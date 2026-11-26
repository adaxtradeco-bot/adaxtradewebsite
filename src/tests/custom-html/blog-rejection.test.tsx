/**
 * F1 regression: custom-html (code) sections must never enter, or render in, blog posts.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFixtureInput } from './fixtures';

const mocks = vi.hoisted(() => ({
  db: {
    post: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    postGroup: { create: vi.fn() },
    blogCategory: { findFirst: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma: mocks.db }));
vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: () => ({ ok: true, user: { id: 'u1', role: 'editor' } }),
  authorizeDelete: () => ({ ok: true }),
}));
vi.mock('@/lib/blog/api-keys', () => ({
  verifyApiKey: async () => ({ ok: true, key: { id: 'k1', createdById: 'u1' } }),
  getApiCanPublish: async () => false,
}));
vi.mock('@/lib/blog/cover-import', () => ({ importCover: vi.fn() }));
vi.mock('@/components/FirstSectionMarker', () => ({
  FirstSectionMarker: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { POST as adminCreate } from '@/app/api/admin/blog/posts/route';
import { PUT as adminUpdate } from '@/app/api/admin/blog/posts/[id]/route';
import { PUT as adminBuilder } from '@/app/api/admin/blog/posts/[id]/builder/route';
import { POST as apiCreate } from '@/app/api/v1/blog/posts/route';
import { PATCH as apiUpdate } from '@/app/api/v1/blog/posts/[id]/route';
import { PostBody } from '@/app/[lang]/blog/_components/PostBody';
import { addTranslation, createPost, updatePost } from '@/lib/blog/post-service';
import { dropCustomHtmlSections, sanitizeSections } from '@/lib/blog/sanitize';
import { CUSTOM_HTML_BLOG_ERROR } from '@/lib/blog/schemas';
import { BaseSectionSchema } from '@/lib/page-builder/section-schemas';
import { SectionRenderer } from '@/lib/page-builder/section-renderer';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';

const { db } = mocks;
const custom = { id: 'c1', type: 'custom-html', order: 0, data: makeFixtureInput() };
const heading = { id: 'h1', type: 'blog-heading', order: 1, data: { text: 'Kept', level: 'h2' } };
const ctx = { params: { id: 'p1' } };
const req = (method: string, body: unknown) =>
  new NextRequest('https://site.example/api', {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  db.post.findUnique.mockResolvedValue(null);
  db.post.create.mockImplementation(async ({ data }: any) => ({ id: 'p1', ...data }));
  db.post.update.mockImplementation(async ({ data }: any) => ({ id: 'p1', ...data }));
  db.postGroup.create.mockResolvedValue({ id: 'g1' });
});

describe('blog write routes reject custom-html with 400', () => {
  const body = { language: 'en', title: 'T', sections: [heading, custom] };
  const routes: Array<[string, () => Promise<Response>]> = [
    ['POST /api/admin/blog/posts', () => adminCreate(req('POST', body))],
    ['PUT /api/admin/blog/posts/[id]', () => adminUpdate(req('PUT', { sections: [custom] }), ctx)],
    ['POST /api/v1/blog/posts', () => apiCreate(req('POST', body))],
    ['PATCH /api/v1/blog/posts/[id]', () => apiUpdate(req('PATCH', { sections: [custom] }), ctx)],
    ['PUT /api/admin/blog/posts/[id]/builder', () => adminBuilder(req('PUT', { builderData: [custom] }), ctx)],
  ];

  it.each(routes)('%s', async (_name, call) => {
    const res = await call();
    expect(res.status).toBe(400);
    expect(JSON.stringify(await res.json())).toContain(CUSTOM_HTML_BLOG_ERROR);
    expect(db.post.create).not.toHaveBeenCalled();
    expect(db.post.update).not.toHaveBeenCalled();
  });

  it('other validation errors stay 422', async () => {
    expect((await apiCreate(req('POST', { language: 'en', title: 'No body' }))).status).toBe(422);
  });

  it('the page builder schema still accepts custom-html', () => {
    expect(BaseSectionSchema.safeParse(custom).success).toBe(true);
  });
});

describe('blog service never stores custom-html', () => {
  it('sanitizeSections drops it', () => {
    expect(sanitizeSections([custom, heading]).map((s) => s.type)).toEqual(['blog-heading']);
    expect(dropCustomHtmlSections([null, custom])).toEqual([null]);
  });

  it('createPost and updatePost drop it', async () => {
    await createPost({ language: 'en', title: 'T', sections: [custom, heading] as never }, { source: 'api' });
    expect(db.post.create.mock.calls[0][0].data.builderData).not.toContain('custom-html');

    db.post.findUnique.mockResolvedValueOnce({ id: 'p1', language: 'en', slug: 's', publishedAt: null });
    await updatePost('p1', { sections: [custom] as never });
    expect(db.post.update.mock.calls[0][0].data.builderData).toBe('[]');
  });

  it('addTranslation does not copy a stored custom-html section', async () => {
    db.post.findUnique.mockResolvedValueOnce({
      id: 'o', language: 'en', title: 'Hi', postGroupId: 'g1', category: null,
      builderData: JSON.stringify([custom, heading]),
    });
    db.post.findFirst.mockResolvedValueOnce(null);
    await addTranslation('o', 'fa');
    expect(JSON.parse(db.post.create.mock.calls[0][0].data.builderData)).toEqual([heading]);
  });
});

describe('blog rendering never renders custom-html', () => {
  const sections = [custom, heading] as never;

  it('PostBody and the admin preview path skip it', () => {
    for (const ui of [
      <PostBody key="a" sections={sections} />,
      <PageRenderer key="b" sections={sections} isPreview allowCustomHtml={false} />,
    ]) {
      const { container, unmount } = render(ui);
      expect(container.querySelector('[data-chs]')).toBeNull();
      expect(container.textContent).not.toContain('Hello world');
      expect(container.textContent).toContain('Kept');
      unmount();
    }
  });

  it('SectionRenderer renders nothing live and only a notice in the blog builder', () => {
    const live = render(<SectionRenderer section={custom as never} allowCustomHtml={false} />);
    expect(live.container.querySelector('[data-chs]')).toBeNull();
    expect(live.container.textContent).toBe('');
    live.unmount();
    const builder = render(<SectionRenderer section={custom as never} isBuilder allowCustomHtml={false} />);
    expect(builder.container.querySelector('[data-chs]')).toBeNull();
    expect(builder.getByRole('alert').textContent).toContain('not supported in blog posts');
  });

  it('pages still render it', () => {
    const { container } = render(<PageRenderer sections={[custom] as never} />);
    expect(container.querySelector('[data-chs]')).not.toBeNull();
  });
});
