/**
 * Custom HTML section — source extraction (spec §7.1).
 *
 * Splits pasted/uploaded HTML (a full document or a fragment) into
 * html / css / js blocks / external resources. Runs in the admin's browser
 * (DOMParser) and in vitest/jsdom. Nothing here executes author code.
 */
import * as acorn from 'acorn';
import { CUSTOM_HTML_LIMITS, type ExtractResult } from './types';

/** Loose ESTree node — avoids coupling to acorn's evolving type exports. */
interface AstNode {
  type: string;
  start: number;
  end: number;
  [key: string]: any;
}

const JS_TYPES = new Set([
  'text/javascript',
  'application/javascript',
  'application/x-javascript',
  'text/ecmascript',
  'application/ecmascript',
  'text/jscript',
  'text/livescript',
]);

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const TAILWIND_HOST = 'cdn.tailwindcss.com';
/** top-level tailwind.config members that are code, not data (typically `require(...)`) */
const TAILWIND_CODE_KEYS = ['plugins', 'presets'];

function byteLength(s: string): number {
  try {
    return new TextEncoder().encode(s).length;
  } catch {
    return s.length;
  }
}

function parseUrl(raw: string): URL | null {
  const value = raw.trim();
  try {
    return new URL(value.startsWith('//') ? `https:${value}` : value);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Static evaluation of `tailwind.config = {...}` (never eval / new Function)
// ---------------------------------------------------------------------------

class UnsupportedConfig extends Error {}

/** `skip` applies to this object's own properties: a true result omits one without evaluating it. */
function evalStatic(node: AstNode, skip?: (name: string, value: AstNode) => boolean): unknown {
  switch (node.type) {
    case 'Literal': {
      if (node.regex || typeof node.value === 'bigint') throw new UnsupportedConfig('regex/bigint literal');
      return node.value;
    }
    case 'TemplateLiteral': {
      if (node.expressions.length > 0) throw new UnsupportedConfig('template literal with expressions');
      return node.quasis.map((q: AstNode) => q.value.cooked ?? '').join('');
    }
    case 'UnaryExpression': {
      const arg = node.argument as AstNode;
      if ((node.operator === '-' || node.operator === '+') && arg.type === 'Literal' && typeof arg.value === 'number') {
        return node.operator === '-' ? -arg.value : arg.value;
      }
      throw new UnsupportedConfig(`unary "${node.operator}" expression`);
    }
    case 'ArrayExpression': {
      return (node.elements as Array<AstNode | null>).map((el) => {
        if (!el) throw new UnsupportedConfig('array hole');
        if (el.type === 'SpreadElement') throw new UnsupportedConfig('spread element');
        return evalStatic(el);
      });
    }
    case 'ObjectExpression': {
      const out: Record<string, unknown> = {};
      for (const prop of node.properties as AstNode[]) {
        if (prop.type !== 'Property') throw new UnsupportedConfig('spread property');
        if (prop.computed) throw new UnsupportedConfig('computed key');
        if (prop.kind !== 'init' || prop.method) throw new UnsupportedConfig('method or accessor');
        const key = prop.key as AstNode;
        let name: string;
        if (key.type === 'Identifier') name = key.name;
        else if (key.type === 'Literal') name = String(key.value);
        else throw new UnsupportedConfig('unsupported key');
        if (FORBIDDEN_KEYS.has(name)) throw new UnsupportedConfig(`forbidden key "${name}"`);
        if (skip?.(name, prop.value as AstNode)) continue;
        out[name] = evalStatic(prop.value as AstNode);
      }
      return out;
    }
    default:
      throw new UnsupportedConfig(`${node.type} is not a static value`);
  }
}

function isTailwindConfigAssignment(stmt: AstNode): boolean {
  if (stmt.type !== 'ExpressionStatement') return false;
  const expr = stmt.expression as AstNode;
  if (expr.type !== 'AssignmentExpression' || expr.operator !== '=') return false;
  const left = expr.left as AstNode;
  return (
    left.type === 'MemberExpression' &&
    !left.computed &&
    left.object.type === 'Identifier' &&
    left.object.name === 'tailwind' &&
    left.property.type === 'Identifier' &&
    left.property.name === 'config'
  );
}

interface TailwindScan {
  js: string;
  config?: Record<string, unknown>;
  warnings: string[];
}

/** Finds top-level `tailwind.config = {...}` statements, evaluates them statically and removes them. */
function pullTailwindConfig(js: string): TailwindScan {
  const result: TailwindScan = { js, warnings: [] };
  if (!/tailwind\s*\.\s*config\s*=/.test(js)) return result;
  let program: AstNode;
  try {
    program = acorn.parse(js, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReturnOutsideFunction: true,
    }) as unknown as AstNode;
  } catch {
    return result; // syntax error is reported by the caller
  }
  const statements = (program.body as AstNode[]).filter(isTailwindConfigAssignment);
  if (!statements.length) return result;

  let out = js;
  // remove back-to-front so earlier offsets stay valid
  for (const stmt of [...statements].reverse()) {
    out = out.slice(0, stmt.start) + out.slice(stmt.end);
  }
  for (const stmt of statements) {
    const right = (stmt.expression as AstNode).right as AstNode;
    try {
      const value = evalStatic(right, (name, node) => {
        if (TAILWIND_CODE_KEYS.indexOf(name) === -1) return false;
        if (!(node.type === 'ArrayExpression' && node.elements.length === 0)) {
          result.warnings.push(`tailwind.config "${name}" is not supported and was ignored.`);
        }
        return true;
      });
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result.config = { ...(result.config ?? {}), ...(value as Record<string, unknown>) };
      } else {
        result.warnings.push('tailwind.config is not an object literal and was ignored.');
      }
    } catch (err) {
      const reason = err instanceof UnsupportedConfig ? err.message : 'unsupported syntax';
      result.warnings.push(
        `tailwind.config could not be read statically (${reason}) and was ignored. Only plain object/array/string/number/boolean/null literals are supported.`
      );
    }
  }
  result.js = out;
  return result;
}

function syntaxError(js: string): string | null {
  try {
    acorn.parse(js, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

// ---------------------------------------------------------------------------

export function extractSource(input: string, extra?: { css?: string; js?: string }): ExtractResult {
  const result: ExtractResult = {
    html: '',
    css: '',
    jsBlocks: [],
    externalScripts: [],
    externalStylesheets: [],
    warnings: [],
    errors: [],
    isFullDocument: false,
  };

  const source = typeof input === 'string' ? input : '';
  if (byteLength(source) > CUSTOM_HTML_LIMITS.uploadBytes) {
    result.errors.push(
      `The HTML is too large (limit ${(CUSTOM_HTML_LIMITS.uploadBytes / 1_000_000).toFixed(0)} MB).`
    );
    return result;
  }

  result.isFullDocument = /<html[\s>]|<body[\s>]/i.test(source);

  const doc = new DOMParser().parseFromString(source, 'text/html');
  const cssParts: string[] = [];
  const jsBlocks: string[] = [];
  let tailwindEnabled = false;
  let tailwindConfig: Record<string, unknown> | undefined;
  let moduleScripts = 0;

  const pushUnique = (list: string[], value: string) => {
    if (!list.includes(value)) list.push(value);
  };

  // Elements in document order across <head> and <body>.
  const nodes = Array.from(doc.querySelectorAll('style, link, script'));
  for (const el of nodes) {
    // <style>/<script> inside inline SVG or <noscript> belong to the markup.
    if (el.closest('svg, noscript')) continue;
    const tag = el.tagName.toLowerCase();

    if (tag === 'style') {
      const text = el.textContent ?? '';
      if (text.trim()) {
        const media = (el.getAttribute('media') ?? '').trim();
        cssParts.push(media && media.toLowerCase() !== 'all' ? `@media ${media} {\n${text}\n}` : text);
      }
      el.remove();
      continue;
    }

    if (tag === 'link') {
      const rel = (el.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
      if (rel.includes('stylesheet')) {
        const href = (el.getAttribute('href') ?? '').trim();
        const url = href ? parseUrl(href) : null;
        if (url && (url.protocol === 'http:' || url.protocol === 'https:')) {
          pushUnique(result.externalStylesheets, href.startsWith('//') ? url.toString() : href);
        } else {
          result.warnings.push(`Stylesheet link "${href}" was ignored (only http/https URLs are supported).`);
        }
      }
      el.remove(); // preconnect / icon / etc. are page-level metadata
      continue;
    }

    // <script>
    const type = (el.getAttribute('type') ?? '').trim().toLowerCase();
    const src = (el.getAttribute('src') ?? '').trim();

    if (type === 'module') {
      moduleScripts += 1;
      el.remove();
      continue;
    }
    if (type && !JS_TYPES.has(type)) continue; // JSON islands, templates, importmap… stay in the HTML

    if (src) {
      const url = parseUrl(src);
      if (url && url.hostname.toLowerCase() === TAILWIND_HOST) {
        tailwindEnabled = true;
        const plugins = url.searchParams.get('plugins');
        if (plugins) {
          result.warnings.push(
            `Tailwind CDN plugins (${plugins}) are not supported; their classes will not be styled.`
          );
        }
      } else if (url && (url.protocol === 'http:' || url.protocol === 'https:')) {
        pushUnique(result.externalScripts, src.startsWith('//') ? url.toString() : src);
      } else {
        result.warnings.push(`Script "${src}" was ignored (only http/https URLs are supported).`);
      }
      el.remove();
      continue;
    }

    const text = el.textContent ?? '';
    el.remove();
    if (!text.trim()) continue;
    const scan = pullTailwindConfig(text);
    result.warnings.push(...scan.warnings);
    if (scan.config) tailwindConfig = { ...(tailwindConfig ?? {}), ...scan.config };
    if (scan.js.trim()) jsBlocks.push(scan.js);
  }

  if (moduleScripts) {
    result.warnings.push(
      `${moduleScripts} <script type="module"> block${moduleScripts > 1 ? 's were' : ' was'} removed (module scripts are not supported).`
    );
  }

  // Page metadata is dropped.
  doc.querySelectorAll('title, meta, base').forEach((el) => {
    if (!el.closest('svg')) el.remove();
  });

  const body = doc.body;
  // With Tailwind the <body> utilities carry the look of the page, so they move to a wrapper.
  let bodyWrapper: Element | null = null;
  if (body && (body.getAttribute('class') || body.getAttribute('style'))) {
    if (tailwindEnabled) {
      bodyWrapper = doc.createElement('div');
      bodyWrapper.setAttribute('data-chs-body', '');
      for (const name of ['class', 'style']) {
        const value = body.getAttribute(name);
        if (value) bodyWrapper.setAttribute(name, value);
      }
    }
    result.warnings.push(
      `<body> attributes (class/style) ${
        bodyWrapper ? 'were moved to a wrapper <div>' : 'are not kept'
      }; html/body/:root CSS selectors are mapped to the section root.`
    );
  }

  // Non-JS scripts that lived in <head> (e.g. JSON data) move to the start of the markup.
  const headLeftovers = Array.from(doc.head?.querySelectorAll('script') ?? []).map((s) => s.outerHTML);
  let bodyHtml = body?.innerHTML ?? '';
  if (bodyWrapper) {
    bodyWrapper.innerHTML = bodyHtml;
    bodyHtml = bodyWrapper.outerHTML;
  }
  result.html = (headLeftovers.join('\n') + (headLeftovers.length ? '\n' : '') + bodyHtml).trim();

  if (extra?.css && extra.css.trim()) cssParts.push(extra.css);
  if (extra?.js && extra.js.trim()) jsBlocks.push(extra.js);

  result.css = cssParts.map((c) => c.trim()).filter(Boolean).join('\n\n');
  result.jsBlocks = jsBlocks;

  jsBlocks.forEach((block, i) => {
    const message = syntaxError(block);
    if (message) {
      result.errors.push(`JavaScript syntax error in script block ${i + 1}: ${message}`);
    }
  });

  if (tailwindEnabled || tailwindConfig) {
    result.tailwind = { enabled: tailwindEnabled };
    if (tailwindConfig) result.tailwind.config = tailwindConfig;
  }

  return result;
}
