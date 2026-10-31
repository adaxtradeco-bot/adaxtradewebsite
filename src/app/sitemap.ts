import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { supportedLanguages } from '@/lib/i18n/config';
import { visiblePostWhere } from '@/lib/blog/visibility';
import { absoluteUrl, siteBaseUrl } from '@/lib/blog/seo';

export const revalidate = 3600;

/** Builder page URL path: `/{language}/{slug}` (homepage -> `/{language}`); stored slugs may carry a leading slash or language prefix. */
export function pagePath(page: { slug: string; language: string; isHomepage?: boolean }): string {
  const parts = page.slug.split('/').filter(Boolean);
  if (parts[0] === page.language) parts.shift();
  if (page.isHomepage || parts.length === 0) return `/${page.language}`;
  return `/${page.language}/${parts.join('/')}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await siteBaseUrl();
  const entries: MetadataRoute.Sitemap = [];
  const add = (path: string, lastModified?: Date | null) =>
    entries.push({ url: absoluteUrl(base, path), ...(lastModified ? { lastModified } : {}) });

  try {
    for (const lang of supportedLanguages) add(`/${lang}/blog`);

    const posts = await prisma.post.findMany({
      where: { ...visiblePostWhere(), noindex: false },
      select: { language: true, slug: true, updatedAt: true, category: { select: { slug: true } }, tags: { select: { slug: true } } },
    });
    const cats = new Map<string, Date>();
    const tags = new Map<string, Date>();
    const bump = (m: Map<string, Date>, key: string, d: Date) => {
      const cur = m.get(key);
      if (!cur || d > cur) m.set(key, d);
    };
    for (const p of posts) {
      add(`/${p.language}/blog/${p.slug}`, p.updatedAt);
      if (p.category) bump(cats, `${p.language}/category/${p.category.slug}`, p.updatedAt);
      for (const t of p.tags) bump(tags, `${p.language}/tag/${t.slug}`, p.updatedAt);
    }
    for (const [key, d] of [...Array.from(cats), ...Array.from(tags)]) {
      const [lang, ...rest] = key.split('/');
      add(`/${lang}/blog/${rest.join('/')}`, d);
    }

    const pages = await prisma.page.findMany({
      where: { status: 'published' },
      select: { slug: true, language: true, isHomepage: true, updatedAt: true },
    });
    for (const pg of pages) add(pagePath(pg), pg.updatedAt);
  } catch {
    // DB unavailable: return what we have
  }
  return entries;
}
