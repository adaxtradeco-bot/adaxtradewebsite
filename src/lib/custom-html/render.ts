/**
 * Custom HTML section — pure string renderer (spec §5).
 *
 * The template is trusted code; values are untrusted. Rendering is a single regex pass over the
 * (repeater-expanded) template, so a substituted value is never scanned for tokens again. The context
 * of each token (attribute value, style url(), element text, CSS) selects the escaper.
 */
import { sanitizeRichText, sanitizeSvg, safeStyleText } from '../sanitize';
import { escapeAttr, escapeText, safeColor, safeCssUrl, safeEmbedUrl, safeUrl } from './escape';
import {
  CUSTOM_HTML_LIMITS,
  TOKEN_LITERAL_ID,
  TOKEN_OPEN,
  TOKEN_RE,
  type CustomHtmlData,
  type FieldDef,
  type RenderOptions,
  type RenderResult,
} from './types';

export type RenderInput = Pick<CustomHtmlData, 'template' | 'fields'> & Partial<Pick<CustomHtmlData, 'values'>>;

const has = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);
const isPlainObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const tokenRe = () => new RegExp(TOKEN_RE.source, 'g');

/** Sub-keys addressable per object-valued field type. */
const SUBKEYS: Record<string, string[]> = {
  link: ['text', 'href', 'target'],
  image: ['src', 'alt'],
  bgImage: ['src', 'alt'],
  video: ['src', 'poster', 'alt'],
  embed: ['src'],
  icon: ['svg'],
  color: ['value'],
};

const URL_ATTRS = ['href', 'src', 'poster', 'data-src', 'data-lazy-src', 'action', 'formaction', 'xlink:href', 'background'];
const HREF_KIND_ATTRS = ['href', 'action', 'formaction', 'xlink:href'];
/** Attributes that may never receive a token value. */
const BLOCKED_ATTRS = ['srcdoc', 'srcset', 'imagesrcset', 'data-srcset', 'sizes', 'is', 'ping'];
const EMBED_TAGS = ['iframe', 'embed', 'object', 'frame'];
const STRIP_ON_IMAGE_CHANGE = ['srcset', 'sizes', 'data-srcset'];
const CSS_URL_PREFIX_RE = /url\(\s*(?:'[^']*|"[^"]*|[^'")\s]*)$/i;
const REP_PATH_RE = /^(.+)\.\$(\d+)\.(.+)$/;
const REP_BLOCK_RE = /<!--cf:rep:([A-Za-z0-9_.-]+)-->([\s\S]*?)<!--\/cf:rep:\1-->/g;
const LOOKBACK = 400;

function isStringType(t: string): boolean {
  return t === 'text' || t === 'textarea' || t === 'richtext';
}

function shapeOk(type: string, v: unknown): boolean {
  if (isStringType(type)) return typeof v === 'string';
  if (type === 'repeater') return Array.isArray(v);
  return isPlainObj(v);
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

interface Ctx {
  fields: Map<string, FieldDef>;
  values: Record<string, unknown>;
  builder: boolean;
  childMaps: Map<FieldDef, Map<string, FieldDef>>;
  itemCache: Map<FieldDef, Record<string, unknown>[]>;
}

interface Resolved {
  def: FieldDef;
  sub: string;
  value: unknown;
}

function buildCtx(data: RenderInput, useDefaults: boolean, builder: boolean): Ctx {
  const fields = new Map<string, FieldDef>();
  const list = Array.isArray(data.fields) ? data.fields : [];
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (f && typeof f.id === 'string' && typeof f.type === 'string' && !fields.has(f.id)) fields.set(f.id, f);
  }
  const values = !useDefaults && isPlainObj(data.values) ? (data.values as Record<string, unknown>) : {};
  return { fields, values, builder, childMaps: new Map(), itemCache: new Map() };
}

function childMap(ctx: Ctx, rep: FieldDef): Map<string, FieldDef> {
  let m = ctx.childMaps.get(rep);
  if (!m) {
    m = new Map();
    const kids = Array.isArray(rep.children) ? rep.children : [];
    for (let i = 0; i < kids.length; i++) {
      const k = kids[i];
      if (k && typeof k.id === 'string' && !m.has(k.id)) m.set(k.id, k);
    }
    ctx.childMaps.set(rep, m);
  }
  return m;
}

function effectiveValue(def: FieldDef, values: Record<string, unknown>): unknown {
  if (has(values, def.id) && shapeOk(def.type, values[def.id])) return values[def.id];
  return def.default;
}

function repeaterItems(ctx: Ctx, rep: FieldDef): Record<string, unknown>[] {
  let items = ctx.itemCache.get(rep);
  if (!items) {
    const v = effectiveValue(rep, ctx.values);
    items = [];
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length && items.length < CUSTOM_HTML_LIMITS.repeaterItems; i++) {
        if (isPlainObj(v[i])) items.push(v[i] as Record<string, unknown>);
      }
    }
    ctx.itemCache.set(rep, items);
  }
  return items;
}

/** "a.b.c" -> longest field id prefix present in the map (ids may contain dots); remainder is the sub-key. */
function splitPath(path: string, map: Map<string, FieldDef>): { def: FieldDef; sub: string } | null {
  const parts = path.split('.');
  for (let n = parts.length; n >= 1; n--) {
    const def = map.get(parts.slice(0, n).join('.'));
    if (def) return { def, sub: parts.slice(n).join('.') };
  }
  return null;
}

function resolve(path: string, ctx: Ctx): Resolved | null {
  const m = REP_PATH_RE.exec(path);
  if (m) {
    const rep = ctx.fields.get(m[1]);
    if (!rep || rep.type !== 'repeater') return null;
    const item = repeaterItems(ctx, rep)[Number(m[2])];
    if (!item) return null;
    const kids = childMap(ctx, rep);
    const sp = splitPath(m[3], kids);
    if (!sp || sp.def.type === 'repeater') return null;
    const v = has(item, sp.def.id) && shapeOk(sp.def.type, item[sp.def.id]) ? item[sp.def.id] : sp.def.default;
    return { def: sp.def, sub: sp.sub, value: v };
  }
  const sp = splitPath(path, ctx.fields);
  if (!sp || sp.def.type === 'repeater') return null;
  return { def: sp.def, sub: sp.sub, value: effectiveValue(sp.def, ctx.values) };
}

function leafFrom(def: FieldDef, sub: string, value: unknown): string | null {
  if (isStringType(def.type)) return sub === '' && typeof value === 'string' ? value : null;
  const keys = SUBKEYS[def.type];
  if (!keys || keys.indexOf(sub) === -1) return null;
  if (isPlainObj(value) && has(value, sub) && typeof value[sub] === 'string') return value[sub] as string;
  if (isPlainObj(def.default) && has(def.default, sub) && typeof def.default[sub] === 'string') {
    return def.default[sub] as string;
  }
  return '';
}

function leafOf(res: Resolved): string | null {
  return leafFrom(res.def, res.sub, res.value);
}

function defaultLeaf(res: Resolved): string {
  if (isStringType(res.def.type)) return typeof res.def.default === 'string' ? res.def.default : '';
  const d = res.def.default;
  if (isPlainObj(d) && has(d, res.sub) && typeof d[res.sub] === 'string') return d[res.sub] as string;
  return '';
}

// ---------------------------------------------------------------------------
// Token -> string, per context
// ---------------------------------------------------------------------------

/** Element-text context. */
function textToken(path: string, ctx: Ctx): string {
  if (path === TOKEN_LITERAL_ID) return TOKEN_OPEN;
  const res = resolve(path, ctx);
  if (!res) return '';
  const l = leafOf(res);
  if (l === null) return '';
  switch (res.def.type) {
    case 'richtext':
      return sanitizeRichText(l);
    case 'icon':
      return res.sub === 'svg' ? sanitizeSvg(l) : escapeText(l);
    case 'textarea':
      return escapeText(l).replace(/\r\n|\r|\n/g, '<br>');
    default:
      return escapeText(l);
  }
}

/** CSS-escapes a string so it contains only [A-Za-z0-9 ._-] and \HEX escapes. */
function cssStringEscape(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    if (/[A-Za-z0-9 ._-]/.test(c)) out += c;
    else out += '\\' + s.charCodeAt(i).toString(16) + ' ';
  }
  return out;
}

/** CSS context (cssScoped, style attribute, <style> text). Returns an unescaped CSS fragment. */
function cssToken(path: string, prefix: string, ctx: Ctx): string {
  if (path === TOKEN_LITERAL_ID) return TOKEN_OPEN;
  const res = resolve(path, ctx);
  if (!res) return '';
  const l = leafOf(res);
  if (l === null) return '';
  if (CSS_URL_PREFIX_RE.test(prefix)) return safeCssUrl(l);
  if (res.def.type === 'color' && res.sub === 'value') {
    return safeColor(l, safeColor(defaultLeaf(res), 'transparent'));
  }
  if (res.def.type === 'text' || res.def.type === 'textarea') return cssStringEscape(l);
  return '';
}

function normalizeTarget(v: string): string {
  return v.trim().toLowerCase() === '_blank' ? '_blank' : '_self';
}

/** Attribute-value context. Returns the already attribute-escaped replacement. */
function attrToken(attrName: string, tagName: string, path: string, prefix: string, ctx: Ctx): string {
  if (path === TOKEN_LITERAL_ID) return escapeAttr(TOKEN_OPEN);
  const name = attrName.toLowerCase();
  if (name.indexOf('on') === 0 || BLOCKED_ATTRS.indexOf(name) !== -1) return '';
  const res = resolve(path, ctx);
  if (!res) return '';
  const l = leafOf(res);
  if (l === null) return '';
  if (name === 'style') return escapeAttr(cssToken(path, prefix, ctx));
  if (URL_ATTRS.indexOf(name) !== -1) {
    if (res.def.type === 'embed' || EMBED_TAGS.indexOf(tagName) !== -1) return escapeAttr(safeEmbedUrl(l));
    return escapeAttr(safeUrl(l, HREF_KIND_ATTRS.indexOf(name) !== -1 ? 'href' : 'src'));
  }
  if (name === 'target') return normalizeTarget(l);
  return escapeAttr(l);
}

// ---------------------------------------------------------------------------
// Repeater expansion (template-level only; values are not involved)
// ---------------------------------------------------------------------------

function expandRepeaters(tpl: string, ctx: Ctx): string {
  if (tpl.indexOf('<!--cf:rep:') === -1) return tpl;
  return tpl.replace(new RegExp(REP_BLOCK_RE.source, 'g'), (_m, id: string, body: string) => {
    const rep = ctx.fields.get(id);
    if (!rep || rep.type !== 'repeater') return '';
    const items = repeaterItems(ctx, rep);
    let out = '';
    for (let n = 0; n < items.length; n++) {
      out += body
        .split(TOKEN_OPEN + id + '.$.')
        .join(TOKEN_OPEN + id + '.$' + n + '.')
        .split('data-cf="' + id + '.$.')
        .join('data-cf="' + id + '.$' + n + '.')
        .split("data-cf='" + id + '.$.')
        .join("data-cf='" + id + '.$' + n + '.');
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// HTML scanner
// ---------------------------------------------------------------------------

interface Attr {
  name: string;
  nameLower: string;
  start: number;
  end: number;
  hasValue: boolean;
  valStart: number;
  valEnd: number;
  quote: '"' | "'" | '';
}

type Piece =
  | { kind: 'text' | 'comment' | 'raw' | 'closetag'; start: number; end: number }
  | { kind: 'rawtext'; start: number; end: number; tag: string }
  | { kind: 'tag'; start: number; end: number; name: string; attrs: Attr[]; tail: number };

const WS_RE = /\s/;
const ALPHA_RE = /[A-Za-z]/;

function scan(src: string): Piece[] {
  const pieces: Piece[] = [];
  const n = src.length;
  let i = 0;
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt === -1) {
      pieces.push({ kind: 'text', start: i, end: n });
      break;
    }
    if (lt > i) pieces.push({ kind: 'text', start: i, end: lt });
    if (src.substr(lt, 4) === '<!--') {
      const close = src.indexOf('-->', lt + 4);
      const end = close === -1 ? n : close + 3;
      pieces.push({ kind: 'comment', start: lt, end });
      i = end;
      continue;
    }
    const next = src.charAt(lt + 1);
    if (next === '!' || next === '?') {
      const gt = src.indexOf('>', lt);
      const end = gt === -1 ? n : gt + 1;
      pieces.push({ kind: 'raw', start: lt, end });
      i = end;
      continue;
    }
    const closing = next === '/';
    const nameStart = lt + (closing ? 2 : 1);
    if (!ALPHA_RE.test(src.charAt(nameStart))) {
      pieces.push({ kind: 'text', start: lt, end: lt + 1 });
      i = lt + 1;
      continue;
    }
    let j = nameStart;
    while (j < n && !WS_RE.test(src.charAt(j)) && src.charAt(j) !== '>' && src.charAt(j) !== '/') j++;
    const name = src.slice(nameStart, j).toLowerCase();
    if (closing) {
      const gt = src.indexOf('>', j);
      const end = gt === -1 ? n : gt + 1;
      pieces.push({ kind: 'closetag', start: lt, end });
      i = end;
      continue;
    }
    const attrs: Attr[] = [];
    let lastEnd = j;
    let end = n;
    while (j < n) {
      const ch = src.charAt(j);
      if (WS_RE.test(ch) || ch === '/') {
        j++;
        continue;
      }
      if (ch === '>') {
        end = j + 1;
        break;
      }
      const aStart = j;
      while (j < n && !WS_RE.test(src.charAt(j)) && src.charAt(j) !== '=' && src.charAt(j) !== '>' && src.charAt(j) !== '/') j++;
      if (j === aStart) j++; // stray '=' — consume to guarantee progress
      const aName = src.slice(aStart, j);
      let k = j;
      while (k < n && WS_RE.test(src.charAt(k))) k++;
      const attr: Attr = {
        name: aName,
        nameLower: aName.toLowerCase(),
        start: aStart,
        end: j,
        hasValue: false,
        valStart: j,
        valEnd: j,
        quote: '',
      };
      if (src.charAt(k) === '=') {
        k++;
        while (k < n && WS_RE.test(src.charAt(k))) k++;
        const q = src.charAt(k);
        if (q === '"' || q === "'") {
          const close = src.indexOf(q, k + 1);
          attr.valStart = k + 1;
          attr.valEnd = close === -1 ? n : close;
          attr.end = close === -1 ? n : close + 1;
          attr.quote = q;
        } else {
          let v = k;
          while (v < n && !WS_RE.test(src.charAt(v)) && src.charAt(v) !== '>') v++;
          attr.valStart = k;
          attr.valEnd = v;
          attr.end = v;
        }
        attr.hasValue = true;
        j = attr.end;
      }
      attrs.push(attr);
      lastEnd = attr.end;
    }
    pieces.push({ kind: 'tag', start: lt, end, name, attrs, tail: lastEnd });
    i = end;
    if (name === 'script' || name === 'style') {
      const closeIdx = src.toLowerCase().indexOf('</' + name, i);
      const rawEnd = closeIdx === -1 ? n : closeIdx;
      if (rawEnd > i) pieces.push({ kind: 'rawtext', start: i, end: rawEnd, tag: name });
      i = rawEnd;
    }
  }
  return pieces;
}

// ---------------------------------------------------------------------------
// Tag rendering
// ---------------------------------------------------------------------------

interface TagFlags {
  imageChanged: boolean;
  videoChanged: boolean;
}

function tokenPaths(value: string): string[] {
  const out: string[] = [];
  const re = tokenRe();
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) out.push(m[1]);
  return out;
}

function mediaChange(src: string, tag: { attrs: Attr[] }, ctx: Ctx): TagFlags {
  const flags: TagFlags = { imageChanged: false, videoChanged: false };
  for (let a = 0; a < tag.attrs.length; a++) {
    const attr = tag.attrs[a];
    if (!attr.hasValue) continue;
    const paths = tokenPaths(src.slice(attr.valStart, attr.valEnd));
    for (let p = 0; p < paths.length; p++) {
      if (paths[p] === TOKEN_LITERAL_ID) continue;
      const res = resolve(paths[p], ctx);
      if (!res || res.sub !== 'src') continue;
      const type = res.def.type;
      if (type !== 'image' && type !== 'video') continue;
      const l = leafOf(res);
      if (l !== null && l !== defaultLeaf(res)) {
        if (type === 'image') flags.imageChanged = true;
        else flags.videoChanged = true;
      }
    }
  }
  return flags;
}

function mergeRel(existing: string): string {
  const parts = existing.split(/\s+/).filter(Boolean);
  const lower = parts.map((p) => p.toLowerCase());
  if (lower.indexOf('noopener') === -1) parts.push('noopener');
  if (lower.indexOf('noreferrer') === -1) parts.push('noreferrer');
  return parts.join(' ');
}

function renderAttrValue(raw: string, attr: Attr, tagName: string, ctx: Ctx): string {
  let out = '';
  let last = 0;
  const re = tokenRe();
  let m: RegExpExecArray | null;
  const quoteSafe = (lit: string) => (attr.quote === '' ? lit.replace(/"/g, '&quot;') : lit);
  while ((m = re.exec(raw))) {
    out += quoteSafe(raw.slice(last, m.index));
    const prefix = raw.slice(Math.max(0, m.index - LOOKBACK), m.index);
    out += attrToken(attr.name, tagName, m[1], prefix, ctx);
    last = m.index + m[0].length;
  }
  return out + quoteSafe(raw.slice(last));
}

function renderTag(
  src: string,
  tag: Extract<Piece, { kind: 'tag' }>,
  flags: TagFlags,
  ctx: Ctx,
): string {
  // Pre-pass: target/rel decisions and the data-cf bound link field.
  let targetAttr: Attr | null = null;
  let relAttr: Attr | null = null;
  let dataCf = '';
  for (let a = 0; a < tag.attrs.length; a++) {
    const attr = tag.attrs[a];
    if (attr.nameLower === 'target') targetAttr = attr;
    else if (attr.nameLower === 'rel') relAttr = attr;
    else if (attr.nameLower === 'data-cf' && attr.hasValue) dataCf = src.slice(attr.valStart, attr.valEnd).trim();
  }

  let needsRel = false;
  let addTarget = false;
  if (targetAttr && targetAttr.hasValue) {
    const raw = src.slice(targetAttr.valStart, targetAttr.valEnd);
    if (tokenPaths(raw).length) {
      needsRel = normalizeTarget(renderAttrValue(raw, targetAttr, tag.name, ctx)) === '_blank';
    }
  } else if (!targetAttr && dataCf && /^[A-Za-z0-9_.$-]+$/.test(dataCf)) {
    const res = resolve(dataCf, ctx);
    if (res && res.def.type === 'link' && res.sub === '') {
      const t = leafFrom(res.def, 'target', res.value);
      if (t !== null && normalizeTarget(t) === '_blank' && t.trim().toLowerCase() === '_blank') {
        addTarget = true;
        needsRel = true;
      }
    }
  }

  let out = '<' + src.slice(tag.start + 1, tag.start + 1 + tag.name.length);
  let prevEnd = tag.start + 1 + tag.name.length;
  for (let a = 0; a < tag.attrs.length; a++) {
    const attr = tag.attrs[a];
    const gap = src.slice(prevEnd, attr.start);
    prevEnd = attr.end;

    if (attr.nameLower === 'data-cf' && !ctx.builder) continue;
    if (tokenPaths(attr.name).length) continue;
    if (flags.imageChanged && STRIP_ON_IMAGE_CHANGE.indexOf(attr.nameLower) !== -1) continue;
    if (flags.videoChanged && tag.name === 'source' && attr.nameLower === 'type') continue;

    if (attr === relAttr && needsRel) {
      const existing = attr.hasValue ? src.slice(attr.valStart, attr.valEnd) : '';
      out += gap + 'rel="' + mergeRel(existing).replace(/"/g, '&quot;') + '"';
      relAttr = null; // handled
      needsRel = false;
      continue;
    }
    if (!attr.hasValue) {
      out += gap + src.slice(attr.start, attr.end);
      continue;
    }
    const raw = src.slice(attr.valStart, attr.valEnd);
    if (!tokenPaths(raw).length) {
      out += gap + src.slice(attr.start, attr.end);
      continue;
    }
    const q = attr.quote || '"';
    out += gap + attr.name + '=' + q + renderAttrValue(raw, attr, tag.name, ctx) + q;
  }
  if (addTarget) out += ' target="_blank"';
  if (needsRel) out += ' rel="noopener noreferrer"';
  return out + src.slice(tag.tail, tag.end);
}

// ---------------------------------------------------------------------------
// HTML / CSS
// ---------------------------------------------------------------------------

function replaceTokensInText(text: string, ctx: Ctx): string {
  if (text.indexOf(TOKEN_OPEN) === -1) return text;
  return text.replace(tokenRe(), (_m, path: string) => textToken(path, ctx));
}

function dropTokens(text: string): string {
  return text.indexOf(TOKEN_OPEN) === -1 ? text : text.replace(tokenRe(), (_m, path: string) => (path === TOKEN_LITERAL_ID ? TOKEN_OPEN : ''));
}

function renderCssString(css: string, ctx: Ctx): string {
  const out = css.replace(tokenRe(), (_m: string, path: string, offset: number) =>
    cssToken(path, css.slice(Math.max(0, offset - LOOKBACK), offset), ctx),
  );
  return safeStyleText(out);
}

function renderHtml(tpl: string, ctx: Ctx): string {
  const src = expandRepeaters(tpl, ctx);
  const pieces = scan(src);

  // Pass 1: media-change flags and <picture><source> removal.
  const flags: TagFlags[] = [];
  const removed: Record<number, true> = {};
  let pictureStart = -1;
  let pictureChanged = false;
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    if (p.kind === 'tag') {
      const f = mediaChange(src, p, ctx);
      flags[i] = f;
      if (p.name === 'picture') {
        pictureStart = i;
        pictureChanged = false;
      } else if (pictureStart !== -1 && f.imageChanged) {
        pictureChanged = true;
      }
    } else if (p.kind === 'closetag' && pictureStart !== -1 && /^<\/picture/i.test(src.substr(p.start, 10))) {
      if (pictureChanged) {
        for (let k = pictureStart + 1; k < i; k++) {
          const q = pieces[k];
          if (q.kind === 'tag' && q.name === 'source') removed[k] = true;
        }
      }
      pictureStart = -1;
      pictureChanged = false;
    }
  }

  // Pass 2: emit.
  let out = '';
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    switch (p.kind) {
      case 'text':
        out += replaceTokensInText(src.slice(p.start, p.end), ctx);
        break;
      case 'comment': {
        const raw = src.slice(p.start, p.end);
        if (/^<!--\/?cf:rep:/.test(raw)) break; // leftover repeater marker
        out += dropTokens(raw);
        break;
      }
      case 'raw':
      case 'closetag':
        out += dropTokens(src.slice(p.start, p.end));
        break;
      case 'rawtext': {
        const raw = src.slice(p.start, p.end);
        out += p.tag === 'style' ? renderCssString(raw, ctx) : dropTokens(raw);
        break;
      }
      case 'tag':
        if (!removed[i]) out += renderTag(src, p, flags[i], ctx);
        break;
    }
  }
  return out;
}

function renderInternal(data: RenderInput, opts: RenderOptions, useDefaults: boolean): RenderResult {
  const ctx = buildCtx(data, useDefaults, opts.builder);
  const template = data.template;
  const html = renderHtml(typeof template.html === 'string' ? template.html : '', ctx);
  const css = renderCssString(typeof template.cssScoped === 'string' ? template.cssScoped : '', ctx);
  return { html, css };
}

/**
 * Renders a custom-html section to { html, css }. Never throws: on failure it re-renders with field
 * defaults, and on a second failure returns empty strings.
 */
export function renderCustomHtml(data: RenderInput, opts: RenderOptions): RenderResult {
  try {
    return renderInternal(data, opts, false);
  } catch (e) {
    if (typeof console !== 'undefined') console.warn('[custom-html] render failed, falling back to defaults', e);
    try {
      return renderInternal(data, opts, true);
    } catch {
      return { html: '', css: '' };
    }
  }
}

/** HTML rendered with field defaults and data-cf markers kept (source reconstruction for re-import). */
export function renderWithDefaults(data: RenderInput): string {
  try {
    return renderInternal(data, { builder: true }, true).html;
  } catch {
    return '';
  }
}
