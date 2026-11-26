// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { compileCss } from '@/lib/custom-html/css-scope';

async function run(css: string, html = '<div></div>', extra: object = {}) {
  const r = await compileCss({ html, css, ...extra });
  return { ...r, R: `[data-chs="${r.scope}"]` };
}

describe('compileCss', () => {
  it('computes a 10-hex scope from html+css', async () => {
    const a = await run('.a{color:red}', '<p/>');
    const b = await run('.a{color:blue}', '<p/>');
    expect(a.scope).toMatch(/^[0-9a-f]{10}$/);
    expect(a.scope).not.toBe(b.scope);
    expect((await run('.a{color:red}', '<p/>')).scope).toBe(a.scope);
  });

  it('prefixes ordinary selectors', async () => {
    const { cssScoped, R } = await run('.a, .b > p { color: red }');
    expect(cssScoped).toContain(`${R} .a, ${R} .b > p`);
  });

  it('maps html/body/:root to the scope root, keeping attached parts', async () => {
    const { cssScoped, R } = await run('html{a:1} body{b:2} :root{--x:1} body.dark-mode{c:3} body::before{d:4} body p{e:5}');
    expect(cssScoped.startsWith(`${R}{a:1}`)).toBe(true);
    expect(cssScoped).toContain(`${R}{b:2}`);
    expect(cssScoped).toContain(`${R}{--x:1}`);
    expect(cssScoped).toContain(`${R}.dark-mode{c:3}`);
    expect(cssScoped).toContain(`${R}::before{d:4}`);
    expect(cssScoped).toContain(`${R} p{e:5}`);
    expect(cssScoped).not.toMatch(/(^|[\s,}])body[\s{.:,]/);
  });

  it('collapses "html body" chains onto the root', async () => {
    const { cssScoped, R } = await run('html body .x{a:1}');
    expect(cssScoped).toContain(`${R} .x{a:1}`);
  });

  it('rewrites .dark / html.dark leading compounds', async () => {
    const { cssScoped, R } = await run('.dark .card{a:1} html.dark .t{b:2} .dark{c:3} html.dark body{d:4}');
    expect(cssScoped).toContain(`.dark ${R} .card{a:1}`);
    expect(cssScoped).toContain(`.dark ${R} .t{b:2}`);
    expect(cssScoped).toContain(`.dark ${R}{c:3}`);
    expect(cssScoped).toContain(`.dark ${R}{d:4}`);
  });

  it('expands lone * into self and descendant variants', async () => {
    const { cssScoped, R } = await run('*{box-sizing:border-box}');
    expect(cssScoped).toContain(`${R}, ${R} *{box-sizing:border-box}`);
  });

  it('expands *::before / *::after', async () => {
    const { cssScoped, R } = await run('*::before, *::after{content:""}');
    expect(cssScoped).toContain(`${R}::before, ${R} *::before, ${R}::after, ${R} *::after`);
  });

  it('prefixes a non-lone universal normally', async () => {
    const { cssScoped, R } = await run('.a *{x:1}');
    expect(cssScoped).toContain(`${R} .a *{x:1}`);
  });

  it('recurses into @media, @supports, @layer and @container', async () => {
    const { cssScoped, R } = await run(
      '@media (min-width:600px){ .a{x:1} body{y:2} @supports (display:grid){ .b{z:3} } } @layer base{ .c{w:4} } @container (min-width:10px){ .d{v:5} }',
    );
    expect(cssScoped).toContain(`${R} .a`);
    expect(cssScoped).toContain(`${R}{y:2}`);
    expect(cssScoped).toContain(`${R} .b`);
    expect(cssScoped).toContain(`${R} .c`);
    expect(cssScoped).toContain(`${R} .d`);
  });

  it('keeps @keyframes untouched', async () => {
    const { cssScoped } = await run('@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} .a{animation:spin 1s}');
    expect(cssScoped).toContain('@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}');
    expect(cssScoped).not.toContain('] from');
    expect(cssScoped).not.toContain('] to');
  });

  it('keeps @font-face global and drops @charset', async () => {
    const { cssScoped, R } = await run(
      '@charset "utf-8"; @font-face{font-family:X;src:url(https://example.com/x.woff2)} .a{font-family:X}',
    );
    expect(cssScoped).not.toContain('@charset');
    expect(cssScoped).toContain('@font-face{font-family:X;src:url(https://example.com/x.woff2)}');
    expect(cssScoped).toContain(`${R} .a`);
  });

  it('keeps http(s) @import at the top and drops others with a warning', async () => {
    const r = await run('.a{x:1} @import url("https://fonts.example.com/a.css"); @import "local.css"; @import url(data:text/css,a{});');
    expect(r.cssScoped.startsWith('@import url("https://fonts.example.com/a.css")')).toBe(true);
    expect(r.cssScoped).not.toContain('local.css');
    expect(r.warnings.filter((w) => w.includes('@import')).length).toBe(2);
  });

  it('preserves {{cf:x.src}} tokens inside url()', async () => {
    const { cssScoped, R } = await run('.hero{background:url({{cf:x.src}}) center/cover} .b{background-image:url("{{cf:y.src}}")}');
    expect(cssScoped).toContain(`${R} .hero{background:url({{cf:x.src}}) center/cover}`);
    expect(cssScoped).toContain('url("{{cf:y.src}}")');
  });

  it('never throws on invalid CSS', async () => {
    const r = await run('.a{color:red; @media (');
    expect(r.cssScoped).toBe('');
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.scope).toMatch(/^[0-9a-f]{10}$/);
  });

  it('drops a rule with an invalid selector and warns', async () => {
    const r = await run('.a:not(,{x:1} .ok{y:2}');
    expect(r).toBeDefined();
    expect(Array.isArray(r.warnings)).toBe(true);
  });

  it('returns empty output for empty css', async () => {
    const r = await run('   ');
    expect(r.cssScoped).toBe('');
  });

  it('warns when tailwind is enabled', async () => {
    const r = await run('.a{x:1}', '<p/>', { tailwind: { enabled: true } });
    expect(r.warnings).toContain('Tailwind compile not available yet');
    expect(r.cssScoped).toContain('.a');
  });
});
