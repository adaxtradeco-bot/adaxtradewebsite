/**
 * Repeaters end to end (spec §5, §6.5, §6.6, §9): detection, hints, tokenizing, rendering,
 * click-to-map, re-import and language sync.
 */
import { describe, expect, it } from 'vitest';
import {
  analyzeSource,
  buildCustomHtmlData,
  mergePreviousFieldMeta,
  reconstructSource,
  removedFieldLabels,
} from '@/lib/custom-html/assemble';
import { detectFields, markElementAsField, unmarkField } from '@/lib/custom-html/detect';
import { renderCustomHtml, renderWithDefaults } from '@/lib/custom-html/render';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import { mergeForLanguageSync, type CustomHtmlSectionLike } from '@/lib/custom-html/sync';
import { tokenizeHtml } from '@/lib/custom-html/tokenize';
import type { CompileResult, CustomHtmlData, FieldDef, RepeaterItem } from '@/lib/custom-html/types';

const compile = async (): Promise<CompileResult> => ({ cssScoped: '', scope: 'abcdef0123', warnings: [] });

const LIST =
  '<ul class="list">\n' +
  '  <li class="card"><h3>One</h3><p>First</p></li>\n' +
  '  <li class="card"><h3>Two</h3><p><em>Second</em></p></li>\n' +
  '</ul>';

const repeaters = (fields: FieldDef[]) => fields.filter((f) => f.type === 'repeater');
const items = (field: FieldDef) => field.default as RepeaterItem[];
const parse = (html: string) => new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html').body;

/** Markup without editor attributes and inter-element whitespace. */
function normalized(html: string): string {
  const body = parse(html);
  body.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('data-cf');
    el.removeAttribute('data-cf-item');
  });
  return body.innerHTML.replace(/>\s+</g, '><').trim();
}

async function build(html: string, previous?: CustomHtmlData): Promise<CustomHtmlData> {
  const analysis = analyzeSource(html);
  const fields = previous ? mergePreviousFieldMeta(analysis.detect.fields, previous) : analysis.detect.fields;
  return buildCustomHtmlData({ name: 'R', analysis, fields, compile, previous });
}

describe('repeater detection', () => {
  it('turns structurally identical children into one repeater and widens child text types', () => {
    const r = detectFields(LIST);
    expect(r.warnings).toEqual([]);
    expect(r.fields).toHaveLength(1);
    const [list] = r.fields;
    expect(list).toMatchObject({ id: 'r1', type: 'repeater', label: 'Section › List 1' });
    expect(list.children).toEqual([
      { id: 'f1', type: 'text', label: 'Heading', default: 'One' },
      { id: 'f2', type: 'richtext', label: 'Text', default: 'First' },
    ]);
    expect(items(list)).toEqual([
      { f1: 'One', f2: 'First' },
      { f1: 'Two', f2: '<em>Second</em>' },
    ]);
    expect(r.root.querySelector('ul')!.getAttribute('data-cf')).toBe('r1');
    expect(r.root.querySelectorAll('li[data-cf-item="r1"]')).toHaveLength(2);
    expect(r.root.querySelectorAll('[data-cf="r1.$.f1"]')).toHaveLength(2);
  });

  it('keeps document order and uses the item root as a child (nav links)', () => {
    const r = detectFields('<h1>T</h1><nav><a href="/a">A</a><a href="/b">B</a></nav><p>After</p>');
    expect(r.fields.map((f) => f.type)).toEqual(['text', 'repeater', 'text']);
    expect(items(r.fields[1]).map((i) => Object.values(i)[0])).toEqual([
      { text: 'A', href: '/a' },
      { text: 'B', href: '/b' },
    ]);
  });

  const card = (t: string) => `<div class="c"><h3>${t}</h3></div>`;

  it('needs two matching children covering 80 % in one block', () => {
    const four = card('1') + card('2') + card('3') + card('4');
    const withStatic = detectFields(`<div>${four}<div class="more"></div></div>`);
    expect(repeaters(withStatic.fields)).toHaveLength(1);
    expect(items(repeaters(withStatic.fields)[0])).toHaveLength(4);

    expect(repeaters(detectFields(`<div>${card('1')}${card('2')}<p>x</p></div>`).fields)).toHaveLength(0);
    expect(repeaters(detectFields(`<div>${card('1')}<p>x</p></div>`).fields)).toHaveLength(0);
    const split = card('1') + card('2') + '<hr>' + card('3') + card('4');
    expect(repeaters(detectFields(`<div>${split}</div>`).fields)).toHaveLength(0);
    expect(repeaters(detectFields(`<div>${card('1')} or ${card('2')}</div>`).fields)).toHaveLength(0);
  });

  it('does not repeat the section root, empty items or inline formatting', () => {
    expect(repeaters(detectFields(card('1') + card('2')).fields)).toHaveLength(0);
    expect(repeaters(detectFields('<div><i class="dot"></i><i class="dot"></i></div>').fields)).toHaveLength(0);
    expect(detectFields('<div><span>a</span><span>b</span></div>').fields[0].type).toBe('richtext');
  });

  it.each([
    ['an id', '<div class="c" id="a"><h3>1</h3></div><div class="c" id="b"><h3>2</h3></div>'],
    ['a data attribute', '<div class="c" data-tab="1"><h3>1</h3></div><div class="c" data-tab="2"><h3>2</h3></div>'],
    ['a handler', '<div class="c" data-chs-h="click:0"><h3>1</h3></div><div class="c" data-chs-h="click:1"><h3>2</h3></div>'],
    ['fixed text', '<div class="c">Before<div>x</div><h3>1</h3></div><div class="c">After<div>x</div><h3>2</h3></div>'],
    ['a missing field', '<div class="c"><h3>1</h3><p>a</p></div><div class="c"><h3>2</h3><p></p><img src="/x.png"></div>'],
    ['a nested style', '<div class="c"><h3 style="color:red">1</h3></div><div class="c"><h3 style="color:blue">2</h3></div>'],
    ['a nested class', '<div class="c"><h3 class="a">1</h3></div><div class="c"><h3 class="b">2</h3></div>'],
  ])('keeps separate fields when items differ in %s', (_what, html) => {
    const r = detectFields(`<div class="w">${html}</div>`);
    expect(repeaters(r.fields)).toHaveLength(0);
    expect(r.root.querySelector('[data-cf-item]')).toBeNull();
  });

  it('only repeats the outermost level', () => {
    const column = '<div class="col"><ul><li>a</li><li>b</li></ul></div>';
    const r = detectFields(`<div class="row">${column}${column}</div>`);
    expect(r.fields.map((f) => f.type)).toEqual(['repeater']);
    expect(r.fields[0].children!.every((c) => c.type !== 'repeater')).toBe(true);
  });

  it('handles icons that need a wrapper span in every item', () => {
    const item = (d: string) => `<li><a href="/x"><svg viewBox="0 0 1 1"><path d="${d}"></path></svg>Go</a></li>`;
    const r = detectFields(`<ul>${item('M0 0')}${item('M1 1')}</ul>`);
    const [list] = repeaters(r.fields);
    const icon = list.children!.find((c) => c.type === 'icon')!;
    expect(r.root.querySelectorAll(`span[data-cf="r1.$.${icon.id}"] > svg`)).toHaveLength(2);
    expect((items(list)[1][icon.id] as { svg: string }).svg).toContain('M1 1');
  });

  it('leaves lists longer than the limit as separate fields', () => {
    const r = detectFields(`<ul>${'<li>x</li>'.repeat(101)}</ul>`);
    expect(repeaters(r.fields)).toHaveLength(0);
    expect(r.fields).toHaveLength(101);
    expect(r.warnings.join()).toMatch(/limit of 100/);
  });

  it('counts repeater children towards the field limit', () => {
    const r = detectFields(`<ul><li>a</li><li>b</li></ul>${'<h2>x</h2>'.repeat(600)}`);
    const total = r.fields.reduce((n, f) => n + 1 + (f.children?.length ?? 0), 0);
    expect(total).toBe(600);
  });
});

describe('data-edit-repeat hint', () => {
  const html =
    '<div data-edit-repeat="team" data-edit-label="Team">' +
    '<div class="a" id="x"><h3 data-edit="name" data-edit-label="Name">Ann</h3><p>Dev</p></div>' +
    '<div class="b"><h3>Bob</h3></div>' +
    '</div>';

  it('repeats the children even when they differ, and says what is lost', () => {
    const r = detectFields(html);
    const [list] = r.fields;
    expect(list).toMatchObject({ id: 'team', type: 'repeater', label: 'Team' });
    expect(list.children!.map((c) => [c.id, c.label])).toEqual([
      ['name', 'Name'],
      ['f1', 'Text'],
    ]);
    expect(items(list)[1]).toEqual({ name: 'Bob', f1: '' });
    expect(r.warnings.join(' ')).toMatch(/do not contain every field/);
    expect(r.warnings.join(' ')).toMatch(/differ in markup/);
    expect(r.root.innerHTML).not.toContain('data-edit');
    expect(r.hasHints).toBe(true);
  });

  it('works with "hints only", detecting item content when the items carry no hints', () => {
    const r = detectFields('<p>skip</p><ul data-edit-repeat="rows"><li>a</li><li>b</li></ul>', { hintsOnly: true });
    expect(r.fields.map((f) => f.id)).toEqual(['rows']);
    expect(r.fields[0].children).toHaveLength(1);
  });

  it('accepts a single example item', () => {
    const r = detectFields('<div data-edit-repeat><article><h2>Only</h2></article></div>');
    expect(items(r.fields[0])).toEqual([{ f1: 'Only' }]);
  });
});

describe('tokenize + render', () => {
  it('keeps the first item as the template, with its trailing whitespace', () => {
    const r = detectFields(LIST);
    expect(tokenizeHtml(r.root, r.fields)).toBe(
      '<ul class="list" data-cf="r1">\n  <!--cf:rep:r1--><li class="card" data-cf-item="r1">' +
        '<h3 data-cf="r1.$.f1">{{cf:r1.$.f1}}</h3><p data-cf="r1.$.f2">{{cf:r1.$.f2}}</p></li>\n  <!--cf:rep:r1-->'.replace(
          '<!--cf:rep:r1-->',
          '<!--/cf:rep:r1-->'
        ) +
        '\n</ul>'
    );
  });

  it('ignores repeater comments written by the author', () => {
    const r = detectFields('<div><!--cf:rep:r1--><p>x</p><!--/cf:rep:r1--></div>');
    expect(tokenizeHtml(r.root, r.fields)).not.toContain('cf:rep');
  });

  it('reproduces the source with the defaults and strips editor attributes publicly', async () => {
    const data = await build(LIST);
    expect(parseCustomHtmlData(data).success).toBe(true);
    expect(normalized(renderWithDefaults(data))).toBe(normalized(LIST));
    const publicHtml = renderCustomHtml(data, { builder: false }).html;
    expect(publicHtml).not.toMatch(/data-cf|<!--/);
    const builder = renderCustomHtml(data, { builder: true }).html;
    expect(builder).toContain('data-cf="r1.$1.f2"');
  });

  it('renders edited items in order, nothing for an empty list, and never re-scans values', async () => {
    const data = await build('<h1>Head</h1>' + LIST);
    const list = data.fields.find((f) => f.type === 'repeater')!;
    const [title, body] = list.children!.map((c) => c.id);
    const values = { [list.id]: [{ [title]: '{{cf:f1}}', [body]: '<img src=x onerror=1>ok' }, { [title]: 'Z' }] };
    const out = parse(renderCustomHtml({ ...data, values }, { builder: false }).html);
    expect(Array.from(out.querySelectorAll('h3'), (h) => h.textContent)).toEqual(['{{cf:f1}}', 'Z']);
    expect(out.querySelector('img')).toBeNull();
    const empty = parse(renderCustomHtml({ ...data, values: { [list.id]: [] } }, { builder: false }).html);
    expect(empty.querySelectorAll('li')).toHaveLength(0);
    expect(empty.querySelector('h1')!.textContent).toBe('Head');
  });

  it('works inside table bodies', async () => {
    const table = '<table><tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody></table>';
    const data = await build(table);
    expect(parse(renderCustomHtml(data, { builder: false }).html).querySelectorAll('tbody > tr')).toHaveLength(2);
  });

  it('rejects min greater than max', async () => {
    const data = await build(LIST);
    const fields = data.fields.map((f) => ({ ...f, min: 3, max: 2 }));
    expect(parseCustomHtmlData({ ...data, fields }).success).toBe(false);
    expect(parseCustomHtmlData({ ...data, fields: data.fields.map((f) => ({ ...f, min: 1, max: 2 })) }).success).toBe(true);
  });

  it('enforces min and max on stored values, widened by a longer default list', async () => {
    const data = await build(LIST);
    const list = data.fields.find((f) => f.type === 'repeater')!;
    const base = (list.default as RepeaterItem[]).length;
    const check = (bounds: Partial<FieldDef>, count: number) =>
      parseCustomHtmlData({
        ...data,
        fields: data.fields.map((f) => (f.id === list.id ? { ...f, ...bounds } : f)),
        values: { [list.id]: Array.from({ length: count }, () => ({})) },
      }).success;
    expect(check({ max: 3 }, 3)).toBe(true);
    expect(check({ max: 3 }, 4)).toBe(false);
    expect(check({ min: 1 }, 0)).toBe(false);
    expect(check({ min: 1 }, 1)).toBe(true);
    expect(check({ max: 1 }, base)).toBe(true);
    expect(check({ max: 1 }, base + 1)).toBe(false);
  });
});

describe('re-import', () => {
  async function edited() {
    const data = await build('<h1>Head</h1>' + LIST);
    const list = data.fields.find((f) => f.type === 'repeater')!;
    const [title, body] = list.children!.map((c) => c.id);
    list.label = 'Cards';
    list.max = 5;
    list.children![0].label = 'Card title';
    data.values = {
      [list.id]: [
        { [title]: 'Edited A', [body]: 'a' },
        { [title]: 'Edited B', [body]: 'b' },
        { [title]: 'Edited C', [body]: 'c' },
      ],
    };
    return { data, list, title, body };
  }

  it('keeps ids, labels, limits and values', async () => {
    const { data } = await edited();
    const source = reconstructSource(data);
    const again = await build(source.html, data);
    expect(again.fields).toEqual(data.fields);
    expect(again.values).toEqual(data.values);
    expect(again.template.html.replace(/\s+/g, '')).toBe(data.template.html.replace(/\s+/g, ''));
  });

  it('picks up an item added to the source', async () => {
    const { data, list } = await edited();
    const extra = reconstructSource(data).html.replace(
      '</ul>',
      '<li class="card" data-cf-item="r1"><h3 data-cf="r1.$2.f2">Three</h3><p data-cf="r1.$2.f3">Third</p></li></ul>'
    );
    const again = await build(extra, data);
    const nextList = again.fields.find((f) => f.id === list.id)!;
    expect(items(nextList)).toHaveLength(3);
    expect(again.values).toEqual(data.values);
  });

  it('lists removed children and fills new ones from the new defaults', async () => {
    const { data, list, title, body } = await edited();
    const source = reconstructSource(data).html.replace(/<p [^>]*>[\s\S]*?<\/p>/g, '<span class="n"><b></b></span><img src="/new.png">');
    const analysis = analyzeSource(source);
    const fields = mergePreviousFieldMeta(analysis.detect.fields, data);
    expect(removedFieldLabels(data, fields)).toEqual(['Cards › Text']);
    const again = await buildCustomHtmlData({ name: 'R', analysis, fields, compile, previous: data });
    const value = again.values[list.id] as RepeaterItem[];
    expect(value.map((v) => v[title])).toEqual(['Edited A', 'Edited B', 'Edited C']);
    // nothing of the removed text survives, even where a new child took over its id
    expect(JSON.stringify(value)).not.toContain('"a"');
    expect(again.fields.find((f) => f.id === list.id)!.children!.some((c) => c.id === body && c.type !== 'image')).toBe(false);
    const image = again.fields.find((f) => f.id === list.id)!.children!.find((c) => c.type === 'image')!;
    expect(value[1][image.id]).toEqual({ src: '/new.png', alt: '' });
    expect(parseCustomHtmlData(again).success).toBe(true);
  });

  it('does not fold previously separate fields into a new repeater', () => {
    const r = detectFields('<div><p data-cf="f1">a</p><p data-cf="f2">b</p></div>');
    expect(r.fields.map((f) => [f.id, f.type])).toEqual([
      ['f1', 'text'],
      ['f2', 'text'],
    ]);
  });

  it('keeps a link or background on the repeater container', async () => {
    const html = '<div class="g" style="background:url(/bg.png)"><p>a</p><p>b</p></div>';
    const data = await build(html);
    expect(data.fields.map((f) => f.type)).toEqual(['bgImage', 'repeater']);
    const again = await build(reconstructSource(data).html, data);
    expect(again.fields.map((f) => [f.id, f.type])).toEqual(data.fields.map((f) => [f.id, f.type]));
  });
});

describe('click-to-map with repeaters', () => {
  const html =
    '<div data-edit-repeat="rows">' +
    '<div class="row"><h3 data-edit="t">A</h3><p>alpha</p></div>' +
    '<div class="row"><h3>B</h3><p>beta</p></div>' +
    '</div>';

  it('adds a child field to every item', () => {
    const r = detectFields(html, { hintsOnly: true });
    const p = r.root.querySelectorAll('p')[1];
    const next = markElementAsField(r.root, p, 'text', r.fields);
    expect(next).toHaveLength(1);
    const added = next[0].children![1];
    expect(added).toMatchObject({ type: 'text', default: 'alpha' });
    expect(items(next[0]).map((i) => i[added.id])).toEqual(['alpha', 'beta']);
    expect(r.root.querySelectorAll(`[data-cf="rows.$.${added.id}"]`)).toHaveLength(2);
    // the previous list object is untouched
    expect(r.fields[0].children).toHaveLength(1);
  });

  it('re-types a child in place and refuses what cannot be mapped', () => {
    const r = detectFields(LIST);
    const h3 = r.root.querySelector('h3')!;
    const next = markElementAsField(r.root, h3, 'richtext', r.fields);
    expect(next[0].children![0]).toMatchObject({ id: 'f1', type: 'richtext', label: 'Heading' });
    expect(markElementAsField(r.root, r.root.querySelector('li')!, 'text', r.fields)).toBe(r.fields);
    expect(markElementAsField(r.root, h3, 'image', r.fields)).toBe(r.fields);
  });

  it('removes one child, then the whole repeater', () => {
    const r = detectFields(LIST);
    const without = unmarkField(r.root, 'r1.$.f2', r.fields);
    expect(without[0].children!.map((c) => c.id)).toEqual(['f1']);
    expect(items(without[0])[0]).toEqual({ f1: 'One' });
    expect(r.root.querySelectorAll('[data-cf="r1.$.f2"]')).toHaveLength(0);
    expect(unmarkField(r.root, 'r1.$.f1', without)).toEqual([]);
    expect(r.root.querySelector('[data-cf], [data-cf-item]')).toBeNull();
    expect(tokenizeHtml(r.root, [])).not.toContain('{{cf:');
  });
});

describe('language sync', () => {
  const field: FieldDef = {
    id: 'r1',
    type: 'repeater',
    label: 'L',
    default: [{ t: 'd1', l: { href: '/d1' } }, { t: 'd2', l: { href: '/d2' } }],
    children: [
      { id: 't', type: 'text', label: 't', default: 'd1' },
      { id: 'l', type: 'link', label: 'l', default: { href: '/d1' } },
    ],
  };
  const section = (values: CustomHtmlData['values']): CustomHtmlSectionLike => ({
    type: 'custom-html',
    data: { schemaVersion: 1, name: 's', template: {} as CustomHtmlData['template'], fields: [field], values },
  });

  it('keeps translated items and fills children the target does not have', () => {
    const source = section({ r1: [{ t: 'en1', l: { href: '/en1' } }, { t: 'en2', l: { href: '/en2' } }] });
    const target = section({
      r1: [{ t: 'fr1', old: 'x' }, { t: { href: 'wrong shape' } }, { t: 'fr3' }],
    } as unknown as CustomHtmlData['values']);
    expect(mergeForLanguageSync(source, target).data.values.r1).toEqual([
      { t: 'fr1', l: { href: '/en1' } },
      { t: 'en2', l: { href: '/en2' } },
      { t: 'fr3' },
    ]);
  });

  it('keeps an emptied target list', () => {
    expect(mergeForLanguageSync(section({}), section({ r1: [] })).data.values.r1).toEqual([]);
  });
});
