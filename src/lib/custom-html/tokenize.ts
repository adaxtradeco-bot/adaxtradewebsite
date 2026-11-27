/**
 * Custom HTML section — tokenisation (spec §5).
 *
 * Turns the data-cf annotated DOM + field list into the stored template HTML
 * (`{{cf:<path>}}` tokens) and finds url(...) background and colour fields inside CSS.
 */
import { findStyleBgUrl } from './detect';
import { safeColor } from './escape';
import {
  CUSTOM_HTML_LIMITS,
  REPEATER_ITEM_ATTR as ITEM_ATTR,
  TOKEN_CLOSE,
  TOKEN_LITERAL_ID,
  TOKEN_OPEN,
  parseRepeaterPath,
  repeaterChildPath,
  repeaterClose,
  repeaterOpen,
  type FieldDef,
  type LinkValue,
} from './types';

const tok = (path: string): string => `${TOKEN_OPEN}${path}${TOKEN_CLOSE}`;
const LITERAL_ESCAPE = tok(TOKEN_LITERAL_ID);

const tagOf = (el: Element): string => el.tagName.toLowerCase();

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

/** Replaces literal "{{cf:" in text, comments and attribute values so it can never be read as a token. */
function escapeLiteralTokens(root: Element): void {
  const fix = (s: string) => (s.includes(TOKEN_OPEN) ? s.split(TOKEN_OPEN).join(LITERAL_ESCAPE) : s);
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3 || child.nodeType === 8) {
        const data = (child as CharacterData).data;
        const fixed = fix(data);
        if (fixed !== data) (child as CharacterData).data = fixed;
      } else if (child.nodeType === 1) {
        const el = child as Element;
        for (const attr of Array.from(el.attributes)) {
          const fixed = fix(attr.value);
          if (fixed !== attr.value) el.setAttribute(attr.name, fixed);
        }
        walk(el);
        // <template> children live in a separate fragment, not in childNodes
        const content = el.localName === 'template' ? (el as HTMLTemplateElement).content : undefined;
        if (content) walk(content);
      }
    });
  };
  walk(root);
}

function setContent(el: Element, token: string): void {
  el.textContent = token;
}

/** Writes the tokens of `field` into `el`; `id` is the token path (differs from field.id for repeater children). */
function applyField(el: Element, field: FieldDef, id: string = field.id): void {
  const tag = tagOf(el);

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'richtext':
      if (tag === 'input' || tag === 'textarea') el.setAttribute('placeholder', tok(id));
      else setContent(el, tok(id));
      break;

    case 'link': {
      el.setAttribute('href', tok(`${id}.href`));
      // target/rel are emitted by the renderer from the value
      el.removeAttribute('target');
      el.removeAttribute('rel');
      if (typeof (field.default as LinkValue)?.text === 'string') setContent(el, tok(`${id}.text`));
      break;
    }

    case 'image':
      el.setAttribute('src', tok(`${id}.src`));
      el.setAttribute('alt', tok(`${id}.alt`));
      if (el.hasAttribute('data-src')) el.setAttribute('data-src', tok(`${id}.src`));
      if (el.hasAttribute('data-lazy-src')) el.setAttribute('data-lazy-src', tok(`${id}.src`));
      break;

    case 'video': {
      el.setAttribute('poster', tok(`${id}.poster`));
      if (el.hasAttribute('src')) el.setAttribute('src', tok(`${id}.src`));
      else el.querySelector('source[src]')?.setAttribute('src', tok(`${id}.src`));
      break;
    }

    case 'embed':
      el.setAttribute('src', tok(`${id}.src`));
      break;

    case 'icon':
      setContent(el, tok(`${id}.svg`));
      break;

    case 'bgImage': {
      const style = el.getAttribute('style') ?? '';
      const m = findStyleBgUrl(style);
      if (m) {
        el.setAttribute('style', `${style.slice(0, m.start)}url('${tok(`${id}.src`)}')${style.slice(m.end)}`);
      }
      break;
    }

    default:
      break; // color lives in the CSS; repeaters are handled by applyRepeater
  }
}

/** Author comments that look like repeater markers must not open or close a block. */
function removeRepeaterComments(root: Node): void {
  Array.from(root.childNodes).forEach((child) => {
    if (child.nodeType === 8 && /^\s*\/?cf:rep:/.test((child as Comment).data)) root.removeChild(child);
    else if (child.nodeType === 1) {
      removeRepeaterComments(child);
      const el = child as Element;
      if (el.localName === 'template') removeRepeaterComments((el as HTMLTemplateElement).content);
    }
  });
}

const isBlankText = (node: Node | null): node is Text => node?.nodeType === 3 && !/\S/.test(node.textContent ?? '');

/** Tokenises the first item as the item template, drops the others and brackets it with comment markers. */
function applyRepeater(root: Element, repeater: FieldDef): void {
  const marked = Array.from(root.querySelectorAll(`[${ITEM_ATTR}]`)).filter(
    (el) => el.getAttribute(ITEM_ATTR) === repeater.id
  );
  const first = marked[0];
  const parent = first?.parentNode;
  if (!first || !parent) return;
  const items = marked.filter((el) => el.parentNode === parent);

  for (const el of [first, ...Array.from(first.querySelectorAll('[data-cf]'))]) {
    if (el !== first && !first.contains(el)) continue; // swallowed by a content token
    const path = parseRepeaterPath(el.getAttribute('data-cf') ?? '');
    if (!path || path.repeaterId !== repeater.id) continue;
    const child = repeater.children?.find((c) => c.id === path.childId);
    if (child) applyField(el, child, repeaterChildPath(repeater.id, child.id));
    else el.removeAttribute('data-cf');
  }

  // the whitespace between two items belongs to the item template (inline-block spacing)
  const separator = items.length > 1 && isBlankText(first.nextSibling) ? first.nextSibling : null;
  for (const item of items.slice(1)) {
    while (isBlankText(item.previousSibling) && item.previousSibling !== separator) {
      parent.removeChild(item.previousSibling);
    }
    parent.removeChild(item);
  }
  const doc = root.ownerDocument;
  const comment = (marker: string) => doc.createComment(marker.slice('<!--'.length, -'-->'.length));
  parent.insertBefore(comment(repeaterOpen(repeater.id)), first);
  parent.insertBefore(comment(repeaterClose(repeater.id)), (separator ?? first).nextSibling);
}

/**
 * Returns the tokenised HTML for the annotated DOM. The given root is not modified.
 * Elements carrying a data-cf marker without a matching field lose the marker.
 */
export function tokenizeHtml(root: Element, fields: FieldDef[]): string {
  const clone = root.cloneNode(true) as Element;
  escapeLiteralTokens(clone);
  removeRepeaterComments(clone);

  const byId = new Map<string, FieldDef>();
  for (const f of fields) if (!byId.has(f.id)) byId.set(f.id, f);
  const isRepeaterId = (id: string | null) => byId.get(id ?? '')?.type === 'repeater';

  const marked = Array.from(clone.querySelectorAll('[data-cf]'));
  for (const el of marked) {
    if (!clone.contains(el)) continue; // swallowed by an ancestor's content token
    const marker = el.getAttribute('data-cf') ?? '';
    const path = parseRepeaterPath(marker);
    if (path && isRepeaterId(path.repeaterId)) continue; // item template, see applyRepeater
    const field = byId.get(marker);
    if (!field) {
      el.removeAttribute('data-cf');
      continue;
    }
    applyField(el, field);
  }
  clone.querySelectorAll(`[${ITEM_ATTR}]`).forEach((el) => {
    if (!isRepeaterId(el.getAttribute(ITEM_ATTR))) el.removeAttribute(ITEM_ATTR);
  });
  for (const field of Array.from(byId.values())) if (field.type === 'repeater') applyRepeater(clone, field);
  return clone.innerHTML;
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const SKIPPED_AT_RULES = /^@(?:-\w+-)?(?:font-face|keyframes|property|page|counter-style|font-feature-values|viewport)\b/i;
const GROUP_AT_RULES = /^@(?:media|supports|container|layer|document|scope|starting-style)\b/i;
const BG_PROPS = new Set(['background', 'background-image']);
/** The section root as written by css-scope.ts, optionally in dark mode, plus anything below it. */
const SCOPED_SELECTOR_RE = /^(\.dark\s+)?\[data-chs="[^"]*"\](?:\s+([\s\S]+))?$/;
const COMPOUND_RE = /^[a-zA-Z0-9_#.-]+$/;
const CUSTOM_PROP_RE = /^((?:\s|\/\*[\s\S]*?\*\/)*)(--[^\s:;{}]+)((?:\s|\/\*[\s\S]*?\*\/)*:\s*)/;
const TOKEN_AT_RE = /^\{\{cf:[A-Za-z0-9_.$-]+\}\}/;
const CSS_TOKEN_VALUE_RE = /^\{\{cf:([A-Za-z0-9_.-]+)\.(src|value)\}\}$/;

const NAMED_COLORS = new Set(
  (
    'transparent currentcolor aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue ' +
    'blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue ' +
    'darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink ' +
    'deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold ' +
    'goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush ' +
    'lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey ' +
    'lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime ' +
    'limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen ' +
    'mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin ' +
    'navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise ' +
    'palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
    'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow ' +
    'springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
  ).split(' ')
);

/** A value the colour editor can edit: hex, rgb[a], hsl[a] or a real colour keyword. */
function isColorValue(value: string): boolean {
  if (safeColor(value, '') !== value) return false;
  return !/^[a-z]+$/i.test(value) || NAMED_COLORS.has(value.toLowerCase());
}

function selectorLabel(rawSelector: string): string {
  const first = rawSelector.split(',')[0] ?? '';
  const cleaned = first
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\[data-chs="[^"]*"\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'Root';
}

/** Splits a selector list at its top-level commas. */
function splitSelectors(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  const text = list.replace(/\/\*[\s\S]*?\*\//g, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') {
      current += text.slice(i, i + 2);
      i += 1;
      continue;
    }
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
    } else current += ch;
  }
  out.push(current.trim());
  return out;
}

/** True when every selector targets the section root or its wrapper element (where theme colours live). */
function declaresThemeColors(selectorList: string, wrapper: Element | null): boolean {
  return splitSelectors(selectorList).every((selector) => {
    const m = SCOPED_SELECTOR_RE.exec(selector);
    if (!m) return false;
    const rest = m[2];
    if (rest === undefined) return true;
    return wrapper !== null && COMPOUND_RE.test(rest) && wrapper.matches(rest);
  });
}

function maxAutoNumber(fields: FieldDef[]): number {
  let max = 0;
  for (const f of fields) {
    const m = /^f(\d+)$/.exec(f.id);
    if (m) max = Math.max(max, Number(m[1]));
    if (f.children) max = Math.max(max, maxAutoNumber(f.children));
  }
  return max;
}

const countFields = (fields: FieldDef[]): number =>
  fields.reduce((n, f) => n + 1 + (f.children ? countFields(f.children) : 0), 0);

interface Frame {
  kind: 'rule' | 'group' | 'skip';
  selector: string;
}

/** A place in the CSS whose text can become a value token. */
interface CssSite {
  type: 'bgImage' | 'color';
  /** range to replace */
  start: number;
  end: number;
  /** current url or colour */
  value: string;
  prop: string;
  /** enclosing at-rules and rule, outermost first */
  frames: Frame[];
}

/**
 * Calls `visit`, in source order, for every url() in a background declaration and every custom property
 * declaration of a normal rule (not @font-face / @keyframes / @import).
 */
function walkCss(css: string, visit: (site: CssSite) => void): void {
  const stack: Frame[] = [];
  let prelude = '';
  let declStart = 0; // index where the current declaration (or prelude) begins
  let i = 0;
  const n = css.length;
  const inRule = () => stack[stack.length - 1]?.kind === 'rule' && !stack.some((f) => f.kind === 'skip');

  const endDeclaration = (end: number) => {
    if (!inRule()) return;
    const raw = css.slice(declStart, end);
    const m = CUSTOM_PROP_RE.exec(raw);
    if (!m) return;
    const value = raw.slice(m[0].length).replace(/\s*(?:!\s*important)?\s*$/i, '');
    const start = declStart + m[0].length;
    visit({ type: 'color', start, end: start + value.length, value, prop: m[2], frames: [...stack] });
  };

  while (i < n) {
    const ch = css[i];

    // comments
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    // escapes outside strings (e.g. quotes or braces in utility class names)
    if (ch === '\\') {
      prelude += css.slice(i, i + 2);
      i += 2;
      continue;
    }
    // strings
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && css[j] !== ch) j += css[j] === '\\' ? 2 : 1;
      prelude += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    // value tokens are atomic: their braces do not open blocks
    if (ch === '{' && css[i + 1] === '{') {
      const token = TOKEN_AT_RE.exec(css.slice(i, i + 300));
      if (token) {
        prelude += token[0];
        i += token[0].length;
        continue;
      }
    }
    // url(...)
    if ((ch === 'u' || ch === 'U') && /^url\(/i.test(css.slice(i, i + 4)) && (i === 0 || !/[\w-]/.test(css[i - 1]))) {
      let j = i + 4;
      while (j < n && /\s/.test(css[j])) j += 1;
      let url = '';
      if (css[j] === '"' || css[j] === "'") {
        const q = css[j];
        let k = j + 1;
        while (k < n && css[k] !== q) k += css[k] === '\\' ? 2 : 1;
        url = css.slice(j + 1, k);
        j = k + 1;
      } else {
        let k = j;
        while (k < n && css[k] !== ')') k += 1;
        url = css.slice(j, k).trim();
        j = k;
      }
      while (j < n && css[j] !== ')') j += 1;
      const end = j + 1; // after ')'
      const prop = (css.slice(declStart, i).split(':')[0] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').trim().toLowerCase();
      if (inRule() && BG_PROPS.has(prop)) {
        visit({ type: 'bgImage', start: i, end, value: url, prop, frames: [...stack] });
      }
      i = end;
      continue;
    }

    if (ch === '{') {
      const p = prelude.trim();
      let kind: Frame['kind'] = 'rule';
      if (stack.some((f) => f.kind === 'skip') || SKIPPED_AT_RULES.test(p)) kind = 'skip';
      else if (p.startsWith('@')) kind = GROUP_AT_RULES.test(p) ? 'group' : 'skip';
      stack.push({ kind, selector: p });
      prelude = '';
      declStart = i + 1;
      i += 1;
      continue;
    }
    if (ch === '}' || ch === ';') {
      endDeclaration(i);
      if (ch === '}') stack.pop();
      prelude = '';
      declStart = i + 1;
      i += 1;
      continue;
    }
    prelude += ch;
    i += 1;
  }
}

/** Identifies a CSS site across re-imports: the scope hash changes, the selectors and property do not. */
function siteKey(site: CssSite): string {
  const path = site.frames.map((f) => f.selector.replace(/\[data-chs="[^"]*"\]/g, '&').replace(/\s+/g, ' '));
  return JSON.stringify([site.type, path, site.prop]);
}

export interface CssFieldOptions {
  /** the single element wrapping the section markup; its rules may declare theme colours */
  wrapper?: Element | null;
  /** the section being re-imported: CSS fields found at the same place keep their ids */
  previous?: { cssScoped: string; fields: FieldDef[] };
}

export interface CssFieldResult {
  cssScoped: string;
  fields: FieldDef[];
  /** with `previous`: id of a CSS field -> id of the previous CSS field it continues */
  matched?: Record<string, string>;
}

interface PreviousSite {
  field: FieldDef;
  key: string;
}

function previousSites(previous: NonNullable<CssFieldOptions['previous']>): PreviousSite[] {
  const byId = new Map(previous.fields.map((f) => [f.id, f]));
  const out: PreviousSite[] = [];
  walkCss(previous.cssScoped, (site) => {
    const token = CSS_TOKEN_VALUE_RE.exec(site.value);
    const field = token ? byId.get(token[1]) : undefined;
    if (field && field.type === site.type) out.push({ field, key: siteKey(site) });
  });
  return out;
}

const defaultText = (field: FieldDef): string => {
  const d = field.default as { src?: string; value?: string };
  return d.src ?? d.value ?? '';
};

/**
 * Finds background url(...) values and the colour custom properties declared on the section root or its
 * wrapper, replaces them by value tokens and adds bgImage fields (group "Styles") and color fields
 * (group "Colours"). data: and #fragment URLs are left alone.
 */
export function detectCssFields(cssScoped: string, existing: FieldDef[], opts: CssFieldOptions = {}): CssFieldResult {
  const wrapper = opts.wrapper ?? null;
  const sites: CssSite[] = [];
  walkCss(cssScoped, (site) => {
    if (site.value.includes(TOKEN_OPEN)) return;
    if (site.type === 'bgImage') {
      if (site.value === '' || site.value.startsWith('#') || /^data:/i.test(site.value)) return;
    } else {
      const rule = site.frames[site.frames.length - 1];
      if (site.prop.startsWith('--tw-') || !isColorValue(site.value)) return;
      if (!declaresThemeColors(rule.selector, wrapper)) return;
    }
    sites.push(site);
  });
  sites.splice(Math.max(0, CUSTOM_HTML_LIMITS.fields - countFields(existing)));

  // pair sites with the previous CSS fields: same place and value first, then same place
  const previous = opts.previous ? previousSites(opts.previous) : [];
  const pairs: (PreviousSite | undefined)[] = sites.map(() => undefined);
  const taken = new Set<PreviousSite>();
  for (const sameValue of [true, false]) {
    sites.forEach((site, i) => {
      if (pairs[i]) return;
      const key = siteKey(site);
      const found = previous.find(
        (p) => !taken.has(p) && p.key === key && (!sameValue || defaultText(p.field) === site.value)
      );
      if (found) {
        pairs[i] = found;
        taken.add(found);
      }
    });
  }

  const fields = [...existing];
  const used = new Set(fields.map((f) => f.id));
  fields.forEach((f) => f.children?.forEach((c) => used.add(c.id)));
  // kept ids are reserved so a new field never takes one over
  const reserved = new Set(Array.from(taken, (p) => p.field.id));
  let counter = Math.max(maxAutoNumber(fields), maxAutoNumber(opts.previous?.fields ?? []));
  const labelCounts = new Map<string, number>();
  for (const f of fields) labelCounts.set(f.label, (labelCounts.get(f.label) ?? 0) + 1);
  const matched: Record<string, string> = {};

  const nextId = (): string => {
    let id: string;
    do {
      counter += 1;
      id = `f${counter}`;
    } while (used.has(id) || reserved.has(id));
    return id;
  };

  let out = '';
  let last = 0;
  sites.forEach((site, i) => {
    const before = pairs[i]?.field;
    const id = before && !used.has(before.id) ? before.id : nextId();
    used.add(id);
    if (before) matched[id] = before.id;

    const rule = site.frames[site.frames.length - 1];
    let base: string;
    if (site.type === 'bgImage') base = `Styles › ${selectorLabel(rule.selector)} Background`;
    else {
      const dark = /(^|,)\s*\.dark\s/.test(rule.selector) ? ' (dark)' : '';
      const media = site.frames.some((f) => /^@media\b/i.test(f.selector)) ? ' (media)' : '';
      base = `Colour › ${site.prop.slice(2)}${dark}${media}`;
    }
    const seen = labelCounts.get(base) ?? 0;
    labelCounts.set(base, seen + 1);
    const label = seen ? `${base} ${seen + 1}` : base;
    fields.push({
      id,
      type: site.type,
      label: before?.label ?? (label.length > 48 ? `${label.slice(0, 47).trimEnd()}…` : label),
      group: site.type === 'bgImage' ? 'Styles' : 'Colours',
      ...(before?.hidden !== undefined ? { hidden: before.hidden } : {}),
      default: site.type === 'bgImage' ? { src: site.value } : { value: site.value },
    });
    const replacement = site.type === 'bgImage' ? `url('${tok(`${id}.src`)}')` : tok(`${id}.value`);
    out += cssScoped.slice(last, site.start) + replacement;
    last = site.end;
  });

  out += cssScoped.slice(last);
  return opts.previous ? { cssScoped: out, fields, matched } : { cssScoped: out, fields };
}
