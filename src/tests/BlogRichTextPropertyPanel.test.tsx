import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogRichTextPropertyPanel } from '@/components/admin/PageBuilder/BlogRichTextPropertyPanel';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const section = { id: 'b2', type: 'blog-rich-text', order: 0, data: { html: '<p>Existing body</p>' } } as unknown as SectionConfig;

describe('BlogRichTextPropertyPanel', () => {
  it('mounts the editor with a toolbar and the initial content', async () => {
    render(<BlogRichTextPropertyPanel section={section} onUpdate={vi.fn()} />);
    expect(await screen.findByRole('toolbar')).toBeTruthy();
    for (const name of ['Bold', 'Italic', 'Underline', 'Link', 'Heading 2', 'Heading 4', 'Bullet list', 'Ordered list', 'Blockquote', 'Code block', 'Image', 'Horizontal rule', 'Right to left', 'Left to right', 'Auto direction']) {
      expect(screen.getByLabelText(name)).toBeTruthy();
    }
    expect(await screen.findByText('Existing body')).toBeTruthy();
  });
});
