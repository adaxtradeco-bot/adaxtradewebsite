import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen, waitFor, cleanup, within } from '@testing-library/react';

import { ImportWizard } from '@/components/admin/PageBuilder/custom-html/ImportWizard';
import { analyzeSource, buildCustomHtmlData } from '@/lib/custom-html/assemble';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import type { CompileRequest, CompileResult, CustomHtmlData } from '@/lib/custom-html/types';

const ok = async (req: CompileRequest): Promise<CompileResult> => ({
  cssScoped: req.css,
  scope: 'abcdef0123',
  warnings: [],
});
const compile = vi.fn(ok);

const LONG = 'Long enough copy for a section of its own. '.repeat(6);
const block = (cls: string, title: string, extra = '') =>
  `<section class="${cls}"><h2>${title}</h2><p>${LONG}</p>${extra}</section>`;
const PAGE = `<style>.a { color: red } .b { color: blue }</style>
${block('a', 'Alpha')}${block('b', 'Beta', '<button onclick="go()">Go</button>')}${block('c', 'Gamma')}
<script>function go() {}</script>`;

beforeEach(() => {
  compile.mockReset().mockImplementation(ok);
});
afterEach(cleanup);

function open(source = PAGE, compileFn: typeof ok = compile) {
  const onInsert = vi.fn();
  const onInsertMany = vi.fn();
  const onClose = vi.fn();
  render(
    <ImportWizard isOpen onClose={onClose} onInsert={onInsert} onInsertMany={onInsertMany} compile={compileFn} />
  );
  fireEvent.click(screen.getByLabelText('Split into sections'));
  fireEvent.change(screen.getByLabelText('HTML source'), { target: { value: source } });
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next: split sections' }));
  return { onInsert, onInsertMany, onClose };
}

const rows = () => screen.getAllByTestId('split-section');
const nameOf = (n: number) => (screen.getByLabelText(`Name of section ${n}`) as HTMLInputElement).value;
const button = (name: string | RegExp) => screen.getByRole('button', { name }) as HTMLButtonElement;
const inserted = (mock: ReturnType<typeof vi.fn>) =>
  mock.mock.calls[0][0] as Array<{ id: string; type: string; order: number; data: CustomHtmlData }>;

describe('ImportWizard — split into sections', () => {
  it('shows the proposed split and inserts every section in one call', async () => {
    const { onInsert, onInsertMany, onClose } = open();
    expect(rows()).toHaveLength(3);
    expect([nameOf(1), nameOf(2), nameOf(3)]).toEqual(['Alpha', 'Beta', 'Gamma']);
    // the script defaults to the section whose button calls it
    const select = screen.getByLabelText('Section for script 1') as HTMLSelectElement;
    expect(select.selectedOptions[0].textContent).toBe('2. Beta');

    fireEvent.click(button('Insert 3 sections'));
    await waitFor(() => expect(onInsertMany).toHaveBeenCalledTimes(1));
    expect(onInsert).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    const sections = inserted(onInsertMany);
    expect(sections.map((s) => s.data.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(sections.map((s) => s.order)).toEqual([0, 1, 2]);
    expect(new Set(sections.map((s) => s.id)).size).toBe(3);
    for (const s of sections) {
      expect(s.type).toBe('custom-html');
      expect(s.id).toMatch(/^section-\d+$/);
      expect(parseCustomHtmlData(s.data).success).toBe(true);
    }
    expect(sections.map((s) => s.data.template.js !== '')).toEqual([false, true, false]);
  });

  it('merges, renames, removes and restores sections', async () => {
    const { onInsertMany } = open();
    expect(button('Merge section 1 with previous').disabled).toBe(true);
    fireEvent.click(button('Merge section 2 with previous'));
    expect(rows()).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Name of section 1'), { target: { value: 'Intro' } });
    fireEvent.click(button('Remove section 2'));
    expect(within(rows()[1]).getByText(/will not be imported/)).toBeTruthy();
    fireEvent.click(button('Restore section 2'));
    fireEvent.click(button('Remove section 2'));
    fireEvent.click(button('Insert 1 section'));
    await waitFor(() => expect(onInsertMany).toHaveBeenCalledTimes(1));
    const [only] = inserted(onInsertMany);
    expect(inserted(onInsertMany)).toHaveLength(1);
    expect(only.data.name).toBe('Intro');
    expect(only.data.template.html).toContain('class="b"');
    expect(only.data.template.html).not.toContain('class="c"');
  });

  it('splits a section further at child boundaries', () => {
    open(`<div class="shell">${block('a', 'Alpha')}${block('b', 'Beta')}</div>`);
    expect(rows()).toHaveLength(1);
    fireEvent.click(button('Split section 1 further'));
    expect(rows()).toHaveLength(2);
    expect(screen.getByTestId('split-warnings').textContent).toContain('copied around 2 sections');
  });

  it('warns about cross-section scripts and follows the assignment', async () => {
    const { onInsertMany } = open();
    expect(screen.queryByTestId('split-issues')).toBeNull();
    const select = screen.getByLabelText('Section for script 1') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: select.options[0].value } });
    expect(screen.getByTestId('split-issues').textContent).toContain('go()');
    fireEvent.click(button('Insert 3 sections'));
    await waitFor(() => expect(onInsertMany).toHaveBeenCalled());
    expect(inserted(onInsertMany).map((s) => s.data.template.jsSource !== '')).toEqual([true, false, false]);
  });

  it('removes unused CSS only when asked', async () => {
    const { onInsertMany } = open();
    const toggle = screen.getByLabelText('Remove unused CSS') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    fireEvent.click(toggle);
    fireEvent.click(button('Insert 3 sections'));
    await waitFor(() => expect(onInsertMany).toHaveBeenCalled());
    const css = inserted(onInsertMany).map((s) => s.data.template.css);
    expect(css[0]).toContain('.a {');
    expect(css[0]).not.toContain('.b {');
    expect(css[1]).toContain('.b {');
  });

  it('inserts nothing when one section fails, and says which', async () => {
    const failing = vi.fn(async (req: CompileRequest) => {
      if (req.html.includes('class="b"')) throw new Error('CSS compile failed (HTTP 500)');
      return ok(req);
    });
    const { onInsert, onInsertMany, onClose } = open(PAGE, failing);
    fireEvent.click(button('Insert 3 sections'));
    await waitFor(() => expect(screen.getByTestId('wizard-errors').textContent).toContain('Section 2 "Beta"'));
    expect(screen.getByTestId('wizard-errors').textContent).toContain('HTTP 500');
    expect(onInsert).not.toHaveBeenCalled();
    expect(onInsertMany).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(button('Insert 3 sections').disabled).toBe(false);
  });

  it('asks to confirm compile warnings before inserting', async () => {
    compile.mockImplementation(async (req) => ({ ...(await ok(req)), warnings: ['Heads up'] }));
    const { onInsertMany } = open();
    fireEvent.click(button('Insert 3 sections'));
    await waitFor(() => expect(screen.getByTestId('confirm-warnings')).toBeTruthy());
    expect(onInsertMany).not.toHaveBeenCalled();
    expect(screen.getByTestId('split-warnings').textContent).toContain('Heads up');
    fireEvent.click(button('Insert anyway'));
    await waitFor(() => expect(onInsertMany).toHaveBeenCalledTimes(1));
    expect(compile).toHaveBeenCalledTimes(3);
  });

  it('cannot insert without a section or a name', () => {
    open();
    fireEvent.change(screen.getByLabelText('Name of section 1'), { target: { value: ' ' } });
    expect(button('Insert 3 sections').disabled).toBe(true);
    for (const n of [1, 2, 3]) fireEvent.click(button(`Remove section ${n}`));
    expect(button('Insert 0 sections').disabled).toBe(true);
  });

  it('goes back to the source step', () => {
    open();
    fireEvent.click(button('Back'));
    expect((screen.getByLabelText('Split into sections') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('HTML source') as HTMLTextAreaElement).value).toBe(PAGE);
  });

  it('keeps the one-section flow as the default', () => {
    render(<ImportWizard isOpen onClose={() => {}} onInsert={() => {}} onInsertMany={() => {}} compile={compile} />);
    expect((screen.getByLabelText('One section') as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole('button', { name: /Next: map fields/ })).toBeTruthy();
  });

  it('is not offered without a multi insert handler or when editing a section', async () => {
    render(<ImportWizard isOpen onClose={() => {}} onInsert={() => {}} compile={compile} />);
    expect(screen.queryByLabelText('Split into sections')).toBeNull();
    cleanup();
    const analysis = analyzeSource(PAGE);
    const data = await buildCustomHtmlData({ name: 'Old', analysis, fields: analysis.detect.fields, compile });
    const section = { id: 'section-1', type: 'custom-html', order: 0, data } as unknown as SectionConfig;
    render(
      <ImportWizard isOpen onClose={() => {}} onInsert={() => {}} onInsertMany={() => {}} editSection={section} compile={compile} />
    );
    fireEvent.click(button('Back'));
    expect(screen.queryByLabelText('Split into sections')).toBeNull();
  });
});
