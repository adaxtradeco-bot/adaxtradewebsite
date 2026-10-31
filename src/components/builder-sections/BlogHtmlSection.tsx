import React from 'react';
import { sanitizeHtml } from '@/lib/blog/sanitize';
import '@/styles/blog.css';

export interface BlogHtmlSectionProps {
  data: { html?: string } | Record<string, any>;
  style?: Record<string, any>;
  isBuilder?: boolean;
}

// Sanitized on render too, so stored HTML can never inject script.
export default function BlogHtmlSection({ data, style }: BlogHtmlSectionProps) {
  const html = sanitizeHtml(String(data?.html ?? ''));
  return (
    <div className="mx-auto w-full max-w-3xl px-4" style={style}>
      <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
