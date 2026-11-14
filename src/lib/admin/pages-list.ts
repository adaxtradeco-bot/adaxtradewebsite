/**
 * Pure helpers for the admin Pages list: types, preferences, filter + sort.
 */

export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  language: string;
  status: string;
  isDefaultLang: boolean;
  isHomepage?: boolean;
  lastSyncedAt?: string | null;
  updatedAt: string;
  pageGroupId?: string | null;
  pageGroupName?: string;
}

export type SortKey = 'updated' | 'title' | 'language' | 'status';
export type SortDir = 'asc' | 'desc';
export type StatusFilter = 'all' | 'published' | 'draft';
export type ViewMode = 'flat' | 'grouped';

export interface PagesListPrefs {
  view: ViewMode;
  sortKey: SortKey;
  sortDir: SortDir;
  status: StatusFilter;
  language: string; // 'all' or a language code
}

export const DEFAULT_PREFS: PagesListPrefs = {
  view: 'flat',
  sortKey: 'updated',
  sortDir: 'desc',
  status: 'all',
  language: 'all',
};

export const PREFS_KEY = 'adminPagesListPrefs';
export const PAGE_SIZE = 25;

const SORT_KEYS: SortKey[] = ['updated', 'title', 'language', 'status'];
const STATUSES: StatusFilter[] = ['all', 'published', 'draft'];

export function sanitizePrefs(raw: unknown): PagesListPrefs {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    view: o.view === 'grouped' ? 'grouped' : 'flat',
    sortKey: SORT_KEYS.includes(o.sortKey as SortKey) ? (o.sortKey as SortKey) : DEFAULT_PREFS.sortKey,
    sortDir: o.sortDir === 'asc' ? 'asc' : 'desc',
    status: STATUSES.includes(o.status as StatusFilter) ? (o.status as StatusFilter) : 'all',
    language: typeof o.language === 'string' && o.language ? o.language : 'all',
  };
}

export function loadPrefs(): PagesListPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? sanitizePrefs(JSON.parse(raw)) : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: PagesListPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable: ignore
  }
}

export function matchesSearch(page: AdminPage, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q);
}

/** Search + language filter (status is applied separately so tab counts stay accurate). */
export function baseFilter(pages: AdminPage[], search: string, language: string): AdminPage[] {
  return pages.filter((p) => (language === 'all' || p.language === language) && matchesSearch(p, search));
}

export function applyStatus(pages: AdminPage[], status: StatusFilter): AdminPage[] {
  return status === 'all' ? pages : pages.filter((p) => p.status === status);
}

export function sortPages(pages: AdminPage[], key: SortKey, dir: SortDir): AdminPage[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...pages].sort((a, b) => {
    let r: number;
    switch (key) {
      case 'title':
        r = a.title.localeCompare(b.title);
        break;
      case 'language':
        r = a.language.localeCompare(b.language);
        break;
      case 'status':
        r = a.status.localeCompare(b.status);
        break;
      default:
        r = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return r * sign || a.title.localeCompare(b.title);
  });
}

export function adminHeaders(): HeadersInit {
  let token: string | null = null;
  try {
    token = localStorage.getItem('adminToken');
  } catch {
    // ignore
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US');
}
