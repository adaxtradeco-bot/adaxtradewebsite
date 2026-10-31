import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BlogHeadingPropertyPanel } from '@/components/admin/PageBuilder/BlogHeadingPropertyPanel';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const section = { id: 'b1', type: 'blog-heading', order: 0, data: { text: 'Old', level: 'h2', align: 'start' } } as unknown as SectionConfig;

describe('BlogHeadingPropertyPanel', () => {
  it('emits merged data when fields change', () => {
    const onUpdate = vi.fn();
    const { getByLabelText } = render(<BlogHeadingPropertyPanel section={section} onUpdate={onUpdate} />);
    fireEvent.change(getByLabelText('Text'), { target: { value: 'New' } });
    expect(onUpdate.mock.calls.at(-1)![0].data).toEqual({ text: 'New', level: 'h2', align: 'start' });
    fireEvent.change(getByLabelText('Level'), { target: { value: 'h4' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.level).toBe('h4');
    fireEvent.change(getByLabelText('Anchor'), { target: { value: 'a1' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.anchor).toBe('a1');
    fireEvent.change(getByLabelText('Alignment'), { target: { value: 'center' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.align).toBe('center');
  });
});
