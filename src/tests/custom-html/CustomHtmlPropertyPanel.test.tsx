import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, cleanup, screen, act } from '@testing-library/react';
import { CustomHtmlPropertyPanel } from '@/components/admin/PageBuilder/custom-html/CustomHtmlPropertyPanel';
import { CHS_EVENTS } from '@/lib/custom-html/client-role';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import { makeFixture } from './fixtures';

function sectionWith(data: unknown): SectionConfig {
  return { id: 'sec1', type: 'custom-html', order: 0, data } as unknown as SectionConfig;
}
function setRole(role: string | null) {
  if (role) localStorage.setItem('adminUser', JSON.stringify({ role }));
  else localStorage.removeItem('adminUser');
}

beforeEach(() => setRole(null));
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('CustomHtmlPropertyPanel', () => {
  it('renders the template name and grouped fields (first group open, others collapsed)', () => {
    const { getByText, getByLabelText, queryByLabelText } = render(
      <CustomHtmlPropertyPanel section={sectionWith(makeFixture())} onUpdate={vi.fn()} />,
    );
    expect(getByText('Promo banner')).toBeTruthy();
    expect(getByText('Content').closest('button')?.getAttribute('aria-expanded')).toBe('true');
    expect(getByText('Style').closest('button')?.getAttribute('aria-expanded')).toBe('false');
    expect((getByLabelText('Headline') as HTMLInputElement).value).toBe('Hello world');
    expect(queryByLabelText('Body')).toBeNull();
    fireEvent.click(getByText('Style'));
    expect(getByLabelText('Body')).toBeTruthy();
  });

  it('calls onUpdate with the new values when a text field is edited', () => {
    const onUpdate = vi.fn();
    const data = makeFixture({ values: { f3: 'keep' } });
    const { getByLabelText } = render(<CustomHtmlPropertyPanel section={sectionWith(data)} onUpdate={onUpdate} />);
    fireEvent.change(getByLabelText('Headline'), { target: { value: 'New headline' } });
    const next = onUpdate.mock.calls.at(-1)![0].data;
    expect(next.values).toEqual({ f3: 'keep', f1: 'New headline' });
    expect(next.template.scope).toBe(data.template.scope);
  });

  it('hides Edit code and the scripts toggle for editors', () => {
    setRole('editor');
    const { queryByText, queryByRole, getByText } = render(
      <CustomHtmlPropertyPanel section={sectionWith(makeFixture())} onUpdate={vi.fn()} />,
    );
    expect(queryByText('Edit code')).toBeNull();
    expect(queryByRole('switch', { name: 'Run scripts in builder' })).toBeNull();
    expect(queryByText('Hidden fields')).toBeNull();
    expect(getByText('Reset all to defaults')).toBeTruthy();
  });

  it('shows Edit code, the scripts toggle and hidden fields for admins', () => {
    setRole('admin');
    const onUpdate = vi.fn();
    const editCode = vi.fn();
    window.addEventListener(CHS_EVENTS.editCode, editCode);
    const { getByText, getByRole } = render(<CustomHtmlPropertyPanel section={sectionWith(makeFixture())} onUpdate={onUpdate} />);
    fireEvent.click(getByText('Edit code'));
    window.removeEventListener(CHS_EVENTS.editCode, editCode);
    expect((editCode.mock.calls[0][0] as CustomEvent).detail).toEqual({ sectionId: 'sec1' });
    expect(getByText('Hidden fields')).toBeTruthy();
    fireEvent.click(getByRole('switch', { name: 'Run scripts in builder' }));
    expect(onUpdate.mock.calls.at(-1)![0].data.runInBuilder).toBe(true);
  });

  it('resets a field to its default', () => {
    const onUpdate = vi.fn();
    const data = makeFixture({ values: { f1: 'Changed' } });
    const { getByLabelText } = render(<CustomHtmlPropertyPanel section={sectionWith(data)} onUpdate={onUpdate} />);
    fireEvent.click(getByLabelText('Reset Headline'));
    expect(onUpdate.mock.calls.at(-1)![0].data.values.f1).toBe('Hello world');
  });

  it('resets all values to defaults', () => {
    const onUpdate = vi.fn();
    const data = makeFixture({ values: { f1: 'Changed', f3: 'x' } });
    const { getByText } = render(<CustomHtmlPropertyPanel section={sectionWith(data)} onUpdate={onUpdate} />);
    fireEvent.click(getByText('Reset all to defaults'));
    expect(onUpdate.mock.calls.at(-1)![0].data.values).toEqual({});
  });

  it('opens the group, focuses and highlights the field on selectField', () => {
    vi.useFakeTimers();
    try {
      const { getByLabelText, container } = render(
        <CustomHtmlPropertyPanel section={sectionWith(makeFixture())} onUpdate={vi.fn()} />,
      );
      act(() => {
        window.dispatchEvent(new CustomEvent(CHS_EVENTS.selectField, { detail: { sectionId: 'sec1', fieldId: 'f3' } }));
      });
      act(() => {
        vi.advanceTimersByTime(10);
      });
      const input = getByLabelText('Body');
      expect(document.activeElement).toBe(input);
      expect(container.querySelector('[data-field-id="f3"]')?.className).toContain('ring-2');
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(container.querySelector('[data-field-id="f3"]')?.className).not.toContain('ring-2');
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores selectField for other sections', () => {
    const { queryByLabelText } = render(<CustomHtmlPropertyPanel section={sectionWith(makeFixture())} onUpdate={vi.fn()} />);
    act(() => {
      window.dispatchEvent(new CustomEvent(CHS_EVENTS.selectField, { detail: { sectionId: 'other', fieldId: 'f3' } }));
    });
    expect(queryByLabelText('Body')).toBeNull();
  });

  it('shows a search box when there are more than 12 fields and filters by label', () => {
    const many = Array.from({ length: 13 }, (_, i) => ({ id: `t${i}`, type: 'text', label: `Item ${i}`, default: 'x' }));
    const data = makeFixture({ fields: many });
    render(<CustomHtmlPropertyPanel section={sectionWith(data)} onUpdate={vi.fn()} />);
    const search = screen.getByLabelText('Search fields');
    fireEvent.change(search, { target: { value: 'item 12' } });
    expect(screen.getByLabelText('Item 12')).toBeTruthy();
    expect(screen.queryByLabelText('Item 3')).toBeNull();
  });
});
