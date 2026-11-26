/**
 * F2 (runInBuilder) and F3 (lossy parsing) regressions for the write guard.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { analyzeSource, buildCustomHtmlData } from '@/lib/custom-html/assemble';
import { checkCustomHtmlWrite, parseStoredCustomHtml } from '@/lib/custom-html/guard';
import { templateHash } from '@/lib/custom-html/hash';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import { makeFixture, makeFixtureInput } from './fixtures';

const mocks = vi.hoisted(() => ({
  db: { page: { findUnique: vi.fn(), update: vi.fn() }, sectionTemplate: { findMany: vi.fn() } },
}));
vi.mock('@/lib/prisma', () => ({ prisma: mocks.db }));
vi.mock('@/lib/api-auth', () => ({ authenticateRequest: () => ({ ok: true, user: { id: 'u', role: 'admin' } }) }));

import { PUT } from '@/app/api/admin/pages/[id]/builder/route';

const sec = (id: string, data: unknown) => ({ id, type: 'custom-html', order: 0, data });
const run = (canEditCode: boolean, prev: unknown, next: unknown, lib = new Set<string>()) =>
  checkCustomHtmlWrite({ canEditCode, prevSections: prev, nextSections: next, libraryHashes: lib });

const off = makeFixtureInput();
const on = makeFixtureInput({ runInBuilder: true });

describe('F2: runInBuilder', () => {
  it('an editor cannot enable it', async () => {
    expect(await run(false, [sec('a', off)], [sec('a', on)])).toMatchObject({ ok: false, status: 403, sectionId: 'a' });
  });

  it('an editor cannot enable it on a duplicate of a disabled section', async () => {
    expect(await run(false, [sec('a', off)], [sec('a', off), sec('b', on)])).toMatchObject({
      ok: false,
      status: 403,
      sectionId: 'b',
    });
  });

  it('an editor may keep, duplicate or disable an admin-enabled section', async () => {
    expect(await run(false, [sec('a', on)], [sec('a', on), sec('b', on)])).toEqual({ ok: true });
    expect(await run(false, [sec('a', on)], [sec('a', off)])).toEqual({ ok: true });
  });

  it('enablement does not carry over to a different template', async () => {
    const other = { ...makeFixtureInput(), template: { ...(off.template as object), js: '(function(){})' } };
    const prev = [sec('a', on), sec('c', other)];
    expect(await run(false, prev, [sec('c', { ...other, runInBuilder: true })])).toMatchObject({ ok: false, status: 403 });
  });

  it('a library entry does not grant it', async () => {
    const data = makeFixture({ runInBuilder: true });
    const lib = new Set([await templateHash(data.template, data.fields)]);
    expect(await run(false, [], [sec('n', off)], lib)).toEqual({ ok: true });
    expect(await run(false, [], [sec('n', on)], lib)).toMatchObject({ ok: false, status: 403 });
  });

  it('an admin may enable it', async () => {
    expect(await run(true, [], [sec('a', on)])).toEqual({ ok: true });
  });
});

/** Raw JSON text with an own "__proto__" (or other) key spliced in, as request.json() would produce it. */
const withConfig = (configJson: string) => {
  const raw = makeFixtureInput();
  (raw.template as Record<string, unknown>).tailwind = { enabled: true, config: '@@' };
  return JSON.parse(JSON.stringify(raw).replace('"@@"', configJson));
};

describe('F3: parsing must be lossless', () => {
  it('accepts legitimate data, including a nested tailwind config and sparse values', () => {
    const good = withConfig('{"theme":{"extend":{"colors":{"brand":"#123456"},"list":[1,null,true]}}}');
    expect(parseStoredCustomHtml(good).success).toBe(true);
    expect(parseStoredCustomHtml(off).success).toBe(true);
    expect(parseStoredCustomHtml(on).success).toBe(true);
    expect(parseStoredCustomHtml({ ...off, libraryId: undefined, values: { f2: {}, f3: '' } }).success).toBe(true);
  });

  it.each(['fleet-tailwind.html', 'flow-builder-tabs.html', 'partner-showcase.html'])(
    'accepts imported data from %s',
    async (file) => {
      const analysis = analyzeSource(readFileSync(path.join(__dirname, 'fixtures', file), 'utf8'));
      const compile = async () => ({ cssScoped: '', scope: '0123456789', warnings: [] });
      const data = await buildCustomHtmlData({ name: file, analysis, fields: analysis.detect.fields, compile });
      const sent = JSON.parse(JSON.stringify(data));
      expect(parseStoredCustomHtml(sent)).toMatchObject({ success: true });
    },
  );

  it.each([
    '{"__proto__":{"x":1}}',
    '{"theme":{"__proto__":{"x":1}}}',
    '{"theme":{"constructor":1}}',
    '{"theme":[{"prototype":1}]}',
  ])('rejects reserved config key %s', async (config) => {
    const bad = withConfig(config);
    expect(parseCustomHtmlData(bad).success).toBe(false);
    for (const admin of [true, false]) {
      expect(await run(admin, [sec('a', off)], [sec('a', bad)])).toMatchObject({ ok: false, status: 400 });
    }
  });

  it.each([
    ['values', '"values":{}', '"values":{"__proto__":"x"}'],
    ['link value', '"values":{}', '"values":{"f2":{"__proto__":{"a":1}}}'],
    ['template', '"template":{', '"template":{"__proto__":{"a":1},'],
    ['data root', '"schemaVersion":1', '"__proto__":{"a":1},"schemaVersion":1'],
    ['field', '"id":"f1"', '"__proto__":{"a":1},"id":"f1"'],
  ])('rejects a __proto__ key in %s', async (_where, search, replace) => {
    const json = JSON.stringify(off);
    expect(json).toContain(search);
    const bad = JSON.parse(json.replace(search, replace));
    expect(await run(true, [], [sec('a', bad)])).toMatchObject({ ok: false, status: 400, sectionId: 'a' });
  });

  it('the builder route sees the raw key and stores nothing', async () => {
    mocks.db.page.findUnique.mockResolvedValue({ builderData: '{"sections":[]}' });
    const body = JSON.stringify({ builderData: [sec('a', withConfig('{"__proto__":{"x":1}}'))] });
    expect(body).toContain('__proto__');
    const res = await PUT(new NextRequest('https://site.example/api', { method: 'PUT', body }), { params: { id: 'p' } });
    expect(res.status).toBe(400);
    expect(mocks.db.page.update).not.toHaveBeenCalled();
  });
});
