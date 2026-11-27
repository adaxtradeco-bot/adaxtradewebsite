// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
// @ts-ignore -- jsdom ships no type declarations
import { JSDOM } from 'jsdom';
import { NextRequest } from 'next/server';
import postcss from 'postcss';
import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  compileCss,
  tailwindConfigError,
  TailwindOptionsSchema,
  TAILWIND_LIMITS,
  type CssCompileRequest,
} from '@/lib/custom-html/css-scope';
import { extractSource } from '@/lib/custom-html/extract';
import { CUSTOM_HTML_LIMITS } from '@/lib/custom-html/types';
import { POST } from '@/app/api/admin/custom-html/compile/route';

vi.mock('@/lib/api-auth', () => ({ authorizeCode: () => ({ ok: true }) }));

async function tw(classes: string, extra: Partial<CssCompileRequest> = {}, config?: Record<string, unknown>) {
  const r = await compileCss({
    html: `<div class="${classes}"></div>`,
    css: '',
    tailwind: { enabled: true, config },
    ...extra,
  });
  return { ...r, R: `[data-chs="${r.scope}"]` };
}

/** every style-rule selector outside @keyframes */
function selectors(css: string): string[] {
  const out: string[] = [];
  postcss.parse(css).walkRules((rule) => {
    const parent = rule.parent as { type: string; name?: string };
    if (parent.type === 'atrule' && /keyframes$/.test(parent.name ?? '')) return;
    out.push(rule.selector);
  });
  return out;
}

describe('compileCss — Tailwind', () => {
  it('generates only the used utilities, all inside the section', async () => {
    const r = await tw('flex md:grid-cols-2 hover:underline space-x-4 2xl:hidden container [&>li]:p-2');
    expect(r.warnings).toEqual([]);
    expect(r.cssScoped).toContain(`${r.R} .flex`);
    expect(r.cssScoped).toContain(`${r.R} .md\\:grid-cols-2`);
    expect(r.cssScoped).toContain(`${r.R} .hover\\:underline:hover`);
    expect(r.cssScoped).toContain(`${r.R} .space-x-4 > :not([hidden]) ~ :not([hidden])`);
    // "\32xl" and "\32 xl" are the same CSS escape
    expect(r.cssScoped).toContain(`${r.R} .\\32xl\\:hidden`);
    expect(r.cssScoped).toContain(`${r.R} .\\[\\&\\>li\\]\\:p-2>li`);
    expect(r.cssScoped).not.toContain('.grid-cols-3');
    expect(r.cssScoped).not.toContain('@tailwind');
    const all = selectors(r.cssScoped);
    expect(all.length).toBeGreaterThan(8);
    for (const s of all) expect(s.startsWith(r.R) || s.startsWith(`:where(${r.R}`)).toBe(true);
  });

  it('adds a zero-specificity base instead of preflight', async () => {
    const r = await tw('border shadow-lg backdrop:bg-black');
    const universal = `:where(${r.R}, ${r.R} *), :where(${r.R}, ${r.R} *)::before, :where(${r.R}, ${r.R} *)::after`;
    const rules = postcss.parse(r.cssScoped).nodes.filter((n) => n.type === 'rule') as postcss.Rule[];
    const preflight = rules[0];
    expect(preflight.selector).toBe(universal);
    expect(preflight.toString()).toContain('border-style:solid');
    expect(preflight.toString()).toContain('border-width:0');
    expect(preflight.toString()).toContain('border-color:#e5e7eb');
    expect(rules[1].selector).toBe(universal);
    expect(rules[1].toString()).toContain('--tw-shadow');
    expect(r.cssScoped).toContain(`:where(${r.R}, ${r.R} *)::backdrop`);
    expect(r.cssScoped).not.toContain('chs-preflight');
    // real preflight resets elements; none of that may appear
    expect(r.cssScoped).not.toContain('text-size-adjust');
    expect(r.cssScoped).not.toMatch(/\bh1\b/);
  });

  it('keeps .dark outside the scope for dark: variants', async () => {
    const r = await tw('dark:text-white dark:hover:bg-black dark:group-hover:underline dark:space-x-2 [.dark_&]:bg-white [html.dark_&]:flex');
    expect(r.cssScoped).toContain(`${r.R} .dark\\:text-white:is(.dark *)`);
    expect(r.cssScoped).toContain(`${r.R} .dark\\:hover\\:bg-black:hover:is(.dark *)`);
    expect(r.cssScoped).toContain(`${r.R} .group:hover .dark\\:group-hover\\:underline:is(.dark *)`);
    expect(r.cssScoped).toContain(`${r.R} .dark\\:space-x-2:is(.dark *) > :not([hidden])`);
    expect(r.cssScoped).toContain(`.dark ${r.R} .\\[\\.dark_\\&\\]\\:bg-white`);
    expect(r.cssScoped).toContain(`.dark ${r.R} .\\[html\\.dark_\\&\\]\\:flex`);
    expect(r.cssScoped).not.toContain('prefers-color-scheme');
  });

  it('resets the host .container only when the section uses it', async () => {
    const used = await tw('container');
    expect(used.cssScoped).toContain(`${used.R} .container{margin-left:0;`);
    expect(used.cssScoped.indexOf('padding-left:0')).toBeLessThan(used.cssScoped.search(/[{;\s]width: ?100%/));
    expect((await tw('flex')).cssScoped).not.toContain('.container');
  });

  it('orders @import, then Tailwind, then author CSS', async () => {
    const r = await tw('p-4', { css: '@import url("https://fonts.example.com/a.css"); .card{padding:0}' });
    expect(r.cssScoped.startsWith('@import url("https://fonts.example.com/a.css")')).toBe(true);
    const utility = r.cssScoped.indexOf(`${r.R} .p-4`);
    expect(utility).toBeGreaterThan(0);
    expect(r.cssScoped.indexOf(`${r.R} .card`)).toBeGreaterThan(utility);
  });

  it('scans js and the extra content string for class names', async () => {
    const r = await tw('', {
      js: "el.classList.add('translate-x-4')",
      content: '<strong class="text-blue-700">x</strong>',
    });
    expect(r.cssScoped).toContain('.translate-x-4');
    expect(r.cssScoped).toContain('.text-blue-700');
  });

  it('generates nothing when disabled', async () => {
    const r = await compileCss({ html: '<div class="flex"></div>', css: '', tailwind: { enabled: false } });
    expect(r.cssScoped).toBe('');
    expect(r.warnings).toEqual([]);
  });

  it('applies theme.extend', async () => {
    const r = await tw('text-brand-500 p-18 animate-float font-display rounded', {}, {
      darkMode: 'class',
      theme: {
        extend: {
          colors: { brand: { 500: '#1a73e8' } },
          spacing: { 18: '4.5rem' },
          fontFamily: { display: ['Inter', 'sans-serif'] },
          borderColor: { DEFAULT: '#123456' },
          keyframes: { float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } } },
          animation: { float: 'float 3s ease-in-out infinite' },
        },
      },
    });
    expect(r.warnings).toEqual([]);
    expect(r.cssScoped).toContain('26 115 232');
    expect(r.cssScoped).toMatch(/padding: ?4\.5rem/);
    expect(r.cssScoped).toMatch(/font-family: ?Inter, sans-serif/);
    expect(r.cssScoped).toContain('border-color:#123456');
    expect(r.cssScoped).toContain('@keyframes float');
    expect(r.cssScoped).toMatch(/animation: ?float 3s ease-in-out infinite/);
  });

  it('scopes differently when only the Tailwind input differs', async () => {
    const a = await tw('text-brand', {}, { theme: { extend: { colors: { brand: '#111111' } } } });
    const b = await tw('text-brand', {}, { theme: { extend: { colors: { brand: '#222222' } } } });
    const c = await tw('text-brand', { content: '<b class="flex"></b>' });
    expect(new Set([a.scope, b.scope, c.scope]).size).toBe(3);
  });

  it('does not leak classes or theme between compiles', async () => {
    const first = await tw('text-brand underline', {}, { theme: { extend: { colors: { brand: '#111111' } } } });
    expect(first.cssScoped).toContain('.text-brand');
    const second = await tw('text-brand italic');
    expect(second.cssScoped).toContain('.italic');
    expect(second.cssScoped).not.toContain('.underline');
    expect(second.cssScoped).not.toContain('.text-brand');
  });

  it('handles concurrent compiles', async () => {
    const [a, b, c] = await Promise.all([tw('underline'), tw('italic'), tw('underline')]);
    expect(a.cssScoped).toContain('.underline');
    expect(a.cssScoped).not.toContain('.italic');
    expect(b.cssScoped).not.toContain('.underline');
    expect(c.cssScoped).toBe(a.cssScoped);
  });

  // The project config defines these through theme.extend and a plugin.
  const PROJECT_ONLY = 'text-primary-500 animate-slide-up rtl ltr';

  it('never reads the project tailwind.config or user-supplied paths', async () => {
    const r = await tw(`${PROJECT_ONLY} flex`, { css: '@config "./tailwind.config.js"; .a{x:1}' }, {
      content: ['./src/**/*.{ts,tsx}'],
      presets: ['./tailwind.config.js'],
      plugins: ['@tailwindcss/forms'],
      safelist: ['underline'],
      config: './tailwind.config.js',
      corePlugins: { preflight: true },
    });
    expect(r.cssScoped).toContain('.flex');
    expect(r.cssScoped).not.toMatch(/primary-500|slide-up|\.rtl|\.ltr|\.underline|text-size-adjust/);
    const ignored = r.warnings.find((w) => w.startsWith('Ignored tailwind.config'))!;
    for (const key of ['content', 'presets', 'plugins', 'safelist', 'config', 'corePlugins']) expect(ignored).toContain(key);
    expect(r.warnings.some((w) => w.includes('@config'))).toBe(true);
  });

  it('accepts only theme.extend with known theme keys', async () => {
    const r = await tw('text-brand text-other', {}, {
      darkMode: 'media',
      theme: { colors: { other: '#000000' }, extend: { nonsense: { a: 'b' }, colors: { brand: '#111111' } } },
    });
    expect(r.cssScoped).toContain('.text-brand');
    expect(r.cssScoped).not.toContain('.text-other');
    expect(r.warnings.join(' ')).toContain('theme.colors');
    expect(r.warnings.join(' ')).toContain('theme.extend.nonsense');
    expect(r.warnings.some((w) => w.includes('darkMode'))).toBe(true);
  });

  it('drops theme strings and keys that could break out of a rule', async () => {
    const r = await tw('text-bad text-good bg-x', {}, {
      theme: {
        extend: {
          colors: { bad: 'red} body{display:none', good: '#111111' },
          backgroundImage: { 'x': 'none}html{opacity:0' },
          screens: { 'y': '1px){}body{color:red}@media (min-width:1px' },
        },
      },
    });
    expect(r.cssScoped).toContain('.text-good');
    expect(r.cssScoped).not.toContain('display:none');
    expect(r.cssScoped).not.toContain('opacity:0');
    expect(r.cssScoped).not.toContain('body');
    expect(r.warnings.join(' ')).toContain('theme.extend.colors.bad');
  });

  it('ignores a config with functions or reserved keys passed programmatically', async () => {
    const fn = vi.fn(() => ({}));
    const a = await tw('flex', {}, { theme: { extend: { colors: fn } } });
    expect(fn).not.toHaveBeenCalled();
    expect(a.cssScoped).toContain('.flex');
    expect(a.warnings.join(' ')).toContain('plain data');
    const b = await tw('flex', {}, JSON.parse('{"theme":{"extend":{"__proto__":{"polluted":1}}}}'));
    expect(b.warnings.join(' ')).toContain('reserved key');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('keeps the author CSS when the theme makes Tailwind fail', async () => {
    const r = await tw('sm:flex', { css: '.a{x:1}' }, { theme: { extend: { screens: { bad: null } } } });
    expect(r.cssScoped).toContain(`${r.R} .a`);
    expect(r.warnings.some((w) => w.startsWith('Tailwind CSS could not be compiled'))).toBe(true);
  });

  it('warns when the output exceeds the stored limit', async () => {
    const classes = Array.from({ length: 10_000 }, (_, i) => `w-[${i}px]`).join(' ');
    const r = await tw(classes);
    expect(r.cssScoped.length).toBeGreaterThan(CUSTOM_HTML_LIMITS.cssScoped);
    expect(r.warnings.some((w) => w.includes('too large'))).toBe(true);
  });
});

describe('Tailwind option validation', () => {
  const nested = (depth: number) => {
    let value: Record<string, unknown> = {};
    for (let i = 0; i < depth; i++) value = { a: value };
    return value;
  };

  it('accepts plain data', () => {
    expect(tailwindConfigError({ theme: { extend: { spacing: { '-4': -1 }, x: [true, null] } } })).toBeNull();
    expect(TailwindOptionsSchema.safeParse({ enabled: true }).success).toBe(true);
  });

  it.each(['__proto__', 'constructor', 'prototype'])('rejects the reserved key %s at any depth', (key) => {
    const config = JSON.parse(`{"theme":{"extend":{"colors":[{"${key}":1}]}}}`);
    expect(tailwindConfigError(config)).toContain('reserved key');
    expect(TailwindOptionsSchema.safeParse({ enabled: true, config }).success).toBe(false);
  });

  it('rejects wrong shapes, unknown members and oversized configs', () => {
    expect(tailwindConfigError([])).not.toBeNull();
    expect(tailwindConfigError({ a: new Date() })).toContain('plain data');
    expect(tailwindConfigError({ a: Infinity })).toContain('plain data');
    expect(tailwindConfigError(nested(TAILWIND_LIMITS.configDepth + 2))).toContain('deeply');
    expect(tailwindConfigError(nested(100_000))).not.toBeNull();
    expect(tailwindConfigError({ a: 'x'.repeat(TAILWIND_LIMITS.configChars) })).toContain('too large');
    expect(tailwindConfigError({ a: Array(TAILWIND_LIMITS.configEntries).fill(1) })).toContain('too many');
    expect(TailwindOptionsSchema.safeParse({ enabled: 'yes' }).success).toBe(false);
    expect(TailwindOptionsSchema.safeParse({ enabled: true, plugins: [] }).success).toBe(false);
    expect(TailwindOptionsSchema.safeParse({ enabled: true, config: 'x' }).success).toBe(false);
  });
});

describe('POST /api/admin/custom-html/compile — tailwind', () => {
  const post = async (body: string) => {
    const res = await POST(new NextRequest('http://localhost/api/admin/custom-html/compile', { method: 'POST', body }));
    return { status: res.status, json: await res.json() };
  };
  const request = (extra: Record<string, unknown>) => JSON.stringify({ html: '<p class="flex"></p>', css: '', ...extra });

  it('passes tailwind and content through', async () => {
    const { status, json } = await post(
      request({
        tailwind: { enabled: true, config: { theme: { extend: { colors: { brand: '#111111' } } } } },
        content: '<b class="text-brand"></b>',
      }),
    );
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.cssScoped).toContain('.flex');
    expect(json.cssScoped).toContain('.text-brand');
  });

  it.each([
    ['a non-object', request({ tailwind: [] })],
    ['a missing flag', request({ tailwind: {} })],
    ['an unknown member', request({ tailwind: { enabled: true, content: ['./src'] } })],
    ['a reserved key', '{"html":"","css":"","tailwind":{"enabled":true,"config":{"__proto__":{"a":1}}}}'],
    ['an oversized config', request({ tailwind: { enabled: true, config: { a: 'x'.repeat(60_000) } } })],
    ['non-string content', request({ content: 1 })],
    ['oversized content', request({ content: 'x'.repeat(TAILWIND_LIMITS.content + 1) })],
  ])('rejects %s with 400', async (_label, body) => {
    const { status, json } = await post(body);
    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });
});

describe('extraction of Tailwind CDN pages', () => {
  const useDom = () => vi.stubGlobal('DOMParser', new JSDOM('').window.DOMParser);
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  const cdn = '<script src="https://cdn.tailwindcss.com"></script>';

  it('moves body class/style to a wrapper only for Tailwind pages', () => {
    useDom();
    const body = '<body class="antialiased bg-slate-900" style="margin:0"><p>x</p></body>';
    const r = extractSource(`<html><head>${cdn}</head>${body}</html>`);
    expect(r.html).toBe('<div data-chs-body="" class="antialiased bg-slate-900" style="margin:0"><p>x</p></div>');
    expect(r.warnings.some((w) => w.includes('wrapper'))).toBe(true);
    expect(extractSource(r.html).html).toBe(r.html);
    expect(extractSource(`<html>${body}</html>`).html).toBe('<p>x</p>');
  });

  it('warns about CDN plugins and skips plugins/presets in the config', () => {
    useDom();
    const r = extractSource(
      '<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>' +
        "<script>tailwind.config = { theme: { extend: {} }, plugins: [require('x')], presets: [] }</script><p>x</p>",
    );
    expect(r.tailwind).toEqual({ enabled: true, config: { theme: { extend: {} } } });
    expect(r.warnings.some((w) => w.includes('forms,typography'))).toBe(true);
    expect(r.warnings.some((w) => w.includes('"plugins"'))).toBe(true);
    expect(r.warnings.some((w) => w.includes('"presets"'))).toBe(false);
  });

  // spec §15 item 6, against a real Tailwind CDN page
  it.each(['FleetBPMS.html', 'setiran-workflow-orchestrator-v2.html'])('styles every utility used by %s', async (file) => {
    const sample = path.resolve(__dirname, '../../../sample pages', file);
    let source: string;
    try {
      source = readFileSync(sample, 'utf8');
    } catch {
      return; // sample pages are not part of every checkout
    }
    useDom();
    const ex = extractSource(source);
    expect(ex.errors).toEqual([]);
    expect(ex.tailwind?.enabled).toBe(true);

    const r = await compileCss({ html: ex.html, css: ex.css, js: ex.jsBlocks.join('\n'), tailwind: ex.tailwind });
    expect(r.warnings.filter((w) => !w.includes('@apply'))).toEqual([]);
    expect(r.cssScoped.length).toBeLessThan(CUSTOM_HTML_LIMITS.cssScoped);

    const styled = new Set<string>();
    postcss.parse(r.cssScoped).walkRules((rule) => {
      const found = rule.selector.match(/\.(?:\\[0-9a-f]{1,6} ?|\\.|[\w-])+/gi) ?? [];
      for (const c of found) {
        styled.add(c.slice(1).replace(/\\([0-9a-f]{1,6}) ?|\\(.)/gi, (_m, hex, ch) => ch ?? String.fromCodePoint(parseInt(hex, 16))));
      }
    });
    const doc: Document = new JSDOM(ex.html).window.document;
    const used = new Set<string>();
    doc.querySelectorAll('[class]').forEach((el) => el.classList.forEach((c) => used.add(c)));
    // markers without CSS of their own, and icon-font / JS hook names
    const unstyled = Array.from(used).filter((c) => !styled.has(c) && !/^(group|peer)$/.test(c));
    expect(used.size).toBeGreaterThan(50);
    console.info(`${file}: ${used.size} classes, ${r.cssScoped.length} CSS chars, without a rule: ${unstyled.join(' ') || 'none'}`);
    expect(unstyled.length).toBeLessThan(used.size * 0.05);
  });
});
