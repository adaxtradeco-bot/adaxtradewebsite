/**
 * Custom HTML section — tokenisation (spec §5).
 *
 * Turns the data-cf annotated DOM + field list into the stored template HTML
 * (`{{cf:<path>}}` tokens) and finds url(...) background fields inside CSS.
 */
import { findStyleBgUrl } from './detect';
import {
  TOKEN_CLOSE,
  TOKEN_LITERAL_ID,
  TOKEN_OPEN,
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
      }
    });
  };
  walk(root);
}

function setContent(el: Element, token: string): void {
  el.textContent = token;
}

function applyField(el: Element, field: FieldDef): void {
  const id = field.id;
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
      break; // color / repeater: phase 2
  }
}

/**
 * Returns the tokenised HTML for the annotated DOM. The given root is not modified.
 * Elements carrying a data-cf marker without a matching field lose the marker.
 */
export function tokenizeHtml(root: Element, fields: FieldDef[]): string {
  const clone = root.cloneNode(true) as Element;
  escapeLiteralTokens(clone);

  const byId = new Map<string, FieldDef>();
  for (const f of fields) if (!byId.has(f.id)) byId.set(f.id, f);

  const marked = Array.from(clone.querySelectorAll('[data-cf]'));
  for (const el of marked) {
    if (!clone.contains(el)) continue; // swallowed by an ancestor's content token
    const field = byId.get(el.getAttribute('data-cf') ?? '');
    if (!field) {
      el.removeAttribute('data-cf');
      continue;
    }
    applyField(el, field);
  }
  return clone.innerHTML;
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const SKIPPED_AT_RULES = /^@(?:-\w+-)?(?:font-face|keyframes|property|page|counter-style|font-feature-values|viewport)\b/i;
const GROUP_AT_RULES = /^@(?:media|supports|container|layer|document|scope|starting-style)\b/i;
const BG_PROPS = new Set(['background', 'background-image']);

function selectorLabel(rawSelector: string): string {
  const first = rawSelector.split(',')[0] ?? '';
  const cleaned = first
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\[data-chs="[^"]*"\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'Root';
}

function maxAutoNumber(fields: FieldDef[]): number {
  let max = 0;
  for (const f of fields) {
    const m = /^f(\d+)$/.exec(f.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

interface Frame {
  kind: 'rule' | 'group' | 'skip';
  selector: string;
}

/**
 * Finds url(...) in background declarations of normal rules (not @font-face / @keyframes / @import),
 * replaces them by url('{{cf:<id>.src}}') and adds bgImage fields (group "Styles").
 * data: and #fragment URLs are left alone.
 */
export function detectCssFields(
  cssScoped: string,
  existing: FieldDef[]
): { cssScoped: string; fields: FieldDef[] } {
  const css = cssScoped;
  const fields = [...existing];
  const used = new Set(fields.map((f) => f.id));
  let counter = maxAutoNumber(fields);
  const labelCounts = new Map<string, number>();
  for (const f of fields) labelCounts.set(f.label, (labelCounts.get(f.label) ?? 0) + 1);

  const nextId = (): string => {
    let id: string;
    do {
      counter += 1;
      id = `f${counter}`;
    } while (used.has(id));
    used.add(id);
    return id;
  };

  let out = '';
  let last = 0;
  const stack: Frame[] = [];
  let prelude = '';
  let declStart = 0; // index where the current declaration (or prelude) begins
  let i = 0;
  const n = css.length;
  const inSkip = () => stack.some((f) => f.kind === 'skip');

  while (i < n) {
    const ch = css[i];

    // comments
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
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
      const frame = stack[stack.length - 1];
      const prop = (css.slice(declStart, i).split(':')[0] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').trim().toLowerCase();
      const usable =
        frame?.kind === 'rule' &&
        !inSkip() &&
        BG_PROPS.has(prop) &&
        url !== '' &&
        !url.startsWith('#') &&
        !/^data:/i.test(url) &&
        !url.includes('{{cf:');
      if (usable) {
        const id = nextId();
        const base = `Styles › ${selectorLabel(frame?.selector ?? '')} Background`;
        const seen = labelCounts.get(base) ?? 0;
        labelCounts.set(base, seen + 1);
        const label = (seen ? `${base} ${seen + 1}` : base);
        fields.push({
          id,
          type: 'bgImage',
          label: label.length > 48 ? `${label.slice(0, 47).trimEnd()}…` : label,
          group: 'Styles',
          default: { src: url },
        });
        out += css.slice(last, i) + `url('${tok(`${id}.src`)}')`;
        last = end;
      }
      i = end;
      continue;
    }

    if (ch === '{') {
      const p = prelude.trim();
      let kind: Frame['kind'] = 'rule';
      if (inSkip() || SKIPPED_AT_RULES.test(p)) kind = 'skip';
      else if (p.startsWith('@')) kind = GROUP_AT_RULES.test(p) ? 'group' : 'skip';
      stack.push({ kind, selector: p });
      prelude = '';
      declStart = i + 1;
      i += 1;
      continue;
    }
    if (ch === '}') {
      stack.pop();
      prelude = '';
      declStart = i + 1;
      i += 1;
      continue;
    }
    if (ch === ';') {
      prelude = '';
      declStart = i + 1;
      i += 1;
      continue;
    }
    prelude += ch;
    i += 1;
  }

  out += css.slice(last);
  return { cssScoped: out, fields };
}
