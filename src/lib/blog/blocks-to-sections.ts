import { randomUUID } from 'crypto';
import { slugify } from './slug';
import type { ContentBlock } from './schemas';

type BlogSection = { id: string; type: string; order: number; data: Record<string, any> };

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function blockToSection(block: ContentBlock): Omit<BlogSection, 'id' | 'order'> {
  switch (block.type) {
    case 'heading':
      return {
        type: 'blog-heading',
        data: { text: block.text, level: `h${block.level}`, anchor: slugify(block.text) || undefined, align: 'start' },
      };
    case 'paragraph':
      return { type: 'blog-rich-text', data: { html: block.html } };
    case 'html':
      return { type: 'blog-html', data: { html: block.html } };
    case 'image': {
      const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
      return {
        type: 'blog-rich-text',
        data: { html: `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" loading="lazy">${caption}</figure>` },
      };
    }
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const items = block.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');
      return { type: 'blog-rich-text', data: { html: `<${tag}>${items}</${tag}>` } };
    }
    case 'quote': {
      const cite = block.cite ? `<p>— ${escapeHtml(block.cite)}</p>` : '';
      return { type: 'blog-rich-text', data: { html: `<blockquote><p>${escapeHtml(block.text)}</p>${cite}</blockquote>` } };
    }
  }
}

const withIds = (parts: Array<Omit<BlogSection, 'id' | 'order'>>): BlogSection[] =>
  parts.map((part, order) => ({ id: randomUUID(), order, ...part }));

export function contentToSections(content: ContentBlock[]): BlogSection[] {
  return withIds(content.map(blockToSection));
}

/** A raw `html` payload becomes a single `blog-html` section. */
export function htmlToSections(html: string): BlogSection[] {
  return withIds([{ type: 'blog-html', data: { html } }]);
}
