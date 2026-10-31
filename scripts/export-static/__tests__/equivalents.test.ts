import { describe, it, expect } from 'vitest';
import {
  buildEquivalents,
  fetchPublishedPages,
  type PublishedPageRow,
  type PrismaPublishedPagesClient,
} from '../equivalents';
import { normalizeSlugToPath } from '../routes';
import type { Lang, RouteEntry } from '../types';

const PAGES: PublishedPageRow[] = [
  { id: 'p1', slug: '/en', language: 'en', pageGroupId: 'g-home' },
  { id: 'p2', slug: '/ar', language: 'ar', pageGroupId: 'g-home' },
  { id: 'p3', slug: '/home', language: 'en', pageGroupId: null },
  { id: 'p4', slug: '/en/app-builder', language: 'en', pageGroupId: 'g-app' },
  { id: 'p5', slug: '/ar/app-builder', language: 'ar', pageGroupId: 'g-app' },
  { id: 'p6', slug: 'partnership', language: 'en', pageGroupId: 'g-partner' },
  { id: 'p7', slug: 'partnership', language: 'ar', pageGroupId: 'g-partner' },
  { id: 'p8', slug: 'industries-real-estate', language: 'en', pageGroupId: 'g-re' },
  { id: 'p9', slug: 'ar-industries-real-estate', language: 'ar', pageGroupId: 'g-re' },
  { id: 'p10', slug: '/en/only-english', language: 'en', pageGroupId: 'g-solo' },
];

// Slugs are unique in the DB; fix the fixture so two pages do not share 'partnership'.
PAGES[6] = { ...PAGES[6], slug: '/ar/partnership' };

function routesFor(pages: PublishedPageRow[]): RouteEntry[] {
  return pages.map((p) => ({
    lang: p.language as Lang,
    path: normalizeSlugToPath(p.slug, p.language),
    source: 'db' as const,
    pageId: p.id,
  }));
}

const ALL_ROUTES = routesFor(PAGES);

describe('buildEquivalents', () => {
  const eq = buildEquivalents(PAGES, ALL_ROUTES);

  it('emits sorted canonical routes', () => {
    expect(eq.routes).toEqual([...eq.routes].sort());
    expect(eq.routes).toContain('/en');
    expect(eq.routes).toContain('/en/home');
    expect(eq.routes).toContain('/en/partnership');
  });

  it('keys bySlug by the stored slug and its slash variants, with exported paths', () => {
    expect(eq.bySlug['/en']).toEqual({ path: '/en', group: 'g-home', lang: 'en' });
    expect(eq.bySlug['en']).toEqual(eq.bySlug['/en']);
    expect(eq.bySlug['partnership'].path).toBe('/en/partnership');
    expect(eq.bySlug['/partnership']).toEqual(eq.bySlug['partnership']);
    expect(eq.bySlug['/en/app-builder'].path).toBe('/en/app-builder');
    expect(eq.bySlug['en/app-builder'].path).toBe('/en/app-builder');
    expect(eq.bySlug['industries-real-estate'].path).toBe('/en/industries-real-estate');
    expect(eq.bySlug['/home']).toEqual({ path: '/en/home', group: null, lang: 'en' });
  });

  it('never emits a raw stored slug as a path', () => {
    for (const entry of Object.values(eq.bySlug)) expect(entry.path).toMatch(/^\/(en|ar)(\/|$)/);
    for (const members of Object.values(eq.byGroup)) {
      for (const p of Object.values(members)) expect(p).toMatch(/^\/(en|ar)(\/|$)/);
    }
  });

  it('builds byGroup only for grouped kept pages', () => {
    expect(eq.byGroup['g-home']).toEqual({ ar: '/ar', en: '/en' });
    expect(eq.byGroup['g-partner']).toEqual({ ar: '/ar/partnership', en: '/en/partnership' });
    expect(Object.keys(eq.byGroup)).not.toContain('null');
  });

  it('skips pages whose route was not kept', () => {
    const kept = ALL_ROUTES.filter((r) => r.pageId !== 'p2');
    const partial = buildEquivalents(PAGES, kept);
    expect(partial.bySlug['/ar']).toBeUndefined();
    expect(partial.byGroup['g-home']).toEqual({ en: '/en' });
    expect(partial.routes).not.toContain('/ar');
  });

  it('is deterministic regardless of input order', () => {
    const a = JSON.stringify(buildEquivalents(PAGES, ALL_ROUTES));
    const b = JSON.stringify(buildEquivalents([...PAGES].reverse(), [...ALL_ROUTES].reverse()));
    expect(b).toBe(a);
    const keys = Object.keys(eq.bySlug);
    expect(keys).toEqual([...keys].sort());
  });

  it('ignores kept routes without pageId for page maps but keeps them in routes', () => {
    const withFs = buildEquivalents(PAGES, [...ALL_ROUTES, { lang: 'en', path: '/en/about', source: 'fs' }]);
    expect(withFs.routes).toContain('/en/about');
    expect(Object.values(withFs.bySlug).some((e) => e.path === '/en/about')).toBe(false);
  });
});

describe('fetchPublishedPages', () => {
  it('queries published pages in the given languages', async () => {
    let seen: unknown;
    const prisma: PrismaPublishedPagesClient = {
      page: {
        async findMany(args) {
          seen = args;
          return PAGES;
        },
      },
    };
    expect(await fetchPublishedPages(prisma, ['en', 'ar'])).toBe(PAGES);
    expect(seen).toEqual({
      where: { status: 'published', language: { in: ['en', 'ar'] } },
      select: { id: true, slug: true, language: true, pageGroupId: true },
    });
  });
});

// Faithful re-implementation of src/app/api/pages/find-equivalent/route.ts against an in-memory table.
function realFindEquivalent(table: PublishedPageRow[], slug: string, lang: string) {
  const current = table.find((p) => p.slug === slug);
  if (!current) return { found: false, reason: 'current_page_not_found' };
  if (current.pageGroupId) {
    const eqPage = table.find((p) => p.pageGroupId === current.pageGroupId && p.language === lang);
    if (eqPage) return { found: true, slug: eqPage.slug, method: 'pageGroup' };
  }
  return { found: false, reason: 'no_equivalent_in_group' };
}

// Mirrors the lookup order of export-template/static-shim.js (exact slug first).
function staticFindEquivalent(eq: ReturnType<typeof buildEquivalents>, slug: string, lang: string) {
  const entry = eq.bySlug[slug];
  if (!entry) return { found: false, reason: 'current_page_not_found' };
  const target = entry.group ? eq.byGroup[entry.group]?.[lang] : undefined;
  if (!target) return { found: false, reason: 'no_equivalent_in_group' };
  return { found: true, slug: target, method: 'pageGroup' };
}

describe('find-equivalent parity', () => {
  const eq = buildEquivalents(PAGES, ALL_ROUTES);
  const pathOf = new Map(ALL_ROUTES.map((r) => [r.pageId as string, r.path]));
  const idBySlug = new Map(PAGES.map((p) => [p.slug, p.id]));

  for (const page of PAGES) {
    for (const lang of ['en', 'ar', 'fa']) {
      it(`${page.slug} (${page.language}) -> ${lang}`, () => {
        const real = realFindEquivalent(PAGES, page.slug, lang);
        const stat = staticFindEquivalent(eq, page.slug, lang);
        expect(stat.found).toBe(real.found);
        expect(stat.reason).toBe(real.reason);
        if (real.found) {
          const realPageId = idBySlug.get(real.slug as string) as string;
          expect(stat.slug).toBe(pathOf.get(realPageId));
        }
      });
    }
  }
});
