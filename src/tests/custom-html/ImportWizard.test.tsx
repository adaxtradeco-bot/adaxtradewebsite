import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
// SectionLibrary's preview modal pulls in the whole section renderer (and prisma); not needed here.
vi.mock('@/components/section-preview/SectionPreviewModal', () => ({ SectionPreviewModal: () => null }));
vi.mock('@/lib/section-preview-data', () => ({ getSectionPreviewData: () => null }));

import { ImportWizard } from '@/components/admin/PageBuilder/custom-html/ImportWizard';
import { SectionLibrary } from '@/components/admin/PageBuilder/SectionLibrary';
import { analyzeSource, buildCustomHtmlData } from '@/lib/custom-html/assemble';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import type { CompileRequest, CompileResult, CustomHtmlData } from '@/lib/custom-html/types';

const compile = vi.fn(
  async (req: CompileRequest): Promise<CompileResult> => ({ cssScoped: req.css, scope: 'abcdef0123', warnings: [] })
);

const FRAGMENT = '<section class="hero"><h1>Welcome home</h1><p>Short intro text.</p><a href="/go">Go now</a></section>';

function setRole(role: string | null) {
  if (role) window.localStorage.setItem('adminUser', JSON.stringify({ role }));
  else window.localStorage.removeItem('adminUser');
}

beforeEach(() => {
  compile.mockClear();
});
afterEach(() => {
  cleanup();
  setRole(null);
});

describe('ImportWizard', () => {
  it('paste -> analyze -> fields -> name -> insert', async () => {
    const onInsert = vi.fn();
    const onClose = vi.fn();
    render(<ImportWizard isOpen onClose={onClose} onInsert={onInsert} compile={compile} />);

    fireEvent.change(screen.getByLabelText('HTML source'), { target: { value: FRAGMENT } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    expect(screen.getByTestId('extract-summary')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Next: map fields/ }));
    expect(screen.getAllByTestId('field-row').length).toBeGreaterThanOrEqual(3);
    // the preview iframe never gets script permission
    const frame = screen.getByTestId('mapping-preview');
    expect(frame.getAttribute('sandbox')).toBe('allow-same-origin');

    fireEvent.click(screen.getByRole('button', { name: /Next: details/ }));
    const insert = screen.getByRole('button', { name: 'Insert section' }) as HTMLButtonElement;
    expect(insert.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/Section name/), { target: { value: 'My hero' } });
    expect(insert.disabled).toBe(false);
    fireEvent.click(insert);

    await waitFor(() => expect(onInsert).toHaveBeenCalledTimes(1));
    const section = onInsert.mock.calls[0][0] as { id: string; type: string; order: number; data: unknown };
    expect(section.type).toBe('custom-html');
    expect(section.id).toMatch(/^section-\d+$/);
    expect(section.order).toBe(0);
    expect(parseCustomHtmlData(section.data).success).toBe(true);
    expect((section.data as CustomHtmlData).name).toBe('My hero');
    expect(onClose).toHaveBeenCalled();
  });

  it('blocks on a JS syntax error and shows it', () => {
    render(<ImportWizard isOpen onClose={() => {}} onInsert={() => {}} compile={compile} />);
    fireEvent.change(screen.getByLabelText('HTML source'), { target: { value: '<p>x</p><script>function (</script>' } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    expect(screen.getByTestId('wizard-errors')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Next: map fields/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows compile errors inline and does not insert', async () => {
    const onInsert = vi.fn();
    const failing = vi.fn(async () => {
      throw new Error('CSS compile failed (HTTP 403)');
    });
    render(<ImportWizard isOpen onClose={() => {}} onInsert={onInsert} compile={failing} />);
    fireEvent.change(screen.getByLabelText('HTML source'), { target: { value: FRAGMENT } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    fireEvent.click(screen.getByRole('button', { name: /Next: map fields/ }));
    fireEvent.click(screen.getByRole('button', { name: /Next: details/ }));
    fireEvent.change(screen.getByLabelText(/Section name/), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: 'Insert section' }));
    await waitFor(() => expect(screen.getByTestId('wizard-errors').textContent).toContain('403'));
    expect(onInsert).not.toHaveBeenCalled();
  });

  it('lets the author remove a field and edit its label', () => {
    render(<ImportWizard isOpen onClose={() => {}} onInsert={() => {}} compile={compile} />);
    fireEvent.change(screen.getByLabelText('HTML source'), { target: { value: FRAGMENT } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    fireEvent.click(screen.getByRole('button', { name: /Next: map fields/ }));
    const before = screen.getAllByTestId('field-row').length;
    fireEvent.change(screen.getByLabelText('Label for f1'), { target: { value: 'Headline' } });
    expect((screen.getByLabelText('Label for f1') as HTMLInputElement).value).toBe('Headline');
    fireEvent.click(screen.getByLabelText('Remove f2'));
    expect(screen.getAllByTestId('field-row').length).toBe(before - 1);
  });

  it('edit mode re-imports the source and keeps values, replacing via onReplace', async () => {
    const analysis = analyzeSource(FRAGMENT);
    const data = await buildCustomHtmlData({ name: 'Existing', analysis, fields: analysis.detect.fields, compile });
    const f1 = data.fields[0].id;
    data.values = { [f1]: 'Customised headline' };
    const section = { id: 'section-9', type: 'custom-html', order: 2, data } as unknown as SectionConfig;
    const onReplace = vi.fn();
    const onInsert = vi.fn();
    render(<ImportWizard isOpen onClose={() => {}} onInsert={onInsert} editSection={section} onReplace={onReplace} compile={compile} />);

    // starts on the fields step
    expect(screen.getAllByTestId('field-row').length).toBe(data.fields.length);
    fireEvent.click(screen.getByRole('button', { name: /Next: details/ }));
    expect((screen.getByLabelText(/Section name/) as HTMLInputElement).value).toBe('Existing');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onReplace).toHaveBeenCalledTimes(1));
    expect(onInsert).not.toHaveBeenCalled();
    const [id, next] = onReplace.mock.calls[0] as [string, CustomHtmlData];
    expect(id).toBe('section-9');
    expect(next.values[f1]).toBe('Customised headline');
  });

  it('renders nothing when closed', () => {
    const { container } = render(<ImportWizard isOpen={false} onClose={() => {}} onInsert={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('SectionLibrary import entry', () => {
  it('shows Import HTML… for admins and calls onImportHtml', async () => {
    setRole('admin');
    const onImportHtml = vi.fn();
    render(<SectionLibrary onAddSection={() => {}} onImportHtml={onImportHtml} />);
    const btn = await screen.findByRole('button', { name: 'Import HTML…' });
    fireEvent.click(btn);
    expect(onImportHtml).toHaveBeenCalledTimes(1);
  });

  it('hides the Import button for editors', async () => {
    setRole('editor');
    render(<SectionLibrary onAddSection={() => {}} onImportHtml={() => {}} />);
    await waitFor(() => expect(screen.getByPlaceholderText('Search sections...')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Import HTML…' })).toBeNull();
  });
});

describe('MappingPreview helpers', () => {
  it('maps an element between two parses of the same html via child-index paths', async () => {
    const { pathFromBody, resolvePath, buildPreviewDoc } = await import('@/components/admin/PageBuilder/custom-html/MappingPreview');
    const html = '<div><p>a</p><section><h2>t</h2><span id="x">y</span></section></div>';
    const a = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body;
    const b = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body;
    const path = pathFromBody(a.querySelector('#x')!, a)!;
    expect(path).toEqual([0, 1, 1]);
    expect(resolvePath(b, path)).toBe(b.querySelector('#x'));
    const doc = buildPreviewDoc(html, 'p{color:red}</style><script>x</script>', ['https://a.test/x.css', 'javascript:alert(1)']);
    expect(doc).toContain('<link rel="stylesheet" href="https://a.test/x.css">');
    expect(doc).not.toContain('javascript:');
    expect(doc).not.toContain('</style><script>');
  });
});
