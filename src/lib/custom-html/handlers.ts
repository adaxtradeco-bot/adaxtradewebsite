/**
 * Custom HTML section — inline handler rewrite and runtime wrapper (spec §7.3).
 *
 * `on<event>="code"` attributes and `href="javascript:code"` are turned into
 * `data-chs-h` markers plus generated JS, so handlers close over the section's
 * own functions and work when the section is placed more than once.
 */

const HANDLER_ATTR = /^on[a-z]+$/i;
const JS_HREF = /^[\s\u0000-\u001f]*javascript:/i;

function decodeJavascriptUrl(href: string): string {
  const code = href.replace(JS_HREF, '');
  try {
    return decodeURIComponent(code);
  } catch {
    return code;
  }
}

const BINDER = [
  "root.querySelectorAll('[data-chs-h]').forEach(function (el) {",
  "  el.getAttribute('data-chs-h').split(' ').forEach(function (p) {",
  "    var parts = p.split(':'), ev = parts[0], i = parts[1];",
  '    el.addEventListener(ev, function (e) {',
  '      if (__h[i].call(this, e) === false) e.preventDefault();',
  '    });',
  '  });',
  '});',
].join('\n');

export function rewriteInlineHandlers(html: string): { html: string; handlerJs: string; count: number } {
  const doc = new DOMParser().parseFromString(`<!DOCTYPE html><html><body>${html}</body></html>`, 'text/html');
  const root = doc.body;
  const bodies: string[] = [];

  root.querySelectorAll('*').forEach((el) => {
    const refs: string[] = [];
    // keep any markers that already exist (re-import)
    const existing = (el.getAttribute('data-chs-h') ?? '').trim();
    if (existing) refs.push(existing);
    let touched = false;

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (HANDLER_ATTR.test(name)) {
        const event = name.slice(2);
        bodies.push(attr.value);
        refs.push(`${event}:${bodies.length - 1}`);
        el.removeAttribute(attr.name);
        touched = true;
      }
    }

    const href = el.getAttribute('href');
    if (href !== null && JS_HREF.test(href)) {
      bodies.push(`event.preventDefault();\n${decodeJavascriptUrl(href)}`);
      refs.push(`click:${bodies.length - 1}`);
      el.setAttribute('href', '#');
      touched = true;
    }

    if (touched) el.setAttribute('data-chs-h', refs.join(' '));
  });

  const count = bodies.length;
  if (count === 0) return { html, handlerJs: '', count: 0 };

  const lines = ['const __h = [];'];
  bodies.forEach((code, n) => {
    lines.push(`__h[${n}] = function (event) {\n${code}\n};`);
  });
  lines.push(BINDER);

  return { html: root.innerHTML, handlerJs: lines.join('\n'), count };
}

/**
 * "(function (root, document, window, setTimeout, setInterval, requestAnimationFrame) {\n<blocks>\n<handlerJs>\n})"
 * or '' when there is nothing to run. No "use strict" (author code may be sloppy-mode).
 */
export function buildRuntimeJs(jsBlocks: string[], handlerJs: string): string {
  const blocks = jsBlocks.filter((b) => b.trim() !== '');
  const handlers = handlerJs.trim() === '' ? '' : handlerJs;
  if (blocks.length === 0 && handlers === '') return '';
  return (
    '(function (root, document, window, setTimeout, setInterval, requestAnimationFrame) {\n' +
    blocks.join(';\n') +
    '\n' +
    handlers +
    '\n})'
  );
}

const JS_WARNING_RULES: Array<{ re: RegExp; label: string }> = [
  { re: /\.\s*innerHTML\b/g, label: 'innerHTML' },
  { re: /\.\s*outerHTML\b/g, label: 'outerHTML' },
  { re: /\binsertAdjacentHTML\s*\(/g, label: 'insertAdjacentHTML' },
  { re: /\bdocument\s*\.\s*write(?:ln)?\s*\(/g, label: 'document.write' },
];

/** Warns about patterns that can turn editor-supplied text into executable markup (spec §8.4). */
export function jsWarnings(js: string): string[] {
  const out: string[] = [];
  for (const { re, label } of JS_WARNING_RULES) {
    const count = (js.match(re) ?? []).length;
    if (count > 0) {
      out.push(
        `JavaScript uses ${label} (${count}×). Never assign field content through ${label}; use textContent so editor-supplied text cannot become script.`
      );
    }
  }
  return out;
}
