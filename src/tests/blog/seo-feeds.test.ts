import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = vi.hoisted(() => ({
  post: { findMany: vi.fn() },
  page: { findMany: vi.fn() },
  siteSettings: { findFirst: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { GET } from '@/app/[lang]/blog/rss.xml/route';
import sitemap, { pagePath } from '@/app/sitemap';

beforeEach(() => {
  vi.clearAllMocks();
  db.siteSettings.findFirst.mockResolvedValue(null);
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/';
});

describe('rss.xml', () => {
  it('returns 404 for an unknown language', async () => {
    const res = await GET(new Request('http://x'), { params: { lang: 'zz' } });
    expect(res.status).toBe(404);
    expect(db.post.findMany).not.toHaveBeenCalled();
  });

  it('renders escaped RSS with RFC-822 dates and limits to 20', async () => {
    db.post.findMany.mockResolvedValue([
      {
        title: 'A & B <tag>',
        slug: 'a-b',
        excerpt: 'say "hi" & <bye>',
        publishedAt: new Date('2026-01-02T03:04:05Z'),
        updatedAt: new Date(),
        category: { name: 'News & Co' },
      },
    ]);
    const res = await GET(new Request('http://x'), { params: { lang: 'en' } });
    expect(res.headers.get('Content-Type')).toBe('application/rss+xml; charset=utf-8');
    expect(db.post.findMany.mock.calls[0][0].take).toBe(20);
    expect(db.post.findMany.mock.calls[0][0].where.language).toBe('en');
    const xml = await res.text();
    expect(xml).toContain('<title>A &amp; B &lt;tag&gt;</title>');
    expect(xml).toContain('<description>say &quot;hi&quot; &amp; &lt;bye&gt;</description>');
    expect(xml).toContain('<category>News &amp; Co</category>');
    expect(xml).toContain('<pubDate>Fri, 02 Jan 2026 03:04:05 GMT</pubDate>');
    expect(xml).toContain('<link>https://example.com/en/blog/a-b</link>');
    expect(xml).toContain('<atom:link href="https://example.com/en/blog/rss.xml" rel="self"');
    expect(xml).toContain('<language>en</language>');
  });
});

describe('sitemap', () => {
  it('lists blog index, posts, categories, tags and published pages', async () => {
    const d = new Date('2026-02-01T00:00:00Z');
    db.post.findMany.mockResolvedValue([
      { language: 'fa', slug: 'مقاله', updatedAt: d, category: { slug: 'c1' }, tags: [{ slug: 't1' }] },
      { language: 'fa', slug: 'two', updatedAt: d, category: { slug: 'c1' }, tags: [] },
    ]);
    db.page.findMany.mockResolvedValue([
      { slug: '/', language: 'en', isHomepage: true, updatedAt: d },
      { slug: '/fa/about', language: 'fa', isHomepage: false, updatedAt: d },
    ]);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://example.com/en/blog');
    expect(urls).toContain(`https://example.com/fa/blog/${encodeURIComponent('مقاله')}`);
    expect(urls.filter((u) => u.endsWith('/fa/blog/category/c1'))).toHaveLength(1);
    expect(urls).toContain('https://example.com/fa/blog/tag/t1');
    expect(urls).toContain('https://example.com/en');
    expect(urls).toContain('https://example.com/fa/about');
    expect(entries.find((e) => e.url.endsWith('/fa/blog/two'))?.lastModified).toEqual(d);
  });

  it('survives DB failure', async () => {
    db.post.findMany.mockRejectedValue(new Error('down'));
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.url.includes('/blog'))).toBe(true);
  });

  it('normalises page paths', () => {
    expect(pagePath({ slug: 'about/team', language: 'en' })).toBe('/en/about/team');
    expect(pagePath({ slug: '/en/about', language: 'en' })).toBe('/en/about');
    expect(pagePath({ slug: 'home', language: 'en', isHomepage: true })).toBe('/en');
  });
});
