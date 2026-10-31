'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { getLabels } from '@/app/[lang]/blog/_components/labels';
import '@/styles/blog.css';

interface BlogLatestPostsData {
  title?: string;
  subtitle?: string;
  count?: number;
  categorySlug?: string;
  tagSlug?: string;
  layout?: 'grid' | 'list' | 'carousel';
  columns?: number;
  show?: { cover?: boolean; date?: boolean; excerpt?: boolean; author?: boolean; category?: boolean };
  viewAll?: { enabled?: boolean; text?: string };
}

export interface BlogLatestPostsSectionProps {
  data: BlogLatestPostsData | Record<string, any>;
  style?: Record<string, any>;
  isBuilder?: boolean;
}

interface PostItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string } | null;
  url?: string;
}

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const clamp = (n: unknown, min: number, max: number, fallback: number) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
};

// The language hook throws outside a provider (e.g. admin preview); fall back to English.
function usePageLanguage(): string {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLanguage().language as string;
  } catch {
    return 'en';
  }
}

export default function BlogLatestPostsSection({ data, style, isBuilder }: BlogLatestPostsSectionProps) {
  const lang = usePageLanguage();
  const labels = getLabels(lang);
  const count = clamp(data?.count, 1, 24, 3);
  const categorySlug = String(data?.categorySlug || '').trim();
  const tagSlug = String(data?.tagSlug || '').trim();
  const layout: 'grid' | 'list' | 'carousel' = ['grid', 'list', 'carousel'].includes(data?.layout) ? data.layout : 'grid';
  const columns = clamp(data?.columns, 1, 4, 3);
  const show = { cover: true, date: true, excerpt: true, author: false, category: true, ...(data?.show || {}) };
  const viewAll = data?.viewAll || {};

  const [posts, setPosts] = useState<PostItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setPosts(null);
    setFailed(false);
    const qs = new URLSearchParams({ language: lang, limit: String(count) });
    if (categorySlug) qs.set('categorySlug', categorySlug);
    if (tagSlug) qs.set('tagSlug', tagSlug);
    fetch(`/api/blog/posts?${qs.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json) => {
        if (active) setPosts(Array.isArray(json?.posts) ? json.posts : []);
      })
      .catch(() => {
        if (active) {
          setFailed(true);
          setPosts([]);
        }
      });
    return () => {
      active = false;
    };
  }, [lang, count, categorySlug, tagSlug]);

  const title = String(data?.title || '');
  const subtitle = String(data?.subtitle || '');
  const empty = posts !== null && posts.length === 0;

  if (empty && !isBuilder) return null;

  const viewAllHref = categorySlug
    ? `/${lang}/blog/category/${encodeURIComponent(categorySlug)}`
    : tagSlug
      ? `/${lang}/blog/tag/${encodeURIComponent(tagSlug)}`
      : `/${lang}/blog`;

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(lang);
  };

  const container =
    layout === 'grid'
      ? `grid gap-6 ${GRID_COLS[columns]}`
      : layout === 'list'
        ? 'flex flex-col gap-6'
        : 'flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2';

  const cardCls = `overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${
    layout === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'
  } ${layout === 'carousel' ? 'w-72 shrink-0 snap-start' : ''}`;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8" style={style} data-blog-latest-posts>
      {(title || subtitle) && (
        <div className="mb-6 text-start">
          {title && <h2 className="text-3xl font-bold">{title}</h2>}
          {subtitle && <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}

      {posts === null && (
        <p className="text-sm text-gray-500" role="status">…</p>
      )}

      {empty && isBuilder && (
        <p className="text-sm text-gray-400">{failed ? 'Could not load posts.' : labels.empty}</p>
      )}

      {posts && posts.length > 0 && (
        <div className={container} data-layout={layout}>
          {posts.map((p) => {
            const href = p.url || `/${lang}/blog/${encodeURIComponent(p.slug)}`;
            const date = show.date ? fmtDate(p.publishedAt) : '';
            return (
              <article key={p.id} className={cardCls} data-testid="blog-card">
                {show.cover && p.coverImage && (
                  <a href={href} className={layout === 'list' ? 'sm:w-64 sm:shrink-0' : ''}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.coverImage} alt={p.coverImageAlt || p.title} loading="lazy" className="h-48 w-full object-cover" />
                  </a>
                )}
                <div className="flex flex-1 flex-col gap-2 p-4 text-start">
                  {show.category && p.category && (
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{p.category.name}</span>
                  )}
                  <h3 className="text-lg font-semibold leading-snug">
                    <a href={href}>{p.title}</a>
                  </h3>
                  {show.excerpt && p.excerpt && <p className="text-sm text-gray-600 dark:text-gray-400">{p.excerpt}</p>}
                  {((show.author && p.author) || date) && (
                    <p className="mt-auto text-xs text-gray-500">
                      {show.author && p.author && <span>{labels.by} {p.author.name}</span>}
                      {show.author && p.author && date && ' · '}
                      {date && <time dateTime={p.publishedAt || undefined}>{date}</time>}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {viewAll.enabled && posts && posts.length > 0 && (
        <div className="mt-6 text-center">
          <a href={viewAllHref} className="inline-block font-medium text-blue-600 hover:underline dark:text-blue-400">
            {viewAll.text || labels.blog}
          </a>
        </div>
      )}
    </section>
  );
}
