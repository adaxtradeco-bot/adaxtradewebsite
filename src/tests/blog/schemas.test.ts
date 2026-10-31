import { describe, it, expect } from 'vitest';
import { ApiCreatePostSchema, ApiUpdatePostSchema } from '@/lib/blog/schemas';
import { contentToSections, htmlToSections } from '@/lib/blog/blocks-to-sections';
import { BaseSectionSchema } from '@/lib/page-builder/section-schemas';

const base = { language: 'fa', title: 'عنوان' };

describe('ApiCreatePostSchema', () => {
  it('requires exactly one of sections / html / content', () => {
    expect(ApiCreatePostSchema.safeParse(base).success).toBe(false);
    expect(
      ApiCreatePostSchema.safeParse({ ...base, html: '<p>a</p>', content: [{ type: 'paragraph', html: 'a' }] }).success
    ).toBe(false);
    expect(ApiCreatePostSchema.safeParse({ ...base, html: '<p>a</p>' }).success).toBe(true);
  });

  it('rejects sections with unknown types', () => {
    const bad = { id: '1', type: 'nope', order: 0, data: {} };
    expect(ApiCreatePostSchema.safeParse({ ...base, sections: [bad] }).success).toBe(false);
  });

  it('requires scheduledAt for scheduled status', () => {
    expect(ApiCreatePostSchema.safeParse({ ...base, html: 'x', status: 'scheduled' }).success).toBe(false);
    const ok = ApiCreatePostSchema.safeParse({ ...base, html: 'x', status: 'scheduled', scheduledAt: '2026-12-01T10:00:00Z' });
    expect(ok.success).toBe(true);
    expect(ok.success && ok.data.scheduledAt).toBeInstanceOf(Date);
  });

  it('rejects an unknown block type', () => {
    expect(ApiCreatePostSchema.safeParse({ ...base, content: [{ type: 'video', src: 'x' }] }).success).toBe(false);
  });
});

describe('ApiUpdatePostSchema', () => {
  it('accepts partial bodies but not two body fields', () => {
    expect(ApiUpdatePostSchema.safeParse({ title: 'x' }).success).toBe(true);
    expect(ApiUpdatePostSchema.safeParse({ html: 'a', sections: [] }).success).toBe(false);
  });
});

describe('content block mapping', () => {
  const parsed = ApiCreatePostSchema.parse({
    ...base,
    content: [
      { type: 'heading', text: 'مقدمه', level: 2 },
      { type: 'paragraph', html: '<p>x</p>' },
      { type: 'html', html: '<div>y</div>' },
      { type: 'image', src: 'https://a.test/i.jpg', alt: 'a "b"', caption: 'c' },
      { type: 'list', ordered: true, items: ['one <b>', 'two'] },
      { type: 'quote', text: 'q', cite: 'me' },
    ],
  });
  const sections = contentToSections(parsed.content!);

  it('maps blocks to blog sections in order', () => {
    expect(sections.map((s) => s.type)).toEqual([
      'blog-heading',
      'blog-rich-text',
      'blog-html',
      'blog-rich-text',
      'blog-rich-text',
      'blog-rich-text',
    ]);
    expect(sections.map((s) => s.order)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(sections[0].data).toMatchObject({ text: 'مقدمه', level: 'h2', anchor: 'مقدمه' });
  });

  it('escapes text-only blocks', () => {
    expect(sections[3].data.html).toContain('alt="a &quot;b&quot;"');
    expect(sections[4].data.html).toBe('<ol><li>one &lt;b&gt;</li><li>two</li></ol>');
  });

  it('produces sections that pass BaseSectionSchema', () => {
    [...sections, ...htmlToSections('<p>z</p>')].forEach((s) => expect(BaseSectionSchema.safeParse(s).success).toBe(true));
  });

  it('wraps raw html into one blog-html section', () => {
    const [only] = htmlToSections('<p>z</p>');
    expect(only).toMatchObject({ type: 'blog-html', data: { html: '<p>z</p>' } });
  });
});
