import fs from 'fs';
import path from 'path';
import { supportedLanguages } from '../../src/lib/i18n/config';
import { POSTS_PER_PAGE } from '../../src/lib/blog/constants';
import { visiblePostWhere } from '../../src/lib/blog/visibility';
import type { Lang, RouteEntry } from './types';

export type { Lang, RouteEntry } from './types';

export interface PrismaPageClient {
  page: {
    findMany(args: {
      where: { status: string; language: { in: string[] } };
      select: { id: true; slug: true; language: true };
    }): Promise<Array<{ id: string; slug: string; language: string }>>;
  };
}

/** Just what route discovery reads from the blog tables. */
export interface PrismaBlogClient {
  post: { findMany(args: unknown): Promise<Array<{ language: string; slug: string }>> };
  blogCategory: { findMany(args: unknown): Promise<Array<{ language: string; slug: string }>> };
  blogTag: { findMany(args: unknown): Promise<Array<{ language: string; slug: string }>> };
}

const SOURCE_PRIORITY: Record<RouteEntry['source'], number> = { db: 0, fs: 1, link: 2 };

/** Stored slugs are inconsistent ('/en', '/home', 'partnership', '/en/app-builder'); the page language decides the prefix. */
export function normalizeSlugToPath(slug: string, pageLanguage: string): string {
  const lang = pageLanguage.trim().toLowerCase();
  const segments = slug
    .trim()
    .split('/')
    .filter((s) => s !== '');
  if (segments.length > 0 && supportedLanguages.includes(segments[0].toLowerCase())) {
    segments.shift();
  }
  return segments.length === 0 ? `/${lang}` : `/${lang}/${segments.join('/')}`;
}

function normalizePath(p: string): string {
  const segments = p.split('/').filter((s) => s !== '');
  if (segments.length === 0) return '/';
  segments[0] = segments[0].toLowerCase();
  return `/${segments.join('/')}`;
}

export function dedupeRoutes(routes: RouteEntry[]): RouteEntry[] {
  const best = new Map<string, RouteEntry>();
  for (const route of routes) {
    const normalized: RouteEntry = {
      ...route,
      lang: route.lang.toLowerCase() as Lang,
      path: normalizePath(route.path),
    };
    const existing = best.get(normalized.path);
    if (!existing || SOURCE_PRIORITY[normalized.source] < SOURCE_PRIORITY[existing.source]) {
      best.set(normalized.path, normalized);
    }
  }
  return [...best.values()];
}

export function scanFilesystemRoutes(appLangDir = 'src/app/[lang]'): string[] {
  const root = path.resolve(appLangDir);
  const found: string[] = [];

  const walk = (dir: string, rel: string[]): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.includes('[')) continue;
      const topLevelExcluded =
        rel.length === 0 && (entry.name === 'admin' || entry.name === 'api' || entry.name.startsWith('test-'));
      if (topLevelExcluded) continue;
      const next = [...rel, entry.name];
      const full = path.join(dir, entry.name);
      if (fs.existsSync(path.join(full, 'page.tsx'))) found.push(next.join('/'));
      walk(full, next);
    }
  };

  walk(root, []);
  return found.sort();
}

export async function discoverDbRoutes(prisma: PrismaPageClient, langs: Lang[]): Promise<RouteEntry[]> {
  const pages = await prisma.page.findMany({
    where: { status: 'published', language: { in: langs } },
    select: { id: true, slug: true, language: true },
  });
  return pages.map((p) => ({
    lang: p.language.toLowerCase() as Lang,
    path: normalizeSlugToPath(p.slug, p.language),
    source: 'db' as const,
    pageId: p.id,
  }));
}

/**
 * Blog index (+ pagination), visible posts, and categories / tags that have visible posts.
 * These routes have no `pageId`, so the empty-page check (`hasNoSections`) never applies to them.
 * The RSS feed is not a route: see `blogFeedPaths`.
 */
export async function discoverBlogRoutes(prisma: PrismaBlogClient, langs: Lang[]): Promise<RouteEntry[]> {
  const inLangs = { language: { in: langs } };
  const withVisiblePosts = { ...inLangs, posts: { some: visiblePostWhere() } };
  const select = { language: true, slug: true };
  const [posts, categories, tags] = await Promise.all([
    prisma.post.findMany({ where: { ...inLangs, ...visiblePostWhere() }, select }),
    prisma.blogCategory.findMany({ where: withVisiblePosts, select }),
    prisma.blogTag.findMany({ where: withVisiblePosts, select }),
  ]);

  const route = (lang: string, rest: string): RouteEntry => ({
    lang: lang.toLowerCase() as Lang,
    path: `/${lang}/blog${rest}`,
    source: 'fs',
  });
  const routes: RouteEntry[] = [];
  for (const lang of langs) {
    const count = posts.filter((p) => p.language === lang).length;
    routes.push(route(lang, ''));
    for (let n = 2; n <= Math.ceil(count / POSTS_PER_PAGE); n++) routes.push(route(lang, `/page/${n}`));
  }
  routes.push(...posts.map((p) => route(p.language, `/${p.slug}`)));
  routes.push(...categories.map((c) => route(c.language, `/category/${c.slug}`)));
  routes.push(...tags.map((t) => route(t.language, `/tag/${t.slug}`)));
  return routes;
}

/** RSS feeds are fetched as text (a browser would wrap the XML), one per language. */
export const blogFeedPaths = (langs: Lang[]): string[] => langs.map((lang) => `/${lang}/blog/rss.xml`);

/** Render order: default language 'en' first when requested, otherwise the given order. */
function orderLangs(langs: Lang[]): Lang[] {
  return langs.includes('en') ? ['en', ...langs.filter((l) => l !== 'en')] : [...langs];
}

export async function buildInitialRoutes(
  prisma: PrismaPageClient & PrismaBlogClient,
  langs: Lang[],
): Promise<RouteEntry[]> {
  const ordered = orderLangs(langs);
  const db = await discoverDbRoutes(prisma, ordered);
  const blog = await discoverBlogRoutes(prisma, ordered);
  const fsPaths = scanFilesystemRoutes();

  const all: RouteEntry[] = [...db, ...blog];
  for (const lang of ordered) {
    all.push({ lang, path: `/${lang}`, source: 'fs' });
    for (const rel of fsPaths) all.push({ lang, path: `/${lang}/${rel}`, source: 'fs' });
  }

  const deduped = dedupeRoutes(all);
  return ordered.flatMap((lang) => deduped.filter((r) => r.lang === lang));
}

export function extractInternalLinks(hrefs: string[], origin: string, langs: Lang[]): string[] {
  const originHost = new URL(origin).origin;
  const result = new Set<string>();
  for (const raw of hrefs) {
    const href = raw.trim();
    if (!href || href.startsWith('#')) continue;
    let pathname: string;
    try {
      const url = new URL(href, origin);
      if (url.origin !== originHost) continue;
      pathname = url.pathname;
    } catch {
      continue;
    }
    const cleaned = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
    const first = cleaned.split('/')[1]?.toLowerCase();
    if (!first || !langs.includes(first as Lang)) continue;
    result.add(`/${first}${cleaned.slice(first.length + 1)}`);
  }
  return [...result];
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

/**
 * True when a builder page has no sections at all (builderData parsed like api/pages/by-slug:
 * `parsed.sections || parsed`; or no builderData and no legacy sections). Unparseable data is not
 * "empty": the page is rendered and judged on its result.
 */
export function hasNoSections(row: { builderData?: string | null; sections?: string | null }): boolean {
  const legacyEmpty = ((): boolean => {
    if (!row.sections?.trim()) return true;
    const parsed = parseJson(row.sections);
    return parsed.ok && Array.isArray(parsed.value) && parsed.value.length === 0;
  })();

  if (!row.builderData?.trim()) return legacyEmpty;
  const parsed = parseJson(row.builderData);
  if (!parsed.ok) return false;
  const value = parsed.value as { sections?: unknown } | null;
  const sections = value && typeof value === 'object' && 'sections' in value && value.sections ? value.sections : value;
  return Array.isArray(sections) && sections.length === 0 && legacyEmpty;
}

export function isNotFoundMain(mainText: string): boolean {
  return /^404\s+page not found$/i.test(mainText.replace(/\s+/g, ' ').trim());
}

export function shouldSkipIdentical(args: {
  routePath: string;
  lang: Lang;
  hasPageRow: boolean;
  mainHash: string;
  keptHashesByLang: Map<Lang, string>;
}): { skip: boolean; reason?: string } {
  if (args.hasPageRow) return { skip: false };
  for (const [lang, hash] of args.keptHashesByLang) {
    if (lang !== args.lang && hash === args.mainHash) {
      return { skip: true, reason: `identical-to-${lang}` };
    }
  }
  return { skip: false };
}
