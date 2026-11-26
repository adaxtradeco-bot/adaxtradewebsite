import { describe, it, expect } from 'vitest';
import {
  CustomHtmlDataSchema,
  CustomHtmlTemplateSchema,
  FieldDefSchema,
  FieldValueSchema,
  parseCustomHtmlData,
} from '@/lib/custom-html/schema';
import { CUSTOM_HTML_LIMITS } from '@/lib/custom-html/types';

const template = () => ({
  html: '<h1 data-cf="f1">{{cf:f1}}</h1>',
  css: '',
  cssScoped: '',
  js: '',
  jsSource: '',
  externalScripts: [] as string[],
  externalStylesheets: [] as string[],
  scope: 'abcdef0123',
});

const data = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  schemaVersion: 1,
  name: 'Hero',
  template: template(),
  fields: [{ id: 'f1', type: 'text', label: 'Title', default: 'Hello' }],
  values: { f1: 'Hi' },
  ...over,
});

const err = (input: unknown): string => {
  const r = parseCustomHtmlData(input);
  expect(r.success).toBe(false);
  return r.success ? '' : r.error;
};

describe('parseCustomHtmlData', () => {
  it('accepts valid data and returns it', () => {
    const r = parseCustomHtmlData(data());
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe('Hero');
      expect(r.data.values.f1).toBe('Hi');
    }
  });

  it('accepts every field type with matching defaults and values', () => {
    const fields = [
      { id: 'a', type: 'text', label: 'a', default: 'x' },
      { id: 'b', type: 'textarea', label: 'b', default: 'x\ny' },
      { id: 'c', type: 'richtext', label: 'c', default: '<b>x</b>' },
      { id: 'd', type: 'link', label: 'd', default: { text: 'T', href: '/x', target: '_blank' } },
      { id: 'e', type: 'image', label: 'e', default: { src: '/a.png', alt: 'A' } },
      { id: 'f', type: 'bgImage', label: 'f', default: { src: '/a.png' } },
      { id: 'g', type: 'video', label: 'g', default: { src: '/a.mp4', poster: '/p.png' } },
      { id: 'h', type: 'embed', label: 'h', default: { src: 'https://www.youtube.com/embed/x' } },
      { id: 'i', type: 'icon', label: 'i', default: { svg: '<svg></svg>' } },
      { id: 'j', type: 'color', label: 'j', default: { value: '#fff' } },
      {
        id: 'k',
        type: 'repeater',
        label: 'k',
        default: [{ t: 'one' }],
        min: 1,
        max: 5,
        children: [{ id: 't', type: 'text', label: 't', default: '' }],
      },
    ];
    expect(parseCustomHtmlData(data({ fields, values: { k: [{ t: 'a' }, { t: 'b' }] } })).success).toBe(true);
  });

  it('rejects non-object input', () => {
    expect(parseCustomHtmlData(null).success).toBe(false);
    expect(parseCustomHtmlData('x').success).toBe(false);
    expect(parseCustomHtmlData([]).success).toBe(false);
    expect(parseCustomHtmlData(undefined).success).toBe(false);
  });

  it('reports path and message', () => {
    expect(err(data({ name: 5 }))).toMatch(/name/);
  });

  describe('strictness (unknown keys rejected at every level)', () => {
    it('root', () => expect(parseCustomHtmlData(data({ extra: 1 })).success).toBe(false));
    it('template', () => {
      expect(parseCustomHtmlData(data({ template: { ...template(), extra: 1 } })).success).toBe(false);
    });
    it('tailwind', () => {
      expect(parseCustomHtmlData(data({ template: { ...template(), tailwind: { enabled: true, x: 1 } } })).success).toBe(false);
    });
    it('field', () => {
      expect(
        parseCustomHtmlData(data({ fields: [{ id: 'f1', type: 'text', label: 'x', default: '', evil: 1 }] })).success,
      ).toBe(false);
    });
    it('value objects', () => {
      const fields = [{ id: 'l', type: 'link', label: 'l', default: {} }];
      expect(parseCustomHtmlData(data({ fields, values: { l: { href: '/x', onclick: 'x' } } })).success).toBe(false);
      expect(parseCustomHtmlData(data({ fields, values: { l: { href: '/x' } } })).success).toBe(true);
    });
    it('children', () => {
      const fields = [
        { id: 'r', type: 'repeater', label: 'r', default: [], children: [{ id: 'c', type: 'text', label: 'c', default: '', x: 1 }] },
      ];
      expect(parseCustomHtmlData(data({ fields, values: {} })).success).toBe(false);
    });
    it('schemaVersion must be 1', () => {
      expect(parseCustomHtmlData(data({ schemaVersion: 2 })).success).toBe(false);
    });
  });

  describe('template', () => {
    it.each(['ABCDEF0123', 'abcdef012', 'abcdef01234', 'abcdefghij', ''])('rejects scope %j', (scope) => {
      expect(parseCustomHtmlData(data({ template: { ...template(), scope } })).success).toBe(false);
    });
    it('requires all template keys', () => {
      const t = template() as Record<string, unknown>;
      delete t.cssScoped;
      expect(parseCustomHtmlData(data({ template: t })).success).toBe(false);
    });
    it('accepts dir and tailwind', () => {
      const t = { ...template(), dir: 'auto', tailwind: { enabled: true, config: { theme: {} } } };
      expect(parseCustomHtmlData(data({ template: t })).success).toBe(true);
      expect(parseCustomHtmlData(data({ template: { ...template(), dir: 'up' } })).success).toBe(false);
    });
  });

  describe('limits', () => {
    it('html, css, cssScoped, js, jsSource', () => {
      const L = CUSTOM_HTML_LIMITS;
      const ok = (k: 'html' | 'css' | 'cssScoped' | 'js' | 'jsSource', n: number) =>
        parseCustomHtmlData(data({ template: { ...template(), [k]: 'x'.repeat(n) } })).success;
      expect(ok('html', L.html)).toBe(true);
      expect(ok('html', L.html + 1)).toBe(false);
      expect(ok('css', L.css + 1)).toBe(false);
      expect(ok('cssScoped', L.cssScoped + 1)).toBe(false);
      expect(ok('js', L.js + 1)).toBe(false);
      expect(ok('jsSource', L.jsSource + 1)).toBe(false);
      expect(ok('js', L.js)).toBe(true);
    });

    it('fields count includes children', () => {
      const top = (n: number) =>
        Array.from({ length: n }, (_, i) => ({ id: 'f' + i, type: 'text', label: 'x', default: '' }));
      expect(parseCustomHtmlData(data({ fields: top(CUSTOM_HTML_LIMITS.fields), values: {} })).success).toBe(true);
      expect(parseCustomHtmlData(data({ fields: top(CUSTOM_HTML_LIMITS.fields + 1), values: {} })).success).toBe(false);
      const children = top(300);
      const withChildren = [...top(400), { id: 'rep', type: 'repeater', label: 'r', default: [], children }];
      expect(err(data({ fields: withChildren, values: {} }))).toMatch(/fields/);
    });

    it('repeater items', () => {
      const fields = [
        { id: 'r', type: 'repeater', label: 'r', default: [], children: [{ id: 't', type: 'text', label: 't', default: '' }] },
      ];
      const items = (n: number) => Array.from({ length: n }, () => ({ t: 'x' }));
      expect(parseCustomHtmlData(data({ fields, values: { r: items(CUSTOM_HTML_LIMITS.repeaterItems) } })).success).toBe(true);
      expect(parseCustomHtmlData(data({ fields, values: { r: items(CUSTOM_HTML_LIMITS.repeaterItems + 1) } })).success).toBe(false);
    });

    it('external URL counts and protocols', () => {
      const urls = (n: number) => Array.from({ length: n }, (_, i) => `https://cdn.example.com/${i}.js`);
      const tpl = (extra: Record<string, unknown>) => data({ template: { ...template(), ...extra } });
      expect(parseCustomHtmlData(tpl({ externalScripts: urls(10) })).success).toBe(true);
      expect(parseCustomHtmlData(tpl({ externalScripts: urls(11) })).success).toBe(false);
      expect(parseCustomHtmlData(tpl({ externalStylesheets: urls(11) })).success).toBe(false);
      expect(parseCustomHtmlData(tpl({ externalScripts: ['http://cdn.example.com/a.js'] })).success).toBe(true);
      for (const bad of ['javascript:alert(1)', 'data:text/javascript,alert(1)', 'ftp://x.com/a.js', '//cdn.x.com/a.js', '/local.js', 'not a url', 'https://x.com/a b.js']) {
        expect(parseCustomHtmlData(tpl({ externalScripts: [bad] })).success).toBe(false);
        expect(parseCustomHtmlData(tpl({ externalStylesheets: [bad] })).success).toBe(false);
      }
    });

    it('string value lengths', () => {
      expect(parseCustomHtmlData(data({ values: { f1: 'x'.repeat(100_001) } })).success).toBe(false);
    });
  });

  describe('fields and values', () => {
    it('rejects invalid ids', () => {
      for (const id of ['', 'a b', 'a/b', 'a"b', '__proto__', 'x'.repeat(121)]) {
        expect(parseCustomHtmlData(data({ fields: [{ id, type: 'text', label: 'x', default: '' }], values: {} })).success).toBe(false);
      }
      for (const id of ['f1', 'hero.title', 'data-edit_key', 'constructor']) {
        expect(parseCustomHtmlData(data({ fields: [{ id, type: 'text', label: 'x', default: '' }], values: {} })).success).toBe(true);
      }
    });

    it('rejects invalid value keys', () => {
      expect(parseCustomHtmlData(data({ values: { 'a b': 'x' } })).success).toBe(false);
      expect(parseCustomHtmlData(data({ values: JSON.parse('{"__proto__":"x"}') })).success).toBe(false);
    });

    it('rejects duplicate ids', () => {
      const f = { id: 'f1', type: 'text', label: 'x', default: '' };
      expect(err(data({ fields: [f, f] }))).toMatch(/duplicate/);
    });

    it('rejects a default that does not match the type', () => {
      expect(parseCustomHtmlData(data({ fields: [{ id: 'f1', type: 'text', label: 'x', default: { src: 'x' } }] })).success).toBe(false);
      expect(parseCustomHtmlData(data({ fields: [{ id: 'f1', type: 'image', label: 'x', default: 'x' }] })).success).toBe(false);
      expect(parseCustomHtmlData(data({ fields: [{ id: 'f1', type: 'link', label: 'x', default: { target: '_top' } }] })).success).toBe(false);
    });

    it('rejects a value that does not match its field type', () => {
      expect(parseCustomHtmlData(data({ values: { f1: { text: 'x' } } })).success).toBe(false);
      expect(parseCustomHtmlData(data({ values: { f1: ['x'] } })).success).toBe(false);
    });

    it('rejects children on non-repeater fields', () => {
      const field = { id: 'f1', type: 'text', label: 'x', default: '', children: [] };
      expect(parseCustomHtmlData(data({ fields: [field] })).success).toBe(false);
    });

    it('rejects repeater items that violate child types', () => {
      const fields = [
        { id: 'r', type: 'repeater', label: 'r', default: [], children: [{ id: 'l', type: 'link', label: 'l', default: {} }] },
      ];
      expect(parseCustomHtmlData(data({ fields, values: { r: [{ l: 'not a link' }] } })).success).toBe(false);
      expect(parseCustomHtmlData(data({ fields, values: { r: [{ l: { href: '/x' } }] } })).success).toBe(true);
      expect(parseCustomHtmlData(data({ fields, values: { r: ['x'] } })).success).toBe(false);
    });

    it('allows values without a matching field (render ignores them)', () => {
      expect(parseCustomHtmlData(data({ values: { f1: 'a', orphan: 'b' } })).success).toBe(true);
    });
  });
});

describe('exported schemas', () => {
  it('FieldValueSchema accepts the documented shapes only', () => {
    expect(FieldValueSchema.safeParse('x').success).toBe(true);
    expect(FieldValueSchema.safeParse({ src: 'x', alt: 'y', poster: 'z' }).success).toBe(true);
    expect(FieldValueSchema.safeParse({ svg: '<svg/>' }).success).toBe(true);
    expect(FieldValueSchema.safeParse({ value: 'red' }).success).toBe(true);
    expect(FieldValueSchema.safeParse([{ a: 'x' }]).success).toBe(true);
    expect(FieldValueSchema.safeParse({ nope: 1 }).success).toBe(false);
    expect(FieldValueSchema.safeParse(5).success).toBe(false);
    expect(FieldValueSchema.safeParse(null).success).toBe(false);
  });
  it('FieldDefSchema is recursive for children', () => {
    const def = {
      id: 'r',
      type: 'repeater',
      label: 'r',
      default: [],
      children: [{ id: 'inner', type: 'repeater', label: 'i', default: [], children: [{ id: 'x', type: 'text', label: 'x', default: '' }] }],
    };
    expect(FieldDefSchema.safeParse(def).success).toBe(true);
    const bad = JSON.parse(JSON.stringify(def));
    bad.children[0].children[0].type = 'nope';
    expect(FieldDefSchema.safeParse(bad).success).toBe(false);
  });
  it('CustomHtmlTemplateSchema and CustomHtmlDataSchema are exported', () => {
    expect(CustomHtmlTemplateSchema.safeParse(template()).success).toBe(true);
    expect(CustomHtmlDataSchema.safeParse(data()).success).toBe(true);
  });
});
