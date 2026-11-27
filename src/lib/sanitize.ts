import sanitize from 'sanitize-html';

/**
 * Shared sanitizers for database-supplied markup that is rendered with
 * dangerouslySetInnerHTML. Editors can have low privilege, so every such
 * string must pass through one of these before reaching the DOM.
 * For long-form blog HTML use `@/lib/blog/sanitize` instead.
 */

// ---------- inline rich text ----------

const RICH_TEXT_OPTIONS: sanitize.IOptions = {
  allowedTags: ['strong', 'b', 'em', 'i', 'u', 's', 'br', 'span', 'a', 'code', 'mark', 'small', 'sub', 'sup'],
  allowedAttributes: {
    '*': ['class'],
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer';
      return { tagName, attribs };
    },
  },
};

/** Inline rich text (basic formatting, safe links, class). No scripts, handlers or style. */
export function sanitizeRichText(html: unknown): string {
  if (typeof html !== 'string' || !html) return '';
  return sanitize(html, RICH_TEXT_OPTIONS);
}

/** HTML splits class lists on ASCII whitespace only. */
const classTokens = (value: string): string[] => value.split(/[\t\n\f\r ]+/).filter(Boolean);

/** Every class name on any element of the inline rich text `html`. */
export function richTextClasses(html: unknown): string[] {
  if (typeof html !== 'string' || !html) return [];
  const out: string[] = [];
  sanitize(html, {
    ...RICH_TEXT_OPTIONS,
    transformTags: {
      ...RICH_TEXT_OPTIONS.transformTags,
      '*': (tagName, attribs) => {
        if (attribs.class) out.push(...classTokens(attribs.class));
        return { tagName, attribs };
      },
    },
  });
  return out;
}

/** `sanitizeRichText`, additionally dropping every class name that is not in `allowed`. */
export function sanitizeRichTextWithClasses(html: unknown, allowed: ReadonlySet<string>): string {
  if (typeof html !== 'string' || !html) return '';
  return sanitize(html, {
    ...RICH_TEXT_OPTIONS,
    transformTags: {
      ...RICH_TEXT_OPTIONS.transformTags,
      '*': (tagName, attribs) => {
        if (attribs.class !== undefined) {
          const kept = classTokens(attribs.class).filter((c) => allowed.has(c));
          if (kept.length) attribs.class = kept.join(' ');
          else delete attribs.class;
        }
        return { tagName, attribs };
      },
    },
  });
}

// ---------- SVG icons ----------

const SVG_TAGS = [
  'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse',
  'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'title', 'use',
];

const SVG_ATTRS = [
  'viewBox', 'xmlns', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
  'd', 'points', 'transform', 'class', 'id', 'role', 'aria-hidden', 'aria-label', 'focusable',
  'preserveAspectRatio', 'version',
  'fill', 'fill-opacity', 'fill-rule', 'clip-rule', 'opacity',
  'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
  'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity',
  'color', 'stop-color', 'stop-opacity', 'offset',
  'gradientUnits', 'gradientTransform', 'spreadMethod', 'fx', 'fy',
  'clip-path', 'clipPathUnits', 'mask', 'maskUnits', 'maskContentUnits',
  'href', 'xlink:href',
];

const SVG_ATTR_SET = new Set(SVG_ATTRS);

/** Drops attribute values that could load external resources or run script. */
function cleanSvgAttribs(tagName: string, attribs: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(attribs)) {
    if (!SVG_ATTR_SET.has(name)) continue; // case-sensitive allow-list
    const v = String(value);
    if (/javascript:|data:|vbscript:|expression\(|<|&#/i.test(v)) continue;
    if (name === 'href' || name === 'xlink:href') {
      if (tagName !== 'use' || !/^#[\w.:-]+$/.test(v.trim())) continue; // same-document refs only
    }
    // url(...) references must stay same-document
    if (/url\(/i.test(v) && !/^\s*url\(\s*['"]?#[\w.:-]+['"]?\s*\)\s*$/i.test(v)) continue;
    out[name] = v;
  }
  return { tagName, attribs: out };
}

const SVG_OPTIONS: sanitize.IOptions = {
  allowedTags: SVG_TAGS,
  allowedAttributes: { '*': SVG_ATTRS },
  allowedSchemes: [],
  allowedSchemesAppliedToAttributes: [],
  allowProtocolRelative: false,
  // keep the content of these out of the output entirely
  nonTextTags: ['script', 'style', 'textarea', 'option', 'foreignObject', 'foreignobject'],
  parser: { lowerCaseTags: false, lowerCaseAttributeNames: false, decodeEntities: true },
  transformTags: Object.fromEntries(
    SVG_TAGS.map((t) => [t, (tagName: string, attribs: Record<string, string>) => cleanSvgAttribs(tagName, attribs)]),
  ),
};

/** SVG icon markup: allow-listed SVG elements and presentation attributes, case preserved. */
export function sanitizeSvg(svg: unknown): string {
  if (typeof svg !== 'string' || !svg) return '';
  return sanitize(svg, SVG_OPTIONS);
}

export interface SvgNames {
  classes: ReadonlySet<string>;
  ids: ReadonlySet<string>;
}

/** `sanitizeSvg` with a second pass over the already cleaned attributes of every element. */
function sanitizeSvgThen(svg: string, visit: (attribs: Record<string, string>) => void): string {
  return sanitize(svg, {
    ...SVG_OPTIONS,
    transformTags: Object.fromEntries(
      SVG_TAGS.map((t) => [
        t,
        (tagName: string, attribs: Record<string, string>) => {
          const cleaned = cleanSvgAttribs(tagName, attribs);
          visit(cleaned.attribs);
          return cleaned;
        },
      ]),
    ),
  });
}

/** Every class name and id used by the given SVG strings. */
export function svgNames(svgs: readonly unknown[]): SvgNames {
  const classes = new Set<string>();
  const ids = new Set<string>();
  for (const svg of svgs) {
    if (typeof svg !== 'string' || !svg) continue;
    sanitizeSvgThen(svg, (attribs) => {
      if (attribs.class) classTokens(attribs.class).forEach((c) => classes.add(c));
      if (attribs.id) ids.add(attribs.id);
    });
  }
  return { classes, ids };
}

/** `sanitizeSvg`, additionally dropping every class name and id that is not in `allowed`. */
export function sanitizeSvgWithNames(svg: unknown, allowed: SvgNames): string {
  if (typeof svg !== 'string' || !svg) return '';
  return sanitizeSvgThen(svg, (attribs) => {
    if (attribs.class !== undefined) {
      const kept = classTokens(attribs.class).filter((c) => allowed.classes.has(c));
      if (kept.length) attribs.class = kept.join(' ');
      else delete attribs.class;
    }
    if (attribs.id !== undefined && !allowed.ids.has(attribs.id)) delete attribs.id;
  });
}

// ---------- <style> text ----------

/** Makes CSS text safe to place inside a <style> element (cannot close it early). */
export function safeStyleText(css: string): string {
  return String(css ?? '').replace(/</g, '\\3c ');
}

/** Escapes text for use as HTML before adding trusted highlight markup. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
