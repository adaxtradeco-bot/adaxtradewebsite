import { describe, it, expect } from 'vitest';
import postcss from 'postcss';
import { extractSource } from '@/lib/custom-html/extract';
import { buildSplit, createSplitPlan } from '@/lib/custom-html/split-page';
import { pruneCss } from '@/lib/custom-html/split-css';
import { scriptMentions } from '@/lib/custom-html/split-scripts';

function section(html: string): Element {
  const body = document.implementation.createHTMLDocument('').body;
  body.innerHTML = html;
  return body;
}

const MARKUP =
  '<div class="page-shell"><section class="card"><h2 class="title">T</h2><a href="#">l</a><template><span class="tpl"></span></template></section></div>';

/** every name the tests treat as present elsewhere in the page */
const PAGE_NAMES = new Set(['page-shell', 'card', 'title', 'tpl', 'other', 'is-open', 'tab-2', 'wrap', 'md:flex', 'x']);

function prune(css: string, opts: { js?: string[]; wrappers?: string[]; pageNames?: Set<string> | null } = {}) {
  return pruneCss(css, {
    section: section(MARKUP),
    wrapperNames: new Set(opts.wrappers ?? []),
    mentions: scriptMentions(opts.js ?? []),
    pageNames: opts.pageNames === null ? undefined : (opts.pageNames ?? PAGE_NAMES),
  });
}

const selectors = (css: string) => {
  const out: string[] = [];
  postcss.parse(css).walkRules((r) => {
    out.push(r.selector);
  });
  return out;
};

const kept = (selector: string, opts?: Parameters<typeof prune>[1]) => prune(`${selector} { color: red }`, opts).includes('{');

describe('pruneCss', () => {
  it('removes rules that match nothing in the section', () => {
    expect(selectors(prune('.card { a: 1 } .other { a: 2 } section.card > .title { a: 3 } .other .title { a: 4 }'))).toEqual([
      '.card',
      'section.card > .title',
    ]);
  });

  it.each([
    '.card:hover',
    '.card::before',
    'a:visited:focus-visible',
    '.card:not(.other)',
    '.title::-webkit-scrollbar',
    '::selection',
    '*',
    '*::after',
    ':root',
    'html',
    'body',
    'body.other .zzz',
    'html .other',
    ':is(.card, .other) .title',
    '.card[data-state="open"]',
    '.dark .other',
    '.tpl',
    '.card:has(> .title)',
  ])('keeps %s', (selector) => {
    expect(kept(selector)).toBe(true);
  });

  it.each(['.other', '.other:hover', '.card .other', 'table td', '.other::before'])('removes %s', (selector) => {
    expect(kept(selector)).toBe(false);
  });

  it('keeps a whole selector list when one member is needed', () => {
    expect(selectors(prune('.other, .card { a: 1 }'))).toEqual(['.other, .card']);
  });

  it('keeps selectors it cannot parse or test', () => {
    expect(kept('.other >>> .zzz')).toBe(true);
    expect(prune('.other { a: 1').trim()).toBe('.other { a: 1');
  });

  it('keeps classes and ids the section scripts mention, including computed ones', () => {
    expect(kept('.card.is-open', { js: ["el.classList.add('is-open')"] })).toBe(true);
    expect(kept('.tab-2', { js: ["el.classList.add('tab-' + n)"] })).toBe(true);
    expect(kept('.tab-2', { js: ['el.className = `tab-${n}`'] })).toBe(true);
    expect(kept('.md\\:flex', { js: ["el.classList.toggle('md:flex')"] })).toBe(true);
    expect(kept('#other', { js: ["root.querySelector('#other')"] })).toBe(true);
    expect(kept('.other', { js: ["el.classList.add('is-open')"] })).toBe(false);
  });

  it('keeps tags the scripts create', () => {
    expect(kept('.card table', { js: ["document.createElement('table')"] })).toBe(true);
    expect(kept('em', { js: ["el.innerHTML = '<em>hi</em>'"] })).toBe(true);
  });

  it('keeps names that exist nowhere in the markup when the page has scripts', () => {
    expect(kept('.swiper-slide-active')).toBe(true);
    expect(kept('.card .swiper-slide-active')).toBe(true);
    expect(kept('.other .swiper-slide-active')).toBe(false);
    expect(kept('.swiper-slide-active', { pageNames: null })).toBe(false);
  });

  it('keeps rules depending on repeated wrapper classes', () => {
    expect(kept('.wrap .other', { wrappers: ['wrap'] })).toBe(true);
  });

  it('recurses into conditional at-rules and drops the emptied ones', () => {
    const css = `@import url(https://x.test/a.css);
      @layer base, extra;
      @media (min-width: 1px) { .card { a: 1 } .other { a: 2 } }
      @supports (display: grid) { @media print { .other { a: 3 } } }
      @container (min-width: 1px) { .title { a: 4 } }
      @layer extra { .other { a: 5 } }`;
    const out = prune(css);
    expect(out).toContain('@import');
    expect(out).toContain('@layer base, extra;');
    expect(out).toContain('@media (min-width: 1px)');
    expect(out).toContain('@container');
    expect(out).not.toContain('@supports');
    expect(out).not.toContain('.other');
    expect(out).not.toContain('@layer extra {');
  });

  it('keeps @font-face, @keyframes and empty at-rules untouched', () => {
    const css = '@font-face { font-family: A; src: url(a.woff) } @keyframes k { from { a: 1 } 50% { a: 2 } } @media print {}';
    expect(prune(css)).toBe(css);
  });
});

describe('buildSplit with pruning', () => {
  const copy = 'Words that fill the section up to a sensible length. '.repeat(5);
  const page = `<style>:root { --c: red } .a h2 { a: 1 } .b h2 { a: 2 } .b.is-on { a: 3 } @keyframes k { to { a: 1 } }</style>
    <section class="a"><h2>A</h2><p>${copy}</p></section>
    <section class="b"><h2>B</h2><p>${copy}</p><button onclick="this.parentElement.classList.toggle('is-on')">x</button></section>`;

  it('is off by default', () => {
    const out = buildSplit(createSplitPlan(extractSource(page)));
    for (const part of out.parts) {
      expect(part.extract.css).toContain('.a h2');
      expect(part.extract.css).toContain('.b h2');
    }
  });

  it('gives each section only its rules plus the shared ones', () => {
    const [a, b] = buildSplit(createSplitPlan(extractSource(page)), { pruneCss: true }).parts.map((p) => p.extract.css);
    expect(a).toContain('.a h2');
    expect(a).not.toContain('.b h2');
    expect(a).not.toContain('.is-on');
    expect(b).toContain('.b h2');
    expect(b).toContain('.is-on');
    expect(b).not.toContain('.a h2');
    for (const css of [a, b]) {
      expect(css).toContain(':root');
      expect(css).toContain('@keyframes k');
    }
  });
});
