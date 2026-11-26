import { describe, it, expect } from 'vitest';
import { mergeForLanguageSync, type CustomHtmlSectionLike } from '@/lib/custom-html/sync';
import type { CustomHtmlData, FieldDef } from '@/lib/custom-html/types';

const fields: FieldDef[] = [
  { id: 'title', type: 'text', label: 'Title', default: 'Default title' },
  { id: 'cta', type: 'link', label: 'CTA', default: { text: 'Go', href: '/go', target: '_self' } },
  { id: 'hero', type: 'image', label: 'Hero', default: { src: '/a.png', alt: '' } },
  {
    id: 'items',
    type: 'repeater',
    label: 'Items',
    default: [{ t: 'a' }],
    children: [{ id: 't', type: 'text', label: 't', default: '' }],
  },
];

const makeData = (values: CustomHtmlData['values'], over: Partial<CustomHtmlData> = {}): CustomHtmlData => ({
  schemaVersion: 1,
  name: 'S',
  template: {
    html: '<h1>{{cf:title}}</h1>',
    css: '',
    cssScoped: '',
    js: '',
    jsSource: '',
    externalScripts: [],
    externalStylesheets: [],
    scope: '0123456789',
  },
  fields,
  values,
  ...over,
});

const section = (values: CustomHtmlData['values'], over: Partial<CustomHtmlData> = {}): CustomHtmlSectionLike => ({
  id: 'sec-1',
  type: 'custom-html',
  data: makeData(values, over),
});

describe('mergeForLanguageSync', () => {
  it('uses source values when there is no target', () => {
    const src = section({ title: 'EN title', cta: { text: 'Go', href: '/en' } });
    const out = mergeForLanguageSync(src, undefined);
    expect(out.data.values).toEqual({ title: 'EN title', cta: { text: 'Go', href: '/en' } });
    expect(out.id).toBe('sec-1');
  });

  it('keeps target values with the same shape and takes the rest from source', () => {
    const src = section({ title: 'EN', cta: { text: 'Go', href: '/en' }, items: [{ t: 'en1' }] });
    const tgt = section({ title: 'FR', cta: { text: 'Aller', href: '/fr' }, items: [{ t: 'fr1' }, { t: 'fr2' }] });
    const out = mergeForLanguageSync(src, tgt);
    expect(out.data.values).toEqual({
      title: 'FR',
      cta: { text: 'Aller', href: '/fr' },
      items: [{ t: 'fr1' }, { t: 'fr2' }],
    });
  });

  it('takes the template and fields from the source, never from the target', () => {
    const src = section({ title: 'EN' });
    const tgt = section({ title: 'FR' }, { name: 'Old', template: { ...makeData({}).template, html: '<script>evil()</script>' } });
    const out = mergeForLanguageSync(src, tgt);
    expect(out.data.template).toEqual(src.data.template);
    expect(out.data.fields).toEqual(fields);
    expect(out.data.name).toBe('S');
  });

  it('falls back to the source value when the shape differs', () => {
    const src = section({ title: 'EN', cta: { text: 'Go' }, items: [{ t: 'x' }] });
    const tgt = section({
      title: { text: 'object instead of string' },
      cta: 'string instead of object',
      items: { not: 'array' },
    } as unknown as CustomHtmlData['values']);
    const out = mergeForLanguageSync(src, tgt);
    expect(out.data.values).toEqual({ title: 'EN', cta: { text: 'Go' }, items: [{ t: 'x' }] });
  });

  it('ignores a target that is not a custom-html section', () => {
    const src = section({ title: 'EN' });
    const out = mergeForLanguageSync(src, { type: 'hero', data: { values: { title: 'HACK' } } });
    expect(out.data.values).toEqual({ title: 'EN' });
  });

  it('ignores target values that are not own properties', () => {
    const src = section({ title: 'EN' });
    const inheritedValues = Object.create({ title: 'inherited' });
    const out = mergeForLanguageSync(src, { type: 'custom-html', data: { values: inheritedValues } });
    expect(out.data.values).toEqual({ title: 'EN' });
  });

  it('drops target-only keys that are not fields of the source', () => {
    const src = section({ title: 'EN' });
    const tgt = section({ title: 'FR', orphan: 'x' });
    expect(mergeForLanguageSync(src, tgt).data.values).toEqual({ title: 'FR' });
  });

  it('shape comparison falls back to the field default when the source has no value', () => {
    const src = section({});
    const tgt = section({ title: 'FR', hero: 'wrong shape' } as unknown as CustomHtmlData['values']);
    const out = mergeForLanguageSync(src, tgt);
    expect(out.data.values).toEqual({ title: 'FR' });
  });

  it('does not mutate its inputs and does not share references', () => {
    const src = section({ title: 'EN', items: [{ t: 'a' }] });
    const tgt = section({ title: 'FR', items: [{ t: 'b' }] });
    const srcBefore = JSON.stringify(src);
    const tgtBefore = JSON.stringify(tgt);
    const out = mergeForLanguageSync(src, tgt);
    expect(JSON.stringify(src)).toBe(srcBefore);
    expect(JSON.stringify(tgt)).toBe(tgtBefore);
    expect(out.data.values.items).not.toBe(tgt.data.values.items);
    const outNoTarget = mergeForLanguageSync(src, null);
    expect(outNoTarget.data.values.items).not.toBe(src.data.values.items);
    expect(outNoTarget.data).not.toBe(src.data);
  });

  it('copes with a field id of "__proto__" or "constructor" in values', () => {
    const f: FieldDef[] = [{ id: 'constructor', type: 'text', label: 'c', default: 'd' }];
    const src = section({ constructor: 'EN' }, { fields: f });
    const tgt = section(JSON.parse('{"constructor":"FR","__proto__":"x"}'), { fields: f });
    const out = mergeForLanguageSync(src, tgt);
    expect(Object.prototype.hasOwnProperty.call(out.data.values, 'constructor')).toBe(true);
    expect(out.data.values.constructor).toBe('FR');
    expect(Object.getPrototypeOf(out.data.values)).toBe(Object.prototype);
  });
});
