import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractSource } from '@/lib/custom-html/extract';
import { CUSTOM_HTML_LIMITS } from '@/lib/custom-html/types';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

describe('extractSource — full document', () => {
  const r = extractSource(fixture('partner-showcase.html'));

  it('detects a full document and returns body markup only', () => {
    expect(r.isFullDocument).toBe(true);
    expect(r.html.startsWith('<!-- S1 HERO -->') || r.html.startsWith('<section')).toBe(true);
    expect(r.html).toContain('A platform your clients');
    expect(r.html).not.toMatch(/<(title|meta|style|script|link)\b/i);
    expect(r.html).not.toMatch(/<body|<html|<head/i);
  });

  it('collects <style> into css and keeps rule order', () => {
    expect(r.css).toContain(':root { --bg: #07080A;');
    expect(r.css).toContain('@keyframes blink');
    expect(r.css.indexOf('.container')).toBeLessThan(r.css.indexOf('.reveal.in'));
  });

  it('collects stylesheet links but drops preconnect', () => {
    expect(r.externalStylesheets).toEqual([
      'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap',
    ]);
  });

  it('collects the classic inline script as a block', () => {
    expect(r.jsBlocks).toHaveLength(1);
    expect(r.jsBlocks[0]).toContain('IntersectionObserver');
    expect(r.errors).toEqual([]);
    expect(r.tailwind).toBeUndefined();
  });
});

describe('extractSource — fragment', () => {
  const r = extractSource(fixture('flow-builder-tabs.html'));

  it('handles a fragment starting with <style>', () => {
    expect(r.isFullDocument).toBe(false);
    expect(r.css).toContain('.tab-panel.active');
    expect(r.html.startsWith('<section class="sec1">')).toBe(true);
    expect(r.html).toContain('onclick="switchTab(1,0)"'); // handlers are rewritten later (handlers.ts)
  });

  it('keeps script order and syntax-checks blocks', () => {
    expect(r.jsBlocks).toHaveLength(1);
    expect(r.jsBlocks[0]).toContain('function switchTab');
    expect(r.errors).toEqual([]);
  });

  it('keeps multiple scripts in document order', () => {
    const out = extractSource('<div></div><script>var a = 1;</script><p>x</p><script>var b = 2;</script>');
    expect(out.jsBlocks).toEqual(['var a = 1;', 'var b = 2;']);
    expect(out.html).toBe('<div></div><p>x</p>');
  });
});

describe('extractSource — Tailwind', () => {
  const r = extractSource(fixture('fleet-tailwind.html'));

  it('turns the CDN script into tailwind.enabled', () => {
    expect(r.tailwind?.enabled).toBe(true);
    expect(r.externalScripts).toEqual([]);
  });

  it('parses tailwind.config statically', () => {
    expect(r.tailwind?.config).toEqual({
      darkMode: 'class',
      theme: {
        extend: {
          colors: { brand: { 500: '#1a73e8', 600: '#1557b0' }, ink: '#0b1220' },
          spacing: { '-4': -1, 18: '4.5rem' },
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          flags: [true, false, null],
        },
      },
    });
  });

  it('removes the config script from the JS blocks', () => {
    expect(r.jsBlocks).toHaveLength(1);
    expect(r.jsBlocks.join('\n')).not.toContain('tailwind.config');
    expect(r.jsBlocks[0]).toContain("querySelectorAll('a[href^=\"#\"]')");
  });

  it('drops module scripts with a warning and keeps JSON islands in the html', () => {
    expect(r.warnings.some((w) => /module/i.test(w))).toBe(true);
    expect(r.html).toContain('type="application/json"');
    expect(r.html).toContain('{"page":"fleet"}');
    expect(r.html).not.toContain('import x from');
  });

  it('warns about <body> attributes', () => {
    expect(r.warnings.some((w) => /<body>/.test(w))).toBe(true);
  });

  it('only removes the tailwind.config statement from a mixed block', () => {
    const out = extractSource(
      '<script>var before = 1; tailwind.config = { theme: { x: -2 } }; var after = 2;</script>'
    );
    expect(out.tailwind?.config).toEqual({ theme: { x: -2 } });
    expect(out.jsBlocks).toHaveLength(1);
    expect(out.jsBlocks[0]).toContain('var before = 1;');
    expect(out.jsBlocks[0]).toContain('var after = 2;');
    expect(out.jsBlocks[0]).not.toContain('tailwind');
  });

  it('warns and ignores non-static configs (never evaluates them)', () => {
    const marker = '__evaluated__';
    (globalThis as Record<string, unknown>)[marker] = false;
    const out = extractSource(
      `<script>tailwind.config = { theme: { x: (globalThis.${marker} = true) }, y: foo(), ...rest }</script>`
    );
    expect(out.tailwind?.config).toBeUndefined();
    expect(out.warnings.some((w) => /tailwind\.config/.test(w))).toBe(true);
    expect(out.jsBlocks).toEqual([]);
    expect((globalThis as Record<string, unknown>)[marker]).toBe(false);
  });

  it('rejects template literals with expressions and computed keys', () => {
    const a = extractSource('<script>tailwind.config = { c: `x${1}` }</script>');
    expect(a.tailwind?.config).toBeUndefined();
    const b = extractSource('<script>tailwind.config = { ["a" + "b"]: 1 }</script>');
    expect(b.tailwind?.config).toBeUndefined();
    expect(b.warnings.length).toBeGreaterThan(0);
  });
});

describe('extractSource — errors, limits and extras', () => {
  it('reports JS syntax errors with the block number and message', () => {
    const r = extractSource('<div></div><script>var ok = 1;</script><script>function (</script>');
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatch(/block 2/);
    expect(r.errors[0]).toMatch(/syntax error/i);
  });

  it('rejects input larger than the upload limit', () => {
    const r = extractSource('a'.repeat(CUSTOM_HTML_LIMITS.uploadBytes + 1));
    expect(r.errors).toHaveLength(1);
    expect(r.html).toBe('');
  });

  it('appends extra css and js (and syntax-checks the extra js)', () => {
    const r = extractSource('<style>a{color:red}</style><p>x</p><script>var a=1</script>', {
      css: 'b{color:blue}',
      js: 'var b = 2;',
    });
    expect(r.css).toBe('a{color:red}\n\nb{color:blue}');
    expect(r.jsBlocks).toEqual(['var a=1', 'var b = 2;']);
    const bad = extractSource('<p>x</p>', { js: 'let = ;' });
    expect(bad.errors).toHaveLength(1);
  });

  it('classifies external scripts and ignores non-http sources', () => {
    const r = extractSource(
      '<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>' +
        '<script src="//cdnjs.cloudflare.com/x.js"></script>' +
        '<script src="js/local.js"></script>' +
        '<script src="https://cdn.tailwindcss.com"></script><p>x</p>'
    );
    expect(r.externalScripts).toEqual([
      'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
      'https://cdnjs.cloudflare.com/x.js',
    ]);
    expect(r.tailwind).toEqual({ enabled: true });
    expect(r.warnings.some((w) => w.includes('js/local.js'))).toBe(true);
  });

  it('wraps <style media> in an @media rule', () => {
    const r = extractSource('<style media="(max-width:600px)">a{b:c}</style><p>x</p>');
    expect(r.css).toContain('@media (max-width:600px)');
  });

  it('keeps <style> inside inline svg in the markup', () => {
    const r = extractSource('<svg><style>.a{fill:red}</style><rect class="a"/></svg>');
    expect(r.css).toBe('');
    expect(r.html).toContain('<style>');
  });
});
