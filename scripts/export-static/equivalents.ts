import type { Lang, RouteEntry } from './types';

export interface PublishedPageRow {
  id: string;
  slug: string;
  language: string;
  pageGroupId: string | null;
}

export interface PrismaPublishedPagesClient {
  page: {
    findMany(args: {
      where: { status: string; language: { in: string[] } };
      select: { id: true; slug: true; language: true; pageGroupId: true };
    }): Promise<PublishedPageRow[]>;
  };
}

export interface SlugEntry {
  path: string;
  group: string | null;
  lang: Lang;
}

export interface Equivalents {
  routes: string[];
  bySlug: Record<string, SlugEntry>;
  byGroup: Record<string, Record<string, string>>;
}

export async function fetchPublishedPages(
  prisma: PrismaPublishedPagesClient,
  langs: Lang[],
): Promise<PublishedPageRow[]> {
  return prisma.page.findMany({
    where: { status: 'published', language: { in: langs } },
    select: { id: true, slug: true, language: true, pageGroupId: true },
  });
}

function sortedRecord<T>(entries: Map<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const key of [...entries.keys()].sort()) out[key] = entries.get(key) as T;
  return out;
}

/**
 * Builds the data behind the shim's /api/pages/check and /api/pages/find-equivalent.
 * Only pages whose route was actually exported (matched by pageId) are included, and
 * every emitted path is an exported path, never a raw stored slug.
 */
export function buildEquivalents(pages: PublishedPageRow[], keptRoutes: RouteEntry[]): Equivalents {
  const pathById = new Map<string, string>();
  for (const route of keptRoutes) {
    if (route.pageId !== undefined) pathById.set(route.pageId, route.path);
  }

  const kept = pages
    .filter((p) => pathById.has(p.id))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const exact = new Map<string, SlugEntry>();
  const variants = new Map<string, SlugEntry>();
  const groups = new Map<string, Map<string, string>>();

  for (const page of kept) {
    const lang = page.language.trim().toLowerCase() as Lang;
    const path = pathById.get(page.id) as string;
    const entry: SlugEntry = { path, group: page.pageGroupId || null, lang };

    exact.set(page.slug, entry);
    const alt = page.slug.startsWith('/') ? page.slug.replace(/^\/+/, '') : `/${page.slug}`;
    if (alt) variants.set(alt, entry);

    if (entry.group) {
      const members = groups.get(entry.group) ?? new Map<string, string>();
      if (!members.has(lang)) members.set(lang, path);
      groups.set(entry.group, members);
    }
  }

  // Exact stored slugs win over derived with/without-slash variants.
  const bySlug = new Map<string, SlugEntry>(variants);
  for (const [slug, entry] of exact) bySlug.set(slug, entry);

  const byGroup = new Map<string, Record<string, string>>();
  for (const [group, members] of groups) byGroup.set(group, sortedRecord(members));

  return {
    routes: [...new Set(keptRoutes.map((r) => r.path))].sort(),
    bySlug: sortedRecord(bySlug),
    byGroup: sortedRecord(byGroup),
  };
}
