import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { compareBundles, summarizeHtml } from '../compare-bundles';

let a: string;
let b: string;

const write = (root: string, rel: string, content: string): void => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const html = (main: string, title = 'Home', extra = ''): string =>
  `<html><head><title>${title}</title></head><body><main>${main}</main>${extra}</body></html>`;
const both = (rel: string, content: string): void => {
  write(a, rel, content);
  write(b, rel, content);
};

beforeEach(() => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmp-bundles-'));
  a = path.join(root, 'a');
  b = path.join(root, 'b');
  fs.mkdirSync(a);
  fs.mkdirSync(b);
});
afterEach(() => fs.rmSync(path.dirname(a), { recursive: true, force: true }));

describe('summarizeHtml', () => {
  it('normalizes main text and ignores scripts, tags and whitespace', () => {
    const s = summarizeHtml(html('<h1>Hi &amp;  bye</h1>\n<script>x()</script><p>there</p>', ' My  title '));
    expect(s).toEqual({ title: 'My title', mainText: 'Hi & bye there' });
  });
});

describe('compareBundles', () => {
  it('reports no differences for equal bundles, ignoring README timestamps, sitemap lastmod and HTML noise', () => {
    both('_data/api-index.json', '{}');
    both('send.php', '<?php');
    write(a, 'README-DEPLOY.txt', 'Exported: 2026-01-01T10:00:00.000Z\nfiles: 3');
    write(b, 'README-DEPLOY.txt', 'Exported: 2026-01-02T11:30:00.123Z\nfiles: 3');
    write(a, 'sitemap.xml', '<url><lastmod>2026-01-01</lastmod></url>');
    write(b, 'sitemap.xml', '<url><lastmod>2026-02-02</lastmod></url>');
    write(a, 'en/index.html', html('<p>Same text</p>', 'Home', '<script id="r1">a</script>'));
    write(b, 'en/index.html', html('<p>Same  <b>text</b></p>', 'Home', '<script id="r2">b</script>'));
    const r = compareBundles(a, b);
    expect(r.differences).toEqual([]);
    expect(r.htmlCompared).toBe(1);
  });

  it('reports files present on one side only', () => {
    write(a, 'only-a.txt', '1');
    write(b, 'only-b.txt', '1');
    expect(compareBundles(a, b).differences.map((d) => `${d.kind}:${d.file}`)).toEqual([
      'only-in-a:only-a.txt',
      'only-in-b:only-b.txt',
    ]);
  });

  it('reports byte differences in non-HTML files', () => {
    write(a, '_data/api/0001.json', '{"a":1}');
    write(b, '_data/api/0001.json', '{"a":2}');
    expect(compareBundles(a, b).differences).toMatchObject([{ kind: 'content', file: '_data/api/0001.json' }]);
  });

  it('reports main-text and title differences in HTML', () => {
    write(a, 'en/x/index.html', html('<p>One</p>', 'T1'));
    write(b, 'en/x/index.html', html('<p>Two</p>', 'T2'));
    expect(compareBundles(a, b).differences.map((d) => d.kind)).toEqual(['title', 'main-text']);
  });
});
