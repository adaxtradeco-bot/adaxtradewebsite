/**
 * Custom HTML section — CSS scoping (server side).
 * Spec: docs/custom-html-section-spec.md §7.2
 *
 * Server-only (uses node:crypto, postcss, tailwindcss). Never import from client code.
 */
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import type { AtRule, ChildNode, Container, Root, Rule } from 'postcss';
import selectorParser from 'postcss-selector-parser';
import type { Node as SelNode, Selector } from 'postcss-selector-parser';
import tailwindcss from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import { z } from 'zod';
import { CUSTOM_HTML_LIMITS, type CompileRequest, type CompileResult } from './types';

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

/**
 * `extra` carries everything besides html/css that changes the output (Tailwind config and content),
 * so two sections with equal markup but different Tailwind input never share a scope.
 */
export function computeScope(html: string, css: string, extra = ''): string {
  return createHash('sha256').update(html + css + extra).digest('hex').slice(0, 10);
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
// Tailwind (v3, programmatic)
//
// Tailwind only ever receives a config object built here plus a fixed input stylesheet. From user
// input it gets raw content strings and allow-listed `theme.extend` data: never plugins, presets,
// content paths, safelists or functions, and never author CSS (`@config` loads files). The config
// object must stay non-empty and without a `config` key, otherwise Tailwind would load the
// project's own tailwind.config from disk.
// ---------------------------------------------------------------------------

export const TAILWIND_LIMITS = {
  /** serialized tailwind.config length */
  configChars: 50_000,
  configDepth: 10,
  configEntries: 5_000,
  /** extra content string scanned for class names */
  content: CUSTOM_HTML_LIMITS.uploadBytes,
} as const;

const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype'];
const THEME_KEYS = Object.keys(defaultTheme);
/** a brace in a theme key or value could close the generated rule */
const UNSAFE_CSS_TEXT = /[{}]/;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === null || Object.getPrototypeOf(proto) === null;
}

/** Returns why `config` is not acceptable (shape, size or reserved keys), or null. */
export function tailwindConfigError(config: unknown): string | null {
  if (!isPlainObject(config)) return 'must be a plain object';
  const stack: Array<[unknown, number]> = [[config, 0]];
  let entries = 0;
  while (stack.length) {
    const [value, depth] = stack.pop()!;
    if (++entries > TAILWIND_LIMITS.configEntries) return 'has too many entries';
    if (value === null || typeof value === 'string' || typeof value === 'boolean') continue;
    if (typeof value === 'number' && Number.isFinite(value)) continue;
    if (!Array.isArray(value) && !isPlainObject(value)) return 'may only contain plain data';
    if (depth > TAILWIND_LIMITS.configDepth) return 'is nested too deeply';
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
      if (FORBIDDEN_KEYS.indexOf(keys[i]) !== -1) return `contains the reserved key "${keys[i]}"`;
      stack.push([(value as unknown as Record<string, unknown>)[keys[i]], depth + 1]);
    }
  }
  if (JSON.stringify(config).length > TAILWIND_LIMITS.configChars) return 'is too large';
  return null;
}

/** Validates the untrusted `tailwind` member of a compile request. */
export const TailwindOptionsSchema = z
  .object({
    enabled: z.boolean(),
    config: z
      .unknown()
      .superRefine((value, ctx) => {
        if (value === undefined) return;
        const error = tailwindConfigError(value);
        if (error) ctx.addIssue({ code: 'custom', message: error });
      })
      .optional(),
  })
  .strict();

/** Copy of a theme value without braces in keys/strings; undefined when nothing safe remains. */
function cleanThemeValue(value: unknown, dropped: string[], path: string): unknown {
  if (typeof value === 'string') {
    if (!UNSAFE_CSS_TEXT.test(value)) return value;
    dropped.push(path);
    return undefined;
  }
  if (Array.isArray(value)) {
    const items = value.map((v, i) => cleanThemeValue(v, dropped, `${path}.${i}`));
    // positions are meaningful (e.g. fontSize tuples), so a bad item drops the whole array
    return items.some((v) => v === undefined) ? undefined : items;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    Object.keys(value).forEach((key) => {
      if (UNSAFE_CSS_TEXT.test(key)) {
        dropped.push(`${path}.${key}`);
        return;
      }
      const cleaned = cleanThemeValue(value[key], dropped, `${path}.${key}`);
      if (cleaned !== undefined) out[key] = cleaned;
    });
    return out;
  }
  return value;
}

/** The only part of a user tailwind.config that reaches Tailwind: known `theme.extend` keys. */
function allowedThemeExtend(config: unknown, warnings: Set<string>): Record<string, unknown> {
  const extend: Record<string, unknown> = {};
  if (config === undefined) return extend;
  const error = tailwindConfigError(config);
  if (error) {
    warnings.add(`tailwind.config was ignored: it ${error}.`);
    return extend;
  }
  const source = config as Record<string, unknown>;
  const ignored: string[] = [];

  Object.keys(source).forEach((key) => {
    if (key !== 'theme' && key !== 'darkMode') ignored.push(key);
  });
  if (source.darkMode !== undefined && source.darkMode !== 'class') {
    warnings.add('tailwind.config darkMode was ignored: "dark:" classes follow the site dark mode (class).');
  }

  const theme = isPlainObject(source.theme) ? source.theme : {};
  Object.keys(theme).forEach((key) => {
    if (key !== 'extend') ignored.push(`theme.${key}`);
  });

  const userExtend = isPlainObject(theme.extend) ? theme.extend : {};
  Object.keys(userExtend).forEach((key) => {
    if (THEME_KEYS.indexOf(key) === -1) {
      ignored.push(`theme.extend.${key}`);
      return;
    }
    const cleaned = cleanThemeValue(userExtend[key], ignored, `theme.extend.${key}`);
    if (cleaned !== undefined) extend[key] = cleaned;
  });

  if (ignored.length) {
    const more = ignored.length > 10 ? ', …' : '';
    warnings.add(
      `Ignored tailwind.config entries (only safe theme.extend values are supported): ${ignored.slice(0, 10).join(', ')}${more}`,
    );
  }
  return extend;
}

/** Stand-in selector for the few preflight defaults that utilities such as `border` depend on. */
const PREFLIGHT_MARK = 'chs-preflight';
const TAILWIND_INPUT = `${PREFLIGHT_MARK}{box-sizing:border-box;border-width:0;border-style:solid;border-color:theme('borderColor.DEFAULT', currentColor)}
@tailwind base;
@tailwind components;
@tailwind utilities;`;

async function runTailwind(content: string, extend: Record<string, unknown>): Promise<Root> {
  const plugin = tailwindcss({
    content: [{ raw: content, extension: 'html' }],
    darkMode: 'class',
    corePlugins: { preflight: false },
    theme: { extend },
    plugins: [],
  });
  const result = await postcss([plugin]).process(TAILWIND_INPUT, { from: undefined });
  return postcss.parse(result.css);
}

/**
 * Removes the base layer (preflight stand-in and `--tw-*` defaults) from the Tailwind output and
 * returns it re-targeted at the section with zero specificity, like the universal selectors it
 * replaces, so every author rule and utility still wins.
 */
function takeBaseRules(tw: Root, R: string): ChildNode[] {
  const all = `:where(${R}, ${R} *)`;
  const universal = `${all}, ${all}::before, ${all}::after`;
  const targets: Record<string, string> = {
    [PREFLIGHT_MARK]: universal,
    '*, ::before, ::after': universal,
    '::backdrop': `${all}::backdrop`,
  };
  const base: ChildNode[] = [];
  let usesContainer = false;
  tw.nodes.slice().forEach((node) => {
    if (node.type !== 'rule') return;
    const key = node.selector.replace(/\s*,\s*/g, ', ').trim();
    if (key === '.container') usesContainer = true;
    if (Object.prototype.hasOwnProperty.call(targets, key)) {
      node.remove();
      node.selector = targets[key];
      base.push(node);
    }
  });
  // The host site styles `.container` itself; undo that inside the section before Tailwind's rule.
  if (usesContainer) {
    const reset = `${R} .container{margin-left:0;margin-right:0;padding-left:0;padding-right:0;max-width:none}`;
    base.push(postcss.parse(reset).first!);
  }
  return base;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type CssCompileRequest = CompileRequest & {
  /**
   * Extra text scanned for Tailwind class names only. Needed because `html` is tokenized: classes
   * inside field defaults (rich text, icons) and inline handlers are not in `html` / `js`.
   */
  content?: string;
};

export async function compileCss(req: CssCompileRequest): Promise<CompileResult> {
  const html = typeof req?.html === 'string' ? req.html : '';
  const css = typeof req?.css === 'string' ? req.css : '';
  const warnings = new Set<string>();

  let tailwind: { content: string; extend: Record<string, unknown> } | null = null;
  if (req?.tailwind?.enabled) {
    const content = [html, req.js, req.content].filter((s) => typeof s === 'string' && s).join('\n');
    tailwind = { content, extend: allowedThemeExtend(req.tailwind.config, warnings) };
    if (/@(apply|tailwind|config)\b/.test(css)) {
      warnings.add('@apply, @tailwind and @config in the CSS are not compiled.');
    }
  }
  const scope = computeScope(html, css, tailwind ? JSON.stringify([tailwind.extend, tailwind.content]) : '');

  try {
    let tw: Root | null = null;
    if (tailwind) {
      try {
        tw = await runTailwind(tailwind.content, tailwind.extend);
      } catch (e) {
        warnings.add(`Tailwind CSS could not be compiled: ${(e as Error)?.message ?? String(e)}`);
      }
    }

    if (!css.trim() && !tw) return { cssScoped: '', scope, warnings: Array.from(warnings) };

    const R = `[data-chs="${scope}"]`;
    const root = postcss.parse(css);
    let base: ChildNode[] = [];
    if (tw) {
      base = takeBaseRules(tw, R);
      root.prepend(...tw.nodes); // Tailwind first, so author CSS wins at equal specificity
    }
    const imports: AtRule[] = [];
    processContainer(root, R, warnings, imports);
    if (base.length) root.prepend(...base); // already scoped
    for (const imp of imports.reverse()) root.prepend(imp);
    const cssScoped = root.toString().trim();
    if (cssScoped.length > CUSTOM_HTML_LIMITS.cssScoped) {
      warnings.add(
        `The compiled CSS is too large (${cssScoped.length} characters, limit ${CUSTOM_HTML_LIMITS.cssScoped}). Split the section into smaller ones.`,
      );
    }
    return { cssScoped, scope, warnings: Array.from(warnings) };
  } catch (e) {
    warnings.add(`CSS could not be processed: ${(e as Error)?.message ?? String(e)}`);
    return { cssScoped: '', scope, warnings: Array.from(warnings) };
  }
}
