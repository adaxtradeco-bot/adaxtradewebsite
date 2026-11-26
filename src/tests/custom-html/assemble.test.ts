import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import { describe, expect, it, vi } from 'vitest';
import {
  analyzeSource,
  assembleCustomHtml,
  buildCustomHtmlData,
  defaultCompile,
  reconstructSource,
  mergePreviousFieldMeta,
} from '@/lib/custom-html/assemble';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import type { CompileRequest, CompileResult } from '@/lib/custom-html/types';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
const compile = vi.fn(
  async (req: CompileRequest): Promise<CompileResult> => ({ cssScoped: req.css, scope: 'abcdef0123', warnings: [] })
);

const FIXTURES = ['partner-showcase.html', 'flow-builder-tabs.html', 'fleet-tailwind.html'];

describe('analyzeSource + buildCustomHtmlData', () => {
  for (const name of FIXTURES) {
    it(`builds valid data from ${name}`, async () => {
      const analysis = analyzeSource(fixture(name));
      expect(analysis.blocked).toBe(false);
      expect(analysis.detect.fields.length).toBeGreaterThan(0);
      const data = await buildCustomHtmlData({ name: 'Imported', analysis, fields: analysis.detect.fields, compile });
      const parsed = parseCustomHtmlData(data);
      expect(parsed.success).toBe(true);
      expect(data.template.scope).toBe('abcdef0123');
      expect(data.template.html).toContain('{{cf:');
      expect(data.template.css).toBe(analysis.extract.css);
      expect(data.values).toEqual({});
    });
  }

  it('passes tokenized html and tailwind info to compile', async () => {
    compile.mockClear();
    const analysis = analyzeSource(fixture('fleet-tailwind.html'));
    expect(analysis.extract.tailwind?.enabled).toBe(true);
    const data = await buildCustomHtmlData({ name: 'TW', analysis, fields: analysis.detect.fields, compile });
    const req = compile.mock.calls[0][0];
    expect(req.html).toContain('{{cf:');
    expect(req.tailwind?.enabled).toBe(true);
    expect(data.template.tailwind?.enabled).toBe(true);
  });

  it('turns inline handlers into a parseable runtime wrapper', async () => {
    const analysis = analyzeSource(fixture('flow-builder-tabs.html'));
    expect(analysis.handlerJs).not.toBe('');
    const data = await buildCustomHtmlData({ name: 'Tabs', analysis, fields: analysis.detect.fields, compile });
    expect(data.template.js).not.toBe('');
    expect(() => acorn.parse(data.template.js, { ecmaVersion: 'latest' })).not.toThrow();
    expect(data.template.html).toContain('data-chs-h');
    expect(data.template.html).not.toMatch(/\sonclick=/i);
  });

  it('blocks on JS syntax errors', () => {
    const analysis = analyzeSource('<p>Hi</p><script>function (</script>');
    expect(analysis.blocked).toBe(true);
    expect(analysis.extract.errors.length).toBeGreaterThan(0);
  });

  it('refuses to build a blocked analysis and reports invalid data readably', async () => {
    const blocked = analyzeSource('<p>x</p><script>function (</script>');
    await expect(buildCustomHtmlData({ name: 'x', analysis: blocked, fields: [], compile })).rejects.toThrow(/Cannot import/);
    const ok = analyzeSource('<h1>Hello</h1>');
    await expect(
      buildCustomHtmlData({
        name: 'x',
        analysis: ok,
        fields: ok.detect.fields,
        compile: async () => ({ cssScoped: '', scope: 'NOPE', warnings: [] }),
      })
    ).rejects.toThrow(/scope/);
  });

  it('surfaces compile warnings', async () => {
    const analysis = analyzeSource('<h1>Hello</h1>');
    const res = await assembleCustomHtml({
      name: 'W',
      analysis,
      fields: analysis.detect.fields,
      compile: async () => ({ cssScoped: '', scope: 'abcdef0123', warnings: ['careful'] }),
    });
    expect(res.compileWarnings).toEqual(['careful']);
  });
});

describe('edit mode (re-import)', () => {
  it('keeps values and field meta for surviving ids, drops removed ones', async () => {
    const first = analyzeSource(fixture('partner-showcase.html'));
    const data1 = await buildCustomHtmlData({ name: 'P', analysis: first, fields: first.detect.fields, compile });
    const [f1, f2, f3] = data1.fields;
    data1.fields[0] = { ...f1, label: 'My title' };
    data1.values = { [f1.id]: 'Edited one', [f2.id]: 'Edited two', [f3.id]: 'Edited three' };
    expect(parseCustomHtmlData(data1).success).toBe(true);

    const src = reconstructSource(data1);
    const second = analyzeSource(src.html, { css: src.css, js: src.js, handlerJs: src.handlerJs });
    // remove f2 from the new field list
    const fields = mergePreviousFieldMeta(second.detect.fields, data1).filter((f) => f.id !== f2.id);
    expect(fields.find((f) => f.id === f1.id)?.label).toBe('My title');
    const data2 = await buildCustomHtmlData({ name: 'P', analysis: second, fields, compile, previous: data1 });

    expect(data2.values[f1.id]).toBe('Edited one');
    expect(data2.values[f3.id]).toBe('Edited three');
    expect(data2.values[f2.id]).toBeUndefined();
    expect(parseCustomHtmlData(data2).success).toBe(true);
  });

  it('drops values whose field type changed', async () => {
    const first = analyzeSource('<h1>Title</h1>');
    const data1 = await buildCustomHtmlData({ name: 'T', analysis: first, fields: first.detect.fields, compile });
    const id = data1.fields[0].id;
    data1.values = { [id]: 'Custom' };
    const retyped = data1.fields.map((f) => ({ ...f, type: 'richtext' as const }));
    const data2 = await buildCustomHtmlData({ name: 'T', analysis: first, fields: retyped, compile, previous: data1 });
    expect(data2.values[id]).toBeUndefined();
  });

  it('keeps inline handlers working across a re-import', async () => {
    const first = analyzeSource(fixture('flow-builder-tabs.html'));
    const data1 = await buildCustomHtmlData({ name: 'Tabs', analysis: first, fields: first.detect.fields, compile });
    const src = reconstructSource(data1);
    expect(src.handlerJs).toContain('const __h = [];');
    const second = analyzeSource(src.html, { css: src.css, js: src.js, handlerJs: src.handlerJs });
    const data2 = await buildCustomHtmlData({ name: 'Tabs', analysis: second, fields: second.detect.fields, compile, previous: data1 });
    expect(data2.template.js).toBe(data1.template.js);
    expect(data2.template.jsSource.trim()).toBe(data1.template.jsSource.trim());
  });
});

describe('defaultCompile', () => {
  it('posts with the admin token and returns the result', async () => {
    window.localStorage.setItem('adminToken', 'tok');
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, cssScoped: '.a{}', scope: 'abcdef0123', warnings: [] }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const out = await defaultCompile({ html: '<p/>', css: '.a{}' });
    expect(out.scope).toBe('abcdef0123');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/admin/custom-html/compile');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 403, json: async () => ({ success: false, error: 'Forbidden' }) }));
    await expect(defaultCompile({ html: '', css: '' })).rejects.toThrow('Forbidden');
    vi.unstubAllGlobals();
    window.localStorage.removeItem('adminToken');
  });
});
