/**
 * Custom HTML section — shared types and module contracts.
 * Spec: docs/custom-html-section-spec.md
 */

export const CUSTOM_HTML_TYPE = 'custom-html';
export const CUSTOM_HTML_SCHEMA_VERSION = 1 as const;

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'link'
  | 'image'
  | 'bgImage'
  | 'video'
  | 'embed'
  | 'icon'
  | 'color'
  | 'repeater';

export interface LinkValue { text?: string; href?: string; target?: '_self' | '_blank' }
export interface MediaValue { src?: string; alt?: string; poster?: string }
export interface IconValue { svg?: string }
export interface ColorValue { value?: string }
export type RepeaterItem = Record<string, FieldValue>;

export type FieldValue = string | LinkValue | MediaValue | IconValue | ColorValue | RepeaterItem[];

export interface FieldDef {
  /** [a-zA-Z0-9_.-]+ — "f12" or a data-edit key. Repeater children ids are local to the item. */
  id: string;
  type: FieldType;
  label: string;
  group?: string;
  hidden?: boolean;
  default: FieldValue;
  /** repeater only */
  children?: FieldDef[];
  min?: number;
  max?: number;
}

export interface CustomHtmlTemplate {
  /** Tokenized HTML with data-cf markers (spec §5). */
  html: string;
  /** Raw author CSS — admin re-edit only; stripped from public responses. */
  css: string;
  /** Scoped CSS under [data-chs="<scope>"], may contain value tokens. */
  cssScoped: string;
  /** Runtime-ready wrapper source: "(function (root, document, window, setTimeout, setInterval, requestAnimationFrame) { … })" or '' */
  js: string;
  /** Raw author JS — admin re-edit only; stripped from public responses. */
  jsSource: string;
  externalScripts: string[];
  externalStylesheets: string[];
  tailwind?: { enabled: boolean; config?: Record<string, unknown> };
  /** 'ltr' default; 'auto' follows the page language (ar/fa → rtl). */
  dir?: 'auto' | 'ltr' | 'rtl';
  /** 10 lowercase hex chars. */
  scope: string;
}

export interface CustomHtmlData {
  schemaVersion: typeof CUSTOM_HTML_SCHEMA_VERSION;
  name: string;
  libraryId?: string;
  template: CustomHtmlTemplate;
  fields: FieldDef[];
  values: Record<string, FieldValue>;
  /** Run template JS inside the builder canvas. Default false. */
  runInBuilder?: boolean;
}

export const CUSTOM_HTML_LIMITS = {
  html: 400_000,
  cssScoped: 400_000,
  css: 400_000,
  js: 200_000,
  jsSource: 200_000,
  fields: 600,
  repeaterItems: 100,
  externalUrls: 10,
  uploadBytes: 2_000_000,
} as const;

/** Token syntax helpers (spec §5). */
export const TOKEN_OPEN = '{{cf:';
export const TOKEN_CLOSE = '}}';
export const TOKEN_LITERAL_ID = '__lit';
/** Matches {{cf:path}} where path = [A-Za-z0-9_.$-]+ */
export const TOKEN_RE = /\{\{cf:([A-Za-z0-9_.$-]+)\}\}/g;
export const repeaterOpen = (id: string) => `<!--cf:rep:${id}-->`;
export const repeaterClose = (id: string) => `<!--/cf:rep:${id}-->`;

// ---------------------------------------------------------------------------
// Module contracts (implemented in sibling files). Kept here so parallel work agrees.
// ---------------------------------------------------------------------------

/** render.ts */
export interface RenderOptions {
  /** true in the builder canvas: keep data-cf attributes. false on public pages: strip them. */
  builder: boolean;
}
export interface RenderResult { html: string; css: string }
// export function renderCustomHtml(data: Pick<CustomHtmlData,'template'|'fields'|'values'>, opts: RenderOptions): RenderResult
// export function renderWithDefaults(data): string   // html with defaults + data-cf kept (re-import source)

/** extract.ts */
export interface ExtractResult {
  html: string;
  css: string;
  /** ordered classic inline script blocks */
  jsBlocks: string[];
  externalScripts: string[];
  externalStylesheets: string[];
  tailwind?: { enabled: boolean; config?: Record<string, unknown> };
  warnings: string[];
  /** blocking errors (e.g. JS syntax error) */
  errors: string[];
  isFullDocument: boolean;
}
// export function extractSource(input: string, extra?: { css?: string; js?: string }): ExtractResult

/** detect.ts */
export interface DetectOptions { hintsOnly?: boolean }
export interface DetectResult {
  /** body element (detached Document) with data-cf markers applied */
  root: Element;
  fields: FieldDef[];
  hasHints: boolean;
  warnings: string[];
}
// export function detectFields(html: string, opts?: DetectOptions): DetectResult
// export function markElementAsField(root: Element, el: Element, type: FieldType, fields: FieldDef[]): FieldDef[]  // click-to-map
// export function unmarkField(root: Element, fieldId: string, fields: FieldDef[]): FieldDef[]

/** tokenize.ts */
// export function tokenizeHtml(root: Element, fields: FieldDef[]): string
// export function detectCssFields(cssScoped: string, existing: FieldDef[]): { cssScoped: string; fields: FieldDef[] }

/** handlers.ts */
// export function rewriteInlineHandlers(html: string): { html: string; handlerJs: string; count: number }
// export function buildRuntimeJs(jsBlocks: string[], handlerJs: string): string   // '' when both empty
// export function jsWarnings(js: string): string[]   // innerHTML/outerHTML/insertAdjacentHTML/document.write

/** runtime.ts (client) */
export interface RuntimeHandle { dispose(): void }
// export function runCustomHtmlScript(opts: { instanceId: string; root: HTMLElement; js: string; externalScripts: string[] }): Promise<RuntimeHandle>

/** css-scope.ts (server) */
export interface CompileRequest {
  html: string;
  css: string;
  js?: string;
  tailwind?: { enabled: boolean; config?: Record<string, unknown> };
}
export interface CompileResult { cssScoped: string; scope: string; warnings: string[] }
// export async function compileCss(req: CompileRequest): Promise<CompileResult>

/** guard.ts (server) */
export type GuardResult =
  | { ok: true }
  | { ok: false; status: 400 | 403; sectionId?: string; reason: string };
// export function checkCustomHtmlWrite(args: { canEditCode: boolean; prevSections: unknown; nextSections: unknown; libraryHashes: Set<string> }): GuardResult
