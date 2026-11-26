import { describe, it, expect } from 'vitest';
import { checkCustomHtmlWrite, normalizeSections, getLibraryHashes } from '@/lib/custom-html/guard';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import { templateHash } from '@/lib/custom-html/hash';
import type { CustomHtmlData } from '@/lib/custom-html/types';

const makeData = (over: Partial<CustomHtmlData> = {}, tplOver: Partial<CustomHtmlData['template']> = {}): CustomHtmlData => ({
  schemaVersion: 1,
  name: 'Hero',
  template: {
    html: '<h1 data-cf="title">{{cf:title}}</h1>',
    css: '',
    cssScoped: '',
    js: '',
    jsSource: '',
    externalScripts: [],
    externalStylesheets: [],
    scope: '0123456789',
    ...tplOver,
  },
  fields: [{ id: 'title', type: 'text', label: 'Title', default: 'Hello' }],
  values: { title: 'Hello' },
  ...over,
});

const sec = (id: string, data: unknown, type = 'custom-html') => ({ id, type, order: 0, data });

const base = makeData();

describe('fixtures', () => {
  it('base fixture passes the strict schema', () => {
    expect(parseCustomHtmlData(base).success).toBe(true);
  });
});

describe('normalizeSections', () => {
  const s = { id: 'a', type: 'hero' };
  it('handles all stored shapes', () => {
    expect(normalizeSections([s])).toEqual([s]);
    expect(normalizeSections({ sections: [s] })).toEqual([s]);
    expect(normalizeSections(s)).toEqual([s]);
    expect(normalizeSections(JSON.stringify({ sections: [s] }))).toEqual([s]);
    expect(normalizeSections(JSON.stringify([s]))).toEqual([s]);
    expect(normalizeSections(null)).toEqual([]);
    expect(normalizeSections(undefined)).toEqual([]);
    expect(normalizeSections('not json')).toEqual([]);
    expect(normalizeSections(42)).toEqual([]);
  });
});

describe('checkCustomHtmlWrite', () => {
  const noLib = new Set<string>();
  const run = (canEditCode: boolean, prev: unknown, next: unknown, lib = noLib) =>
    checkCustomHtmlWrite({ canEditCode, prevSections: prev, nextSections: next, libraryHashes: lib });

  it('ok when no custom-html sections', async () => {
    expect(await run(false, [], [{ id: 'x', type: 'hero', data: {} }])).toEqual({ ok: true });
  });

  it('admin may add or change templates', async () => {
    const changed = makeData({}, { html: '<h1>{{cf:title}}</h1><p>new</p>' });
    expect(await run(true, [sec('a', base)], [sec('a', changed)])).toEqual({ ok: true });
    expect(await run(true, [], [sec('n', changed)])).toEqual({ ok: true });
  });

  it('editor value-only change is ok', async () => {
    const next = makeData({ values: { title: 'Changed' } });
    expect(await run(false, { sections: [sec('a', base)] }, [sec('a', next)])).toEqual({ ok: true });
  });

  it('editor template change is 403', async () => {
    const next = makeData({}, { js: '(function(){})' });
    const r = await run(false, [sec('a', base)], [sec('a', next)]);
    expect(r).toMatchObject({ ok: false, status: 403, sectionId: 'a' });
  });

  it('editor field definition change is 403', async () => {
    const next = makeData({ fields: [{ id: 'title', type: 'text', label: 'Other', default: 'Hello' }] });
    expect(await run(false, [sec('a', base)], [sec('a', next)])).toMatchObject({ ok: false, status: 403 });
  });

  it('editor forged unknown key is 400', async () => {
    const forged = { ...base, template: { ...base.template, evil: 'x' } };
    const r = await run(false, [sec('a', base)], [sec('a', forged)]);
    expect(r).toMatchObject({ ok: false, status: 400, sectionId: 'a' });
    const top = { ...base, extra: 1 };
    expect(await run(false, [sec('a', base)], [sec('a', top)])).toMatchObject({ ok: false, status: 400 });
  });

  it('editor duplicated section with new id is ok', async () => {
    const r = await run(false, [sec('a', base)], [sec('a', base), sec('b', makeData({ values: { title: 'Copy' } }))]);
    expect(r).toEqual({ ok: true });
  });

  it('editor may reuse a template from any prev section (any id, wrapped shape)', async () => {
    const other = makeData({ name: 'Other' }, { html: '<p>{{cf:title}}</p>' });
    const r = await run(false, JSON.stringify({ sections: [sec('a', base), sec('c', other)] }), [sec('z', other)]);
    expect(r).toEqual({ ok: true });
  });

  it('editor inserting a library template is ok', async () => {
    const lib = makeData({ name: 'Lib' }, { html: '<section>{{cf:title}}</section>', scope: 'abcdef0123' });
    const h = await templateHash(lib.template, lib.fields);
    expect(await run(false, [], [sec('n', lib)], new Set([h]))).toEqual({ ok: true });
    expect(await run(false, [], [sec('n', lib)])).toMatchObject({ ok: false, status: 403 });
  });

  it('oversized data is 400 for admin too', async () => {
    const big = makeData({}, { html: 'x'.repeat(400_001) });
    expect(await run(true, [], [sec('a', big)])).toMatchObject({ ok: false, status: 400, sectionId: 'a' });
    expect(await run(false, [sec('a', base)], [sec('a', big)])).toMatchObject({ ok: false, status: 400 });
  });

  it('invalid scope is 400', async () => {
    const bad = makeData({}, { scope: 'nothex' });
    expect(await run(true, [], [sec('a', bad)])).toMatchObject({ ok: false, status: 400 });
  });

  it('non-custom to custom type change by editor is 403', async () => {
    const prev = [{ id: 'a', type: 'hero', data: { title: 'x' } }];
    const next = [sec('a', makeData({}, { html: '<script>x</script>' }))];
    expect(await run(false, prev, next)).toMatchObject({ ok: false, status: 403, sectionId: 'a' });
    expect(await run(true, prev, next)).toEqual({ ok: true });
  });

  it('nested children are checked', async () => {
    const forged = makeData({}, { js: '(function(){})' });
    const next = [{ id: 'w', type: 'wrapper', children: [sec('c', forged)] }];
    expect(await run(false, [], next)).toMatchObject({ ok: false, status: 403, sectionId: 'c' });
  });
});

describe('getLibraryHashes', () => {
  it('hashes custom-html templates and skips unparsable rows', async () => {
    const lib = makeData({ name: 'Lib' });
    const prisma = {
      sectionTemplate: {
        findMany: async () => [
          { defaultData: JSON.stringify(lib) },
          { defaultData: '{not json' },
          { defaultData: JSON.stringify({ foo: 1 }) },
        ],
      },
    } as never;
    const set = await getLibraryHashes(prisma);
    expect(set.size).toBe(1);
    expect(set.has(await templateHash(lib.template, lib.fields))).toBe(true);
  });
});
