'use client';

import React from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { sanitizeHtml } from '@/lib/blog/sanitize';
import '@/styles/blog.css';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

export function BlogHtmlPropertyPanel({ section, onUpdate }: Props) {
  const data = ((section as any).data ?? {}) as Record<string, any>;
  const html = String(data.html ?? '');

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="bhtml-source" className={labelCls}>HTML</label>
        <textarea
          id="bhtml-source"
          dir="ltr"
          rows={10}
          spellCheck={false}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs"
          value={html}
          onChange={(e) => onUpdate({ data: { ...data, html: e.target.value } } as Partial<SectionConfig>)}
        />
        <p className="mt-1 text-[11px] text-gray-400">Scripts, event handlers and unknown tags are removed.</p>
      </div>
      <div>
        <span className={labelCls}>Preview</span>
        <div
          data-testid="blog-html-preview"
          className="blog-prose rounded-md border border-gray-200 bg-white p-3 text-gray-900 dark:border-gray-600"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      </div>
    </div>
  );
}
