'use client';

import React, { useEffect, useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { blogApi } from '@/lib/admin/api';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';
const LANGS = ['fa', 'en', 'ar'];
const SHOW_KEYS = ['cover', 'date', 'excerpt', 'author', 'category'] as const;

type Term = { slug: string; name: string };

export function BlogLatestPostsPropertyPanel({ section, onUpdate }: Props) {
  const data = ((section as any).data ?? {}) as Record<string, any>;
  const set = (patch: Record<string, any>) => onUpdate({ data: { ...data, ...patch } } as Partial<SectionConfig>);
  const show = data.show ?? {};
  const viewAll = data.viewAll ?? {};

  const [lang, setLang] = useState('fa');
  const [cats, setCats] = useState<Term[] | null>([]);
  const [tags, setTags] = useState<Term[] | null>([]);

  // null = fetch failed (free-text fallback)
  useEffect(() => {
    let active = true;
    blogApi.categories.list(lang).then((r) => active && setCats(r.categories)).catch(() => active && setCats(null));
    blogApi.tags.list(lang).then((r) => active && setTags(r.tags)).catch(() => active && setTags(null));
    return () => {
      active = false;
    };
  }, [lang]);

  const picker = (id: string, label: string, key: 'categorySlug' | 'tagSlug', terms: Term[] | null) => (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      {terms ? (
        <select id={id} className={inputCls} value={data[key] ?? ''} onChange={(e) => set({ [key]: e.target.value })}>
          <option value="">All</option>
          {data[key] && !terms.some((t) => t.slug === data[key]) && <option value={data[key]}>{data[key]}</option>}
          {terms.map((t) => (
            <option key={t.slug} value={t.slug}>{t.name}</option>
          ))}
        </select>
      ) : (
        <input id={id} className={inputCls} value={data[key] ?? ''} placeholder="slug" onChange={(e) => set({ [key]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="blp-title" className={labelCls}>Title</label>
        <input id="blp-title" className={inputCls} value={data.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div>
        <label htmlFor="blp-subtitle" className={labelCls}>Subtitle</label>
        <input id="blp-subtitle" className={inputCls} value={data.subtitle ?? ''} onChange={(e) => set({ subtitle: e.target.value })} />
      </div>
      <div>
        <label htmlFor="blp-count" className={labelCls}>Number of posts (1-24)</label>
        <input
          id="blp-count"
          type="number"
          min={1}
          max={24}
          className={inputCls}
          value={data.count ?? 3}
          onChange={(e) => set({ count: Math.min(24, Math.max(1, Math.floor(Number(e.target.value)) || 1)) })}
        />
      </div>
      <div>
        <label htmlFor="blp-layout" className={labelCls}>Layout</label>
        <select id="blp-layout" className={inputCls} value={data.layout ?? 'grid'} onChange={(e) => set({ layout: e.target.value })}>
          <option value="grid">Grid</option>
          <option value="list">List</option>
          <option value="carousel">Carousel</option>
        </select>
      </div>
      <div>
        <label htmlFor="blp-columns" className={labelCls}>Columns (grid)</label>
        <select id="blp-columns" className={inputCls} value={data.columns ?? 3} onChange={(e) => set({ columns: Number(e.target.value) })}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <fieldset className="space-y-1">
        <legend className={labelCls}>Show</legend>
        {SHOW_KEYS.map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" aria-label={`show-${k}`} checked={!!show[k]} onChange={(e) => set({ show: { ...show, [k]: e.target.checked } })} />
            <span className="capitalize">{k}</span>
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="blp-lang" className={labelCls}>Filter language</label>
        <select id="blp-lang" className={inputCls} value={lang} onChange={(e) => setLang(e.target.value)}>
          {LANGS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      {picker('blp-category', 'Category', 'categorySlug', cats)}
      {picker('blp-tag', 'Tag', 'tagSlug', tags)}
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          aria-label="Show view all link"
          checked={!!viewAll.enabled}
          onChange={(e) => set({ viewAll: { ...viewAll, enabled: e.target.checked } })}
        />
        <span>Show view all link</span>
      </label>
      <div>
        <label htmlFor="blp-viewall" className={labelCls}>View all text</label>
        <input
          id="blp-viewall"
          className={inputCls}
          value={viewAll.text ?? ''}
          onChange={(e) => set({ viewAll: { ...viewAll, text: e.target.value } })}
        />
      </div>
    </div>
  );
}
