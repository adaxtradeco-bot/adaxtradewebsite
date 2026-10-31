import { describe, expect, it } from 'vitest';
import { deriveTitle, injectPageMeta } from '../sitemap';

const html = '<html><head><script src="/static-shim.js"></script></head><body><h1>Hello <b>World</b> &amp; co</h1></body></html>';

describe('injectPageMeta', () => {
  it('adds an escaped title and description before </head>', () => {
    const out = injectPageMeta(html, { title: 'A & "B"', description: 'desc <x>' });
    expect(out).toContain('<title>A &amp; &quot;B&quot;</title><meta name="description" content="desc &lt;x&gt;"></head>');
    expect(out.indexOf('static-shim')).toBeLessThan(out.indexOf('<title>'));
  });
  it('keeps existing title and description', () => {
    const existing = '<head><title>T</title><meta name="description" content="d"></head>';
    expect(injectPageMeta(existing, { title: 'X', description: 'Y' })).toBe(existing);
  });
});

describe('deriveTitle', () => {
  it('uses the first h1 text, else the last path segment', () => {
    expect(deriveTitle(html, '/en/x')).toBe('Hello World & co');
    expect(deriveTitle('<p>no heading</p>', '/en/app-builder')).toBe('app builder');
  });
});
