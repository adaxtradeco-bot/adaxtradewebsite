import React, { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomHtmlPropertyPanel } from '@/components/admin/PageBuilder/custom-html/CustomHtmlPropertyPanel';
import { FieldEditor } from '@/components/admin/PageBuilder/custom-html/FieldEditors';
import { selectCustomHtmlField } from '@/lib/custom-html/client-role';
import type { FieldDef, FieldValue, RepeaterItem } from '@/lib/custom-html/types';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import { makeFixture } from './fixtures';

const list = (extra: Partial<FieldDef> = {}): FieldDef => ({
  id: 'r1',
  type: 'repeater',
  label: 'Cards',
  group: 'Content',
  default: [
    { t: 'One', n: 'first' },
    { t: 'Two', n: 'second' },
  ],
  children: [
    { id: 't', type: 'text', label: 'Title', default: 'One' },
    { id: 'n', type: 'text', label: 'Note', default: 'first' },
    { id: 's', type: 'text', label: 'Secret', hidden: true, default: '' },
  ],
  ...extra,
});

const seen: RepeaterItem[][] = [];

function Harness({ field }: { field: FieldDef }) {
  const [value, setValue] = useState<FieldValue>(field.default);
  return (
    <FieldEditor
      field={field}
      value={value}
      onChange={(v) => {
        seen.push(v as RepeaterItem[]);
        setValue(v);
      }}
    />
  );
}

const latest = () => seen[seen.length - 1];
const titles = () => latest().map((i) => i.t);
const button = (name: string) => screen.getByRole('button', { name }) as HTMLButtonElement;
/** The open/close buttons of the items. */
const headers = () => screen.getAllByTestId('repeater-item').map((item) => item.querySelector('button[aria-expanded]') as HTMLButtonElement);

afterEach(() => {
  cleanup();
  seen.length = 0;
  localStorage.clear();
  vi.useRealTimers();
});

describe('repeater editor', () => {
  it('adds, duplicates, reorders and removes items', () => {
    render(<Harness field={list()} />);
    expect(screen.getAllByTestId('repeater-item')).toHaveLength(2);
    fireEvent.click(button('Add item'));
    expect(latest()[2]).toEqual({ t: 'One', n: 'first', s: '' });
    fireEvent.click(button('Duplicate item 2'));
    expect(titles()).toEqual(['One', 'Two', 'Two', 'One']);
    fireEvent.click(button('Move item 2 up'));
    expect(titles()).toEqual(['Two', 'One', 'Two', 'One']);
    fireEvent.click(button('Move item 1 down'));
    expect(titles()).toEqual(['One', 'Two', 'Two', 'One']);
    fireEvent.click(button('Remove item 1'));
    expect(titles()).toEqual(['Two', 'Two', 'One']);
    expect(button('Move item 1 up').disabled).toBe(true);
    expect(button('Move item 3 down').disabled).toBe(true);
  });

  it('edits one item without touching the others, and the open item follows a move', () => {
    render(<Harness field={list()} />);
    expect(screen.queryByLabelText('Title')).toBeNull();
    fireEvent.click(headers()[1]);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Changed' } });
    expect(latest()).toEqual([
      { t: 'One', n: 'first' },
      { t: 'Changed', n: 'second' },
    ]);
    // no per-field reset inside items: only the list's own
    expect(screen.queryByRole('button', { name: 'Reset Title' })).toBeNull();
    fireEvent.click(button('Move item 2 up'));
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Changed');
    expect(headers()[0].getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(button('Reset Cards'));
    expect(titles()).toEqual(['One', 'Two']);
  });

  it('respects min and max', () => {
    render(<Harness field={list({ min: 2, max: 3 })} />);
    expect(button('Remove item 1').disabled).toBe(true);
    fireEvent.click(button('Add item'));
    expect(button('Add item').disabled).toBe(true);
    expect(button('Duplicate item 1').disabled).toBe(true);
    expect(button('Remove item 1').disabled).toBe(false);
  });

  it('never exceeds 100 items', () => {
    const many = Array.from({ length: 100 }, () => ({ t: 'x', n: 'y' }));
    render(<Harness field={list({ default: many })} />);
    expect(button('Add item').disabled).toBe(true);
    expect(button('Duplicate item 100').disabled).toBe(true);
  });

  it('can be emptied and refilled', () => {
    render(<Harness field={list()} />);
    fireEvent.click(button('Remove item 2'));
    fireEvent.click(button('Remove item 1'));
    expect(latest()).toEqual([]);
    expect(screen.getByText(/not shown on the page/)).toBeTruthy();
    fireEvent.click(button('Add item'));
    expect(latest()).toHaveLength(1);
  });

  it('shows hidden children to admins only', () => {
    localStorage.setItem('adminUser', JSON.stringify({ role: 'editor' }));
    const first = render(<Harness field={list()} />);
    fireEvent.click(headers()[0]);
    expect(screen.queryByLabelText('Secret')).toBeNull();
    first.unmount();
    localStorage.setItem('adminUser', JSON.stringify({ role: 'admin' }));
    render(<Harness field={list()} />);
    fireEvent.click(headers()[0]);
    expect(screen.getByLabelText('Secret')).toBeTruthy();
  });
});

describe('canvas click on a repeater item field', () => {
  const section = (id: string): SectionConfig => {
    const data = makeFixture({
      fields: [{ id: 'f1', type: 'text', label: 'Headline', group: 'Top', default: 'h' }, list()],
    });
    return { id, type: 'custom-html', order: 0, data } as unknown as SectionConfig;
  };

  const settle = () => act(() => void vi.advanceTimersByTime(50));

  it('opens the group and the item and focuses the clicked child', () => {
    vi.useFakeTimers();
    const { container } = render(<CustomHtmlPropertyPanel section={section('s-open')} onUpdate={vi.fn()} />);
    expect(screen.queryByTestId('repeater-editor')).toBeNull(); // group "Content" is collapsed
    act(() => selectCustomHtmlField('s-open', 'r1.$1.n'));
    settle();
    const input = screen.getByLabelText('Note') as HTMLInputElement;
    expect(input.value).toBe('second');
    expect(document.activeElement).toBe(input);
    expect(container.querySelector('[data-field-id="r1.$1.n"]')!.className).toContain('ring-2');
  });

  it('also works while the list editor is already mounted', () => {
    vi.useFakeTimers();
    render(<CustomHtmlPropertyPanel section={section('s-mounted')} onUpdate={vi.fn()} />);
    act(() => selectCustomHtmlField('s-mounted', 'r1'));
    settle();
    act(() => selectCustomHtmlField('s-mounted', 'r1.$0.t'));
    settle();
    expect(document.activeElement).toBe(screen.getByLabelText('Title'));
    expect((document.activeElement as HTMLInputElement).value).toBe('One');
  });
});

describe('colour editor', () => {
  const field: FieldDef = { id: 'c', type: 'color', label: 'Accent', default: { value: '#112233' } };

  it('offers a picker for short and rgb colours and flags invalid ones', () => {
    render(<Harness field={field} />);
    const text = screen.getByLabelText('Accent') as HTMLInputElement;
    const picker = screen.getByLabelText('Accent picker') as HTMLInputElement;
    expect(picker.value).toBe('#112233');
    fireEvent.change(text, { target: { value: '#AbC' } });
    expect(picker.value).toBe('#aabbcc');
    fireEvent.change(text, { target: { value: 'rgb(255, 0, 16)' } });
    expect(picker.value).toBe('#ff0010');
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.change(text, { target: { value: 'url(x)' } });
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(text.getAttribute('aria-invalid')).toBe('true');
    expect(picker.value).toBe('#112233');
  });
});

describe('icon editor preview', () => {
  it('mirrors the renderer: foreign classes and ids are dropped', () => {
    render(<Harness field={{ id: 'i', type: 'icon', label: 'Icon', default: { svg: '<svg class="ok"></svg>' } }} />);
    fireEvent.change(screen.getByLabelText('Icon'), { target: { value: '<svg class="ok fixed" id="x"></svg>' } });
    expect(screen.getByTestId('icon-preview').innerHTML).toBe('<svg class="ok"></svg>');
  });
});
