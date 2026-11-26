import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as acornParse } from 'acorn';
import { describe, expect, it } from 'vitest';
import { extractSource } from '@/lib/custom-html/extract';
import { buildRuntimeJs, jsWarnings, rewriteInlineHandlers } from '@/lib/custom-html/handlers';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
const parses = (js: string) => acornParse(js, { ecmaVersion: 'latest', sourceType: 'script' });

describe('rewriteInlineHandlers', () => {
  it('returns the input untouched when there are no handlers', () => {
    const html = '<div class="a"><a href="/x">Go</a></div>';
    expect(rewriteInlineHandlers(html)).toEqual({ html, handlerJs: '', count: 0 });
  });

  it('replaces on<event> attributes with data-chs-h markers', () => {
    const r = rewriteInlineHandlers('<button class="b" onclick="go(1)" onmouseover="hover()">Go</button><i onclick="x()"></i>');
    expect(r.count).toBe(3);
    expect(r.html).toBe('<button class="b" data-chs-h="click:0 mouseover:1">Go</button><i data-chs-h="click:2"></i>');
    expect(r.html).not.toMatch(/onclick|onmouseover/);
    expect(r.handlerJs).toContain('const __h = [];');
    expect(r.handlerJs).toMatch(/__h\[0\] = function \(event\) \{\ngo\(1\)\n\};/);
    expect(r.handlerJs).toMatch(/__h\[1\] = function \(event\) \{\nhover\(\)\n\};/);
    expect(r.handlerJs).toMatch(/__h\[2\] = function \(event\) \{\nx\(\)\n\};/);
    expect(r.handlerJs).toContain("root.querySelectorAll('[data-chs-h]')");
    expect(r.handlerJs).toContain('e.preventDefault()');
  });

  it('converts javascript: hrefs to click handlers with preventDefault', () => {
    const r = rewriteInlineHandlers(
      '<a href="javascript:void(0)" class="m">More</a><a href="  JavaScript:open(%27a%27)">Open</a><a href="/real">Real</a>'
    );
    expect(r.count).toBe(2);
    expect(r.html).toContain('<a href="#" class="m" data-chs-h="click:0">More</a>');
    expect(r.html).toContain('<a href="#" data-chs-h="click:1">Open</a>');
    expect(r.html).toContain('<a href="/real">Real</a>');
    expect(r.handlerJs).toContain('event.preventDefault();\nvoid(0)');
    expect(r.handlerJs).toContain("event.preventDefault();\nopen('a')");
  });

  it('combines an onclick and a javascript: href on one element', () => {
    const r = rewriteInlineHandlers('<a href="javascript:a()" onclick="b()">x</a>');
    expect(r.html).toBe('<a href="#" data-chs-h="click:0 click:1">x</a>');
    expect(parses(`(function(root){${r.handlerJs}})`)).toBeTruthy();
  });

  it('keeps code with trailing line comments and return false parseable', () => {
    const r = rewriteInlineHandlers('<a href="#" onclick="doIt() // comment">x</a><a href="#" onsubmit="return false">y</a>');
    expect(r.count).toBe(2);
    expect(() => parses(`(function(root){${r.handlerJs}})`)).not.toThrow();
  });

  it('does not treat data-/aria- attributes as handlers', () => {
    const r = rewriteInlineHandlers('<div data-onclick="x" aria-label="on" onclick="y()"></div>');
    expect(r.count).toBe(1);
    expect(r.html).toContain('data-onclick="x"');
  });

  it('rewrites the tabs fixture and the generated JS runs in the section scope', () => {
    const ex = extractSource(fixture('flow-builder-tabs.html'));
    const h = rewriteInlineHandlers(ex.html);
    expect(h.count).toBe(4); // 3 onclick + 1 javascript: href
    expect(h.html).not.toMatch(/onclick=/);
    expect(h.html).toContain('data-chs-h="click:0"');

    const js = buildRuntimeJs(ex.jsBlocks, h.handlerJs);
    const container = document.createElement('div');
    container.innerHTML = h.html;
    document.body.appendChild(container);
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return ${js}`)() as (...args: unknown[]) => void;
    fn(container, document, window, setTimeout, setInterval, requestAnimationFrame);

    const buttons = container.querySelectorAll<HTMLButtonElement>('.tab-btn');
    const panel0 = container.querySelector('#s1-panel-0')!;
    const panel1 = container.querySelector('#s1-panel-1')!;
    expect(buttons[0].classList.contains('active')).toBe(true);
    buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(buttons[1].classList.contains('active')).toBe(true);
    expect(buttons[0].classList.contains('active')).toBe(false);
    expect(panel1.classList.contains('active')).toBe(true);
    expect(panel0.classList.contains('active')).toBe(false);

    // javascript: link: preventDefault + no navigation error
    const link = container.querySelector('#more-link')!;
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);

    // `return false` handler cancels the default action
    const third = new MouseEvent('click', { bubbles: true, cancelable: true });
    buttons[2].dispatchEvent(third);
    expect(third.defaultPrevented).toBe(true);
    container.remove();
  });
});

describe('buildRuntimeJs', () => {
  const HEAD = '(function (root, document, window, setTimeout, setInterval, requestAnimationFrame) {\n';

  it('returns an empty string when there is nothing to run', () => {
    expect(buildRuntimeJs([], '')).toBe('');
    expect(buildRuntimeJs(['  ', '\n'], '')).toBe('');
  });

  it('wraps blocks joined by ;\\n followed by the handler js, without "use strict"', () => {
    const js = buildRuntimeJs(['var a = 1', 'var b = 2'], 'const __h = [];');
    expect(js).toBe(`${HEAD}var a = 1;\nvar b = 2\nconst __h = [];\n})`);
    expect(js).not.toContain('use strict');
    expect(() => parses(`(${js})`)).not.toThrow();
  });

  it('works with blocks only and handlers only', () => {
    expect(buildRuntimeJs(['x()'], '')).toBe(`${HEAD}x()\n\n})`);
    const onlyHandlers = buildRuntimeJs([], 'const __h = [];');
    expect(onlyHandlers).toBe(`${HEAD}\nconst __h = [];\n})`);
    expect(() => parses(`(${onlyHandlers})`)).not.toThrow();
  });

  it('keeps sloppy-mode author code valid inside the wrapper', () => {
    const js = buildRuntimeJs(['with (Math) { var x = max(1, 2); } return;'], '');
    expect(() => parses(`(${js})`)).not.toThrow();
  });
});

describe('jsWarnings', () => {
  it('warns about innerHTML, outerHTML, insertAdjacentHTML and document.write', () => {
    const w = jsWarnings(
      'el.innerHTML = x; a.innerHTML += y; b.outerHTML = z; c.insertAdjacentHTML("beforeend", s); document.write("<p>")'
    );
    expect(w).toHaveLength(4);
    expect(w[0]).toContain('innerHTML (2×)');
    expect(w[1]).toContain('outerHTML');
    expect(w[2]).toContain('insertAdjacentHTML');
    expect(w[3]).toContain('document.write');
  });

  it('is quiet for safe code', () => {
    expect(jsWarnings('el.textContent = x; el.classList.add("a"); document.writer = 1;')).toEqual([]);
  });
});
