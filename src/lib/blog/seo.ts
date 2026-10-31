import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { defaultLanguage, supportedLanguages } from '@/lib/i18n/config';

export interface SiteInfo {
  baseUrl: string;
  siteName?: string;
}

const trimSlash = (s: string) => s.replace(/\/+$/, '');

/** Base URL (no trailing slash) and site name: env, then site settings, then localhost. */
export async function siteInfo(): Promise<SiteInfo> {
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL ? trimSlash(process.env.NEXT_PUBLIC_SITE_URL) : '';
  let siteName: string | undefined;
  try {
    const row = await prisma.siteSettings.findFirst();
    if (row) {
      const s = JSON.parse(row.data);
      if (!baseUrl) {
        const u = s?.siteUrl ?? s?.general?.siteUrl ?? s?.seo?.siteUrl;
        if (typeof u === 'string' && /^https?:\/\//.test(u)) baseUrl = trimSlash(u);
      }
      const n = s?.siteName ?? s?.general?.siteName ?? s?.footer?.companyName;
      if (typeof n === 'string' && n) siteName = n;
    }
  } catch {
    // settings unavailable: use fallbacks
  }
  return { baseUrl: baseUrl || 'http://localhost:3000', siteName };
}

export async function siteBaseUrl(): Promise<string> {
  return (await siteInfo()).baseUrl;
}

/** Percent-encodes each path segment once (Persian slugs); keeps a `?query` as is. */
export function encodePath(path: string): string {
  const [p, ...q] = path.split('?');
  const enc = p
    .split('/')
    .map((seg) => {
      let s = seg;
      try {
        s = decodeURIComponent(seg);
      } catch {
        // keep raw segment
      }
      return encodeURIComponent(s);
    })
    .join('/');
  return q.length ? `${enc}?${q.join('?')}` : enc;
}

export function absoluteUrl(baseUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${trimSlash(baseUrl)}${encodePath(p)}`;
}

function languageAlternates(baseUrl: string, alternates?: Record<string, string> | null) {
  if (!alternates || Object.keys(alternates).length === 0) return undefined;
  const out: Record<string, string> = {};
  for (const [lang, path] of Object.entries(alternates)) out[lang] = absoluteUrl(baseUrl, path);
  const def = alternates[defaultLanguage] ?? Object.values(alternates)[0];
  out['x-default'] = absoluteUrl(baseUrl, def);
  return out;
}

export interface SeoPost {
  title: string;
  slug: string;
  language: string;
  excerpt?: string | null;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  updatedAt?: Date | null;
  author?: { name?: string | null } | null;
  category?: { name: string } | null;
  tags?: { name: string }[];
}

export const postPath = (p: { language: string; slug: string }) => `/${p.language}/blog/${p.slug}`;

export function buildPostMetadata(
  post: SeoPost,
  alternates: Record<string, string> | null | undefined,
  baseUrl: string
): Metadata {
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  const url = absoluteUrl(baseUrl, postPath(post));
  const canonical = post.canonicalUrl || url;
  const image = post.ogImage || post.coverImage;
  const images = image ? [absoluteUrl(baseUrl, image)] : undefined;
  const published = post.publishedAt ?? post.scheduledAt ?? undefined;
  const meta: Metadata = {
    title,
    description,
    alternates: { canonical, languages: languageAlternates(baseUrl, alternates) },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      images,
      locale: post.language,
      publishedTime: published?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  };
  if (post.noindex) meta.robots = { index: false, follow: false };
  return meta;
}

export function buildListMetadata(opts: {
  language: string;
  title: string;
  path: string;
  page?: number;
  description?: string;
  alternates?: Record<string, string> | null;
  baseUrl: string;
}): Metadata {
  const title = opts.page && opts.page > 1 ? `${opts.title} (${opts.page})` : opts.title;
  const url = absoluteUrl(opts.baseUrl, opts.path);
  return {
    title,
    description: opts.description,
    alternates: { canonical: url, languages: languageAlternates(opts.baseUrl, opts.alternates) },
    openGraph: { type: 'website', title, description: opts.description, url, locale: opts.language },
  };
}

/** `{ lang: '/lang/blog' }` for every supported language. */
export const blogIndexAlternates = (): Record<string, string> =>
  Object.fromEntries(supportedLanguages.map((l) => [l, `/${l}/blog`]));

// ---- JSON-LD ----

type Json = Record<string, unknown>;

export function postJsonLd(post: SeoPost, url: string, opts: { baseUrl: string; siteName?: string }): Json {
  const image = post.ogImage || post.coverImage;
  const published = post.publishedAt ?? post.scheduledAt;
  const ld: Json = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    inLanguage: post.language,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const description = post.metaDescription || post.excerpt;
  if (description) ld.description = description;
  if (image) ld.image = [absoluteUrl(opts.baseUrl, image)];
  if (published) ld.datePublished = published.toISOString();
  if (post.updatedAt ?? published) ld.dateModified = (post.updatedAt ?? published)!.toISOString();
  if (post.author?.name) ld.author = { '@type': 'Person', name: post.author.name };
  if (opts.siteName) ld.publisher = { '@type': 'Organization', name: opts.siteName };
  return ld;
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function listJsonLd(opts: { name: string; url: string; language: string; postUrls: string[]; type?: 'CollectionPage' | 'Blog' }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'CollectionPage',
    name: opts.name,
    url: opts.url,
    inLanguage: opts.language,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.postUrls.map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: u })),
    },
  };
}

/** Serialises JSON-LD safely for an inline script (`<` escaped). */
export const jsonLdString = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
