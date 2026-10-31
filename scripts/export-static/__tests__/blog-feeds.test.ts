import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportBlogFeeds } from '../prerender';

describe('exportBlogFeeds', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-feeds-'));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('writes XML feeds as text and warns for missing ones', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('/en/')
          ? new Response('<?xml version="1.0"?><rss/>', { status: 200 })
          : new Response('nope', { status: 404 }),
      ),
    );
    const out = await exportBlogFeeds('http://localhost:4000', dir, ['/en/blog/rss.xml', '/fa/blog/rss.xml']);
    expect(out.written).toEqual(['/en/blog/rss.xml']);
    expect(fs.readFileSync(path.join(dir, 'en', 'blog', 'rss.xml'), 'utf8')).toBe('<?xml version="1.0"?><rss/>');
    expect(out.warnings).toEqual(['RSS /fa/blog/rss.xml skipped: HTTP 404']);
  });

  it('does not write an HTML error page that answered 200', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>oops</html>', { status: 200 })));
    const out = await exportBlogFeeds('http://localhost:4000', dir, ['/en/blog/rss.xml']);
    expect(out.written).toEqual([]);
    expect(fs.existsSync(path.join(dir, 'en'))).toBe(false);
  });
});
