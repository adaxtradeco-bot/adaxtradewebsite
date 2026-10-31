import React from 'react';
import { slugify } from '@/lib/blog/slug';
import '@/styles/blog.css';

export interface BlogHeadingSectionProps {
  data: { text?: string; level?: 'h2' | 'h3' | 'h4'; anchor?: string; align?: 'start' | 'center' | 'end' } | Record<string, any>;
  style?: Record<string, any>;
  isBuilder?: boolean;
}

const LEVELS = ['h2', 'h3', 'h4'] as const;
const SIZES = { h2: 'text-3xl', h3: 'text-2xl', h4: 'text-xl' } as const;
const ALIGN = { start: 'text-start', center: 'text-center', end: 'text-end' } as const;

export default function BlogHeadingSection({ data, style }: BlogHeadingSectionProps) {
  const text = String(data?.text ?? '');
  const level = (LEVELS as readonly string[]).includes(data?.level) ? (data.level as (typeof LEVELS)[number]) : 'h2';
  const align = (ALIGN as Record<string, string>)[data?.align] ? (data.align as keyof typeof ALIGN) : 'start';
  const id = String(data?.anchor || '').trim() || slugify(text) || undefined;
  const Tag = level;
  return (
    <div className="mx-auto w-full max-w-3xl px-4" style={style}>
      <Tag id={id} className={`${SIZES[level]} ${ALIGN[align]} scroll-mt-24 font-bold leading-snug`}>
        {text}
      </Tag>
    </div>
  );
}
