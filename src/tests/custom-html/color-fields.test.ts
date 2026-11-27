/**
 * Colour fields (spec §6.3), CSS field identity across re-imports, and the icon class/id filter.
 */
import { describe, expect, it } from 'vitest';
import { analyzeSource, buildCustomHtmlData, reconstructSource } from '@/lib/custom-html/assemble';
import { compileCss } from '@/lib/custom-html/css-scope';
import { renderCustomHtml } from '@/lib/custom-html/render';
import { detectCssFields } from '@/lib/custom-html/tokenize';
import type { CustomHtmlData, FieldDef, FieldValue } from '@/lib/custom-html/types';
import { sanitizeSvg } from '@/lib/sanitize';

const R = '[data-chs="0123456789"]';
const colours = (fields: FieldDef[]) => fields.filter((f) => f.type === 'color');
const values = (fields: FieldDef[]) => fields.map((f) => (f.default as { value: string }).value);

describe('detectCssFields — colour custom properties', () => {
  it('finds them on the root, its dark variant, inside @media, and replaces only the value', () => {
    const css =
      `${R} { --bg: #07080A; --accent:rgb(79 127 255 / 50%) !important; --text: rebeccapurple }\n` +
      `.dark ${R} { --bg: #000 }\n` +
      `@media (max-width: 600px) { ${R}, ${R} { /* c */ --bg: hsl(10, 20%, 30%) } }`;
    const r = detectCssFields(css, []);
    expect(values(r.fields)).toEqual(['#07080A', 'rgb(79 127 255 / 50%)', 'rebeccapurple', '#000', 'hsl(10, 20%, 30%)']);
    expect(r.fields.map((f) => f.label)).toEqual([
      'Colour › bg',
      'Colour › accent',
      'Colour › text',
      'Colour › bg (dark)',
      'Colour › bg (media)',
    ]);
    expect(r.fields.every((f) => f.type === 'color' && f.group === 'Colours')).toBe(true);
    expect(r.cssScoped).toContain('--bg: {{cf:f1.value}}; --accent:{{cf:f2.value}} !important; --text: {{cf:f3.value}} }');
  });

  it('ignores other selectors, non-colours, Tailwind internals and universal rules', () => {
    const css =
      `${R} .card { --bg: red }\n` +
      `${R}, ${R} * { --ring: #fff }\n` +
      `${R}:hover { --bg: red }\n` +
      `${R} { --font: serif; --ease: linear; --size: 12px; --alias: var(--bg); --tw-ring-color: #fff; color: red; --grad: linear-gradient(red, blue) }\n` +
      `@keyframes k { from { --bg: red } }\n` +
      `@font-face { --bg: red }`;
    expect(detectCssFields(css, [])).toEqual({ cssScoped: css, fields: [] });
  });

  it('accepts the wrapper element of the section', () => {
    const wrapper = document.createElement('section');
    wrapper.className = 'hero dark-theme';
    wrapper.id = 'top';
    const css = `${R} .hero { --a: #111 } ${R} section#top { --b: #222 } ${R} .other { --c: #333 } ${R} .hero p { --d: #444 }`;
    expect(values(detectCssFields(css, [], { wrapper }).fields)).toEqual(['#111', '#222']);
  });

  it('works on the output of the real compiler and renders safely', async () => {
    const compiled = await compileCss({
      html: '<div class="w"></div>',
      css: ':root { --main: #123456 } body { --alt: teal } html.dark { --main: #000 }',
    });
    const r = detectCssFields(compiled.cssScoped, []);
    expect(colours(r.fields)).toHaveLength(3);
    const [main, alt] = r.fields;
    const data = {
      template: {
        html: '', css: '', cssScoped: r.cssScoped, js: '', jsSource: '',
        externalScripts: [], externalStylesheets: [], scope: compiled.scope,
      },
      fields: r.fields,
    };
    const ok = renderCustomHtml({ ...data, values: { [main.id]: { value: '#abcdef' } } }, { builder: false }).css;
    expect(ok).toContain('--main: #abcdef');
    expect(ok).toContain('--alt: teal');
    const hostile: Record<string, FieldValue> = {
      [main.id]: { value: 'red;} body{display:none' },
      [alt.id]: { value: 'url(https://evil.example/x)' },
    };
    const safe = renderCustomHtml({ ...data, values: hostile }, { builder: false }).css;
    expect(safe).toContain('--main: #123456');
    expect(safe).toContain('--alt: teal');
    expect(safe).not.toMatch(/evil|display:none/);
  });

  it('is not confused by escaped quotes and braces in class names', () => {
    const css =
      `${R} .before\\:content-\\[\\'\\'\\]::before { content: var(--tw-content) }\n` +
      `${R} .x\\"y\\{ { color: red }\n` +
      `${R} .a\\,b { --no: red }\n` +
      `${R} { --yes: #fff }\n` +
      `${R} .bg { background-image: url(/after.png) }`;
    const r = detectCssFields(css, []);
    expect(r.fields.map((f) => f.type)).toEqual(['color', 'bgImage']);
    expect(r.cssScoped).toContain("url('{{cf:f2.src}}')");
  });

  it('stops at the field limit', () => {
    const css = `${R} { ${Array.from({ length: 700 }, (_, i) => `--c${i}: red;`).join('')} }`;
    expect(detectCssFields(css, []).fields).toHaveLength(600);
  });
});

describe('CSS fields across a re-import', () => {
  const source =
    '<style>:root { --accent: #4f7fff; --text: #fff } .hero { background-image: url(/a.png) }</style>' +
    '<div class="hero"><h1>Title</h1><p>Body</p></div>';

  async function build(html: string, previous?: CustomHtmlData, css?: string) {
    const extra = previous ? reconstructSource(previous) : null;
    const analysis = analyzeSource(html, extra ? { css: css ?? extra.css } : {});
    return buildCustomHtmlData({ name: 'C', analysis, fields: analysis.detect.fields, compile: compileCss, previous });
  }

  const byLabel = (data: CustomHtmlData, label: string) => data.fields.find((f) => f.label === label)!;

  it('keeps colour and background values when the markup field ids shift', async () => {
    const first = await build(source);
    const accent = byLabel(first, 'Colour › accent');
    const bg = byLabel(first, 'Styles › .hero Background');
    first.values = { [accent.id]: { value: '#ff0000' }, [bg.id]: { src: '/mine.png' } };
    byLabel(first, 'Colour › text').hidden = true;

    // a new element in front changes how many ids the markup uses
    const html = reconstructSource(first).html.replace('<h1', '<h6>New</h6><h5>Newer</h5><h4>Newest</h4><h1');
    const second = await build(html, first);
    expect(second.values[byLabel(second, 'Colour › accent').id]).toEqual({ value: '#ff0000' });
    expect(second.values[byLabel(second, 'Styles › .hero Background').id]).toEqual({ src: '/mine.png' });
    expect(byLabel(second, 'Colour › text').hidden).toBe(true);
    expect(Object.keys(second.values)).toHaveLength(2);
  });

  it('keeps the value of a variable whose default changed and never hands it to another one', async () => {
    const first = await build(source);
    const accent = byLabel(first, 'Colour › accent');
    first.values = { [accent.id]: { value: '#ff0000' } };
    const changed = await build(reconstructSource(first).html, first, ':root { --accent: #000; --text: #fff }');
    expect(changed.values).toEqual({ [byLabel(changed, 'Colour › accent').id]: { value: '#ff0000' } });
    const removed = await build(reconstructSource(first).html, first, ':root { --text: #fff }');
    expect(removed.values).toEqual({});
  });
});

describe('editor icons keep only the classes and ids of the default', () => {
  const svg =
    '<svg viewBox="0 0 2 2" class="ico"><defs><linearGradient id="g1"><stop offset="0"></stop></linearGradient></defs>' +
    '<rect fill="url(#g1)" class="bar"></rect></svg>';
  const hostile =
    '<svg class="ico fixed inset-0" id="admin-root"><linearGradient id="g1"></linearGradient>' +
    '<g class="bar z-50" id="g2"><path class="w-screen"></path></g></svg>';
  const template = {
    html: '<i>{{cf:i.svg}}</i>', css: '', cssScoped: '', js: '', jsSource: '',
    externalScripts: [], externalStylesheets: [], scope: '0123456789',
  };
  const field: FieldDef = { id: 'i', type: 'icon', label: 'i', default: { svg } };

  it('renders the default with its gradient reference intact', () => {
    const out = renderCustomHtml({ template, fields: [field] }, { builder: false }).html;
    expect(out).toContain('id="g1"');
    expect(out).toContain('fill="url(#g1)"');
    expect(out).toContain('class="ico"');
    expect(out).toContain('class="bar"');
  });

  it('drops foreign classes and ids from a value', () => {
    const out = renderCustomHtml({ template, fields: [field], values: { i: { svg: hostile } } }, { builder: false }).html;
    expect(out).toContain('class="ico"');
    expect(out).toContain('class="bar"');
    expect(out).toContain('id="g1"');
    expect(out).not.toMatch(/fixed|inset-0|z-50|w-screen|admin-root|g2/);
  });

  it('allows the names of every default item for a repeater child', () => {
    const list: FieldDef = {
      id: 'r',
      type: 'repeater',
      label: 'r',
      default: [{ i: { svg: '<svg class="a" id="one"></svg>' } }, { i: { svg: '<svg class="b" id="two"></svg>' } }],
      children: [{ ...field, default: { svg: '<svg class="a"></svg>' } }],
    };
    const out = renderCustomHtml(
      {
        template: { ...template, html: '<!--cf:rep:r--><i>{{cf:r.$.i.svg}}</i><!--/cf:rep:r-->' },
        fields: [list],
        values: { r: [{ i: { svg: '<svg class="a b c" id="two"></svg>' } }] },
      },
      { builder: false },
    ).html;
    expect(out).toBe('<i><svg class="a b" id="two"></svg></i>');
  });

  it('leaves the global sanitizer unchanged', () => {
    expect(sanitizeSvg('<svg class="anything" id="any"></svg>')).toBe('<svg class="anything" id="any"></svg>');
  });
});
