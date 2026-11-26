import { describe, it, expect } from 'vitest';
import { syncSectionStructure } from '@/lib/custom-html/sync-structure';
import type { CustomHtmlData } from '@/lib/custom-html/types';

const data = (values: CustomHtmlData['values']): CustomHtmlData => ({
  schemaVersion: 1,
  name: 'S',
  template: { html: '{{cf:title}}', css: '', cssScoped: '', js: '', jsSource: '', externalScripts: [], externalStylesheets: [], scope: '0123456789' },
  fields: [{ id: 'title', type: 'text', label: 'T', default: 'D' }],
  values,
});

describe('syncSectionStructure', () => {
  it('custom-html source keeps target translated values, source template', () => {
    const src = { id: 'a', type: 'custom-html', order: 2, data: data({ title: 'EN' }) };
    const tgt = { id: 'a', type: 'custom-html', order: 0, data: data({ title: 'AR' }) };
    const out = syncSectionStructure(src, tgt, false);
    expect(out.data.values.title).toBe('AR');
    expect(out.order).toBe(2);
  });

  it('custom-html source with non-custom target never uses target data', () => {
    const src = { id: 'a', type: 'custom-html', order: 1, data: data({ title: 'EN' }) };
    const tgt = { id: 'a', type: 'hero', order: 0, data: { title: 'forged', template: { js: 'evil' } } };
    const out = syncSectionStructure(src, tgt, false);
    expect(out.type).toBe('custom-html');
    expect(out.data.template.js).toBe('');
    expect(out.data.values.title).toBe('EN');
  });

  it('non-custom source with custom-html target copies the whole source', () => {
    const src = { id: 'a', type: 'hero', order: 1, data: { title: 'x' } };
    const tgt = { id: 'a', type: 'custom-html', order: 0, data: data({ title: 'AR' }) };
    expect(syncSectionStructure(src, tgt, false)).toEqual(src);
  });

  it('same non-custom type keeps target content, syncs structure', () => {
    const src = { id: 'a', type: 'hero', order: 3, style: { p: 1 }, data: { title: 'EN' } };
    const tgt = { id: 'a', type: 'hero', order: 0, style: {}, data: { title: 'AR' } };
    expect(syncSectionStructure(src, tgt, false)).toEqual({ id: 'a', type: 'hero', order: 3, style: { p: 1 }, data: { title: 'AR' } });
  });

  it('missing target or syncContent copies source', () => {
    const src = { id: 'a', type: 'hero', order: 3, data: { title: 'EN' } };
    expect(syncSectionStructure(src, undefined, false)).toEqual(src);
    expect(syncSectionStructure(src, { id: 'a', type: 'hero', data: { title: 'AR' } }, true)).toEqual(src);
  });
});
