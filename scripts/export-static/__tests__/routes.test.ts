import { describe, it, expect } from 'vitest';
import {
  normalizeSlugToPath,
  dedupeRoutes,
  scanFilesystemRoutes,
  discoverDbRoutes,
  buildInitialRoutes,
  extractInternalLinks,
  isNotFoundMain,
  hasNoSections,
  shouldSkipIdentical,
  type PrismaPageClient,
  type PrismaBlogClient,
  discoverBlogRoutes,
  blogFeedPaths,
} from '../routes';
import type { Lang } from '../types';

describe('normalizeSlugToPath', () => {
  const cases: Array<[string, string, string]> = [
    ['/en', 'en', '/en'],
    ['/ar', 'ar', '/ar'],
    ['/home', 'en', '/en/home'],
    ['/en/app-builder', 'en', '/en/app-builder'],
    ['partnership', 'en', '/en/partnership'],
    ['industries-real-estate', 'en', '/en/industries-real-estate'],
    ['/fa/about', 'fa', '/fa/about'],
    ['EN/Foo', 'en', '/en/Foo'],
    ['/en/foo/', 'en', '/en/foo'],
    ['//en//foo//bar//', 'en', '/en/foo/bar'],
    ['  /ar/x  ', 'ar', '/ar/x'],
    ['', 'fa', '/fa'],
    ['/', 'EN', '/en'],
    ['/en/about', 'ar', '/ar/about'],
  ];
  it.each(cases)('%j (%s) -> %s', (slug, lang, expected) => {
    expect(normalizeSlugToPath(slug, lang)).toBe(expected);
  });
});

describe('dedupeRoutes', () => {
  it('collapses slashes, case and trailing slash; first occurrence wins', () => {
    const out = dedupeRoutes([
      { lang: 'en', path: '/en/foo/', source: 'db', pageId: '1' },
      { lang: 'en', path: '//EN//foo', source: 'db', pageId: '2' },
    ]);
    expect(out).toEqual([{ lang: 'en', path: '/en/foo', source: 'db', pageId: '1' }]);
  });

  it('prefers db over fs over link regardless of order', () => {
    const out = dedupeRoutes([
      { lang: 'en', path: '/en/a', source: 'link' },
      { lang: 'en', path: '/en/a', source: 'fs' },
      { lang: 'en', path: '/en/a/', source: 'db', pageId: 'x' },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].source).toBe('db');
    expect(out[0].pageId).toBe('x');
  });
});

describe('scanFilesystemRoutes (real repo)', () => {
  const routes = scanFilesystemRoutes();

  it('includes known static routes', () => {
    expect(routes).toEqual(expect.arrayContaining(['contact', 'industries/oilgas', 'fleet-management']));
  });

  it('excludes dynamic, admin, api and test routes', () => {
    for (const r of routes) {
      const top = r.split('/')[0];
      expect(r).not.toContain('[');
      expect(top).not.toBe('admin');
      expect(top).not.toBe('api');
      expect(top.startsWith('test-')).toBe(false);
    }
  });
});

type Term = { language: string; slug: string };
const fakeBlog = (posts: Term[] = [], categories: Term[] = [], tags: Term[] = []): PrismaBlogClient => ({
  post: { findMany: async () => posts },
  blogCategory: { findMany: async () => categories },
  blogTag: { findMany: async () => tags },
});

const fakePrisma = (rows: Array<{ id: string; slug: string; language: string }>): PrismaPageClient & PrismaBlogClient => ({
  page: { findMany: async () => rows },
  ...fakeBlog(),
});

describe('discoverDbRoutes / buildInitialRoutes', () => {
  const rows = [
    { id: '1', slug: '/en/app-builder', language: 'en' },
    { id: '2', slug: 'partnership', language: 'en' },
    { id: '3', slug: '/fa/about', language: 'fa' },
    { id: '4', slug: '/ar', language: 'ar' },
  ];

  it('maps rows to db routes', async () => {
    const out = await discoverDbRoutes(fakePrisma(rows), ['en', 'ar', 'fa']);
    expect(out.map((r) => r.path)).toEqual(['/en/app-builder', '/en/partnership', '/fa/about', '/ar']);
    expect(out.every((r) => r.source === 'db')).toBe(true);
  });

  it('builds a deduped table, en first, with language homes', async () => {
    const out = await buildInitialRoutes(fakePrisma(rows), ['fa', 'ar', 'en']);
    expect(out[0].lang).toBe('en');
    expect([...new Set(out.map((r) => r.lang))]).toEqual(['en', 'fa', 'ar']);
    const paths = out.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expect.arrayContaining(['/en', '/ar', '/fa', '/fa/contact', '/en/industries/oilgas']));
    expect(out.find((r) => r.path === '/ar')?.source).toBe('db');
    expect(out.find((r) => r.path === '/fa')?.source).toBe('fs');
    expect(out.find((r) => r.path === '/en/app-builder')?.source).toBe('db');
  });

  it('keeps the given order when en is absent', async () => {
    const out = await buildInitialRoutes(fakePrisma([]), ['fa', 'ar']);
    expect(out[0].lang).toBe('fa');
  });
});

describe('extractInternalLinks', () => {
  const origin = 'http://localhost:3999';
  const langs: Lang[] = ['en', 'ar', 'fa'];

  it('keeps same-origin/relative language links, strips hash/query/trailing slash, dedupes', () => {
    const out = extractInternalLinks(
      [
        '/en/contact?x=1#top',
        'http://localhost:3999/ar/about/',
        '/en/contact/',
        'https://example.com/en/x',
        '/de/page',
        '/admin',
        '#section',
        'mailto:a@b.c',
        '/en',
        '/english',
        '',
      ],
      origin,
      langs,
    );
    expect(out).toEqual(['/en/contact', '/ar/about', '/en']);
  });
});

describe('isNotFoundMain', () => {
  it.each([
    ['404 Page not found', true],
    ['  404\n  Page   not found  ', true],
    ['404 page not found', true],
    ['404 Page not found Go home', false],
    ['Welcome', false],
    ['', false],
  ])('%j -> %s', (text, expected) => {
    expect(isNotFoundMain(text)).toBe(expected);
  });
});

describe('shouldSkipIdentical', () => {
  const kept = new Map<Lang, string>([['en', 'h1']]);

  it('skips when no page row and hash equals a kept language', () => {
    expect(
      shouldSkipIdentical({ routePath: '/fa/contact', lang: 'fa', hasPageRow: false, mainHash: 'h1', keptHashesByLang: kept }),
    ).toEqual({ skip: true, reason: 'identical-to-en' });
  });

  it('keeps when a page row exists', () => {
    expect(
      shouldSkipIdentical({ routePath: '/fa/x', lang: 'fa', hasPageRow: true, mainHash: 'h1', keptHashesByLang: kept }).skip,
    ).toBe(false);
  });

  it('keeps when hash differs or nothing is kept yet', () => {
    expect(
      shouldSkipIdentical({ routePath: '/ar/x', lang: 'ar', hasPageRow: false, mainHash: 'h2', keptHashesByLang: kept }).skip,
    ).toBe(false);
    expect(
      shouldSkipIdentical({ routePath: '/en/x', lang: 'en', hasPageRow: false, mainHash: 'h1', keptHashesByLang: new Map() }).skip,
    ).toBe(false);
  });
});

describe('hasNoSections', () => {
  it('is true for empty arrays, empty wrapped sections and missing data', () => {
    expect(hasNoSections({ builderData: '[]' })).toBe(true);
    expect(hasNoSections({ builderData: '{"sections":[]}' })).toBe(true);
    expect(hasNoSections({ builderData: null, sections: null })).toBe(true);
    expect(hasNoSections({ builderData: '', sections: '[]' })).toBe(true);
  });
  it('is false when sections exist (builder or legacy) or the data cannot be parsed', () => {
    expect(hasNoSections({ builderData: '[{"id":"a"}]' })).toBe(false);
    expect(hasNoSections({ builderData: '{"sections":[{"id":"a"}]}' })).toBe(false);
    expect(hasNoSections({ builderData: null, sections: '[{"id":"a"}]' })).toBe(false);
    expect(hasNoSections({ builderData: '[]', sections: '[{"id":"a"}]' })).toBe(false);
    expect(hasNoSections({ builderData: '{broken' })).toBe(false);
  });
});

describe('discoverBlogRoutes', () => {
  const posts = (language: string, n: number) =>
    Array.from({ length: n }, (_, i) => ({ language, slug: `post-${i}` }));

  it('lists index, posts, categories and tags with no pageId', async () => {
    const out = await discoverBlogRoutes(
      fakeBlog([{ language: 'fa', slug: '۵-نکته' }, ...posts('en', 2)], [{ language: 'en', slug: 'import' }], [{ language: 'fa', slug: 'ترکیه' }]),
      ['en', 'fa'],
    );
    expect(out.map((r) => r.path)).toEqual([
      '/en/blog', '/fa/blog', '/fa/blog/۵-نکته', '/en/blog/post-0', '/en/blog/post-1',
      '/en/blog/category/import', '/fa/blog/tag/ترکیه',
    ]);
    expect(out.every((r) => r.source === 'fs' && r.pageId === undefined)).toBe(true);
  });

  it('adds /page/n routes at 12 posts per page', async () => {
    const out = await discoverBlogRoutes(fakeBlog(posts('en', 25)), ['en']);
    const pages = out.map((r) => r.path).filter((p) => p.includes('/page/'));
    expect(pages).toEqual(['/en/blog/page/2', '/en/blog/page/3']);
    const single = await discoverBlogRoutes(fakeBlog(posts('en', 12)), ['en']);
    expect(single.some((x) => x.path.includes('/page/'))).toBe(false);
  });

  it('still lists the empty index of a language without posts', async () => {
    expect((await discoverBlogRoutes(fakeBlog(), ['fa'])).map((r) => r.path)).toEqual(['/fa/blog']);
  });

  it('merges into buildInitialRoutes without duplicating the filesystem /blog route', async () => {
    const prisma = { ...fakePrisma([]), ...fakeBlog([{ language: 'en', slug: 'hello' }]) };
    const paths = (await buildInitialRoutes(prisma, ['en'])).map((r) => r.path);
    expect(paths).toContain('/en/blog/hello');
    expect(paths.filter((p) => p === '/en/blog')).toHaveLength(1);
  });

  it('names one RSS feed per language', () => {
    expect(blogFeedPaths(['en', 'fa'])).toEqual(['/en/blog/rss.xml', '/fa/blog/rss.xml']);
  });
});
