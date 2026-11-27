import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ImportWizard } from '@/components/admin/PageBuilder/custom-html/ImportWizard';
import { buildPreviewDoc } from '@/components/admin/PageBuilder/custom-html/MappingPreview';
import { analyzeSource, buildCustomHtmlData, reconstructSource } from '@/lib/custom-html/assemble';
import type { CompileRequest, CompileResult, CustomHtmlData } from '@/lib/custom-html/types';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const ok = (req: CompileRequest): CompileResult => ({ cssScoped: req.css, scope: 'abcdef0123', warnings: [] });
const compile = vi.fn(async (req: CompileRequest) => ok(req));

const LIST = '<ul><li><h3>One</h3><p>a</p></li><li><h3>Two</h3><p>b</p></li></ul>';
const TAILWIND =
  '<html><head><script src="https://cdn.tailwindcss.com"></script></head>' +
  '<body class="antialiased"><div class="p-4"><p class="text-xl">Hi <span class="font-bold">there</span></p></div></body></html>';

afterEach(() => {
  cleanup();
  compile.mockClear();
});

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

function analyze(html: string) {
  fireEvent.change(screen.getByLabelText('HTML source'), { target: { value: html } });
  click('Analyze');
}

function toDetails(name = 'Section') {
  click(/Next: details/);
  fireEvent.change(screen.getByLabelText(/Section name/), { target: { value: name } });
}

describe('wizard: repeaters', () => {
  it('lists child fields, edits and removes them, and inserts the result', async () => {
    const onInsert = vi.fn();
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={onInsert} compile={compile} />);
    analyze(LIST);
    click(/Next: map fields/);
    expect(screen.getAllByTestId('field-row')).toHaveLength(1);
    expect(screen.getAllByTestId('child-field-row')).toHaveLength(2);
    const type = screen.getByLabelText('Type for r1') as HTMLSelectElement;
    expect(Array.from(type.options, (o) => o.value)).toEqual(['repeater']);

    fireEvent.change(screen.getByLabelText('Label for r1.$.f1'), { target: { value: 'Name' } });
    fireEvent.click(screen.getByLabelText('Visible r1.$.f1'));
    fireEvent.change(screen.getByLabelText('Type for r1.$.f1'), { target: { value: 'richtext' } });
    click('Remove r1.$.f2');
    expect(screen.getAllByTestId('child-field-row')).toHaveLength(1);

    toDetails();
    click('Insert section');
    await waitFor(() => expect(onInsert).toHaveBeenCalled());
    const data = onInsert.mock.calls[0][0].data as CustomHtmlData;
    expect(data.fields[0].children).toEqual([
      { id: 'f1', type: 'richtext', label: 'Name', hidden: true, default: 'One' },
    ]);
    expect(data.template.html).toContain('<!--cf:rep:r1-->');
    expect(data.template.html).toContain('<p>a</p>');
  });

  it('removing the list leaves static markup', () => {
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={vi.fn()} compile={compile} />);
    analyze(LIST);
    click(/Next: map fields/);
    click('Remove r1');
    expect(screen.queryByTestId('field-row')).toBeNull();
    expect(screen.queryByTestId('child-field-row')).toBeNull();
  });

  it('does not report CSS fields as removed when editing', async () => {
    const analysis = analyzeSource('<style>:root{--a:#fff}</style><h1>T</h1>');
    const data = await buildCustomHtmlData({
      name: 'x',
      analysis,
      fields: analysis.detect.fields,
      compile: async () => ({ cssScoped: '[data-chs="abcdef0123"]{--a:#fff}', scope: 'abcdef0123', warnings: [] }),
    });
    expect(data.fields.some((f) => f.type === 'color')).toBe(true);
    const section = { id: 's', type: 'custom-html', order: 0, data } as unknown as SectionConfig;
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={vi.fn()} editSection={section} compile={compile} />);
    click(/Next: details/);
    expect(screen.queryByTestId('removed-fields')).toBeNull();
  });
});

describe('wizard: compile warnings', () => {
  const warned = vi.fn(async (req: CompileRequest) => ({ ...ok(req), warnings: ['Careful with this'] }));

  it('shows them and waits for a confirmation before inserting', async () => {
    const onInsert = vi.fn();
    const onClose = vi.fn();
    const save = vi.fn(async () => undefined);
    render(<ImportWizard isOpen onClose={onClose} onInsert={onInsert} compile={warned} saveToLibrary={save} />);
    analyze('<h1>Hello</h1>');
    click(/Next: map fields/);
    toDetails();
    click('Insert section');
    await screen.findByTestId('confirm-warnings');
    expect(screen.getByText('Careful with this')).toBeTruthy();
    expect(onInsert).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    click('Insert anyway');
    await waitFor(() => expect(onInsert).toHaveBeenCalledTimes(1));
    expect(warned).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it('compiles again after a change', async () => {
    warned.mockClear();
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={vi.fn()} compile={warned} />);
    analyze('<h1>Hello</h1>');
    click(/Next: map fields/);
    toDetails();
    click('Insert section');
    await screen.findByTestId('confirm-warnings');
    fireEvent.change(screen.getByLabelText(/Section name/), { target: { value: 'Other' } });
    expect(screen.queryByTestId('confirm-warnings')).toBeNull();
    expect(screen.getByRole('button', { name: 'Insert section' })).toBeTruthy();
  });
});

describe('wizard: Tailwind', () => {
  it('compiles the preview and keeps its sandbox without scripts', async () => {
    const tw = vi.fn(async () => ({ cssScoped: '[data-chs="abcdef0123"] .p-4{padding:1rem}', scope: 'abcdef0123', warnings: [] }));
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={vi.fn()} compile={tw} />);
    analyze(TAILWIND);
    expect(screen.getByText('Tailwind CDN detected: utility classes are compiled on insert.')).toBeTruthy();
    click(/Next: map fields/);
    const frame = screen.getByTestId('mapping-preview') as HTMLIFrameElement;
    await waitFor(() => expect(frame.getAttribute('srcdoc')).toContain('padding:1rem'));
    expect(frame.getAttribute('srcdoc')).toContain('<body data-chs="abcdef0123">');
    expect(frame.getAttribute('sandbox')).toBe('allow-same-origin');
    const request = (tw.mock.calls[0] as unknown as [CompileRequest])[0];
    expect(request.tailwind?.enabled).toBe(true);
    expect(request.content).toContain('font-bold');
  });

  it('does not compile a preview without Tailwind', () => {
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={vi.fn()} compile={compile} />);
    analyze('<h1>Hello</h1>');
    click(/Next: map fields/);
    expect(compile).not.toHaveBeenCalled();
    expect(buildPreviewDoc('<p></p>', '', [])).toContain('<body><p></p></body>');
  });

  it('keeps Tailwind and the single body wrapper through "Edit code"', async () => {
    const first = analyzeSource(TAILWIND);
    const data = await buildCustomHtmlData({ name: 'tw', analysis: first, fields: first.detect.fields, compile });
    expect(compile.mock.calls[0][0].content).toContain('font-bold');
    expect(data.template.tailwind?.enabled).toBe(true);

    compile.mockClear();
    const source = reconstructSource(data);
    const second = analyzeSource(source.html, { css: source.css, js: source.js, handlerJs: source.handlerJs });
    expect(second.extract.tailwind).toBeUndefined();
    const again = await buildCustomHtmlData({
      name: 'tw',
      analysis: second,
      fields: second.detect.fields,
      compile,
      previous: data,
    });
    expect(compile.mock.calls[0][0].tailwind?.enabled).toBe(true);
    expect(compile.mock.calls[0][0].content).toContain('font-bold');
    expect(again.template.tailwind).toEqual(data.template.tailwind);
    expect(again.template.html.match(/data-chs-body/g)).toHaveLength(1);
  });
});
