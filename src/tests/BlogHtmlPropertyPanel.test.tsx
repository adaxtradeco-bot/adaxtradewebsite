import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BlogHtmlPropertyPanel } from '@/components/admin/PageBuilder/BlogHtmlPropertyPanel';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const section = { id: 'b3', type: 'blog-html', order: 0, data: { html: '<p>Hi</p><script>x()</script>' } } as unknown as SectionConfig;

describe('BlogHtmlPropertyPanel', () => {
  it('shows a sanitized preview and emits html on edit', () => {
    const onUpdate = vi.fn();
    const { getByLabelText, getByTestId } = render(<BlogHtmlPropertyPanel section={section} onUpdate={onUpdate} />);
    const preview = getByTestId('blog-html-preview');
    expect(preview.querySelector('script')).toBeNull();
    expect(preview.textContent).toBe('Hi');
    fireEvent.change(getByLabelText('HTML'), { target: { value: '<p>New</p>' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.html).toBe('<p>New</p>');
  });
});
