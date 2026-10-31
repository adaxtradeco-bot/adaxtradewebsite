import { readFileSync } from 'fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeApiKey } from '../api-key';
import vectors from './fixtures/api-key-vectors.json';

const shimSource = readFileSync(
  path.resolve(__dirname, '../../../export-template/static-shim.js'),
  'utf8'
);

const ORIGIN = 'https://site.test';

const apiIndex = {
  '/api/menu?language=fa&location=header': { file: '0001.json', status: 200 },
  '/api/pages/by-slug?slug=%2Ffa%2Fgone': { file: '0002.json', status: 404 },
};

const equivalents = {
  routes: ['/fa', '/fa/about', '/en', '/en/about'],
  bySlug: {
    '/fa/about': { path: '/fa/about', group: 'g1', lang: 'fa' },
    partnership: { path: '/en/partnership', group: 'g2', lang: 'en' },
    '/en/solo': { path: '/en/solo', group: 'g3', lang: 'en' },
  },
  byGroup: {
    g1: { fa: '/fa/about', en: '/en/about' },
    g2: { en: '/en/partnership', fa: '/fa/partnership' },
    g3: { en: '/en/solo' },
  },
};

const files: Record<string, { body: unknown; status?: number }> = {
  '/_data/api-index.json': { body: apiIndex },
  '/_data/equivalents.json': { body: equivalents },
  '/_data/api/0001.json': { body: [{ id: 'm1' }] },
  '/_data/api/0002.json': { body: { error: 'Page not found' } },
};

interface ShimEnv {
  fetch: (input: any, init?: any) => Promise<Response>;
  realFetch: ReturnType<typeof vi.fn>;
  shim: { normalizeApiKey: (u: string) => string; normalizePath: (p: string) => string };
}

function loadShim(): ShimEnv {
  const realFetch = vi.fn(async (input: any) => {
    const url = new URL(typeof input === 'string' ? input : input.url, ORIGIN);
    const file = files[url.pathname];
    if (!file) return new Response('missing', { status: 404 });
    return new Response(JSON.stringify(file.body), { status: file.status ?? 200 });
  });
  const fakeWindow: any = { fetch: realFetch, location: { origin: ORIGIN, href: `${ORIGIN}/fa` } };
  new Function('window', 'module', `${shimSource}`)(fakeWindow, undefined);
  return { fetch: fakeWindow.fetch, realFetch, shim: fakeWindow.__staticShim };
}

const indexLoads = (env: ShimEnv, file: string) =>
  env.realFetch.mock.calls.filter(([u]) => u === file).length;

describe('normalizeApiKey vectors', () => {
  const { shim } = loadShim();

  it('has enough vectors', () => {
    expect(vectors.length).toBeGreaterThanOrEqual(12);
  });

  it.each(vectors)('node and shim agree: $input', ({ input, expected }) => {
    expect(normalizeApiKey(input)).toBe(expected);
    expect(shim.normalizeApiKey(input)).toBe(expected);
  });
});

describe('static shim fetch', () => {
  let env: ShimEnv;
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    env = loadShim();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it('rejects RSC requests by header and by query', async () => {
    await expect(env.fetch('/fa/about', { headers: { RSC: '1' } })).rejects.toBeInstanceOf(TypeError);
    await expect(env.fetch('/fa/about?_rsc=abc')).rejects.toBeInstanceOf(TypeError);
    expect(env.realFetch).not.toHaveBeenCalled();
  });

  it('passes non-api and cross-origin requests through', async () => {
    await env.fetch('/media/a.png');
    await env.fetch('https://other.test/api/menu');
    expect(env.realFetch).toHaveBeenCalledTimes(2);
    expect(env.realFetch.mock.calls[1][0]).toBe('https://other.test/api/menu');
  });

  it('serves a snapshot hit with the recorded status, regardless of query order', async () => {
    const res = await env.fetch('/api/menu?location=header&language=fa');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(await res.json()).toEqual([{ id: 'm1' }]);

    const missing = await env.fetch('/api/pages/by-slug?slug=/fa/gone');
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Page not found' });
  });

  it('loads each data file once', async () => {
    await env.fetch('/api/menu?language=fa&location=header');
    await env.fetch('/api/menu?language=fa&location=header');
    expect(indexLoads(env, '/_data/api-index.json')).toBe(1);
  });

  it('returns 404 and warns once per key on a snapshot miss', async () => {
    const first = await env.fetch('/api/unknown?x=1');
    expect(first.status).toBe(404);
    expect(await first.json()).toEqual({ error: 'not_available_static' });
    await env.fetch('/api/unknown?x=1');
    expect(warn).toHaveBeenCalledTimes(1);
    await env.fetch('/api/unknown?x=2');
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('answers pages/check from equivalents.routes', async () => {
    const yes = await env.fetch('/api/pages/check?path=' + encodeURIComponent('/FA/about/'));
    expect(await yes.json()).toEqual({ exists: true });
    const no = await env.fetch('/api/pages/check?path=/fa/nope');
    expect(await no.json()).toEqual({ exists: false });
  });

  it('answers find-equivalent for found, no-equivalent and unknown pages', async () => {
    const found = await env.fetch('/api/pages/find-equivalent?slug=/fa/about&lang=en');
    expect(await found.json()).toEqual({ found: true, slug: '/en/about', method: 'pageGroup' });

    const viaPath = await env.fetch('/api/pages/find-equivalent?slug=/en/partnership&lang=fa');
    expect(await viaPath.json()).toEqual({ found: true, slug: '/fa/partnership', method: 'pageGroup' });

    const noGroupMember = await env.fetch('/api/pages/find-equivalent?slug=/en/solo&lang=fa');
    expect(await noGroupMember.json()).toEqual({ found: false, reason: 'no_equivalent_in_group' });

    const unknown = await env.fetch('/api/pages/find-equivalent?slug=/fa/ghost&lang=en');
    expect(await unknown.json()).toEqual({ found: false, reason: 'current_page_not_found' });
  });

  it('forwards POST /api/contact-form to /send.php with the same init', async () => {
    const init = { method: 'POST', body: '{"a":1}', headers: { 'Content-Type': 'application/json' } };
    await env.fetch('/api/contact-form', init);
    expect(env.realFetch).toHaveBeenCalledWith('/send.php', init);
  });

  it('answers other non-GET /api calls with 404', async () => {
    const res = await env.fetch('/api/pages', { method: 'DELETE' });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_available_static' });
  });
});
