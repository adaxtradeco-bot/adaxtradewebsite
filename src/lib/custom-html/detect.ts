/**
 * Custom HTML section — editable-field detection (spec §6.1, §6.2, §6.4).
 *
 * Runs in the admin's browser (DOMParser) and in vitest/jsdom.
 * Repeaters and colour fields are phase 2 and intentionally not handled here.
 */
import {
  CUSTOM_HTML_LIMITS,
  type DetectOptions,
  type DetectResult,
  type FieldDef,
  type FieldType,
  type FieldValue,
  type LinkValue,
  type MediaValue,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template']);
const PHRASING = new Set(['strong', 'b', 'em', 'i', 'u', 's', 'br', 'span', 'small', 'mark', 'code', 'sub', 'sup']);
const TEXTAREA_TAGS = new Set(['p', 'blockquote', 'li']);
const ICON_PARENT_LINK_TAGS = new Set(['a', 'button']);
const MAPPABLE_TYPES: ReadonlySet<string> = new Set([
  'text', 'textarea', 'richtext', 'link', 'image', 'bgImage', 'video', 'embed', 'icon',
]);
const CONTENT_CLAIMING = new Set<FieldType>(['text', 'textarea', 'richtext', 'icon', 'embed', 'video']);

const GROUP_SELECTOR = 'section, header, footer, article, [class*="card"]';
const DEFAULT_GROUP = 'Section';
const MAX_LABEL = 48;
const MAX_GROUP = 40;

const EMBED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'www.google.com',
]);

/** Shown by the UI when click-to-map wraps a mixed-content run (spec §6.2). */
export const MIXED_RUN_WARNING =
  'This text was wrapped in a <span> so it can be edited; CSS rules that rely on sibling selectors (e.g. :first-child, + or ~) may be affected.';

const ROLE_BY_TAG: Record<string, string> = {
  h1: 'Title',
  h2: 'Heading',
  h3: 'Heading',
  h4: 'Heading',
  h5: 'Heading',
  h6: 'Heading',
  p: 'Text',
  a: 'Link',
  button: 'Button',
  img: 'Image',
  video: 'Video',
  iframe: 'Embed',
  svg: 'Icon',
  li: 'Item',
  blockquote: 'Quote',
  label: 'Label',
  input: 'Placeholder',
  textarea: 'Placeholder',
};

// ---------------------------------------------------------------------------
// Small DOM helpers
// ---------------------------------------------------------------------------

const tagOf = (el: Element): string => el.tagName.toLowerCase();
const isBlank = (s: string): boolean => !/\S/.test(s);

function normText(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Text of an element with <br> turned into \n and source whitespace collapsed. */
function brText(el: Element): string {
  let out = '';
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) out += (child.textContent ?? '').replace(/\s+/g, ' ');
      else if (child.nodeType === 1) {
        if (tagOf(child as Element) === 'br') out += '\n';
        else walk(child);
      }
    });
  };
  walk(el);
  return out.replace(/ *\n */g, '\n').trim();
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, Math.max(max - 1, 1)).trimEnd()}…` : s;
}

/** True when every descendant is text, a comment or a phrasing element. */
function isPhrasingOnly(el: Element): boolean {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === 1) {
      const c = child as Element;
      if (!PHRASING.has(tagOf(c)) || !isPhrasingOnly(c)) return false;
    }
  }
  return true;
}

interface ContentInfo {
  phrasingOnly: boolean;
  hasText: boolean;
  hasElements: boolean;
  onlyBr: boolean;
}

function contentInfo(el: Element): ContentInfo {
  const descendants = Array.from(el.querySelectorAll('*'));
  return {
    phrasingOnly: isPhrasingOnly(el),
    hasText: !isBlank(el.textContent ?? ''),
    hasElements: descendants.length > 0,
    onlyBr: descendants.every((d) => tagOf(d) === 'br'),
  };
}

/** True if `child` is the only meaningful content of `parent` (ignoring whitespace and comments). */
function isOnlyContent(parent: Element, child: Element): boolean {
  return Array.from(parent.childNodes).every(
    (n) => n === child || n.nodeType === 8 || (n.nodeType === 3 && isBlank(n.textContent ?? ''))
  );
}

function sanitizeKey(key: string): string {
  const cleaned = key.trim().replace(/[^a-zA-Z0-9_.-]+/g, '_');
  return /^[_.-]*$/.test(cleaned) ? '' : cleaned;
}

/** Hosts allowed for embeds (mirrors safeEmbedUrl in escape.ts). */
export function isEmbeddableUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  const host = url.hostname.toLowerCase();
  if (!EMBED_HOSTS.has(host)) return false;
  if (host === 'www.google.com' && !url.pathname.startsWith('/maps')) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Inline-style background image (shared with tokenize.ts)
// ---------------------------------------------------------------------------

export interface StyleUrlMatch {
  url: string;
  /** offsets of the whole `url(...)` token inside the style attribute value */
  start: number;
  end: number;
}

/**
 * Finds the first usable `url(...)` in a `background` / `background-image`
 * declaration of an inline style. Fragment (#id), `data:` and already-tokenised
 * URLs are ignored.
 */
export function findStyleBgUrl(style: string): StyleUrlMatch | null {
  const declRe = /([-\w]+)\s*:\s*((?:url\((?:"[^"]*"|'[^']*'|[^)])*\)|"[^"]*"|'[^']*'|[^;])*)/g;
  let m: RegExpExecArray | null;
  while ((m = declRe.exec(style))) {
    const prop = m[1].toLowerCase();
    if (prop !== 'background' && prop !== 'background-image') continue;
    const value = m[2];
    const valueStart = m.index + m[0].length - value.length;
    const urlRe = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s][^)]*?))\s*\)/gi;
    let u: RegExpExecArray | null;
    while ((u = urlRe.exec(value))) {
      const url = (u[1] ?? u[2] ?? u[3] ?? '').trim();
      if (!url || url.startsWith('#') || /^data:/i.test(url) || url.includes('{{cf:')) continue;
      return { url, start: valueStart + u.index, end: valueStart + u.index + u[0].length };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Labels and groups (spec §6.4)
// ---------------------------------------------------------------------------

export function roleFor(el: Element, type: FieldType): string {
  switch (type) {
    case 'bgImage': return 'Background';
    case 'icon': return 'Icon';
    case 'link': return 'Link';
    case 'image': return 'Image';
    case 'video': return 'Video';
    case 'embed': return 'Embed';
    default: return ROLE_BY_TAG[tagOf(el)] ?? 'Text';
  }
}

/** Text of the nearest heading inside the nearest section/header/footer/article/card ancestor, else "Section". */
export function groupFor(el: Element): string {
  let anc = el.parentElement;
  while (anc) {
    if (anc.matches(GROUP_SELECTOR)) {
      const heading = anc.querySelector('h1, h2, h3, h4, h5, h6');
      const text = heading ? normText(heading) : '';
      if (text) return truncate(text, MAX_GROUP);
    }
    anc = anc.parentElement;
  }
  return DEFAULT_GROUP;
}

/** "<Group> › <Role> <n>", max 48 characters. n counts existing fields with the same group and role. */
export function labelFor(el: Element, type: FieldType, fields: FieldDef[], group: string = groupFor(el)): string {
  const role = roleFor(el, type);
  const re = /^.* › (.+) (\d+)$/;
  let n = 0;
  for (const f of fields) {
    if ((f.group ?? DEFAULT_GROUP) !== group) continue;
    const m = re.exec(f.label);
    if (m && m[1] === role) n = Math.max(n, Number(m[2]));
  }
  const suffix = ` › ${role} ${n + 1}`;
  const label = `${truncate(group, Math.max(MAX_LABEL - suffix.length, 4))}${suffix}`;
  return label.length > MAX_LABEL ? label.slice(0, MAX_LABEL) : label;
}

// ---------------------------------------------------------------------------
// Field compatibility and defaults
// ---------------------------------------------------------------------------

/** Can this element be mapped as a field of `type`? */
export function canMarkAs(el: Element, type: FieldType): boolean {
  const tag = tagOf(el);
  switch (type) {
    case 'text':
      return !SKIP_TAGS.has(tag) && tag !== 'img' && tag !== 'video' && tag !== 'iframe' && tag !== 'svg';
    case 'textarea':
    case 'richtext':
      return !SKIP_TAGS.has(tag) && tag !== 'img' && tag !== 'video' && tag !== 'iframe' && tag !== 'svg'
        && tag !== 'input' && tag !== 'textarea';
    case 'link': return tag === 'a';
    case 'image': return tag === 'img';
    case 'video': return tag === 'video';
    case 'embed': return tag === 'iframe';
    case 'icon': return tag === 'svg' || el.querySelector('svg') !== null;
    case 'bgImage': return findStyleBgUrl(el.getAttribute('style') ?? '') !== null;
    default: return false;
  }
}

function linkDefault(el: Element, withText: boolean): LinkValue {
  const value: LinkValue = {};
  if (withText) value.text = normText(el);
  value.href = el.getAttribute('href') ?? '';
  const target = el.getAttribute('target');
  if (target === '_blank' || target === '_self') value.target = target;
  return value;
}

function imageDefault(el: Element): MediaValue | null {
  const src = (el.getAttribute('src') ?? '').trim();
  const lazy = (el.getAttribute('data-src') ?? el.getAttribute('data-lazy-src') ?? '').trim();
  const chosen = lazy && (!src || /^data:/i.test(src)) ? lazy : src || lazy;
  if (!chosen) return null;
  return { src: chosen, alt: el.getAttribute('alt') ?? '' };
}

function videoDefault(el: Element): MediaValue | null {
  const own = (el.getAttribute('src') ?? '').trim();
  const source = el.querySelector('source[src]');
  const src = own || (source?.getAttribute('src') ?? '').trim();
  const poster = (el.getAttribute('poster') ?? '').trim();
  if (!src && !poster) return null;
  return { src, poster };
}

/** Default value of `el` as a field of `type`, or null when the element cannot carry it. */
function defaultFor(el: Element, type: FieldType, linkWithText: boolean): FieldValue | null {
  const tag = tagOf(el);
  switch (type) {
    case 'text':
    case 'textarea':
    case 'richtext': {
      if (tag === 'input' || tag === 'textarea') {
        if (type !== 'text') return null;
        const ph = (el.getAttribute('placeholder') ?? '').trim();
        return ph ? ph : null;
      }
      if (type === 'richtext') return el.innerHTML.trim();
      if (type === 'textarea') return brText(el);
      return normText(el);
    }
    case 'link': return tag === 'a' ? linkDefault(el, linkWithText) : null;
    case 'image': return tag === 'img' ? imageDefault(el) : null;
    case 'video': return tag === 'video' ? videoDefault(el) : null;
    case 'embed': {
      if (tag !== 'iframe') return null;
      const src = (el.getAttribute('src') ?? '').trim();
      return src && isEmbeddableUrl(src) ? { src } : null;
    }
    case 'bgImage': {
      const m = findStyleBgUrl(el.getAttribute('style') ?? '');
      return m ? { src: m.url } : null;
    }
    case 'icon': return { svg: '' }; // real value is read from the marker element in claim()
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Detection context and claiming
// ---------------------------------------------------------------------------

interface Ctx {
  root: Element;
  fields: FieldDef[];
  used: Set<string>;
  reserved: Set<string>;
  counter: number;
  warnings: string[];
  hintsOnly: boolean;
  limitWarned: boolean;
}

interface Meta {
  /** sanitised data-edit key (preferred id) */
  key?: string;
  /** existing data-cf (re-import) */
  cfId?: string;
  label?: string;
  group?: string;
}

const VALID_ID = /^[A-Za-z0-9_.-]+$/;

function maxAutoNumber(ids: Iterable<string>): number {
  const list = Array.from(ids);
  let max = 0;
  for (const id of list) {
    const m = /^f(\d+)$/.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

function allocId(ctx: Ctx, meta: Meta): string {
  const { cfId, key } = meta;
  if (cfId && VALID_ID.test(cfId) && !ctx.used.has(cfId)) {
    ctx.used.add(cfId);
    return cfId;
  }
  const taken = (id: string) => ctx.used.has(id) || ctx.reserved.has(id);
  if (key) {
    let id = key;
    for (let n = 2; taken(id); n += 1) id = `${key}-${n}`;
    ctx.used.add(id);
    return id;
  }
  let id: string;
  do {
    ctx.counter += 1;
    id = `f${ctx.counter}`;
  } while (taken(id));
  ctx.used.add(id);
  return id;
}

/** Resolves the element that carries the icon marker (wrapping the svg when needed). */
function iconMarker(ctx: Ctx, el: Element): Element {
  if (tagOf(el) !== 'svg') return el; // explicit wrapper
  const parent = el.parentElement;
  const usable =
    parent !== null &&
    parent !== ctx.root &&
    !parent.hasAttribute('data-cf') &&
    !ICON_PARENT_LINK_TAGS.has(tagOf(parent)) &&
    isOnlyContent(parent, el);
  if (usable) return parent as Element;
  const span = el.ownerDocument.createElement('span');
  span.setAttribute('style', 'display:contents');
  el.replaceWith(span);
  span.appendChild(el);
  return span;
}

/**
 * Turns `el` into a field of `type`: computes the default, allocates the id,
 * applies the data-cf marker and records the field. Returns the new field or null.
 */
function claim(ctx: Ctx, el: Element, type: FieldType, meta: Meta, linkWithText = false): FieldDef | null {
  if (ctx.fields.length >= CUSTOM_HTML_LIMITS.fields) {
    if (!ctx.limitWarned) {
      ctx.warnings.push(`Field limit reached (${CUSTOM_HTML_LIMITS.fields}); remaining elements were not detected.`);
      ctx.limitWarned = true;
    }
    return null;
  }
  const value = defaultFor(el, type, linkWithText);
  if (value === null) return null;

  const markEl = type === 'icon' ? iconMarker(ctx, el) : el;
  const defaultValue: FieldValue = type === 'icon' ? { svg: markEl.innerHTML.trim() } : value;

  const id = allocId(ctx, meta);
  const group = meta.group || groupFor(markEl);
  const label = meta.label ? truncate(meta.label, MAX_LABEL) : labelFor(markEl, type, ctx.fields, group);
  const field: FieldDef = { id, type, label, group, default: defaultValue };
  markEl.setAttribute('data-cf', id);
  ctx.fields.push(field);
  return field;
}

// ---------------------------------------------------------------------------
// Heuristics
// ---------------------------------------------------------------------------

interface Decision {
  type: FieldType;
  /** link: include the text part */
  linkWithText?: boolean;
  /** keep walking into the element's children after claiming */
  descend: boolean;
}

function textType(el: Element, info: ContentInfo): FieldType {
  if (!info.hasElements) return 'text';
  if (info.onlyBr && TEXTAREA_TAGS.has(tagOf(el))) return 'textarea';
  return 'richtext';
}

function iconHeuristic(ctx: Ctx, svg: Element): boolean {
  const parent = svg.parentElement;
  if (!parent) return false;
  if (ICON_PARENT_LINK_TAGS.has(tagOf(parent))) return true;
  return parent !== ctx.root && isOnlyContent(parent, svg);
}

function decide(ctx: Ctx, el: Element, explicit: boolean, requested: FieldType | null): Decision | null {
  const tag = tagOf(el);
  const info = contentInfo(el);

  if (requested) {
    if (requested === 'link') {
      const withText = info.phrasingOnly && info.hasText;
      return { type: 'link', linkWithText: withText, descend: !withText && info.hasElements };
    }
    const stops: FieldType[] = ['text', 'textarea', 'richtext', 'image', 'video', 'embed', 'icon'];
    return { type: requested, descend: !stops.includes(requested) };
  }

  switch (tag) {
    case 'img': return { type: 'image', descend: false };
    case 'video': return { type: 'video', descend: false };
    case 'iframe': {
      const src = (el.getAttribute('src') ?? '').trim();
      return src && isEmbeddableUrl(src) ? { type: 'embed', descend: false } : null;
    }
    case 'svg':
      return explicit || iconHeuristic(ctx, el) ? { type: 'icon', descend: false } : null;
    case 'a': {
      if (!el.hasAttribute('href')) break;
      const withText = info.phrasingOnly && info.hasText;
      return { type: 'link', linkWithText: withText, descend: !withText && info.hasElements };
    }
    case 'input':
    case 'textarea':
      if (!isBlank(el.getAttribute('placeholder') ?? '')) return { type: 'text', descend: false };
      break;
    default:
      break;
  }

  if (info.phrasingOnly && info.hasText) return { type: textType(el, info), descend: false };

  if (findStyleBgUrl(el.getAttribute('style') ?? '')) return { type: 'bgImage', descend: true };

  if (explicit) {
    // re-import: an icon wrapper (data-cf on an element that only contains an svg)
    const only = Array.from(el.children);
    if (only.length === 1 && tagOf(only[0]) === 'svg' && isOnlyContent(el, only[0])) {
      return { type: 'icon', descend: false };
    }
    // a bare data-cf on an empty element is a stale marker, not a field
    if (!el.hasAttribute('data-edit') && !el.hasAttribute('data-edit-type') && !info.hasText && !info.hasElements) {
      return null;
    }
    return { type: info.hasElements ? 'richtext' : 'text', descend: false };
  }
  return null;
}

function readMeta(el: Element): Meta {
  const key = sanitizeKey(el.getAttribute('data-edit') ?? '');
  const label = (el.getAttribute('data-edit-label') ?? '').trim();
  const group = (el.getAttribute('data-edit-group') ?? '').trim();
  const cf = (el.getAttribute('data-cf') ?? '').trim();
  return {
    key: key || undefined,
    cfId: cf || undefined,
    label: label || undefined,
    group: group ? truncate(group, MAX_GROUP) : undefined,
  };
}

function visitChildren(ctx: Ctx, parent: Element): void {
  const kids = Array.from(parent.children);
  const hasDirectText = Array.from(parent.childNodes).some((n) => n.nodeType === 3 && !isBlank(n.textContent ?? ''));
  const hasBlockChild = kids.some((k) => !PHRASING.has(tagOf(k)) && !SKIP_TAGS.has(tagOf(k)));
  const mixedParent = hasDirectText && hasBlockChild;
  for (const kid of kids) {
    // Phrasing children of a mixed-content parent belong to that mixed run.
    if (
      mixedParent &&
      PHRASING.has(tagOf(kid)) &&
      isPhrasingOnly(kid) &&
      !kid.hasAttribute('data-cf') &&
      !kid.hasAttribute('data-edit')
    ) {
      continue;
    }
    visit(ctx, kid);
  }
}

function visit(ctx: Ctx, el: Element): void {
  if (ctx.limitWarned) return;
  const tag = tagOf(el);
  if (SKIP_TAGS.has(tag)) return;
  if (el.hasAttribute('data-edit-ignore')) return;

  const explicit = el.hasAttribute('data-edit') || el.hasAttribute('data-cf') || el.hasAttribute('data-edit-type');

  if (ctx.hintsOnly && !explicit) {
    if (tag !== 'svg') visitChildren(ctx, el);
    return;
  }

  let requested: FieldType | null = null;
  const rawType = (el.getAttribute('data-edit-type') ?? '').trim();
  if (rawType) {
    if (MAPPABLE_TYPES.has(rawType) && canMarkAs(el, rawType as FieldType)) requested = rawType as FieldType;
    else
      ctx.warnings.push(
        `data-edit-type="${rawType}" is not valid on <${tag}>; the type was detected automatically instead.`
      );
  }

  const decision = decide(ctx, el, explicit, requested);
  let descend = tag !== 'svg';
  if (decision) {
    const field = claim(ctx, el, decision.type, readMeta(el), decision.linkWithText === true);
    if (field) descend = decision.descend;
  }
  if (descend && tag !== 'svg') visitChildren(ctx, el);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function stripHintAttributes(root: Element): void {
  root.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-edit')) el.removeAttribute(attr.name);
    }
  });
}

export function detectFields(html: string, opts: DetectOptions = {}): DetectResult {
  const doc = new DOMParser().parseFromString(`<!DOCTYPE html><html><body>${html}</body></html>`, 'text/html');
  const root = doc.body;

  let hasHints = false;
  const reserved = new Set<string>();
  root.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('data-edit')) hasHints = true;
    }
    const cf = el.getAttribute('data-cf');
    if (cf) reserved.add(cf.trim());
  });

  const warnings: string[] = [];
  if (root.querySelector('[data-edit-repeat]')) {
    warnings.push('data-edit-repeat (repeaters) is not supported yet and was ignored.');
  }

  const ctx: Ctx = {
    root,
    fields: [],
    used: new Set(),
    reserved,
    counter: 0,
    warnings,
    hintsOnly: opts.hintsOnly === true,
    limitWarned: false,
  };

  visitChildren(ctx, root);

  // data-cf markers whose element was not (re)claimed are stale.
  root.querySelectorAll('[data-cf]').forEach((el) => {
    const id = el.getAttribute('data-cf') ?? '';
    if (!ctx.fields.some((f) => f.id === id)) el.removeAttribute('data-cf');
  });

  stripHintAttributes(root);
  return { root, fields: ctx.fields, hasHints, warnings };
}

function ctxForRoot(root: Element, fields: FieldDef[]): Ctx {
  const used = new Set(fields.map((f) => f.id));
  root.querySelectorAll('[data-cf]').forEach((el) => used.add(el.getAttribute('data-cf') ?? ''));
  return {
    root,
    fields: [...fields],
    used,
    reserved: new Set(),
    counter: maxAutoNumber(used),
    warnings: [],
    hintsOnly: false,
    limitWarned: false,
  };
}

function sortByDom(root: Element, fields: FieldDef[]): FieldDef[] {
  const order = new Map<string, number>();
  Array.from(root.querySelectorAll('[data-cf]')).forEach((el, i) => order.set(el.getAttribute('data-cf') ?? '', i));
  return fields
    .map((f, i) => ({ f, i }))
    .sort((a, b) => (order.get(a.f.id) ?? Infinity) - (order.get(b.f.id) ?? Infinity) || a.i - b.i)
    .map((x) => x.f);
}

/** Wraps the first not-yet-mapped run of text/phrasing nodes of `el` in a <span>; returns the span. */
function wrapFirstTextRun(el: Element): Element | null {
  const nodes = Array.from(el.childNodes);
  let run: Node[] = [];
  const flush = (): Element | null => {
    if (run.some((n) => !isBlank(n.textContent ?? ''))) {
      const span = el.ownerDocument.createElement('span');
      el.insertBefore(span, run[0]);
      run.forEach((n) => span.appendChild(n));
      return span;
    }
    run = [];
    return null;
  };
  for (const node of nodes) {
    const isRunNode =
      node.nodeType === 3 ||
      (node.nodeType === 1 &&
        PHRASING.has(tagOf(node as Element)) &&
        !(node as Element).hasAttribute('data-cf') &&
        !(node as Element).querySelector('[data-cf]') &&
        isPhrasingOnly(node as Element));
    if (isRunNode) {
      run.push(node);
    } else if (node.nodeType !== 8) {
      const span = flush();
      if (span) return span;
      run = [];
    } else if (run.length) {
      run.push(node); // comments inside a run stay with it
    }
  }
  return flush();
}

/**
 * Click-to-map: marks `el` as a field of `type`. Returns the updated field list
 * (unchanged when the element cannot be mapped as that type). For text types on
 * mixed-content elements the first unmapped text run is wrapped in <span data-cf>
 * (see MIXED_RUN_WARNING).
 */
export function markElementAsField(root: Element, el: Element, type: FieldType, fields: FieldDef[]): FieldDef[] {
  if (el === root || !root.contains(el)) return fields;
  if (!MAPPABLE_TYPES.has(type) || !canMarkAs(el, type)) return fields;

  const isTextual = type === 'text' || type === 'textarea' || type === 'richtext';
  const swallowing = isTextual || type === 'icon' ? el.querySelector('[data-cf]') !== null : false;

  // A content-claiming ancestor would already own this element.
  for (let anc = el.parentElement; anc && anc !== root; anc = anc.parentElement) {
    const id = anc.getAttribute('data-cf');
    if (!id) continue;
    const f = fields.find((x) => x.id === id);
    const withText = f?.type === 'link' && typeof (f.default as LinkValue).text === 'string';
    if (f && (CONTENT_CLAIMING.has(f.type) || withText)) return fields;
  }

  let target = el;
  if (isTextual && el.tagName.toLowerCase() !== 'input' && el.tagName.toLowerCase() !== 'textarea') {
    if (!isPhrasingOnly(el) || swallowing) {
      const span = wrapFirstTextRun(el);
      if (!span) return fields;
      target = span;
    }
  } else if (swallowing) {
    return fields;
  }

  let base = fields;
  const oldId = target.getAttribute('data-cf');
  if (oldId) {
    target.removeAttribute('data-cf');
    base = fields.filter((f) => f.id !== oldId);
  }

  const ctx = ctxForRoot(root, base);
  const info = contentInfo(target);
  const linkWithText = type === 'link' && info.phrasingOnly && info.hasText;
  const field = claim(ctx, target, type, {}, linkWithText);
  if (!field) {
    // restore the marker when the element could not be re-mapped
    if (oldId) target.setAttribute('data-cf', oldId);
    return fields;
  }
  return sortByDom(root, ctx.fields);
}

/** Removes a field and its data-cf marker (unwrapping generated wrapper spans). */
export function unmarkField(root: Element, fieldId: string, fields: FieldDef[]): FieldDef[] {
  const el = Array.from(root.querySelectorAll('[data-cf]')).find((e) => e.getAttribute('data-cf') === fieldId);
  if (el) {
    el.removeAttribute('data-cf');
    const style = (el.getAttribute('style') ?? '').replace(/\s+/g, '').toLowerCase();
    const generated =
      tagOf(el) === 'span' &&
      Array.from(el.attributes).every((a) => a.name === 'style' || a.name === 'data-cf') &&
      (el.attributes.length === 0 || style === 'display:contents;' || style === 'display:contents');
    if (generated) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        parent.normalize();
      }
    }
  }
  return fields.filter((f) => f.id !== fieldId);
}
