import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const db = vi.hoisted(() => ({
  page: { findUnique: vi.fn(), create: vi.fn() },
}));
const authState = vi.hoisted(() => ({ loggedIn: true }));

vi.mock('@/lib/prisma', () => ({ prisma: db }));
vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: () =>
    authState.loggedIn
      ? { ok: true, user: { id: 'u1', role: 'editor' } }
      : { ok: false, response: NextResponse.json({ error: 'x' }, { status: 401 }) },
}));

import { POST } from '@/app/api/admin/pages/[id]/duplicate/route';

const source = {
  id: 'p1',
  title: 'Contact-Us (EN)',
  slug: '/en/contact-us',
  language: 'en',
  status: 'published',
  metaTitle: 'MT',
  metaDescription: 'MD',
  sections: '[{"a":1}]',
  builderData: '[{"id":"s1"}]',
  isBuilderPage: true,
  builderVersion: '2',
  headerOverride: '{"mode":"solid"}',
  isHomepage: true,
  isDefaultLang: true,
  pageGroupId: 'g1',
};

const call = (body?: unknown) =>
  POST(
    new NextRequest('http://localhost/api/admin/pages/p1/duplicate', {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: { id: 'p1' } }
  );

beforeEach(() => {
  vi.clearAllMocks();
  authState.loggedIn = true;
  db.page.findUnique.mockImplementation(async ({ where }: any) => (where.id === 'p1' ? source : null));
  db.page.create.mockImplementation(async ({ data }: any) => ({ id: 'p2', ...data }));
});

describe('POST /api/admin/pages/[id]/duplicate', () => {
  it('requires auth', async () => {
    authState.loggedIn = false;
    expect((await call()).status).toBe(401);
    expect(db.page.create).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown page', async () => {
    db.page.findUnique.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });

  it('copies content as a draft, not homepage, not default, not grouped', async () => {
    const res = await call();
    expect(res.status).toBe(201);
    const { page } = await res.json();
    expect(page).toMatchObject({
      title: 'Contact-Us (EN) copy',
      slug: '/en/contact-us-copy',
      status: 'draft',
      isHomepage: false,
      isDefaultLang: false,
      builderData: source.builderData,
      sections: source.sections,
      metaTitle: 'MT',
      metaDescription: 'MD',
      headerOverride: source.headerOverride,
      language: 'en',
    });
    expect(page.pageGroupId).toBeUndefined();
  });

  it('picks the next free slug when -copy is taken', async () => {
    db.page.findUnique.mockImplementation(async ({ where }: any) =>
      where.id === 'p1' ? source : where.slug === '/en/contact-us-copy' ? { id: 'x' } : null
    );
    const { page } = await (await call()).json();
    expect(page.slug).toBe('/en/contact-us-copy-2');
  });

  it('uses a custom title/slug and rejects a taken slug with 409', async () => {
    const ok = await (await call({ title: 'New', slug: 'en/new' })).json();
    expect(ok.page).toMatchObject({ title: 'New', slug: '/en/new' });

    db.page.findUnique.mockImplementation(async ({ where }: any) =>
      where.id === 'p1' ? source : { id: 'taken' }
    );
    expect((await call({ slug: '/en/new' })).status).toBe(409);
  });

  it('keeps the group only when asked', async () => {
    const { page } = await (await call({ keepGroup: true })).json();
    expect(page.pageGroupId).toBe('g1');
    expect(page.isDefaultLang).toBe(false);
  });
});
