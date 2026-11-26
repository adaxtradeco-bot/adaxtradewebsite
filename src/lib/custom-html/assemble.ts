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
} from './types';
import { CUSTOM_HTML_SCHEMA_VERSION } from './types';

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

/** Like buildCustomHtmlData but also returns compile warnings. */
export async function assembleCustomHtml(input: BuildInput): Promise<BuildResult> {
  const { name, analysis, fields, previous } = input;
  const { extract } = analysis;
  if (analysis.blocked) throw new Error(`Cannot import: ${extract.errors.join('; ')}`);

  const tokenizedHtml = tokenizeHtml(analysis.detect.root, fields);
  const compiled = await input.compile({
    html: tokenizedHtml,
    css: extract.css,
    js: extract.jsBlocks.join('\n'),
    tailwind: extract.tailwind,
  });
  const css = detectCssFields(compiled.cssScoped, fields);

  const values: Record<string, FieldValue> = {};
  if (previous) {
    const prevById = new Map(previous.fields.map((f) => [f.id, f]));
    for (const f of css.fields) {
      const pf = prevById.get(f.id);
      if (pf && pf.type === f.type && Object.prototype.hasOwnProperty.call(previous.values, f.id)) {
        values[f.id] = previous.values[f.id];
      }
    }
  }

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
      ...(extract.tailwind ? { tailwind: extract.tailwind } : {}),
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
 * Edit mode helper: copies label/group/hidden from the previous definition of the same id and type
 * so re-detection (which regenerates labels) does not discard the author's edits.
 */
export function mergePreviousFieldMeta(fields: FieldDef[], previous: CustomHtmlData): FieldDef[] {
  const prevById = new Map(previous.fields.map((f) => [f.id, f]));
  return fields.map((f) => {
    const pf = prevById.get(f.id);
    if (!pf || pf.type !== f.type) return f;
    const merged: FieldDef = { ...f, label: pf.label };
    if (pf.group !== undefined) merged.group = pf.group;
    if (pf.hidden !== undefined) merged.hidden = pf.hidden;
    return merged;
  });
}
