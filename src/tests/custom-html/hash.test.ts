import { describe, it, expect, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { canonicalJson, djb2, templateHash } from '@/lib/custom-html/hash';
import type { CustomHtmlTemplate, FieldDef } from '@/lib/custom-html/types';

const tpl = (over: Partial<CustomHtmlTemplate> = {}): CustomHtmlTemplate => ({
  html: '<p data-cf="f1">{{cf:f1}}</p>',
  css: 'p{color:red}',
  cssScoped: '[data-chs="0123456789"] p{color:red}',
  js: '',
  jsSource: '',
  externalScripts: [],
  externalStylesheets: [],
  scope: '0123456789',
  ...over,
});
const fields: FieldDef[] = [{ id: 'f1', type: 'text', label: 'Title', default: 'Hello' }];
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

describe('canonicalJson', () => {
  it('sorts keys, no whitespace', () => {
    expect(canonicalJson({ b: 1, a: { d: [3, 1], c: 'x' } })).toBe('{"a":{"c":"x","d":[3,1]},"b":1}');
  });
  it('is independent of key insertion order', () => {
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
  });
  it('keeps array order', () => {
    expect(canonicalJson([3, 2, 1])).toBe('[3,2,1]');
  });
  it('drops undefined keys but keeps null', () => {
    expect(canonicalJson({ a: undefined, b: null, c: 1 })).toBe('{"b":null,"c":1}');
  });
  it('handles undefined array members, top level and non-finite numbers like JSON', () => {
    expect(canonicalJson([undefined, 1])).toBe('[null,1]');
    expect(canonicalJson(undefined)).toBe('null');
    expect(canonicalJson(NaN)).toBe('null');
  });
  it('escapes strings and keeps unicode', () => {
    const v = { 'a"b': 'line\n"q" é 😀' };
    expect(canonicalJson(v)).toBe(JSON.stringify(v));
  });
  it('handles an own "__proto__" key', () => {
    const o = JSON.parse('{"__proto__":{"x":1},"a":2}');
    expect(canonicalJson(o)).toBe('{"__proto__":{"x":1},"a":2}');
  });
});

describe('templateHash', () => {
  it('is sha-256 hex of canonicalJson({ template, fields })', async () => {
    const h = await templateHash(tpl(), fields);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).toBe(sha(canonicalJson({ template: tpl(), fields })));
  });
  it('is stable across key order', async () => {
    const t = tpl();
    const reordered = JSON.parse(JSON.stringify(t, Object.keys(t).sort().reverse())) as CustomHtmlTemplate;
    expect(await templateHash(reordered, fields)).toBe(await templateHash(t, fields));
  });
  it('changes when any template key or field changes', async () => {
    const base = await templateHash(tpl(), fields);
    expect(await templateHash(tpl({ css: 'p{color:blue}' }), fields)).not.toBe(base);
    expect(await templateHash(tpl({ jsSource: 'x' }), fields)).not.toBe(base);
    expect(await templateHash(tpl({ dir: 'rtl' }), fields)).not.toBe(base);
    expect(await templateHash(tpl({ tailwind: { enabled: true } }), fields)).not.toBe(base);
    expect(await templateHash(tpl(), [{ ...fields[0], label: 'Other' }])).not.toBe(base);
  });
  it('hashes non-ASCII content correctly', async () => {
    const t = tpl({ html: '<p>سلام 😀 é</p>' });
    expect(await templateHash(t, fields)).toBe(sha(canonicalJson({ template: t, fields })));
  });
  it('falls back to a pure implementation without WebCrypto subtle', async () => {
    const expected = sha(canonicalJson({ template: tpl(), fields }));
    vi.stubGlobal('crypto', {});
    try {
      expect(await templateHash(tpl(), fields)).toBe(expected);
      const big = tpl({ html: 'x'.repeat(5000) + 'é😀' });
      expect(await templateHash(big, fields)).toBe(sha(canonicalJson({ template: big, fields })));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('djb2', () => {
  it('is deterministic, sync and base36', () => {
    expect(djb2('hello')).toBe(djb2('hello'));
    expect(djb2('hello')).not.toBe(djb2('hellp'));
    expect(djb2('hello')).toMatch(/^[0-9a-z]+$/);
    expect(djb2('')).toBe((5381).toString(36));
  });
});
