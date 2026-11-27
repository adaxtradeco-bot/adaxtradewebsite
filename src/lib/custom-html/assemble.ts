/**
 * Custom HTML section — import/assembly pipeline (spec §3, §6.6, §7.1, §11.2).
 *
 * analyzeSource  : extract -> rewrite inline handlers -> detect fields (browser/jsdom, no network).
 * buildCustomHtmlData : tokenize -> compile CSS (injected) -> assemble + validate CustomHtmlData.
 * reconstructSource   : stored data -> editable source for "Edit code" (re-import, §6.6).
 */
import { extractSource } from './extract';
import { rewriteInlineHandlers, buildRuntimeJs, jsWarnings } from './handlers';
import { detectFields } from './detect';
import { tokenizeHtml, detectCssFields } from './tokenize';
import { renderWithDefaults } from './render';
import { parseCustomHtmlData } from './schema';
import type {
  CompileRequest,
  CompileResult,
  CustomHtmlData,
  DetectResult,
  ExtractResult,
  FieldDef,
  FieldValue,
  RepeaterItem,
} from './types';
import { CUSTOM_HTML_SCHEMA_VERSION, TOKEN_OPEN, TOKEN_RE } from './types';

export interface SourceExtras {
  css?: string;
  js?: string;
  /**
   * Generated inline-handler code from a previous import (edit mode). Only used when the html
   * already carries `data-chs-h` markers and contains no raw `on*` attributes to rewrite.
   */
  handlerJs?: string;
}

export interface AnalyzeOptions {
  hintsOnly?: boolean;
}

export interface Analysis {
  extract: ExtractResult;
  /** extract.html after inline-handler rewrite */
  handlerHtml: string;
  handlerJs: string;
  detect: DetectResult;
  /** extract + detect + JS warnings (not compile warnings) */
  warnings: string[];
  /** true when extraction produced blocking errors; detect is then empty */
  blocked: boolean;
}

export function analyzeSource(input: string, extra: SourceExtras = {}, opts: AnalyzeOptions = {}): Analysis {
  const extract = extractSource(input, { css: extra.css, js: extra.js });
  const blocked = extract.errors.length > 0;

  let handlerHtml = '';
  let handlerJs = '';
  if (!blocked) {
    const rewritten = rewriteInlineHandlers(extract.html);
    handlerHtml = rewritten.html;
    handlerJs = rewritten.count === 0 ? (extra.handlerJs ?? '') : rewritten.handlerJs;
  }

  const detect = detectFields(handlerHtml, { hintsOnly: opts.hintsOnly });
  const warnings = [
    ...extract.warnings,
    ...detect.warnings,
    ...jsWarnings([...extract.jsBlocks, handlerJs].join('\n')),
  ];
  return { extract, handlerHtml, handlerJs, detect, warnings, blocked };
}

export interface BuildInput {
  name: string;
  analysis: Analysis;
  /** field list, possibly edited by the user (labels, types, hidden, removals) */
  fields: FieldDef[];
  dir?: 'auto' | 'ltr' | 'rtl';
  compile: (req: CompileRequest) => Promise<CompileResult>;
  /** edit mode: values of surviving fields (same id and type) are kept */
  previous?: CustomHtmlData;
}

export interface BuildResult {
  data: CustomHtmlData;
  /** warnings reported by the compile step */
  compileWarnings: string[];
}

/** The single element wrapping the whole section markup, if there is one. */
function wrapperElement(root: Element): Element | null {
  const kids = Array.from(root.children).filter((el) => !/^(script|style|template|noscript)$/i.test(el.tagName));
  return kids.length === 1 && kids[0].children.length > 0 ? kids[0] : null;
}

const has = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

/**
 * Previous list items fitted to the new child fields: surviving children (same id and type) keep their
 * content, new ones take the new default of the item at the same position. Undefined when no child
 * survives.
 */
function carriedItems(field: FieldDef, before: FieldDef, value: FieldValue): RepeaterItem[] | undefined {
  const children = field.children ?? [];
  const surviving = new Set(
    children.filter((c) => before.children?.some((p) => p.id === c.id && p.type === c.type)).map((c) => c.id)
  );
  if (!Array.isArray(value) || !surviving.size) return undefined;
  const defaults = Array.isArray(field.default) ? field.default : [];
  return value.map((item, i) => {
    const record: RepeaterItem = {};
    for (const child of children) {
      if (surviving.has(child.id) && has(item, child.id)) record[child.id] = item[child.id];
      else if (defaults[i] && has(defaults[i], child.id)) record[child.id] = defaults[i][child.id];
    }
    return record;
  });
}

/**
 * Values of the previous version that survive a re-import (§6.6). The first `htmlCount` fields come
 * from the markup and match by id; the rest come from the CSS and match through `cssMatched`.
 */
function carriedValues(
  previous: CustomHtmlData,
  fields: FieldDef[],
  htmlCount: number,
  cssMatched: Record<string, string>
): Record<string, FieldValue> {
  const prevById = new Map(previous.fields.map((f) => [f.id, f]));
  const prevCss = cssFieldIds(previous);
  const values: Record<string, FieldValue> = {};
  fields.forEach((f, i) => {
    let prevId: string | undefined;
    if (i >= htmlCount) prevId = has(cssMatched, f.id) ? cssMatched[f.id] : undefined;
    else if (!prevCss.has(f.id)) prevId = f.id;
    if (prevId === undefined) return;
    const pf = prevById.get(prevId);
    if (!pf || pf.type !== f.type || !has(previous.values, prevId)) return;
    const value = f.type === 'repeater' ? carriedItems(f, pf, previous.values[prevId]) : previous.values[prevId];
    if (value !== undefined) values[f.id] = value;
  });
  return values;
}

/** Like buildCustomHtmlData but also returns compile warnings. */
export async function assembleCustomHtml(input: BuildInput): Promise<BuildResult> {
  const { name, analysis, fields, previous } = input;
  const { extract } = analysis;
  if (analysis.blocked) throw new Error(`Cannot import: ${extract.errors.join('; ')}`);

  const tokenizedHtml = tokenizeHtml(analysis.detect.root, fields);
  // "Edit code" source has no CDN script, so a re-import keeps the stored Tailwind setting
  const tailwind = extract.tailwind ?? previous?.template.tailwind;
  const compiled = await input.compile({
    html: tokenizedHtml,
    css: extract.css,
    js: extract.jsBlocks.join('\n'),
    tailwind,
    content: `${extract.html}\n${analysis.handlerJs}`,
  });
  const css = detectCssFields(compiled.cssScoped, fields, {
    wrapper: wrapperElement(analysis.detect.root),
    previous: previous ? { cssScoped: previous.template.cssScoped, fields: previous.fields } : undefined,
  });
  const values = previous ? carriedValues(previous, css.fields, fields.length, css.matched ?? {}) : {};

  const candidate: CustomHtmlData = {
    schemaVersion: CUSTOM_HTML_SCHEMA_VERSION,
    name: name.trim(),
    ...(previous?.libraryId ? { libraryId: previous.libraryId } : {}),
    template: {
      html: tokenizedHtml,
      css: extract.css,
      cssScoped: css.cssScoped,
      js: buildRuntimeJs(extract.jsBlocks, analysis.handlerJs),
      jsSource: extract.jsBlocks.join(';\n'),
      externalScripts: extract.externalScripts,
      externalStylesheets: extract.externalStylesheets,
      ...(tailwind ? { tailwind } : {}),
      ...(input.dir ? { dir: input.dir } : {}),
      scope: compiled.scope,
    },
    fields: css.fields,
    values,
    ...(previous?.runInBuilder !== undefined ? { runInBuilder: previous.runInBuilder } : {}),
  };

  const parsed = parseCustomHtmlData(candidate);
  if (!parsed.success) {
    const issues = parsed.error.split('; ').map((s) => `- ${s}`).join('\n');
    throw new Error(`The section data is not valid:\n${issues}`);
  }
  return { data: parsed.data, compileWarnings: compiled.warnings ?? [] };
}

export async function buildCustomHtmlData(input: BuildInput): Promise<CustomHtmlData> {
  return (await assembleCustomHtml(input)).data;
}

const HANDLER_JS_START = 'const __h = [];';

/**
 * Source for edit mode. NOTE: the stored html already had inline `on*` handlers rewritten to
 * `data-chs-h` markers, so the returned html carries those markers and the generated handler code
 * is returned separately as `handlerJs` (pass it to analyzeSource via `extra.handlerJs`); `js` is the
 * raw author JS only. The original inline attributes themselves are not recoverable.
 */
export function reconstructSource(data: CustomHtmlData): { html: string; css: string; js: string; handlerJs: string } {
  const runtime = data.template.js ?? '';
  let handlerJs = '';
  const start = runtime.indexOf(HANDLER_JS_START);
  const end = runtime.lastIndexOf('\n})');
  if (start >= 0 && end > start) handlerJs = runtime.slice(start, end);
  return {
    html: renderWithDefaults(data),
    css: data.template.css,
    js: data.template.jsSource,
    handlerJs,
  };
}

/** Compile via the admin API (Authorization: Bearer <localStorage adminToken>). */
export async function defaultCompile(req: CompileRequest): Promise<CompileResult> {
  let token = '';
  try {
    token = window.localStorage.getItem('adminToken') ?? '';
  } catch {
    /* ignore */
  }
  const res = await fetch('/api/admin/custom-html/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(req),
  });
  let body: { success?: boolean; error?: string; cssScoped?: string; scope?: string; warnings?: string[] } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || body.success === false || typeof body.cssScoped !== 'string' || typeof body.scope !== 'string') {
    throw new Error(body.error || `CSS compile failed (HTTP ${res.status})`);
  }
  return { cssScoped: body.cssScoped, scope: body.scope, warnings: body.warnings ?? [] };
}

/**
 * Edit mode helper: copies label/group/hidden (and a repeater's min/max) from the previous definition
 * of the same id and type so re-detection (which regenerates labels) does not discard the author's edits.
 */
export function mergePreviousFieldMeta(fields: FieldDef[], previous: CustomHtmlData): FieldDef[] {
  const css = cssFieldIds(previous);
  const merge = (list: FieldDef[], prevList: FieldDef[]): FieldDef[] => {
    const prevById = new Map(prevList.map((f) => [f.id, f]));
    return list.map((f) => {
      const pf = prevById.get(f.id);
      if (!pf || pf.type !== f.type) return f;
      const merged: FieldDef = { ...f, label: pf.label };
      if (pf.group !== undefined) merged.group = pf.group;
      if (pf.hidden !== undefined) merged.hidden = pf.hidden;
      if (pf.min !== undefined) merged.min = pf.min;
      if (pf.max !== undefined) merged.max = pf.max;
      if (f.children) merged.children = merge(f.children, pf.children ?? []);
      return merged;
    });
  };
  return merge(fields, previous.fields.filter((f) => !css.has(f.id)));
}

/** Ids of the fields that exist only in the CSS (backgrounds and colours found after compilation). */
export function cssFieldIds(data: CustomHtmlData): Set<string> {
  const inHtml = data.template.html;
  const types = new Map(data.fields.map((f) => [f.id, f.type]));
  const ids = new Set<string>();
  for (const match of Array.from(data.template.cssScoped.matchAll(TOKEN_RE))) {
    const id = match[1].slice(0, match[1].lastIndexOf('.'));
    const type = types.get(id);
    if ((type === 'bgImage' || type === 'color') && !inHtml.includes(`${TOKEN_OPEN}${id}.`)) ids.add(id);
  }
  return ids;
}

/**
 * Labels of the previous fields (and repeater children) that the new field list no longer has, so their
 * values will be discarded. CSS fields are matched after compilation and are not listed.
 */
export function removedFieldLabels(previous: CustomHtmlData, fields: FieldDef[]): string[] {
  const css = cssFieldIds(previous);
  const same = (list: FieldDef[], pf: FieldDef) => list.find((f) => f.id === pf.id && f.type === pf.type);
  const out: string[] = [];
  for (const pf of previous.fields) {
    if (css.has(pf.id)) continue;
    const f = same(fields, pf);
    if (!f) {
      out.push(pf.label);
      continue;
    }
    for (const child of pf.children ?? []) {
      if (!same(f.children ?? [], child)) out.push(`${pf.label} › ${child.label}`);
    }
  }
  return out;
}
