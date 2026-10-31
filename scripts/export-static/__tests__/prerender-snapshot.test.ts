// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { ApiSnapshot, routeToFile, injectShim, renderCrawl } from '../prerender';

const tmp: string[] = [];
const mkTmp = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snap-'));
  tmp.push(dir);
  return dir;
};
afterEach(() => tmp.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

describe('ApiSnapshot', () => {
  it('keeps the first capture and warns on conflicting bodies', () => {
    const snap = new ApiSnapshot();
    snap.add([{ key: '/api/menu?language=en', status: 200, body: '[1]' }], '/en');
    snap.add([{ key: '/api/menu?language=en', status: 200, body: '[1]' }], '/en/a');
    expect(snap.warnings).toHaveLength(0);
    snap.add([{ key: '/api/menu?language=en', status: 200, body: '[2]' }], '/en/b');
    expect(snap.warnings).toHaveLength(1);
    expect(snap.get('/api/menu?language=en')?.body).toBe('[1]');
    expect(snap.size).toBe(1);
  });

  it('writes sequentially numbered files and an index', () => {
    const snap = new ApiSnapshot();
    snap.add([
      { key: '/api/a', status: 200, body: '{"a":1}' },
      { key: '/api/b?x=1', status: 404, body: '{"error":"nf"}' },
    ]);
    const dir = mkTmp();
    snap.writeSnapshot(dir);
    const index = JSON.parse(fs.readFileSync(path.join(dir, '_data', 'api-index.json'), 'utf8'));
    expect(index).toEqual({
      '/api/a': { file: '0001.json', status: 200 },
      '/api/b?x=1': { file: '0002.json', status: 404 },
    });
    expect(fs.readFileSync(path.join(dir, '_data', 'api', '0002.json'), 'utf8')).toBe('{"error":"nf"}');
  });

  it('writes the same files regardless of capture order', () => {
    const calls = [
      { key: '/api/b', status: 200, body: 'B' },
      { key: '/api/a', status: 200, body: 'A' },
    ];
    const [d1, d2] = [mkTmp(), mkTmp()];
    const s1 = new ApiSnapshot();
    s1.add(calls);
    s1.writeSnapshot(d1);
    const s2 = new ApiSnapshot();
    s2.add([...calls].reverse());
    s2.writeSnapshot(d2);
    const read = (d: string): string => fs.readFileSync(path.join(d, '_data', 'api-index.json'), 'utf8');
    expect(read(d1)).toBe(read(d2));
    expect(fs.readFileSync(path.join(d1, '_data', 'api', '0001.json'), 'utf8')).toBe('A');
  });
});

describe('prerender helpers', () => {
  it('maps routes to files', () => {
    expect(routeToFile('/en')).toBe('en/index.html');
    expect(routeToFile('/en/a/b')).toBe('en/a/b/index.html');
  });
  it('injects the shim right after <head>', () => {
    expect(injectShim('<html><head><meta charset="utf-8"></head>')).toBe(
      '<html><head><script src="/static-shim.js"></script><meta charset="utf-8"></head>',
    );
  });
});

describe('renderCrawl empty pages', () => {
  it('skips pages without sections as empty-page before rendering them', async () => {
    const dir = mkTmp();
    const route = { lang: 'en' as const, path: '/en/industries-healthcare', source: 'db' as const, pageId: 'p1' };
    const outcome = await renderCrawl([route], 'http://127.0.0.1:1', {
      concurrency: 1,
      outDir: dir,
      verbose: false,
      langs: ['en'],
      emptyPageIds: new Set(['p1']),
    });
    expect(outcome.failed).toEqual([]);
    expect(outcome.kept).toEqual([]);
    expect(outcome.skipped.map((r) => r.reason)).toEqual(['empty-page']);
    expect(outcome.knownMissing).toEqual([]);
  }, 30_000);
});
