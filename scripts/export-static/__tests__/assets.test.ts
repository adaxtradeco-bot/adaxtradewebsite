import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { processAssets, extractAssetRefs, rewriteRefs } from '../assets';

const BLOB = 'https://abc123.public.blob.vercel-storage.com';

let root: string;
let pub: string;
let bundle: string;

const write = (base: string, rel: string, content: string | Buffer = 'x') => {
  const abs = path.join(base, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
};
const read = (rel: string) => fs.readFileSync(path.join(bundle, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(bundle, rel));

const okFetch = (calls: string[] = []) =>
  (async (url: string) => {
    calls.push(String(url));
    return new Response(Buffer.from('blob-data'), { status: 200 });
  }) as unknown as typeof fetch;

const run = (extra: Record<string, unknown> = {}) =>
  processAssets({
    bundleDir: bundle,
    publicDir: pub,
    fetchImpl: okFetch(),
    retryDelayMs: 0,
    ...extra,
  });

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'assets-test-'));
  pub = path.join(root, 'public');
  bundle = path.join(root, 'bundle');
  fs.mkdirSync(pub, { recursive: true });
  fs.mkdirSync(bundle, { recursive: true });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('extractAssetRefs / rewriteRefs', () => {
  it('finds refs in srcset, url(), JSON-escaped and encoded forms', () => {
    const text = [
      '<img srcset="/media/a.png 1x, /media/b%20c.webp 2x" src="/uploads/x.jpg">',
      'a{background:url(/media/bg.svg)}',
      '{"v":"\\/media\\/j.mp4"}',
      `<img src="${BLOB}/p/pic.png?x=1&amp;y=2">`,
    ].join('\n');
    const urls = extractAssetRefs(text).map((r) => r.url);
    expect(urls).toEqual([
      '/media/a.png',
      '/media/b%20c.webp',
      '/uploads/x.jpg',
      '/media/bg.svg',
      '/media/j.mp4',
      `${BLOB}/p/pic.png`,
    ]);
  });

  it('ignores external URLs and _next/static/media paths', () => {
    const text = '"https://example.com/media/x.png" "/_next/static/media/f.woff2" "/media/noext"';
    expect(extractAssetRefs(text)).toEqual([]);
  });

  it('rewrites blob URLs keeping escape style, and /api/uploads', () => {
    const url = `${BLOB}/p/pic.png`;
    const out = rewriteRefs(
      `<img src="${url}?a=1"> {"u":"https:\\/\\/abc123.public.blob.vercel-storage.com\\/p\\/pic.png"} /api/uploads/a%20b.png`,
      { [url]: '/media/blob/11111111-pic.png' }
    );
    expect(out).toContain('<img src="/media/blob/11111111-pic.png">');
    expect(out).toContain('{"u":"\\/media\\/blob\\/11111111-pic.png"}');
    expect(out).toContain('/uploads/a%20b.png');
  });
});

describe('processAssets', () => {
  it('copies referenced local files from html, css and json', async () => {
    write(pub, 'media/a.png');
    write(pub, 'media/b c.webp');
    write(pub, 'media/bg.svg');
    write(pub, 'media/j.mp4');
    write(pub, 'media/unused.png');
    write(bundle, 'en/index.html', '<img srcset="/media/a.png 1x, /media/b%20c.webp 2x">');
    write(bundle, '_next/static/css/a.css', 'a{background:url(/media/bg.svg)}');
    write(bundle, '_data/en/home.json', '{"v":"\\/media\\/j.mp4"}');

    const report = await run();
    expect(report.ok).toBe(true);
    expect(report.copied).toEqual(
      expect.arrayContaining(['media/a.png', 'media/b c.webp', 'media/bg.svg', 'media/j.mp4'])
    );
    expect(exists('media/unused.png')).toBe(false);
  });

  it('maps /api/uploads to uploads and rewrites html/json/css', async () => {
    write(pub, 'uploads/pic.jpg');
    write(bundle, 'en/index.html', '<img src="/api/uploads/pic.jpg">');
    write(bundle, '_data/en/p.json', '{"i":"\\/api\\/uploads\\/pic.jpg"}');
    write(bundle, 'x.css', 'a{background:url("/api/uploads/pic.jpg")}');
    write(bundle, '_next/static/chunks/c.js', 'var a="/api/uploads/pic.jpg";var b="/api/other";');

    const report = await run();
    expect(report.ok).toBe(true);
    expect(exists('uploads/pic.jpg')).toBe(true);
    expect(exists('api/uploads/pic.jpg')).toBe(false);
    expect(read('en/index.html')).toBe('<img src="/uploads/pic.jpg">');
    expect(read('_data/en/p.json')).toBe('{"i":"\\/uploads\\/pic.jpg"}');
    expect(read('x.css')).toContain('url("/uploads/pic.jpg")');
    expect(read('_next/static/chunks/c.js')).toBe('var a="/uploads/pic.jpg";var b="/api/other";');
    expect(report.rewrittenFiles).toBe(4);
  });

  it('discovers files referenced only from JS chunks', async () => {
    write(pub, 'data/x.json', '{}');
    write(pub, 'media/chunk.png');
    write(bundle, '_next/static/chunks/c.js', 'load("/media/chunk.png")');
    const report = await run();
    expect(report.copied).toContain('media/chunk.png');
  });

  it('reports missing local files as broken', async () => {
    write(bundle, 'en/index.html', '<img src="/media/missing.png">');
    const report = await run();
    expect(report.ok).toBe(false);
    expect(report.broken).toEqual([{ ref: '/media/missing.png', from: 'en/index.html' }]);
    expect((await run({ allowMissing: true })).ok).toBe(true);
  });

  it('never copies public html test files or unreferenced root files', async () => {
    write(pub, 'media-test.html');
    write(pub, 'test-convert.html');
    write(pub, 'adaxtradeMain.mp4');
    write(pub, '.env.local', 'SECRET=1');
    write(pub, 'robots.txt', 'User-agent: *');
    write(bundle, 'index.html', '<a href="/media-test.html">x</a>');
    const report = await run();
    expect(exists('media-test.html')).toBe(false);
    expect(exists('test-convert.html')).toBe(false);
    expect(exists('adaxtradeMain.mp4')).toBe(false);
    expect(exists('.env.local')).toBe(false);
    expect(exists('robots.txt')).toBe(true);
    expect(report.ok).toBe(true);
  });

  it('always copies allow-listed folders', async () => {
    write(pub, 'fonts/yekanbakh/a.woff2');
    write(pub, 'fontawesome/css/all.css');
    write(pub, 'webfonts/fa.ttf');
    write(pub, 'data/icons.json');
    write(pub, 'favicon.ico');
    write(pub, 'other/secret.txt');
    await run();
    for (const f of [
      'fonts/yekanbakh/a.woff2',
      'fontawesome/css/all.css',
      'webfonts/fa.ttf',
      'data/icons.json',
      'favicon.ico',
    ]) {
      expect(exists(f)).toBe(true);
    }
    expect(exists('other/secret.txt')).toBe(false);
  });

  it('rejects path traversal', async () => {
    write(root, 'secret.png', 'top-secret');
    write(bundle, 'index.html', '<img src="/media/../../secret.png"><img src="/media/%2e%2e/%2e%2e/secret.png">');
    const report = await run();
    expect(report.ok).toBe(false);
    expect(report.broken.every((b) => b.reason === 'unsafe path')).toBe(true);
    expect(report.broken.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(root, 'bundle', '..', 'secret.png'))).toBe(true);
    expect(exists('secret.png')).toBe(false);
  });

  it('downloads blob files and rewrites every variant', async () => {
    const calls: string[] = [];
    const url = `${BLOB}/folder/My Pic-xyz.png`.replace(' ', '%20');
    write(
      bundle,
      'en/index.html',
      `<img src="${url}" srcset="${url} 1x, ${url}?w=2 2x"><div style="background:url(${url})"></div>`
    );
    write(bundle, '_data/en/p.json', JSON.stringify({ i: url }).replace(/\//g, '\\/'));
    write(bundle, 'a.css', `a{background:url("${url}")}`);

    const report = await run({ fetchImpl: okFetch(calls) });
    expect(calls).toEqual([url]);
    expect(report.downloaded).toHaveLength(1);
    const local = `/${report.downloaded[0].file}`;
    expect(local).toMatch(/^\/media\/blob\/[0-9a-f]{8}-My_Pic-xyz\.png$/);
    expect(read('en/index.html')).not.toContain('blob.vercel-storage.com');
    expect(read('en/index.html')).toContain(`srcset="${local} 1x, ${local} 2x"`);
    expect(read('_data/en/p.json')).toContain(local.replace(/\//g, '\\/'));
    expect(read('a.css')).toBe(`a{background:url("${local}")}`);
    expect(report.ok).toBe(true);
  });

  it('leaves urls and lists them when download is disabled', async () => {
    const url = `${BLOB}/a.png`;
    write(bundle, 'index.html', `<img src="${url}">`);
    const report = await run({ download: false });
    expect(report.skippedRemote).toEqual([url]);
    expect(read('index.html')).toContain(url);
  });

  it('retries failed downloads then reports broken', async () => {
    let attempts = 0;
    const failing = (async () => {
      attempts++;
      return new Response('nope', { status: 500 });
    }) as unknown as typeof fetch;
    const url = `${BLOB}/a.png`;
    write(bundle, 'index.html', `<img src="${url}">`);
    const report = await run({ fetchImpl: failing });
    expect(attempts).toBe(3);
    expect(report.ok).toBe(false);
    expect(report.broken[0].ref).toBe(url);
    expect(read('index.html')).toContain(url);
  });

  it('is idempotent', async () => {
    write(pub, 'uploads/pic.jpg');
    write(pub, 'fonts/f.woff2');
    write(bundle, 'index.html', `<img src="/api/uploads/pic.jpg"><img src="${BLOB}/a.png">`);
    const snapshot = () =>
      Object.fromEntries(
        fs
          .readdirSync(bundle, { recursive: true, withFileTypes: true })
          .filter((e) => e.isFile())
          .map((e) => {
            const abs = path.join(e.parentPath ?? (e as any).path, e.name);
            return [path.relative(bundle, abs), fs.readFileSync(abs, 'utf8')];
          })
      );
    await run();
    const first = snapshot();
    const report = await run();
    expect(snapshot()).toEqual(first);
    expect(report.ok).toBe(true);
    expect(report.rewrittenFiles).toBe(0);
  });

  it('warns about large files and large totals', async () => {
    write(pub, 'media/big.mp4', Buffer.alloc(300));
    write(pub, 'media/small.png', Buffer.alloc(10));
    write(bundle, 'index.html', '<video src="/media/big.mp4"></video><img src="/media/small.png">');
    const report = await run({ thresholds: { singleFileBytes: 100, totalBytes: 200 } });
    expect(report.warnings.some((w) => w.includes('media/big.mp4'))).toBe(true);
    expect(report.warnings.some((w) => w.startsWith('Total media size'))).toBe(true);
    expect(report.bytes.total).toBe(310);
  });
});
