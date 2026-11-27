// @vitest-environment node
/**
 * P2.4 — library API (spec §12) and the rule that only code editors may write custom-html rows.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getLibraryHashes } from '@/lib/custom-html/guard';
import { templateHash } from '@/lib/custom-html/hash';
import { makeFixtureInput } from './fixtures';

type Row = {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  defaultData: string;
  usageCount: number;
};

const mocks = vi.hoisted(() => {
  const state = { rows: [] as any[], seq: 0, page: { builderData: '[]' as string } };
  const match = (row: any, where: any = {}) => Object.keys(where).every((k) => row[k] === where[k]);
  const pick = (row: any, select?: any) =>
    select ? Object.fromEntries(Object.keys(select).map((k) => [k, row[k]])) : { ...row };
  const prisma = {
    sectionTemplate: {
      findMany: vi.fn(async ({ where, select }: any = {}) => state.rows.filter((r) => match(r, where)).map((r) => pick(r, select))),
      findFirst: vi.fn(async ({ where }: any) => {
        const row = state.rows.find((r) => match(r, where));
        return row ? { ...row } : null;
      }),
      create: vi.fn(async ({ data, select }: any) => {
        const row = { id: `row-${++state.seq}`, usageCount: 0, ...data };
        state.rows.push(row);
        return pick(row, select);
      }),
      update: vi.fn(async ({ where, data, select }: any) => {
        const row = state.rows.find((r) => match(r, where));
        Object.assign(row, data);
        return pick(row, select);
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        const found = state.rows.filter((r) => match(r, where));
        found.forEach((r) => (r.usageCount += data.usageCount.increment));
        return { count: found.length };
      }),
      deleteMany: vi.fn(async ({ where }: any) => {
        const before = state.rows.length;
        state.rows = state.rows.filter((r) => !match(r, where));
        return { count: before - state.rows.length };
      }),
    },
    page: {
      findUnique: vi.fn(async () => ({ id: 'p1', builderData: state.page.builderData })),
      update: vi.fn(async ({ data }: any) => {
        state.page.builderData = data.builderData;
        return { id: 'p1', ...data };
      }),
    },
  };
  return { state, prisma };
});

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }));
// Real api-auth + permissions; only token verification is faked.
vi.mock('@/lib/auth', () => ({
  verifyToken: (token: string) => (token === 'admin' || token === 'editor' ? { id: token, role: token } : null),
}));

import { GET as LIST, POST } from '@/app/api/admin/custom-html/library/route';
import { DELETE, GET, PUT } from '@/app/api/admin/custom-html/library/[id]/route';
import { POST as IMPORT } from '@/app/api/admin/import-export/route';
import { PUT as SAVE_PAGE } from '@/app/api/admin/pages/[id]/builder/route';

const rows = () => mocks.state.rows as Row[];
const req = (method: string, role: string | null, body?: unknown, query = '') =>
  new NextRequest(`http://localhost/api/x${query}`, {
    method,
    headers: { 'content-type': 'application/json', ...(role ? { authorization: `Bearer ${role}` } : {}) },
    ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
const ctx = (id: string) => ({ params: { id } });

const input = () =>
  makeFixtureInput({ values: { f1: 'Page specific' }, runInBuilder: true, libraryId: 'old' }) as Record<string, any>;

async function createItem(name = 'Promo') {
  const res = await POST(req('POST', 'admin', { name, description: 'd', data: input() }));
  expect(res.status).toBe(201);
  return (await res.json()).item.id as string;
}

const savePage = (role: string, sections: unknown[]) =>
  SAVE_PAGE(req('PUT', role, { builderData: sections }), ctx('p1'));

beforeEach(() => {
  mocks.state.rows = [];
  mocks.state.seq = 0;
  mocks.state.page.builderData = '[]';
  vi.clearAllMocks();
});

describe('library list and create', () => {
  it('requires authentication to list and admin to create', async () => {
    expect((await LIST(req('GET', null))).status).toBe(401);
    expect((await POST(req('POST', null, { data: input() }))).status).toBe(401);
    expect((await POST(req('POST', 'editor', { data: input() }))).status).toBe(403);
    expect(rows()).toHaveLength(0);
  });

  it('stores the template without values, runInBuilder or libraryId', async () => {
    await createItem('  My template ');
    const row = rows()[0];
    expect(row).toMatchObject({ name: 'My template', type: 'custom-html', category: 'Custom HTML', description: 'd' });
    const stored = JSON.parse(row.defaultData);
    expect(stored.values).toEqual({});
    expect(stored.name).toBe('My template');
    expect(stored).not.toHaveProperty('runInBuilder');
    expect(stored).not.toHaveProperty('libraryId');
    expect(stored.template).toEqual(input().template);
  });

  it('falls back to the data name', async () => {
    expect((await POST(req('POST', 'admin', { data: input() }))).status).toBe(201);
    expect(rows()[0].name).toBe('Promo banner');
  });

  it('lists only custom-html rows, without their data', async () => {
    rows().push({ id: 'h', name: 'Hero', type: 'hero', category: 'Headers', description: '', defaultData: '{}', usageCount: 0 });
    await createItem();
    const body = await (await LIST(req('GET', 'editor'))).json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ name: 'Promo', usageCount: 0 });
    expect(body.items[0]).not.toHaveProperty('defaultData');
  });

  it('rejects invalid bodies', async () => {
    const extraKey = { ...input(), evil: 1 };
    const proto = JSON.stringify({ name: 'x', data: input() }).replace('"schemaVersion"', '"__proto__":{"a":1},"schemaVersion"');
    const badTemplate = { ...input(), template: { ...input().template, extra: 'x' } };
    for (const body of [
      '{not json',
      { name: 'x' },
      { name: 'x', data: [] },
      { name: '', data: input() },
      { name: 'x'.repeat(201), data: input() },
      { name: 'x', description: 5, data: input() },
      { name: 'x', data: extraKey },
      { name: 'x', data: badTemplate },
      proto,
    ]) {
      expect((await POST(req('POST', 'admin', body))).status).toBe(400);
    }
    expect(rows()).toHaveLength(0);
  });
});

describe('library item', () => {
  it('returns the full item to editors and counts inserts only', async () => {
    const id = await createItem();
    expect((await GET(req('GET', null), ctx(id))).status).toBe(401);
    const plain = await (await GET(req('GET', 'editor'), ctx(id))).json();
    expect(plain.item.data.values).toEqual({});
    expect(rows()[0].usageCount).toBe(0);
    const inserted = await (await GET(req('GET', 'editor', undefined, '?insert=1'), ctx(id))).json();
    expect(inserted.item.usageCount).toBe(1);
    expect(rows()[0].usageCount).toBe(1);
  });

  it('404s for unknown ids and for rows of other types', async () => {
    rows().push({ id: 'h', name: 'Hero', type: 'hero', category: 'Headers', description: '', defaultData: '{}', usageCount: 0 });
    for (const id of ['h', 'nope']) {
      expect((await GET(req('GET', 'admin', undefined, '?insert=1'), ctx(id))).status).toBe(404);
      expect((await PUT(req('PUT', 'admin', { data: input() }), ctx(id))).status).toBe(404);
      expect((await DELETE(req('DELETE', 'admin'), ctx(id))).status).toBe(404);
    }
    expect(rows()).toEqual([expect.objectContaining({ id: 'h', type: 'hero', defaultData: '{}', usageCount: 0 })]);
  });

  it('does not hand out invalid stored data', async () => {
    rows().push({ id: 'bad', name: 'Bad', type: 'custom-html', category: 'Custom HTML', description: '', defaultData: '{x', usageCount: 0 });
    expect((await GET(req('GET', 'editor', undefined, '?insert=1'), ctx('bad'))).status).toBe(422);
    expect(rows()[0].usageCount).toBe(0);
    // but an admin can still rename or delete it
    expect((await PUT(req('PUT', 'admin', { name: 'Still bad' }), ctx('bad'))).status).toBe(200);
    expect((await DELETE(req('DELETE', 'admin'), ctx('bad'))).status).toBe(200);
  });

  it('lets only admins update and delete', async () => {
    const id = await createItem();
    const before = { ...rows()[0] };
    expect((await PUT(req('PUT', 'editor', { name: 'x' }), ctx(id))).status).toBe(403);
    expect((await DELETE(req('DELETE', 'editor'), ctx(id))).status).toBe(403);
    expect((await DELETE(req('DELETE', null), ctx(id))).status).toBe(401);
    expect(rows()).toEqual([before]);
  });

  it('renames (the new name reaches inserted copies) and never changes the type', async () => {
    const id = await createItem();
    const res = await PUT(req('PUT', 'admin', { name: 'Renamed', type: 'hero', category: 'Headers' }), ctx(id));
    expect(res.status).toBe(200);
    expect(rows()[0]).toMatchObject({ name: 'Renamed', type: 'custom-html', category: 'Custom HTML' });
    const body = await (await GET(req('GET', 'editor'), ctx(id))).json();
    expect(body.item.data.name).toBe('Renamed');
  });

  it('validates replacement data and strips values', async () => {
    const id = await createItem();
    const before = rows()[0].defaultData;
    expect((await PUT(req('PUT', 'admin', { data: { nope: true } }), ctx(id))).status).toBe(400);
    expect((await PUT(req('PUT', 'admin', {}), ctx(id))).status).toBe(400);
    expect(rows()[0].defaultData).toBe(before);
    const next = { ...input(), template: { ...input().template, js: '(function(){})' } };
    expect((await PUT(req('PUT', 'admin', { data: next }), ctx(id))).status).toBe(200);
    const stored = JSON.parse(rows()[0].defaultData);
    expect(stored.template.js).toBe('(function(){})');
    expect(stored.values).toEqual({});
    expect(stored).not.toHaveProperty('runInBuilder');
  });
});

describe('guard integration', () => {
  const placed = (id: string, data: any) => ({ id, type: 'custom-html', order: 0, data });

  it('an editor can place a library copy; library edits and deletion leave placed copies alone', async () => {
    const id = await createItem();
    const item = (await (await GET(req('GET', 'editor', undefined, '?insert=1'), ctx(id))).json()).item;
    const copy = placed('s1', { ...item.data, libraryId: id, values: { f1: 'Editor text' } });
    expect((await savePage('editor', [copy])).status).toBe(200);
    const stored = mocks.state.page.builderData;

    const next = { ...input(), template: { ...input().template, js: '(function(){})' } };
    await PUT(req('PUT', 'admin', { data: next }), ctx(id));
    expect(mocks.state.page.builderData).toBe(stored);
    await DELETE(req('DELETE', 'admin'), ctx(id));
    expect(mocks.state.page.builderData).toBe(stored);
    // still saveable: the template is already on the page
    expect((await savePage('editor', [copy])).status).toBe(200);
  });

  it('an editor cannot save a template that is not in the library, or enable scripts in the builder', async () => {
    const id = await createItem();
    const data = JSON.parse(rows()[0].defaultData);
    const forged = { ...data, template: { ...data.template, js: '(function(){alert(1)})' } };
    expect((await savePage('editor', [placed('s1', forged)])).status).toBe(403);
    expect((await savePage('editor', [placed('s1', { ...data, libraryId: id, runInBuilder: true })])).status).toBe(403);
  });
});

describe('import-export cannot be used to whitelist a template', () => {
  const importSection = (role: string, section: Record<string, unknown>) =>
    IMPORT(
      req('POST', role, {
        action: 'import',
        data: { type: 'section', data: { id: 'x', name: 'Imported', category: 'Anything', description: '', ...section } },
        options: { validateData: false, autoImportSections: false },
      }),
    );

  it('refuses custom-html from editors and non-string types from anyone', async () => {
    expect((await importSection('editor', { type: 'custom-html', defaultData: input() })).status).toBe(403);
    for (const type of [['custom-html'], { set: 'custom-html' }, undefined]) {
      expect((await importSection('editor', { type, defaultData: input() })).status).toBe(400);
    }
    expect(rows()).toHaveLength(0);
  });

  it('rows an editor can create are never trusted', async () => {
    for (const type of ['hero', 'Custom-HTML', 'custom-html ']) {
      await importSection('editor', { type, category: 'Custom HTML', name: type, defaultData: input() });
    }
    expect((await getLibraryHashes(mocks.prisma as never)).size).toBe(0);
  });

  it('an editor import with the name of a library item leaves it untouched', async () => {
    await createItem('Imported');
    const before = { ...rows()[0] };
    await importSection('editor', { type: 'hero', defaultData: {} });
    expect(rows()[0]).toEqual(before);
    expect(mocks.prisma.sectionTemplate.update).not.toHaveBeenCalled();
  });

  it('stores an admin import as a normal library item (string or object defaultData)', async () => {
    for (const [name, defaultData] of [['a', input()], ['b', JSON.stringify(input())]] as const) {
      expect((await importSection('admin', { type: 'custom-html', name, defaultData })).status).toBe(200);
    }
    expect(rows()).toHaveLength(2);
    for (const row of rows()) {
      expect(row.category).toBe('Custom HTML');
      const stored = JSON.parse(row.defaultData);
      expect(stored.values).toEqual({});
      expect(stored).not.toHaveProperty('runInBuilder');
      expect((await GET(req('GET', 'editor'), ctx(row.id))).status).toBe(200);
    }
    const data = JSON.parse(rows()[0].defaultData);
    expect(await getLibraryHashes(mocks.prisma as never)).toEqual(new Set([await templateHash(data.template, data.fields)]));
  });
});
