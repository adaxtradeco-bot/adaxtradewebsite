/**
 * Custom HTML section — CSS scoping (server side).
 * Spec: docs/custom-html-section-spec.md §7.2
 *
 * Server-only (uses node:crypto, postcss). Never import from client code.
 */
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import type { AtRule, ChildNode, Container, Rule } from 'postcss';
import selectorParser from 'postcss-selector-parser';
import type { Node as SelNode, Selector } from 'postcss-selector-parser';
import type { CompileRequest, CompileResult } from './types';

const RECURSE_AT_RULES = new Set(['media', 'supports', 'container', 'layer', 'document']);
const GLOBAL_AT_RULES = new Set([
  'font-face',
  'property',
  'page',
  'counter-style',
  'font-feature-values',
  'font-palette-values',
  'view-transition',
]);

export function computeScope(html: string, css: string): string {
  return createHash('sha256').update(html + css).digest('hex').slice(0, 10);
}

// ---------------------------------------------------------------------------
// Selector rewriting
// ---------------------------------------------------------------------------

const str = (nodes: SelNode[]): string => nodes.map((n) => String(n)).join('');

function isRootLike(c: SelNode[]): boolean {
  if (c.length === 0) return false;
  const first = c[0];
  if (first.type === 'tag') return /^(html|body)$/i.test(first.value);
  if (first.type === 'pseudo') return first.value.toLowerCase() === ':root';
  return false;
}

/** exactly `.dark`, `html.dark` or `:root.dark` */
function isDarkCompound(c: SelNode[]): boolean {
  if (c.length === 1) return c[0].type === 'class' && c[0].value === 'dark';
  if (c.length === 2) {
    const [a, b] = c;
    const rootish =
      (a.type === 'tag' && a.value.toLowerCase() === 'html') ||
      (a.type === 'pseudo' && a.value.toLowerCase() === ':root');
    return rootish && b.type === 'class' && b.value === 'dark';
  }
  return false;
}

const isDescendant = (n: SelNode | undefined): boolean => !!n && String(n.value ?? '').trim() === '';

const PSEUDO_ELEMENT_NAMES = new Set([':before', ':after', ':first-line', ':first-letter']);
const isPseudoElement = (n: SelNode): boolean =>
  n.type === 'pseudo' && (n.value.startsWith('::') || PSEUDO_ELEMENT_NAMES.has(n.value.toLowerCase()));

function splitCompounds(sel: Selector): { parts: SelNode[][]; combs: SelNode[] } {
  const parts: SelNode[][] = [[]];
  const combs: SelNode[] = [];
  sel.each((n) => {
    if (n.type === 'comment') return;
    if (n.type === 'combinator') {
      combs.push(n);
      parts.push([]);
    } else {
      parts[parts.length - 1].push(n);
    }
  });
  return { parts, combs };
}

function rewriteSelector(sel: Selector, R: string): string[] {
  const { parts, combs } = splitCompounds(sel);

  // Lone `*`, `*::before`, `*::after` -> R-self and R-descendant variants.
  if (parts.length === 1) {
    const c = parts[0];
    if (c.length >= 1 && c[0].type === 'universal' && c.slice(1).every(isPseudoElement)) {
      const tail = str(c.slice(1));
      return [`${R}${tail}`, `${R} *${tail}`];
    }
  }

  let i = 0;
  let darkPrefix = '';
  if (isDarkCompound(parts[0])) {
    if (parts.length === 1) return [`.dark ${R}`];
    if (isDescendant(combs[0])) {
      darkPrefix = '.dark ';
      i = 1;
    }
  }

  const c = parts[i];
  if (isRootLike(c)) {
    let head = R + str(c.slice(1));
    i++;
    // `html body` / `body html` style chains collapse onto R
    while (i < parts.length && isDescendant(combs[i - 1]) && isRootLike(parts[i])) {
      head += str(parts[i].slice(1));
      i++;
    }
    const tail = i < parts.length ? String(combs[i - 1]) + restFrom(parts, combs, i) : '';
    return [(darkPrefix + head + tail).trim()];
  }

  return [`${darkPrefix}${R} ${restFrom(parts, combs, i)}`.replace(/\s+/g, ' ').trim()];
}

function restFrom(parts: SelNode[][], combs: SelNode[], from: number): string {
  let out = '';
  for (let k = from; k < parts.length; k++) {
    if (k > from) out += String(combs[k - 1]);
    out += str(parts[k]);
  }
  return out.trim();
}

function scopeSelectorList(selector: string, R: string): string {
  const out: string[] = [];
  const root = selectorParser().astSync(selector);
  root.each((sel) => {
    out.push(...rewriteSelector(sel, R));
  });
  return out.join(', ');
}

// ---------------------------------------------------------------------------
// At-rule / rule walk
// ---------------------------------------------------------------------------

function isHttpImport(params: string): boolean {
  const m = /^\s*(?:url\(\s*)?(["']?)\s*(https?:\/\/)/i.exec(params);
  return !!m;
}

function processContainer(container: Container, R: string, warnings: Set<string>, imports: AtRule[]): void {
  const children: ChildNode[] = [...(container.nodes ?? [])];
  for (const node of children) {
    if (node.type === 'rule') {
      scopeRule(node, R, warnings);
    } else if (node.type === 'atrule') {
      const name = node.name.toLowerCase().replace(/^-\w+-/, '');
      if (name === 'charset') {
        node.remove();
      } else if (name === 'import') {
        node.remove();
        if (container.type === 'root' && isHttpImport(node.params)) imports.push(node);
        else warnings.add(`Dropped @import (only http/https URLs are allowed): @import ${node.params}`);
      } else if (name === 'keyframes') {
        // keep global and untouched (selectors inside are keyframe selectors)
      } else if (RECURSE_AT_RULES.has(name)) {
        if (node.nodes) processContainer(node, R, warnings, imports);
      } else if (GLOBAL_AT_RULES.has(name)) {
        // kept as-is
      } else if (node.nodes && node.nodes.some((c) => c.type === 'rule')) {
        warnings.add(`Unsupported at-rule @${node.name} left unscoped`);
      }
    }
  }
}

function scopeRule(rule: Rule, R: string, warnings: Set<string>): void {
  try {
    rule.selector = scopeSelectorList(rule.selector, R);
  } catch (e) {
    warnings.add(`Dropped rule with invalid selector "${rule.selector.trim().slice(0, 80)}": ${(e as Error).message}`);
    rule.remove();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function compileCss(req: CompileRequest): Promise<CompileResult> {
  const html = typeof req?.html === 'string' ? req.html : '';
  const css = typeof req?.css === 'string' ? req.css : '';
  const scope = computeScope(html, css);
  const warnings = new Set<string>();

  try {
    if (req?.tailwind?.enabled) {
      // TODO(phase 2): compile with tailwindcss v3 programmatically
      // (content: [{ raw: html + js, extension: 'html' }], preflight off, darkMode 'class')
      // and prepend the output to `css` before scoping.
      warnings.add('Tailwind compile not available yet');
    }

    if (!css.trim()) return { cssScoped: '', scope, warnings: Array.from(warnings) };

    const R = `[data-chs="${scope}"]`;
    const root = postcss.parse(css);
    const imports: AtRule[] = [];
    processContainer(root, R, warnings, imports);
    for (const imp of imports.reverse()) root.prepend(imp);
    return { cssScoped: root.toString().trim(), scope, warnings: Array.from(warnings) };
  } catch (e) {
    warnings.add(`CSS could not be processed: ${(e as Error)?.message ?? String(e)}`);
    return { cssScoped: '', scope, warnings: Array.from(warnings) };
  }
}
