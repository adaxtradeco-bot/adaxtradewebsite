import { describe, it, expect } from 'vitest';
import {
  sanitizePrefs,
  DEFAULT_PREFS,
  baseFilter,
  applyStatus,
  sortPages,
  type AdminPage,
} from '@/lib/admin/pages-list';

const mk = (id: string, title: string, slug: string, o: Partial<AdminPage> = {}): AdminPage => ({
  id,
  title,
  slug,
  language: 'en',
  status: 'published',
  isDefaultLang: false,
  updatedAt: '2026-01-01T00:00:00Z',
  ...o,
});

const pages = [
  mk('1', 'About', '/en/about', { updatedAt: '2026-02-01T00:00:00Z' }),
  mk('2', 'Contact', '/fa/contact-us', { language: 'fa', status: 'draft', updatedAt: '2026-03-01T00:00:00Z' }),
  mk('3', 'Blog', '/en/blog', { updatedAt: '2026-01-15T00:00:00Z' }),
];

describe('prefs', () => {
  it('defaults to flat, updated desc', () => {
    expect(DEFAULT_PREFS).toMatchObject({ view: 'flat', sortKey: 'updated', sortDir: 'desc' });
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs({ view: 'x', sortKey: 'nope', status: 'zzz' })).toEqual(DEFAULT_PREFS);
  });
  it('keeps valid stored values', () => {
    expect(sanitizePrefs({ view: 'grouped', sortKey: 'title', sortDir: 'asc', status: 'draft', language: 'fa' })).toEqual({
      view: 'grouped', sortKey: 'title', sortDir: 'asc', status: 'draft', language: 'fa',
    });
  });
});

describe('filter + sort', () => {
  it('searches title and slug, case-insensitively', () => {
    expect(baseFilter(pages, 'CONTACT-us', 'all').map((p) => p.id)).toEqual(['2']);
    expect(baseFilter(pages, 'bl', 'all').map((p) => p.id)).toEqual(['3']);
  });
  it('filters by language and status', () => {
    expect(baseFilter(pages, '', 'fa').map((p) => p.id)).toEqual(['2']);
    expect(applyStatus(pages, 'draft').map((p) => p.id)).toEqual(['2']);
  });
  it('sorts by updated desc by default direction and by title asc', () => {
    expect(sortPages(pages, 'updated', 'desc').map((p) => p.id)).toEqual(['2', '1', '3']);
    expect(sortPages(pages, 'title', 'asc').map((p) => p.id)).toEqual(['1', '3', '2']);
  });
  it('does not mutate the input', () => {
    const copy = [...pages];
    sortPages(pages, 'title', 'desc');
    expect(pages).toEqual(copy);
  });
});
