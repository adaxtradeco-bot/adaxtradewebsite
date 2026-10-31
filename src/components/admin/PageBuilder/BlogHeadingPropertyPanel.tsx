'use client';

import React from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { slugify } from '@/lib/blog/slug';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

export function BlogHeadingPropertyPanel({ section, onUpdate }: Props) {
  const data = ((section as any).data ?? {}) as Record<string, any>;
  const set = (patch: Record<string, any>) => onUpdate({ data: { ...data, ...patch } } as Partial<SectionConfig>);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="bh-text" className={labelCls}>Text</label>
        <input id="bh-text" className={inputCls} value={data.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
      </div>
      <div>
        <label htmlFor="bh-level" className={labelCls}>Level</label>
        <select id="bh-level" className={inputCls} value={data.level ?? 'h2'} onChange={(e) => set({ level: e.target.value })}>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
        </select>
      </div>
      <div>
        <label htmlFor="bh-anchor" className={labelCls}>Anchor</label>
        <input
          id="bh-anchor"
          className={inputCls}
          value={data.anchor ?? ''}
          placeholder={slugify(String(data.text ?? ''))}
          onChange={(e) => set({ anchor: e.target.value })}
        />
        <p className="mt-1 text-[11px] text-gray-400">Leave empty to derive it from the text.</p>
      </div>
      <div>
        <label htmlFor="bh-align" className={labelCls}>Alignment</label>
        <select id="bh-align" className={inputCls} value={data.align ?? 'start'} onChange={(e) => set({ align: e.target.value })}>
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
        </select>
      </div>
    </div>
  );
}
