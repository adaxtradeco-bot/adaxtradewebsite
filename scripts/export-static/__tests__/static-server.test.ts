// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { serveBundle, mimeFor, type BundleServer } from '../static-server';

let dir: string;
let server: BundleServer;

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'srv-'));
  fs.mkdirSync(path.join(dir, 'en'));
  fs.writeFileSync(path.join(dir, 'en', 'index.html'), '<h1>en</h1>');
  fs.writeFileSync(path.join(dir, 'a.woff2'), 'font');
  fs.writeFileSync(path.join(dir, '404.html'), 'custom 404');
  server = await serveBundle(dir, 0);
});
afterAll(async () => {
  await server.stop();
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('serveBundle', () => {
  it('serves directories as index.html with MIME types', async () => {
    const res = await fetch(`${server.url}/en/`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toBe('<h1>en</h1>');
    expect((await fetch(`${server.url}/a.woff2`)).headers.get('content-type')).toBe('font/woff2');
  });

  it('returns 404.html for missing paths and 404 for api, image optimizer and php', async () => {
    const missing = await fetch(`${server.url}/nope`);
    expect(missing.status).toBe(404);
    expect(await missing.text()).toBe('custom 404');
    for (const p of ['/api/menu', '/_next/image?url=x', '/send.php']) {
      expect((await fetch(`${server.url}${p}`)).status).toBe(404);
    }
    expect((await fetch(`${server.url}/..%2f..%2fetc/passwd`)).status).toBe(404);
  });

  it('logs requests', () => {
    expect(server.getRequestLog().some((r) => r.url === '/api/menu' && r.status === 404)).toBe(true);
  });

  it('knows common MIME types', () => {
    expect(mimeFor('x.mp4')).toBe('video/mp4');
    expect(mimeFor('x.webp')).toBe('image/webp');
    expect(mimeFor('x.unknown')).toBe('application/octet-stream');
  });
});
