import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ prisma: { siteSettings: { findFirst: vi.fn() } } }));

import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildListMetadata,
  buildPostMetadata,
  jsonLdString,
  listJsonLd,
  postJsonLd,
} from '@/lib/blog/seo';

const base = 'https://example.com';
const post = {
  title: 'Title',
  slug: 'مقاله',
  language: 'fa',
  excerpt: 'Excerpt',
  coverImage: '/uploads/cover.jpg',
  publishedAt: new Date('2026-01-02T00:00:00Z'),
  updatedAt: new Date('2026-01-03T00:00:00Z'),
  author: { name: 'Ali' },
};
const alternates = { fa: '/fa/blog/مقاله', en: '/en/blog/article' };

describe('buildPostMetadata', () => {
  it('encodes the canonical and builds hreflang with x-default', () => {
    const m = buildPostMetadata(post, alternates, base);
    expect(m.alternates?.canonical).toBe(`${base}/fa/blog/${encodeURIComponent('مقاله')}`);
    expect(m.alternates?.languages).toEqual({
      fa: `${base}/fa/blog/${encodeURIComponent('مقاله')}`,
      en: `${base}/en/blog/article`,
      'x-default': `${base}/en/blog/article`,
    });
  });
  it('prefers metaTitle/metaDescription/canonicalUrl and falls back otherwise', () => {
    const m = buildPostMetadata({ ...post, metaTitle: 'SEO', metaDescription: 'D', canonicalUrl: 'https://other.com/x' }, alternates, base);
    expect(m.title).toBe('SEO');
    expect(m.description).toBe('D');
    expect(m.alternates?.canonical).toBe('https://other.com/x');
    expect(buildPostMetadata(post, alternates, base).title).toBe('Title');
    expect(buildPostMetadata(post, alternates, base).description).toBe('Excerpt');
  });
  it('fills Open Graph article fields and image fallback', () => {
    const m = buildPostMetadata(post, alternates, base) as any;
    expect(m.openGraph.type).toBe('article');
    expect(m.openGraph.publishedTime).toBe('2026-01-02T00:00:00.000Z');
    expect(m.openGraph.modifiedTime).toBe('2026-01-03T00:00:00.000Z');
    expect(m.openGraph.authors).toEqual(['Ali']);
    expect(m.openGraph.images).toEqual([`${base}/uploads/cover.jpg`]);
    expect(m.twitter.card).toBe('summary_large_image');
    const og = buildPostMetadata({ ...post, ogImage: 'https://cdn.x/og.png' }, alternates, base) as any;
    expect(og.openGraph.images).toEqual(['https://cdn.x/og.png']);
  });
  it('uses a plain card without images and sets robots for noindex', () => {
    const m = buildPostMetadata({ ...post, coverImage: null, noindex: true }, alternates, base) as any;
    expect(m.twitter.card).toBe('summary');
    expect(m.robots).toEqual({ index: false, follow: false });
    expect((buildPostMetadata(post, alternates, base) as any).robots).toBeUndefined();
  });
});

describe('buildListMetadata', () => {
  it('sets per-page canonical and hreflang', () => {
    const m = buildListMetadata({
      language: 'en',
      title: 'Blog',
      path: '/en/blog/page/2',
      page: 2,
      alternates: { en: '/en/blog', fa: '/fa/blog' },
      baseUrl: base,
    });
    expect(m.title).toBe('Blog (2)');
    expect(m.alternates?.canonical).toBe(`${base}/en/blog/page/2`);
    expect(m.alternates?.languages).toMatchObject({ fa: `${base}/fa/blog`, 'x-default': `${base}/en/blog` });
  });
  it('keeps the query in the canonical', () => {
    expect(absoluteUrl(base, '/en/blog/tag/ب?page=2')).toBe(`${base}/en/blog/tag/${encodeURIComponent('ب')}?page=2`);
  });
});

describe('JSON-LD', () => {
  it('builds BlogPosting', () => {
    const ld = postJsonLd(post, `${base}/fa/blog/x`, { baseUrl: base, siteName: 'Site' }) as any;
    expect(ld['@type']).toBe('BlogPosting');
    expect(ld).toMatchObject({
      headline: 'Title',
      description: 'Excerpt',
      image: [`${base}/uploads/cover.jpg`],
      datePublished: '2026-01-02T00:00:00.000Z',
      dateModified: '2026-01-03T00:00:00.000Z',
      author: { '@type': 'Person', name: 'Ali' },
      inLanguage: 'fa',
      mainEntityOfPage: { '@id': `${base}/fa/blog/x` },
      publisher: { name: 'Site' },
    });
  });
  it('builds BreadcrumbList and list data', () => {
    const b = breadcrumbJsonLd([{ name: 'A', url: 'u1' }, { name: 'B', url: 'u2' }]) as any;
    expect(b.itemListElement.map((i: any) => i.position)).toEqual([1, 2]);
    const l = listJsonLd({ name: 'Blog', url: 'u', language: 'en', postUrls: ['p1'], type: 'Blog' }) as any;
    expect(l['@type']).toBe('Blog');
    expect(l.mainEntity.itemListElement[0].url).toBe('p1');
  });
  it('escapes < to prevent script breakout', () => {
    const s = jsonLdString({ headline: '</script><script>alert(1)</script>' });
    expect(s).not.toContain('<');
    expect(s).toContain('\\u003c/script>');
    expect(JSON.parse(s).headline).toBe('</script><script>alert(1)</script>');
  });
});
