/**
 * Custom HTML section — editable-field detection (spec §6.1, §6.2, §6.4, §6.5).
 *
 * Runs in the admin's browser (DOMParser) and in vitest/jsdom.
 * CSS-sourced fields (backgrounds, colours) are found after compilation by tokenize.ts.
 */
import {
  CUSTOM_HTML_LIMITS,
  REPEATER_ITEM_ATTR as ITEM_ATTR,
  parseRepeaterPath,
  repeaterChildPath,
  type DetectOptions,
  type DetectResult,
  type FieldDef,
  type FieldType,
  type FieldValue,
  type LinkValue,
  type MediaValue,
  type RepeaterItem,
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
/** Elements that belong to a field or a repeater item. */
const MARKED = `[data-cf], [${ITEM_ATTR}]`;

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
    case 'repeater': return 'List';
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
  /** true while detecting the fields of one repeater item (repeaters do not nest) */
  inItem: boolean;
  /** repeater children recorded outside `fields`; they count towards the field limit */
  childCount: number;
  maxFields: number;
  /** wrapper spans created around icons */
  generated: Set<Element>;
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
  const span = wrapIcon(el);
  ctx.generated.add(span);
  return span;
}

function wrapIcon(svg: Element): Element {
  const span = svg.ownerDocument.createElement('span');
  span.setAttribute('style', 'display:contents');
  svg.replaceWith(span);
  span.appendChild(svg);
  return span;
}

/**
 * Turns `el` into a field of `type`: computes the default, allocates the id,
 * applies the data-cf marker and records the field. Returns the new field or null.
 */
function claim(ctx: Ctx, el: Element, type: FieldType, meta: Meta, linkWithText = false): FieldDef | null {
  if (ctx.fields.length + ctx.childCount >= ctx.maxFields) {
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
  const plans = ctx.inItem ? [] : planRepeaters(ctx, parent);
  const kids = Array.from(parent.children);
  const hasDirectText = Array.from(parent.childNodes).some((n) => n.nodeType === 3 && !isBlank(n.textContent ?? ''));
  const hasBlockChild = kids.some((k) => !PHRASING.has(tagOf(k)) && !SKIP_TAGS.has(tagOf(k)));
  const mixedParent = hasDirectText && hasBlockChild;
  const repeated = new Set<Element>();
  for (const kid of kids) {
    if (repeated.has(kid)) continue;
    const plan = plans.find((p) => p.items[0] === kid);
    if (plan && claimRepeater(ctx, parent, plan)) {
      plan.items.forEach((item) => repeated.add(item));
      continue;
    }
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

  // A container whose data-cf names one of its own item groups only marks the repeater (re-import).
  const itemIds = ctx.inItem ? [] : repeaterItemIds(el);
  const ownCf = el.getAttribute('data-cf');
  if (ownCf && itemIds.includes(ownCf)) el.removeAttribute('data-cf');
  const repeaterHost = itemIds.length > 0 || (!ctx.inItem && el.hasAttribute('data-edit-repeat'));

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

  // A repeater container never claims its content; it may still carry a link or background field.
  const decision = repeaterHost ? hostDecision(el) : decide(ctx, el, explicit, requested);
  let descend = tag !== 'svg';
  if (decision) {
    const field = claim(ctx, el, decision.type, readMeta(el), decision.linkWithText === true);
    if (field) descend = decision.descend;
  }
  if (descend && tag !== 'svg') visitChildren(ctx, el);
}

// ---------------------------------------------------------------------------
// Repeaters (spec §6.5)
// ---------------------------------------------------------------------------

/** A container needs this share of structurally identical element children to be a repeater. */
const REPEAT_RATIO = 0.8;
const SIGNATURE_DEPTH = 3;
/** Attributes whose values may differ between items without any effect (the renderer drops them). */
const IGNORED_ITEM_ATTRS = new Set(['data-cf', ITEM_ATTR, 'srcset', 'sizes', 'data-srcset']);

interface RepeaterPlan {
  /** item root elements, in document order */
  items: Element[];
  /** hint or re-import: detect even when the items differ */
  explicit: boolean;
  /** re-import: the data-cf-item value of the items */
  cfId?: string;
  /** data-edit-repeat value */
  key?: string;
}

const elementChildren = (el: Element): Element[] =>
  Array.from(el.children).filter((c) => !SKIP_TAGS.has(tagOf(c)));

/** Distinct data-cf-item values among the element children. */
function repeaterItemIds(el: Element): string[] {
  const ids: string[] = [];
  for (const child of Array.from(el.children)) {
    const id = child.getAttribute(ITEM_ATTR);
    if (id && VALID_ID.test(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

function hostDecision(el: Element): Decision | null {
  if (tagOf(el) === 'a' && el.hasAttribute('href')) return { type: 'link', linkWithText: false, descend: true };
  if (findStyleBgUrl(el.getAttribute('style') ?? '')) return { type: 'bgImage', descend: true };
  return null;
}

/** Child tag sequence down to `depth`; inline formatting is ignored (it varies with the text). */
function childShape(el: Element, depth: number): string {
  if (depth >= SIGNATURE_DEPTH || tagOf(el) === 'svg') return '';
  const kids = elementChildren(el).filter((c) => !(PHRASING.has(tagOf(c)) && c.attributes.length === 0));
  return `(${kids.map((c) => tagOf(c) + childShape(c, depth + 1)).join(',')})`;
}

/** tag + sorted classes + child-tag sequence, depth 3. */
function signature(el: Element): string {
  const classes = (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort().join('.');
  return `${tagOf(el)}.${classes}${childShape(el, 1)}`;
}

function largestGroup(list: Element[], keyOf: (el: Element) => string): Element[] {
  const groups = new Map<string, Element[]>();
  for (const el of list) {
    const key = keyOf(el);
    const group = groups.get(key);
    if (group) group.push(el);
    else groups.set(key, [el]);
  }
  return Array.from(groups.values()).reduce<Element[]>((best, g) => (g.length > best.length ? g : best), []);
}

function hasMarkerOrHint(el: Element): boolean {
  return [el, ...Array.from(el.querySelectorAll('*'))].some((node) =>
    Array.from(node.attributes).some((a) => a.name === 'data-cf' || a.name.startsWith('data-edit'))
  );
}

const canRepeat = (el: Element): boolean => tagOf(el) !== 'svg' && !el.hasAttribute('data-edit-ignore');

function heuristicPlan(parent: Element): RepeaterPlan | null {
  const kids = elementChildren(parent);
  if (kids.length < 2) return null;
  const items = largestGroup(kids.filter(canRepeat), signature);
  if (items.length < 2 || items.length / kids.length < REPEAT_RATIO) return null;
  // the items become one block, so nothing else may sit between them
  const first = kids.indexOf(items[0]);
  if (items.some((item, i) => kids[first + i] !== item)) return null;
  for (let n: Node | null = items[0]; n && n !== items[items.length - 1]; n = n.nextSibling) {
    if (n.nodeType === 3 && !isBlank(n.textContent ?? '')) return null;
  }
  // already mapped (re-import) or hinted content keeps its own fields
  if (items.some(hasMarkerOrHint)) return null;
  return { items, explicit: false };
}

function hintPlan(ctx: Ctx, parent: Element): RepeaterPlan | null {
  const kids = elementChildren(parent);
  const tag = tagOf(largestGroup(kids.filter(canRepeat), tagOf)[0] ?? parent);
  let items: Element[] = [];
  let run: Element[] = [];
  for (const kid of kids) {
    if (canRepeat(kid) && tagOf(kid) === tag) {
      run.push(kid);
      if (run.length > items.length) items = run;
    } else run = [];
  }
  if (!items.length) {
    ctx.warnings.push('A data-edit-repeat container has no repeatable child elements and was ignored.');
    return null;
  }
  const skipped = kids.length - items.length;
  if (skipped > 0) {
    ctx.warnings.push(`${skipped} child element(s) of a data-edit-repeat container are not part of the repeated items.`);
  }
  const key = sanitizeKey(parent.getAttribute('data-edit-repeat') ?? '');
  return { items, explicit: true, key: key || undefined };
}

function planRepeaters(ctx: Ctx, parent: Element): RepeaterPlan[] {
  if (parent === ctx.root) return [];
  const ids = repeaterItemIds(parent);
  if (ids.length) {
    return ids.map((cfId) => ({
      items: elementChildren(parent).filter((c) => c.getAttribute(ITEM_ATTR) === cfId),
      explicit: true,
      cfId,
    }));
  }
  if (parent.hasAttribute('data-edit-repeat')) {
    const plan = hintPlan(ctx, parent);
    return plan ? [plan] : [];
  }
  if (ctx.hintsOnly) return [];
  const plan = heuristicPlan(parent);
  return plan ? [plan] : [];
}

/** Child-element indexes leading from `from` down to `el`. */
function pathWithin(from: Element, el: Element): number[] {
  const path: number[] = [];
  for (let cur: Element = el; cur !== from && cur.parentElement; cur = cur.parentElement) {
    path.unshift(Array.prototype.indexOf.call(cur.parentElement.children, cur));
  }
  return path;
}

function elementAt(from: Element, path: number[]): Element | null {
  let cur: Element | null = from;
  for (const i of path) cur = cur?.children[i] ?? null;
  return cur;
}

const isTextType = (type: FieldType): boolean => type === 'text' || type === 'textarea' || type === 'richtext';
const TEXT_RANK: Partial<Record<FieldType, number>> = { text: 0, textarea: 1, richtext: 2 };

function emptyValue(type: FieldType, linkWithText: boolean): FieldValue {
  switch (type) {
    case 'link': return linkWithText ? { text: '', href: '' } : { href: '' };
    case 'image': return { src: '', alt: '' };
    case 'video': return { src: '', poster: '' };
    case 'embed':
    case 'bgImage': return { src: '' };
    case 'icon': return { svg: '' };
    default: return '';
  }
}

/** Value of one item's element for a child field; `ok` is false when the element cannot carry it. */
function itemValue(el: Element, type: FieldType, linkWithText: boolean): { value: FieldValue; ok: boolean } {
  const tag = tagOf(el);
  const empty = { value: emptyValue(type, linkWithText), ok: false };
  switch (type) {
    case 'text':
    case 'textarea':
    case 'richtext':
      if (tag === 'input' || tag === 'textarea') return { value: el.getAttribute('placeholder')?.trim() ?? '', ok: true };
      if (!isPhrasingOnly(el)) return empty;
      if (type === 'richtext') return { value: el.innerHTML.trim(), ok: true };
      return { value: type === 'textarea' ? brText(el) : normText(el), ok: true };
    case 'link':
      if (tag !== 'a' || (linkWithText && !isPhrasingOnly(el))) return empty;
      return { value: linkDefault(el, linkWithText), ok: true };
    case 'image':
      if (tag !== 'img') return empty;
      return { value: imageDefault(el) ?? { src: '', alt: el.getAttribute('alt') ?? '' }, ok: true };
    case 'video':
      return tag === 'video' ? { value: videoDefault(el) ?? { src: '', poster: '' }, ok: true } : empty;
    case 'icon':
      return el.querySelector('svg') ? { value: { svg: el.innerHTML.trim() }, ok: true } : empty;
    case 'embed':
    case 'bgImage': {
      const value = defaultFor(el, type, false);
      return value === null ? empty : { value, ok: true };
    }
    default:
      return empty;
  }
}

interface ChildSpec {
  path: number[];
  type: FieldType;
  linkWithText: boolean;
  /** the first item's element is a wrapper span created for an icon */
  wrapped: boolean;
  /** type set by data-edit-type: never widened */
  forced: boolean;
}

interface AlignedChild {
  type: FieldType;
  elements: (Element | null)[];
  values: FieldValue[];
  /** every item can carry the field */
  complete: boolean;
}

/** Finds the element at the same position in every item and reads its value. */
function alignChild(items: Element[], spec: ChildSpec): AlignedChild {
  const first = elementAt(items[0], spec.path) as Element;
  const elements = items.map((item) => {
    let el = elementAt(item, spec.path);
    if (el && spec.wrapped && tagOf(el) === 'svg') el = wrapIcon(el);
    return el && tagOf(el) === tagOf(first) ? el : null;
  });
  let type = spec.type;
  if (isTextType(type) && !spec.forced) {
    // text in one item may need formatting that another does not
    for (const el of elements) {
      if (!el || tagOf(el) === 'input' || tagOf(el) === 'textarea' || !isPhrasingOnly(el)) continue;
      const needed = textType(el, contentInfo(el));
      if ((TEXT_RANK[needed] ?? 0) > (TEXT_RANK[type] ?? 0)) type = needed;
    }
  }
  let complete = true;
  const values = elements.map((el) => {
    const read = el ? itemValue(el, type, spec.linkWithText) : { value: emptyValue(type, spec.linkWithText), ok: false };
    if (!read.ok) complete = false;
    return read.value;
  });
  return { type, elements, values, complete };
}

/** Removes from `el` everything a field of this type would replace. */
function blankField(el: Element, type: FieldType, linkWithText: boolean): void {
  const drop = (target: Element, names: string[]) => names.forEach((n) => target.removeAttribute(n));
  const tag = tagOf(el);
  switch (type) {
    case 'text':
    case 'textarea':
    case 'richtext':
      if (tag === 'input' || tag === 'textarea') drop(el, ['placeholder']);
      else el.textContent = '';
      break;
    case 'link':
      drop(el, ['href', 'target', 'rel']);
      if (linkWithText) el.textContent = '';
      break;
    case 'image': drop(el, ['src', 'alt', 'data-src', 'data-lazy-src']); break;
    case 'video': {
      const source = el.hasAttribute('src') ? null : el.querySelector('source[src]');
      if (source) drop(source, ['src', 'type']);
      drop(el, ['src', 'poster']);
      break;
    }
    case 'embed': drop(el, ['src']); break;
    case 'icon': el.textContent = ''; break;
    case 'bgImage': {
      const style = el.getAttribute('style') ?? '';
      const m = findStyleBgUrl(style);
      if (m) el.setAttribute('style', style.slice(0, m.start) + style.slice(m.end));
      break;
    }
    default: break;
  }
}

/** Canonical form of the parts of an item that are not editable. */
function skeleton(el: Element): string {
  const attrs = Array.from(el.attributes)
    .filter((a) => !IGNORED_ITEM_ATTRS.has(a.name) && !a.name.startsWith('data-edit'))
    .map((a) => [a.name, a.name === 'class' ? a.value.split(/\s+/).filter(Boolean).sort().join(' ') : a.value.trim()])
    .sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const children: string[] = [];
  el.childNodes.forEach((n) => {
    if (n.nodeType === 1) children.push(skeleton(n as Element));
    else if (n.nodeType === 3 && !isBlank(n.textContent ?? '')) {
      children.push(JSON.stringify((n.textContent ?? '').replace(/\s+/g, ' ').trim()));
    }
  });
  return `${tagOf(el)}${JSON.stringify(attrs)}[${children.join(',')}]`;
}

function allocRepeaterId(used: Set<string>, reserved: Set<string>, plan: RepeaterPlan): string {
  if (plan.cfId && !used.has(plan.cfId)) return plan.cfId;
  const taken = (id: string) => used.has(id) || reserved.has(id);
  if (plan.key) {
    let id = plan.key;
    for (let n = 2; taken(id); n += 1) id = `${plan.key}-${n}`;
    return id;
  }
  let n = 1;
  while (taken(`r${n}`)) n += 1;
  return `r${n}`;
}

/** Turns the markers of a re-imported item back into plain child ids. */
function normalizeItemMarkers(item: Element, repeaterId: string): void {
  [item, ...Array.from(item.querySelectorAll('[data-cf]'))].forEach((el) => {
    const parsed = parseRepeaterPath(el.getAttribute('data-cf') ?? '');
    if (parsed && parsed.repeaterId === repeaterId) el.setAttribute('data-cf', parsed.childId);
  });
}

/** Short labels for repeater children: "Title", or "Text 1", "Text 2" when a role repeats. */
function childLabels(fields: FieldDef[], elements: Element[]): string[] {
  const roles = fields.map((f, i) => roleFor(elements[i], f.type));
  return fields.map((f, i) => {
    if (elements[i].hasAttribute('data-edit-label')) return f.label;
    if (roles.filter((r) => r === roles[i]).length < 2) return roles[i];
    return `${roles[i]} ${roles.slice(0, i + 1).filter((r) => r === roles[i]).length}`;
  });
}

/**
 * Records `plan` as one repeater field: the first item defines the child fields, every item supplies a
 * default entry. Works on copies of the items, so a rejected plan leaves the DOM untouched.
 */
function claimRepeater(ctx: Ctx, host: Element, plan: RepeaterPlan): boolean {
  const reject = (warning?: string): false => {
    if (warning) ctx.warnings.push(warning);
    // explicit items that stay static lose their repeater markers
    if (plan.cfId) {
      for (const item of plan.items) {
        normalizeItemMarkers(item, plan.cfId);
        item.removeAttribute(ITEM_ATTR);
      }
    }
    return false;
  };
  if (plan.items.length > CUSTOM_HTML_LIMITS.repeaterItems) {
    return reject(`A list of ${plan.items.length} items exceeds the limit of ${CUSTOM_HTML_LIMITS.repeaterItems} and was not made a repeater.`);
  }
  const budget = ctx.maxFields - ctx.fields.length - ctx.childCount - 1;
  if (budget < 1) return reject();

  const items = plan.items.map((item) => item.cloneNode(true) as Element);
  for (const item of items) {
    if (plan.cfId) normalizeItemMarkers(item, plan.cfId);
    item.removeAttribute(ITEM_ATTR);
  }

  const used = new Set(ctx.used);
  const repeaterId = allocRepeaterId(used, ctx.reserved, plan);
  used.add(repeaterId);
  const first = items[0];
  const firstElements = [first, ...Array.from(first.querySelectorAll('*'))];
  const sub: Ctx = {
    ...ctx,
    fields: [],
    used,
    warnings: [],
    // a hinted list with no hints on its items still edits their content
    hintsOnly: ctx.hintsOnly && firstElements.some((e) => e.hasAttribute('data-edit') || e.hasAttribute('data-cf')),
    limitWarned: false,
    inItem: true,
    childCount: 0,
    maxFields: budget,
    generated: new Set(),
  };
  visit(sub, first);
  if (!sub.fields.length) {
    return reject(plan.explicit ? 'A repeater has no editable content in its first item and was ignored.' : undefined);
  }

  const marked = [first, ...Array.from(first.querySelectorAll('[data-cf]'))];
  const sources = sub.fields.map((f) => marked.find((e) => e.getAttribute('data-cf') === f.id) as Element);
  const specs: ChildSpec[] = sub.fields.map((f, i) => ({
    path: pathWithin(first, sources[i]),
    type: f.type,
    linkWithText: f.type === 'link' && typeof (f.default as LinkValue).text === 'string',
    wrapped: sub.generated.has(sources[i]),
    forced: sources[i].hasAttribute('data-edit-type'),
  }));
  const aligned = specs.map((spec) => alignChild(items, spec));
  const complete = aligned.every((a) => a.complete);

  const blanked = items.map((item) => {
    const copy = item.cloneNode(true) as Element;
    // resolve every path before blanking: blanking removes descendants
    const targets = specs.map((s) => elementAt(copy, s.path));
    targets.forEach((el, i) => el && blankField(el, aligned[i].type, specs[i].linkWithText));
    return copy;
  });
  const model = skeleton(blanked[0]);
  const differs = blanked.some((b) => skeleton(b) !== model);
  // without a hint, a repeater must not change how any item looks or behaves
  if (!plan.explicit && (!complete || differs)) return reject();

  const labels = childLabels(sub.fields, sources);
  const group = (host.getAttribute('data-edit-group') ?? '').trim();
  const repeaterGroup = group ? truncate(group, MAX_GROUP) : groupFor(plan.items[0]);
  const hostLabel = (host.getAttribute('data-edit-label') ?? '').trim();
  const label = hostLabel ? truncate(hostLabel, MAX_LABEL) : labelFor(plan.items[0], 'repeater', ctx.fields, repeaterGroup);

  if (!complete) {
    ctx.warnings.push(`Some items of the list "${label}" do not contain every field of the first item; the missing values start empty.`);
  }
  if (differs) {
    ctx.warnings.push(
      `Items of the list "${label}" differ in markup that is not editable (classes, styles, attributes or fixed text); every item will use the markup of the first one.`
    );
  }
  if (items.some((item) => item.querySelector('[data-edit-repeat]'))) {
    ctx.warnings.push('Nested data-edit-repeat containers are not supported and were ignored.');
  }

  const children: FieldDef[] = sub.fields.map((f, i) => ({
    id: f.id,
    type: aligned[i].type,
    label: labels[i],
    default: aligned[i].values[0],
  }));
  const defaults: RepeaterItem[] = items.map((_, n) => {
    const record: RepeaterItem = {};
    children.forEach((child, i) => {
      record[child.id] = aligned[i].values[n];
    });
    return record;
  });

  items.forEach((item, n) => {
    [item, ...Array.from(item.querySelectorAll('*'))].forEach((el) => {
      el.removeAttribute('data-cf');
      el.removeAttribute(ITEM_ATTR);
    });
    item.setAttribute(ITEM_ATTR, repeaterId);
    children.forEach((child, i) => aligned[i].elements[n]?.setAttribute('data-cf', repeaterChildPath(repeaterId, child.id)));
    plan.items[n].replaceWith(item);
  });
  if (host !== ctx.root && !host.hasAttribute('data-cf')) host.setAttribute('data-cf', repeaterId);

  sub.used.forEach((id) => ctx.used.add(id));
  ctx.counter = sub.counter;
  ctx.warnings.push(...sub.warnings);
  ctx.childCount += children.length;
  ctx.fields.push({ id: repeaterId, type: 'repeater', label, group: repeaterGroup, default: defaults, children });
  return true;
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
    for (const marker of [el.getAttribute('data-cf'), el.getAttribute(ITEM_ATTR)]) {
      const id = (marker ?? '').trim();
      if (!id) continue;
      const child = parseRepeaterPath(id);
      if (child) reserved.add(child.repeaterId).add(child.childId);
      else reserved.add(id);
    }
  });

  const warnings: string[] = [];
  const ctx: Ctx = {
    root,
    fields: [],
    used: new Set(),
    reserved,
    counter: 0,
    warnings,
    hintsOnly: opts.hintsOnly === true,
    limitWarned: false,
    inItem: false,
    childCount: 0,
    maxFields: CUSTOM_HTML_LIMITS.fields,
    generated: new Set(),
  };

  visitChildren(ctx, root);
  removeStaleMarkers(root, ctx.fields);

  stripHintAttributes(root);
  return { root, fields: ctx.fields, hasHints, warnings };
}

/** Drops data-cf / data-cf-item markers whose element was not (re)claimed. */
function removeStaleMarkers(root: Element, fields: FieldDef[]): void {
  const paths = new Set<string>();
  const repeaters = new Set<string>();
  for (const f of fields) {
    paths.add(f.id);
    if (f.type !== 'repeater') continue;
    repeaters.add(f.id);
    for (const child of f.children ?? []) paths.add(repeaterChildPath(f.id, child.id));
  }
  root.querySelectorAll('[data-cf]').forEach((el) => {
    if (!paths.has(el.getAttribute('data-cf') ?? '')) el.removeAttribute('data-cf');
  });
  root.querySelectorAll(`[${ITEM_ATTR}]`).forEach((el) => {
    if (!repeaters.has(el.getAttribute(ITEM_ATTR) ?? '')) el.removeAttribute(ITEM_ATTR);
  });
}

/** Every field id, including repeater children. */
function allFieldIds(fields: FieldDef[]): string[] {
  const ids: string[] = [];
  for (const f of fields) {
    ids.push(f.id);
    if (f.children) ids.push(...allFieldIds(f.children));
  }
  return ids;
}

function ctxForRoot(root: Element, fields: FieldDef[]): Ctx {
  const ids = allFieldIds(fields);
  const used = new Set(ids);
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
    inItem: false,
    childCount: ids.length - fields.length,
    maxFields: CUSTOM_HTML_LIMITS.fields,
    generated: new Set(),
  };
}

function sortByDom(root: Element, fields: FieldDef[]): FieldDef[] {
  const order = new Map<string, number>();
  // a repeater without a container marker sorts at its first item
  Array.from(root.querySelectorAll(MARKED)).forEach((el, i) => {
    for (const id of [el.getAttribute('data-cf'), el.getAttribute(ITEM_ATTR)]) {
      if (id && !order.has(id)) order.set(id, i);
    }
  });
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
        !(node as Element).matches(MARKED) &&
        !(node as Element).querySelector(MARKED) &&
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

/** True when an element above `el`, up to and including `stop`, owns the content of `el`. */
function claimedByAncestor(el: Element, stop: Element, fieldFor: (marker: string) => FieldDef | undefined): boolean {
  let anc = el === stop ? null : el.parentElement;
  while (anc) {
    const marker = anc.getAttribute('data-cf');
    const f = marker ? fieldFor(marker) : undefined;
    const withText = f?.type === 'link' && typeof (f.default as LinkValue).text === 'string';
    if (f && (CONTENT_CLAIMING.has(f.type) || withText)) return true;
    anc = anc === stop ? null : anc.parentElement;
  }
  return false;
}

const isFormControl = (el: Element): boolean => tagOf(el) === 'input' || tagOf(el) === 'textarea';

/**
 * Click-to-map inside a repeater item: adds (or re-types) a child field on the element at the same
 * position of every item. Mixed-content runs are not wrapped inside items.
 */
function markItemField(
  root: Element,
  itemRoot: Element,
  el: Element,
  type: FieldType,
  fields: FieldDef[],
  repeater: FieldDef
): FieldDef[] {
  const children = repeater.children ?? [];
  const parent = itemRoot.parentElement as Element;
  const items = Array.from(parent.children).filter((c) => c.getAttribute(ITEM_ATTR) === repeater.id);
  const childFor = (marker: string) => {
    const parsed = parseRepeaterPath(marker);
    return parsed?.repeaterId === repeater.id ? children.find((c) => c.id === parsed.childId) : undefined;
  };
  if (claimedByAncestor(el, itemRoot, childFor)) return fields;

  const isTextual = isTextType(type);
  if ((isTextual || type === 'icon') && el.querySelector(MARKED)) return fields;
  if (isTextual && !isFormControl(el) && !isPhrasingOnly(el)) return fields;
  // an svg that is itself the item root cannot be wrapped
  if (type === 'icon' && el === itemRoot && tagOf(el) === 'svg') return fields;

  const first = elementAt(items[0], pathWithin(itemRoot, el));
  if (!first || tagOf(first) !== tagOf(el)) return fields;

  const ctx = ctxForRoot(root, fields);
  const old = childFor(first.getAttribute('data-cf') ?? '');
  if (!old && ctx.fields.length + ctx.childCount >= ctx.maxFields) return fields;
  const info = contentInfo(first);
  const linkWithText = type === 'link' && info.phrasingOnly && info.hasText;
  if (defaultFor(first, type, linkWithText) === null) return fields;

  const target = type === 'icon' ? iconMarker({ ...ctx, root: parent }, first) : first;
  const aligned = alignChild(items, {
    path: pathWithin(items[0], target),
    type,
    linkWithText,
    wrapped: ctx.generated.has(target),
    forced: true,
  });

  const id = old ? old.id : allocId(ctx, {});
  const sameRole = children.filter((c) => c.type === aligned.type && c.id !== id).length;
  const role = roleFor(target, aligned.type);
  const child: FieldDef = {
    id,
    type: aligned.type,
    label: old ? old.label : sameRole ? `${role} ${sameRole + 1}` : role,
    ...(old?.hidden !== undefined ? { hidden: old.hidden } : {}),
    default: aligned.values[0],
  };
  const marker = repeaterChildPath(repeater.id, id);
  aligned.elements.forEach((element) => element?.setAttribute('data-cf', marker));

  const inFirst = [items[0], ...Array.from(items[0].querySelectorAll('[data-cf]'))];
  const order = (c: FieldDef) => {
    const at = inFirst.findIndex((e) => e.getAttribute('data-cf') === repeaterChildPath(repeater.id, c.id));
    return at === -1 ? inFirst.length : at;
  };
  const nextChildren = [...children.filter((c) => c.id !== id), child].sort((a, b) => order(a) - order(b));
  const defaults = (repeater.default as RepeaterItem[]).map((record, n) => ({
    ...record,
    [id]: aligned.values[n] ?? aligned.values[0],
  }));
  return fields.map((f) => (f.id === repeater.id ? { ...f, children: nextChildren, default: defaults } : f));
}

/**
 * Click-to-map: marks `el` as a field of `type`. Returns the updated field list
 * (unchanged when the element cannot be mapped as that type). For text types on
 * mixed-content elements the first unmapped text run is wrapped in <span data-cf>
 * (see MIXED_RUN_WARNING). Elements inside a repeater item become child fields.
 */
export function markElementAsField(root: Element, el: Element, type: FieldType, fields: FieldDef[]): FieldDef[] {
  if (el === root || !root.contains(el)) return fields;
  if (!MAPPABLE_TYPES.has(type) || !canMarkAs(el, type)) return fields;

  const repeaterOf = (id: string | null) => fields.find((f) => f.id === id && f.type === 'repeater');
  const itemRoot = el.closest(`[${ITEM_ATTR}]`);
  if (itemRoot && root.contains(itemRoot)) {
    const repeater = repeaterOf(itemRoot.getAttribute(ITEM_ATTR));
    if (repeater) return markItemField(root, itemRoot, el, type, fields, repeater);
  }

  const isTextual = isTextType(type);
  const swallowing = isTextual || type === 'icon' ? el.querySelector(MARKED) !== null : false;

  // A content-claiming ancestor would already own this element.
  if (claimedByAncestor(el, root, (id) => fields.find((x) => x.id === id))) return fields;

  let target = el;
  if (isTextual && !isFormControl(el)) {
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
    // a repeater container marker can be taken over: the items identify the repeater
    if (!repeaterOf(oldId)) base = fields.filter((f) => f.id !== oldId);
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

/** Removes the data-cf marker of an element, unwrapping it when it is a generated wrapper span. */
function removeMarker(el: Element): void {
  el.removeAttribute('data-cf');
  const style = (el.getAttribute('style') ?? '').replace(/\s+/g, '').toLowerCase();
  const generated =
    tagOf(el) === 'span' &&
    Array.from(el.attributes).every((a) => a.name === 'style') &&
    (el.attributes.length === 0 || style === 'display:contents;' || style === 'display:contents');
  if (!generated) return;
  const parent = el.parentNode;
  if (parent) {
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
    parent.normalize();
  }
}

const markedWith = (root: Element, id: string): Element[] =>
  Array.from(root.querySelectorAll('[data-cf]')).filter((e) => e.getAttribute('data-cf') === id);

/**
 * Removes a field and its markers (unwrapping generated wrapper spans). A repeater id turns its items
 * back into static markup; "<repeaterId>.$.<childId>" removes one child field from every item.
 */
export function unmarkField(root: Element, fieldId: string, fields: FieldDef[]): FieldDef[] {
  const path = parseRepeaterPath(fieldId);
  if (path) {
    const repeater = fields.find((f) => f.id === path.repeaterId && f.type === 'repeater');
    if (!repeater) return fields;
    const children = (repeater.children ?? []).filter((c) => c.id !== path.childId);
    if (!children.length) return unmarkField(root, repeater.id, fields);
    markedWith(root, repeaterChildPath(repeater.id, path.childId)).forEach(removeMarker);
    const defaults = (repeater.default as RepeaterItem[]).map((record) => {
      const next = { ...record };
      delete next[path.childId];
      return next;
    });
    return fields.map((f) => (f.id === repeater.id ? { ...f, children, default: defaults } : f));
  }

  const field = fields.find((f) => f.id === fieldId);
  if (field?.type === 'repeater') {
    for (const child of field.children ?? []) {
      markedWith(root, repeaterChildPath(fieldId, child.id)).forEach(removeMarker);
    }
    root.querySelectorAll(`[${ITEM_ATTR}]`).forEach((el) => {
      if (el.getAttribute(ITEM_ATTR) === fieldId) el.removeAttribute(ITEM_ATTR);
    });
    markedWith(root, fieldId).forEach((el) => el.removeAttribute('data-cf'));
  } else {
    const el = markedWith(root, fieldId)[0];
    if (el) removeMarker(el);
  }
  return fields.filter((f) => f.id !== fieldId);
}
