import { describe, it, expect } from 'vitest';
import { extractSource } from '@/lib/custom-html/extract';
import {
  assignScript,
  buildSplit,
  canSplit,
  createSplitPlan,
  describeSection,
  mergeWithPrevious,
  renameSection,
  setDropped,
  splitFurther,
  type SplitPlan,
} from '@/lib/custom-html/split-page';
import { assembleSplit } from '@/lib/custom-html/split-assemble';
import type { CompileRequest, CompileResult } from '@/lib/custom-html/types';

const plan = (html: string) => createSplitPlan(extractSource(html));
const parse = (html: string) => new DOMParser().parseFromString(`<!DOCTYPE html><body>${html}</body>`, 'text/html').body;
const squash = (s: string) => s.replace(/\s+/g, '');
const names = (p: SplitPlan) => p.sections.map((s) => s.name);
const htmlOf = (p: SplitPlan) => buildSplit(p).parts.map((x) => x.extract.html);

const LONG = 'Long enough copy for a section of its own. '.repeat(6);
const block = (cls: string, title: string, extra = '') =>
  `<section class="${cls}"><h2>${title}</h2><p>${LONG}</p>${extra}</section>`;

describe('createSplitPlan', () => {
  it('makes one section per substantial candidate and names it after its heading', () => {
    const p = plan(`<body><header><h1>Top</h1></header>${block('a', 'Alpha')}<footer><a href="/x">Contact</a></footer></body>`);
    expect(names(p)).toEqual(['Top', 'Alpha', 'Footer']);
  });

  it('merges tiny neighbours into the previous section, or into the first one', () => {
    const p = plan(
      `<div class="lead-spacer"></div>${block('a', 'Alpha')}<div class="spacer"></div>${block('b', 'Beta')}<div class="line"></div>`
    );
    expect(p.sections).toHaveLength(2);
    const html = htmlOf(p);
    expect(html[0]).toContain('lead-spacer');
    expect(html[0]).toContain('class="spacer"');
    expect(html[1]).toContain('class="line"');
  });

  it('counts an element with an editable field or 200 characters of text', () => {
    const p = plan(`<div><h2>Short but editable</h2></div><div>${LONG}</div><div> </div>`);
    expect(p.sections).toHaveLength(2);
  });

  it('keeps every node: other elements, loose text and comments join a neighbour', () => {
    const source = `Before text<button id="t">Toggle</button>${block('a', 'Alpha')}Between text<!-- note --><ul><li>List item</li></ul>
      <script type="application/json" id="data">{"a":1}</script>${block('b', 'Beta')}<aside>Aside text</aside>After text`;
    const p = plan(source);
    expect(p.sections).toHaveLength(2);
    const joined = htmlOf(p).join('');
    expect(squash(parse(joined).textContent!)).toBe(squash(parse(extractSource(source).html).textContent!));
    expect(joined).toContain('<!-- note -->');
    expect(joined).toContain('id="data"');
  });

  it('keeps template contents and inline SVG intact', () => {
    const p = plan(
      block('a', 'Alpha', '<template><li class="row">Row</li></template><svg viewBox="0 0 1 1"><linearGradient id="g"></linearGradient></svg>') +
        block('b', 'Beta')
    );
    const [first] = htmlOf(p);
    expect(first).toContain('<template><li class="row">Row</li></template>');
    expect(first).toContain('viewBox="0 0 1 1"');
    expect(first).toContain('<linearGradient id="g">');
  });

  it('falls back to one section when nothing is large enough', () => {
    const p = plan('<div></div><span>hi</span>');
    expect(p.sections).toHaveLength(1);
    expect(htmlOf(p)[0]).toContain('<span>hi</span>');
  });

  it('descends into a single main and copies a styled main around its sections only', () => {
    const p = plan(
      `<body><nav><a href="/">Home</a></nav><main class="page" data-kind="landing">${block('a', 'Alpha')}${block('b', 'Beta')}</main><footer><p>Bye</p></footer></body>`
    );
    expect(p.sections).toHaveLength(4);
    const [nav, a, b, footer] = htmlOf(p).map(parse);
    for (const part of [a, b]) expect(part.querySelector('main.page[data-kind="landing"] > section')).not.toBeNull();
    expect(nav.querySelector('main')).toBeNull();
    expect(footer.querySelector('main')).toBeNull();
  });

  it('does not repeat a main nothing depends on, unless the CSS targets it', () => {
    const body = `<main>${block('a', 'Alpha')}${block('b', 'Beta')}</main>`;
    expect(htmlOf(plan(body)).join('')).not.toContain('<main');
    const styled = htmlOf(plan(`<style>main > section { padding: 1px }</style>${body}`));
    expect(styled.every((h) => h.startsWith('<main>'))).toBe(true);
  });

  it('does not descend when there are two mains', () => {
    const p = plan(`<main>${block('a', 'Alpha')}</main><main>${block('b', 'Beta')}</main>`);
    // <main> is not a candidate tag: both stay whole, in one section the admin can split
    expect(p.sections.map((s) => s.unitIds.length)).toEqual([2]);
    expect(canSplit(p, p.sections[0].id)).toBe(true);
  });

  it('keeps one wrapper when a section spans the main boundary', () => {
    let p = plan(`<main class="m">${block('a', 'Alpha')}${block('b', 'Beta')}</main><footer><p>Bye</p></footer>`);
    p = mergeWithPrevious(p, p.sections[2].id);
    const part = parse(htmlOf(p)[1]);
    expect(Array.from(part.children).map((c) => c.tagName)).toEqual(['MAIN', 'FOOTER']);
  });
});

describe('wrappers', () => {
  const TW = (bodyAttrs: string, inner: string) =>
    `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body ${bodyAttrs}>${inner}</body></html>`;

  it('replicates the Tailwind body wrapper without viewport-height utilities', () => {
    const p = plan(
      TW(
        'class="min-h-screen md:h-screen min-h-[100dvh] bg-slate-50" style="min-height: 100vh; color: red"',
        block('a', 'Alpha') + block('b', 'Beta')
      )
    );
    const out = buildSplit(p);
    expect(out.parts).toHaveLength(2);
    for (const part of out.parts) {
      const wrapper = parse(part.extract.html).firstElementChild!;
      expect(wrapper.hasAttribute('data-chs-body')).toBe(true);
      expect(wrapper.getAttribute('class')).toBe('bg-slate-50');
      expect(wrapper.getAttribute('style')).not.toContain('100vh');
      expect(wrapper.getAttribute('style')).toContain('color: red');
      expect(part.extract.tailwind?.enabled).toBe(true);
    }
    expect(out.warnings.join(' ')).toMatch(/Viewport-height/);
    expect(out.warnings.join(' ')).toMatch(/body> wrapper is copied around 2 sections/);
  });

  it('leaves the wrapper alone when only one section is kept', () => {
    let p = plan(TW('class="min-h-screen"', block('a', 'Alpha') + block('b', 'Beta')));
    p = setDropped(p, p.sections[1].id, true);
    const out = buildSplit(p);
    expect(out.parts).toHaveLength(1);
    expect(out.parts[0].extract.html).toContain('min-h-screen');
    expect(out.warnings).toEqual([]);
  });

  it('removes 100vh from page-level and wrapper CSS rules only', () => {
    const p = plan(`<style>html, body, .hero { min-height: 100vh; color: red } .page { height: calc(100vh - 10px) }
      @media (min-width: 600px) { body { min-height: 100svh } }</style>
      <main class="page">${block('hero', 'Alpha')}${block('b', 'Beta')}</main>`);
    const css = buildSplit(p).parts[0].extract.css;
    expect(css).toMatch(/\.hero\s*\{\s*min-height: 100vh/);
    expect(css).not.toMatch(/(html|body)[^{}]*\{[^}]*100/);
    expect(css).not.toContain('calc(100vh');
    expect(css).toContain('color: red');
  });

  it('keeps a wrapper id on every copy when styles use it, otherwise on the first only', () => {
    const body = `<main id="content" class="m">${block('a', 'Alpha')}${block('b', 'Beta')}</main>`;
    const used = buildSplit(plan(`<style>#content p { margin: 0 }</style>${body}`));
    expect(used.parts.every((x) => x.extract.html.includes('id="content"'))).toBe(true);
    expect(used.warnings.join(' ')).toMatch(/id "content" is repeated/);
    const unused = buildSplit(plan(body));
    expect(unused.parts.map((x) => x.extract.html.includes('id="content"'))).toEqual([true, false]);
    expect(unused.warnings.join(' ')).toMatch(/first copy/);
  });

  it('warns about layout containers, sibling selectors and sticky elements', () => {
    const p = plan(`<style>section + section { margin-top: 4px } .a { position: sticky }</style>
      <main style="display: grid">${block('a', 'Alpha')}${block('b', 'Beta')}</main>`);
    const text = buildSplit(p).warnings.join('\n');
    expect(text).toMatch(/flex or grid container/);
    expect(text).toMatch(/section \+ section/);
    expect(text).toMatch(/Sticky/);
  });

  it('gives look-alike sections distinct CSS so they never share a style scope', () => {
    const same = block('a', 'Same');
    const css = buildSplit(plan(`<style>.a { color: red }</style>${same}${same}`)).parts.map((x) => x.extract.css);
    expect(css[0]).not.toBe(css[1]);
  });
});

describe('section operations', () => {
  const page = () => plan(`${block('a', 'Alpha')}${block('b', 'Beta')}${block('c', 'Gamma')}`);

  it('merges with the previous section, keeping its name', () => {
    const p = page();
    const merged = mergeWithPrevious(p, p.sections[1].id);
    expect(names(merged)).toEqual(['Alpha', 'Gamma']);
    expect(htmlOf(merged)[0]).toContain('Beta');
    expect(mergeWithPrevious(p, p.sections[0].id)).toBe(p);
    expect(names(p)).toHaveLength(3);
  });

  it('splits a merged section back at element boundaries', () => {
    let p = page();
    p = mergeWithPrevious(p, p.sections[1].id);
    expect(canSplit(p, p.sections[0].id)).toBe(true);
    p = splitFurther(p, p.sections[0].id);
    expect(names(p)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('splits a single container into its children, copying the container', () => {
    let p = plan(`<div class="shell"><div class="inner">${block('a', 'Alpha')}text${block('b', 'Beta')}</div></div>`);
    expect(p.sections).toHaveLength(1);
    p = splitFurther(p, p.sections[0].id);
    expect(names(p)).toEqual(['Alpha', 'Beta']);
    const parts = htmlOf(p).map(parse);
    parts.forEach((part) => expect(part.querySelector('div.shell > div.inner > section')).not.toBeNull());
    expect(parts.map((x) => x.textContent).join('')).toContain('text');
  });

  it('can split children again after expanding, and stops at content elements', () => {
    let p = plan(`<div class="w"><section><h2>Alpha</h2><p>one</p></section><p>two</p></div>`);
    p = splitFurther(p, p.sections[0].id);
    expect(p.sections).toHaveLength(2);
    p = splitFurther(p, p.sections[0].id);
    expect(p.sections).toHaveLength(3);
    expect(canSplit(p, p.sections[2].id)).toBe(false);
    expect(htmlOf(p).join('')).toContain('<h2>Alpha</h2>');
  });

  it('does not open up a form, svg or table', () => {
    for (const html of ['<form><input><input></form>', '<svg><g></g><g></g></svg>', '<table><tr><td>a</td></tr></table>']) {
      const p = plan(html);
      expect(canSplit(p, p.sections[0].id)).toBe(false);
    }
  });

  it('drops, restores and renames sections', () => {
    let p = page();
    p = setDropped(p, p.sections[1].id, true);
    p = renameSection(p, p.sections[0].id, 'Intro');
    expect(buildSplit(p).parts.map((x) => x.name)).toEqual(['Intro', 'Gamma']);
    p = setDropped(p, p.sections[1].id, false);
    expect(buildSplit(p).parts).toHaveLength(3);
  });

  it('describes a section', () => {
    const p = page();
    const summary = describeSection(p, p.sections[0].id);
    expect(summary.elements).toBe('section.a');
    expect(summary.snippet).toMatch(/^Alpha Long enough/);
  });
});

describe('scripts', () => {
  const two = (script: string, a = '', b = '') =>
    plan(`${block('a', 'Alpha', a)}${block('b', 'Beta', b)}${script}`);

  it('assigns a block to the section whose ids or classes it references', () => {
    const p = two(
      `<script>document.getElementById('chart').textContent = 'x';</script>
       <script>document.querySelector('.a h2').title = 'y';</script>
       <script>console.log('no references');</script>`,
      '',
      '<div id="chart"></div>'
    );
    const out = buildSplit(p);
    expect(out.scripts.map((s) => s.target)).toEqual([p.sections[1].id, p.sections[0].id, p.sections[0].id]);
    expect(out.issues).toEqual([]);
    expect(out.parts.map((x) => x.extract.jsBlocks.length)).toEqual([2, 1]);
    // original order is kept inside a section
    expect(out.parts[0].extract.jsBlocks[0]).toContain("'.a h2'");
  });

  it.each([
    ["getElementById('pane' + i)", '<div id="pane0"></div>'],
    ['querySelector(`#rail${i} .tab`)', '<div id="rail1"><b class="tab"></b></div>'],
    ["getElementsByClassName('pill')", '<i class="pill"></i>'],
  ])('follows %s', (call, markup) => {
    const p = two(`<script>var i = 0; document.${call};</script>`, '', markup);
    expect(buildSplit(p).scripts[0].target).toBe(p.sections[1].id);
  });

  it('follows selector strings passed to the page own helpers', () => {
    const p = two(`<script>function init(sel) { return $(sel); } init('#track');</script>`, '', '<div id="track"></div>');
    expect(buildSplit(p).scripts[0].target).toBe(p.sections[1].id);
  });

  it('assigns a block to the section whose handlers call its functions', () => {
    const p = two('<script>function go() {}</script>', '', '<button onclick="go()">Go</button>');
    const out = buildSplit(p);
    expect(out.scripts[0].target).toBe(p.sections[1].id);
    expect(out.parts[1].extract.html).toContain('onclick="go()"');
    expect(out.issues).toEqual([]);
  });

  it('reports a block that references more than one section', () => {
    const p = two(
      "<script>document.querySelectorAll('.reveal').forEach(function (e) { e.hidden = false; });</script>",
      '<i class="reveal"></i>',
      '<i class="reveal"></i>'
    );
    const out = buildSplit(p);
    expect(out.scripts[0].references).toEqual(p.sections.map((s) => s.id));
    expect(out.issues.map((i) => i.kind)).toEqual(['script-elements']);
    expect(out.issues[0].message).toContain('"Beta"');
  });

  it('reports handlers that need a function assigned elsewhere, until the sections are merged', () => {
    let p = two(
      '<script>function go() {}</script>',
      '<button onclick="go()">A</button>',
      '<button onclick="go()">B</button>'
    );
    expect(buildSplit(p).issues.map((i) => i.kind)).toEqual(['handler-function']);
    p = mergeWithPrevious(p, p.sections[1].id);
    expect(buildSplit(p).issues).toEqual([]);
  });

  it('does not report calls to functions published on window', () => {
    const p = two('<script>window.go = function () {};</script>', '<button onclick="go()">A</button>', '<a href="javascript:go()">B</a>');
    expect(buildSplit(p).issues).toEqual([]);
  });

  it('reports a script that depends on a name declared by a script in another section', () => {
    const p = two(
      `<script>var shared = 1; document.querySelector('.a');</script>
       <script>document.querySelector('.b'); console.log(shared);</script>`
    );
    expect(buildSplit(p).issues.map((i) => i.kind)).toContain('script-dependency');
  });

  it('reports inline handlers that reach into another section', () => {
    const p = two('', `<button onclick="document.getElementById('far').hidden = true">A</button>`, '<div id="far"></div>');
    const out = buildSplit(p);
    expect(out.issues.map((i) => i.kind)).toEqual(['handler-element']);
  });

  it('follows the admin choice through a merge, and can leave a script out', () => {
    let p = plan(`${block('a', 'Alpha')}${block('b', 'Beta')}${block('c', 'Gamma')}<script>1;</script>`);
    p = assignScript(p, 0, p.sections[2].id);
    p = mergeWithPrevious(p, p.sections[2].id);
    expect(buildSplit(p).scripts[0].target).toBe(p.sections[1].id);
    p = assignScript(p, 0, null);
    const out = buildSplit(p);
    expect(out.parts.flatMap((x) => x.extract.jsBlocks)).toEqual([]);
    expect(out.issues.map((i) => i.kind)).toEqual(['not-imported']);
  });

  it('does not import a script whose only section was dropped', () => {
    let p = two("<script>document.querySelector('.b').title = 'x';</script>");
    p = setDropped(p, p.sections[1].id, true);
    expect(buildSplit(p).scripts[0].target).toBeNull();
  });

  it('carries external resources to every section', () => {
    const p = plan(
      `<head><link rel="stylesheet" href="https://x.test/a.css"><script src="https://x.test/lib.js"></script></head><body>${block('a', 'Alpha')}${block('b', 'Beta')}</body>`
    );
    const out = buildSplit(p);
    for (const part of out.parts) {
      expect(part.extract.externalStylesheets).toEqual(['https://x.test/a.css']);
      expect(part.extract.externalScripts).toEqual(['https://x.test/lib.js']);
    }
    expect(out.warnings.join(' ')).toMatch(/External scripts/);
  });
});

describe('assembleSplit', () => {
  const compile = async (req: CompileRequest): Promise<CompileResult> => ({
    cssScoped: req.css,
    scope: 'abcdef0123',
    warnings: [],
  });

  it('runs every part through the single-section pipeline', async () => {
    const out = buildSplit(plan(`${block('a', 'Alpha', '<button onclick="1">x</button>')}${block('b', 'Beta')}`));
    const { sections } = await assembleSplit({ parts: out.parts, compile, dir: 'auto' });
    expect(sections.map((s) => s.name)).toEqual(['Alpha', 'Beta']);
    expect(sections[0].template.html).toContain('data-chs-h');
    expect(sections[0].template.html).not.toContain('onclick');
    expect(sections[1].template.dir).toBe('auto');
    expect(sections[1].fields.length).toBeGreaterThan(0);
  });

  it('builds nothing and names the section when one part fails', async () => {
    const out = buildSplit(plan(`${block('a', 'Alpha')}${block('b', 'Beta')}`));
    const failing = async (req: CompileRequest) => {
      if (req.html.includes('class="b"')) throw new Error('CSS compile failed');
      return compile(req);
    };
    await expect(assembleSplit({ parts: out.parts, compile: failing })).rejects.toThrow(
      /Section 2 "Beta" could not be imported, so nothing was inserted\. CSS compile failed/
    );
  });

  it('applies the schema limits per section', async () => {
    const out = buildSplit(plan(`${block('a', 'Alpha')}${block('b', 'Beta')}`));
    out.parts[1].extract.externalScripts = Array.from({ length: 11 }, (_, i) => `https://x.test/${i}.js`);
    await expect(assembleSplit({ parts: out.parts, compile })).rejects.toThrow(/Section 2 "Beta"[\s\S]*externalScripts/);
  });
});
