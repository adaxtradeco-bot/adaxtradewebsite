import { describe, expect, it } from 'vitest';
import {
  buildReport,
  exitCode,
  findExternalMedia,
  findNotExported,
  formatSummary,
  type DbPageRow,
  type ReportInput,
} from '../report';
import type { RenderResult } from '../prerender';

const result = (
  path: string,
  lang: 'en' | 'ar' | 'fa',
  extra: Partial<RenderResult> & { pageId?: string } = {},
): RenderResult => {
  const { pageId, ...rest } = extra;
  return { route: { lang, path, source: pageId ? 'db' : 'fs', pageId }, ok: true, apiCalls: [], links: [], ...rest };
};

const pages: DbPageRow[] = [
  { id: 'p1', slug: '/en/a', language: 'en', status: 'published' },
  { id: 'p2', slug: 'b', language: 'en', status: 'draft' },
  { id: 'p3', slug: 'c', language: 'tr', status: 'published' },
  { id: 'p4', slug: 'd', language: 'ar', status: 'published' },
  { id: 'p5', slug: 'e', language: 'en', status: 'published' },
  { id: 'p6', slug: 'f', language: 'en', status: 'published' },
];

const kept = [result('/en/a', 'en', { pageId: 'p1' })];
const skipped = [
  result('/en/e', 'en', { ok: false, skipped: true, reason: 'by-slug-404', pageId: 'p5' }),
  result('/ar/x', 'ar', { ok: false, skipped: true, reason: 'identical-to-en' }),
];
const failed = [result('/en/f', 'en', { ok: false, reason: 'render failed: timeout', pageId: 'p6' })];

function input(overrides: Partial<ReportInput> = {}): ReportInput {
  return {
    startedAt: new Date('2026-01-01T00:00:00Z'),
    elapsedMs: 1234,
    langs: ['en', 'ar'],
    kept,
    skipped,
    failed: [],
    allPages: pages,
    assets: null,
    external: [],
    warnings: [],
    verify: { pages: 1, errors: [], warnings: [] },
    bundle: { files: 3, bytes: 100 },
    zip: null,
    ...overrides,
  };
}

describe('findNotExported', () => {
  it('gives a reason for every database page that is not in the bundle', () => {
    const out = findNotExported(pages, ['en', 'ar'], { kept, skipped, failed });
    const reason = (slug: string) => out.find((p) => p.slug === slug)?.reason;
    expect(out.find((p) => p.slug === '/en/a')).toBeUndefined();
    expect(reason('b')).toBe('draft');
    expect(reason('c')).toBe('language-not-exported (tr)');
    expect(reason('d')).toMatch(/duplicate-path/);
    expect(reason('e')).toBe('skipped: by-slug-404');
    expect(reason('f')).toBe('render-failed: render failed: timeout');
  });
});

describe('buildReport', () => {
  it('counts per language and sorts skipped/failed deterministically', () => {
    const r = buildReport(input({ failed }));
    expect(r.perLanguage).toEqual({ en: { exported: 1, skipped: 1 }, ar: { exported: 0, skipped: 1 } });
    expect(r.skipped.map((s) => s.path)).toEqual(['/ar/x', '/en/e']);
    expect(r.failed).toEqual([{ path: '/en/f', reason: 'render failed: timeout' }]);
    expect(r.startedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(r.media.bytes.total).toBe(0);
  });

  it('carries media numbers from the asset report', () => {
    const r = buildReport(
      input({
        assets: {
          ok: true,
          copied: ['a', 'b'],
          downloaded: [{ url: 'u', file: 'f', bytes: 5 }],
          skippedRemote: [],
          broken: [{ ref: '/media/x.png', from: 'en/index.html' }],
          rewrittenFiles: 1,
          bytes: { copied: 10, downloaded: 5, total: 15 },
          warnings: [],
        },
      }),
    );
    expect(r.media).toMatchObject({ copied: 2, downloaded: 1, bytes: { total: 15 } });
    expect(r.media.broken).toHaveLength(1);
  });
});

describe('exitCode', () => {
  const brokenAssets = {
    ok: false,
    copied: [],
    downloaded: [],
    skippedRemote: [],
    broken: [{ ref: 'x', from: 'y' }],
    rewrittenFiles: 0,
    bytes: { copied: 0, downloaded: 0, total: 0 },
    warnings: [],
  };

  it('is 0 for a clean run, skipped routes and warnings', () => {
    expect(exitCode(buildReport(input({ warnings: ['w'] })), { allowMissingMedia: false })).toBe(0);
  });
  it('fails on a failed route', () => {
    expect(exitCode(buildReport(input({ failed })), { allowMissingMedia: true })).toBe(1);
  });
  it('fails on broken media unless allowed', () => {
    const r = buildReport(input({ assets: brokenAssets }));
    expect(exitCode(r, { allowMissingMedia: false })).toBe(1);
    expect(exitCode(r, { allowMissingMedia: true })).toBe(0);
  });
  it('fails on verify errors but not verify warnings', () => {
    const bad = buildReport(input({ verify: { pages: 1, errors: [{ path: '/en', message: 'x' }], warnings: [] } }));
    const warn = buildReport(input({ verify: { pages: 1, errors: [], warnings: [{ path: '/en', message: 'x' }] } }));
    expect(exitCode(bad, { allowMissingMedia: true })).toBe(1);
    expect(exitCode(warn, { allowMissingMedia: false })).toBe(0);
  });
});

describe('formatSummary', () => {
  it('lists languages, skipped routes and the result', () => {
    const text = formatSummary(buildReport(input({ failed })), { allowMissingMedia: false });
    expect(text).toContain('en: 1 exported, 1 skipped');
    expect(text).toContain('/ar/x  (identical-to-en)');
    expect(text).toContain('FAILED routes');
    expect(text).toContain('Result: FAILED');
  });
});

describe('findExternalMedia', () => {
  it('groups non-Vercel media URLs by host and ignores page links', () => {
    const text = [
      '<source src="https://res.cloudinary.com/x/video/upload/v1/a.mp4?x=1">',
      '{"u":"https:\\/\\/res.cloudinary.com\\/x\\/video\\/upload\\/v1\\/a.mp4"}',
      '<img src="https://cdn.example.org/p/b.png"> <a href="https://example.com/about">',
      '<img src="https://abc.public.blob.vercel-storage.com/z.png">',
    ].join('\n');
    const found = findExternalMedia(text);
    expect([...found.keys()].sort()).toEqual(['cdn.example.org', 'res.cloudinary.com']);
    expect(found.get('res.cloudinary.com')?.size).toBe(1);
  });
});

describe('empty pages and known-missing assets', () => {
  const empty = result('/en/industries-healthcare', 'en', { ok: false, skipped: true, reason: 'empty-page', pageId: 'p6' });

  it('counts empty-page skips as warnings, never as failures', () => {
    const r = buildReport(input({ skipped: [empty] }));
    expect(r.failed).toEqual([]);
    expect(r.warnings).toContain('Skipped empty page (no sections): /en/industries-healthcare');
    expect(findNotExported(pages, ['en'], { kept, skipped: [empty], failed: [] }).find((p) => p.slug === 'f')?.reason).toBe(
      'skipped: empty-page',
    );
    expect(exitCode(r, { allowMissingMedia: false })).toBe(0);
  });

  it('lists known-missing paths under media and in the summary', () => {
    const r = buildReport(input({ knownMissing: ['/grid.svg'] }));
    expect(r.media.knownMissing).toEqual(['/grid.svg']);
    expect(formatSummary(r, { allowMissingMedia: false })).toContain('/grid.svg');
  });

  it('says a failed run still has a zip when one was created', () => {
    const r = buildReport(input({ failed, zip: { path: 'x-WITH-ERRORS.zip', bytes: 1 } }));
    expect(formatSummary(r, { allowMissingMedia: false })).toContain('WITH-ERRORS');
  });
});
