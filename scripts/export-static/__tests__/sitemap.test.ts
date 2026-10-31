import { describe, it, expect } from 'vitest';
import { buildEquivalents } from '../equivalents';
import { renderSitemap, renderRobots, injectCanonical, escapeXml } from '../sitemap';
import type { RouteEntry } from '../types';

const pages = [
  { id: 'a', slug: '/en', language: 'en', pageGroupId: 'g1' },
  { id: 'b', slug: '/ar', language: 'ar', pageGroupId: 'g1' },
  { id: 'c', slug: '/en/q&a', language: 'en', pageGroupId: null },
];
const kept: RouteEntry[] = [
  { lang: 'en', path: '/en', source: 'db', pageId: 'a' },
  { lang: 'ar', path: '/ar', source: 'db', pageId: 'b' },
  { lang: 'en', path: '/en/q&a', source: 'db', pageId: 'c' },
  { lang: 'en', path: '/en/about', source: 'fs' },
];
const eq = buildEquivalents(pages, kept);

describe('renderSitemap', () => {
  it('returns null without a base URL', () => {
    expect(renderSitemap(eq.routes, eq)).toBeNull();
  });

  const xml = renderSitemap(eq.routes, eq, 'https://example.com/') as string;

  it('declares namespaces and uses absolute locs', () => {
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('<loc>https://example.com/en</loc>');
    expect(xml).toContain('<loc>https://example.com/en/about</loc>');
    expect(xml).not.toContain('https://example.com//');
  });

  it('adds hreflang alternates for every group member including self', () => {
    const en = xml.slice(xml.indexOf('<loc>https://example.com/en</loc>'));
    const block = en.slice(0, en.indexOf('</url>'));
    expect(block).toContain('hreflang="ar" href="https://example.com/ar"');
    expect(block).toContain('hreflang="en" href="https://example.com/en"');
  });

  it('emits no alternates for ungrouped routes', () => {
    const about = xml.slice(xml.indexOf('<loc>https://example.com/en/about</loc>'));
    expect(about.slice(0, about.indexOf('</url>'))).not.toContain('xhtml:link');
  });

  it('escapes XML special characters', () => {
    expect(xml).toContain('https://example.com/en/q&amp;a');
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    expect(escapeXml(`<"'&>`)).toBe('&lt;&quot;&apos;&amp;&gt;');
  });
});

describe('renderSitemap blog routes', () => {
  it('percent-encodes Persian slugs and lists blog routes', () => {
    const xml = renderSitemap(['/fa/blog', '/fa/blog/۵-نکته'], { bySlug: {}, byGroup: {} }, 'https://example.com') as string;
    expect(xml).toContain('<loc>https://example.com/fa/blog</loc>');
    expect(xml).toContain('<loc>https://example.com/fa/blog/%DB%B5-%D9%86%DA%A9%D8%AA%D9%87</loc>');
  });
});

describe('renderRobots', () => {
  it('appends a Sitemap line once', () => {
    const once = renderRobots('https://example.com', 'User-agent: *\nAllow: /');
    expect(once).toBe('User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n');
    expect(renderRobots('https://example.com', once)).toBe(once);
  });

  it('leaves text untouched without a base URL', () => {
    expect(renderRobots(undefined, 'User-agent: *\n')).toBe('User-agent: *\n');
    expect(renderRobots()).toBe('');
  });

  it('does not duplicate an existing Sitemap line of another host', () => {
    const text = 'sitemap: https://other.example/sitemap.xml\n';
    expect(renderRobots('https://example.com', text)).toBe(text);
  });
});

describe('injectCanonical', () => {
  const html = '<!DOCTYPE html><html><head><title>t</title></head><body></body></html>';

  it('injects into head', () => {
    const out = injectCanonical(html, 'https://example.com/en');
    expect(out).toContain('<head><link rel="canonical" href="https://example.com/en"><title>');
  });

  it('is idempotent and respects an existing canonical', () => {
    const once = injectCanonical(html, 'https://example.com/en');
    expect(injectCanonical(once, 'https://example.com/en')).toBe(once);
    const own = '<html><head><link href="https://x.test/" rel="canonical"></head></html>';
    expect(injectCanonical(own, 'https://example.com/en')).toBe(own);
  });

  it('escapes the URL and leaves head-less html alone', () => {
    expect(injectCanonical(html, 'https://e.com/?a=1&b="2"')).toContain('href="https://e.com/?a=1&amp;b=&quot;2&quot;"');
    expect(injectCanonical('<p>x</p>', 'https://e.com')).toBe('<p>x</p>');
  });
});
