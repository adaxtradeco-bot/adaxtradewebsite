/**
 * Custom HTML section — context-aware escapers (spec §5, §8).
 * Pure string functions, no DOM access. Values passed in are raw strings
 * (never HTML-entity-encoded), so entity decoding is not needed.
 */

/** C0 controls + DEL (browsers drop these inside URLs). */
const CONTROL_RE = /[\x00-\x1f\x7f]/g;
/** Controls, all whitespace and invisible separators, removed before scheme checks. */
const CONTROL_WS_RE = new RegExp(
  '[\\x00-\\x20\\x7f\\xa0' +
    [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x200b, 0x200c, 0x200d, 0x2028, 0x2029, 0x202f, 0x205f, 0x2060, 0x3000, 0xfeff]
      .map((c) => String.fromCharCode(c))
      .join('') +
    ']',
  'g',
);
const SCHEME_RE = /^([a-z][a-z0-9+.\-]*):/i;

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

function toStr(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

/** Escapes text for HTML element content. */
export function escapeText(value: unknown): string {
  return toStr(value).replace(/[&<>]/g, (c) => HTML_ENTITIES[c]);
}

/** Escapes text for a quoted (single or double) HTML attribute value. */
export function escapeAttr(value: unknown): string {
  return toStr(value).replace(/[&<>"'`]/g, (c) => HTML_ENTITIES[c]);
}

const SAFE_URL_SCHEMES = ['http', 'https', 'mailto', 'tel'];

/**
 * Returns the URL (control chars removed, trimmed) when its scheme is http, https,
 * mailto, tel, or it is relative / a fragment. Otherwise the fallback ('#' for href, '' for src).
 * Output is NOT attribute-escaped — callers still apply escapeAttr.
 */
export function safeUrl(url: unknown, kind: 'href' | 'src'): string {
  const fallback = kind === 'href' ? '#' : '';
  if (typeof url !== 'string') return fallback;
  const probe = url.replace(CONTROL_WS_RE, '');
  if (!probe) return fallback;
  const m = SCHEME_RE.exec(probe);
  if (m && SAFE_URL_SCHEMES.indexOf(m[1].toLowerCase()) === -1) return fallback;
  return url.replace(CONTROL_RE, '').trim();
}

const CSS_URL_ENCODE_RE = /[\s"'()\\<>`;{}]/g;

/**
 * URL for use inside CSS url('…'): only http, https or relative. Percent-encodes characters that could
 * leave the url token or the surrounding rule. Empty string when unsafe.
 */
export function safeCssUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const probe = url.replace(CONTROL_WS_RE, '');
  if (!probe) return '';
  const m = SCHEME_RE.exec(probe);
  if (m) {
    const scheme = m[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') return '';
  }
  return url
    .replace(CONTROL_RE, '')
    .trim()
    .replace(CSS_URL_ENCODE_RE, (c) => {
      const hex = c.charCodeAt(0).toString(16).toUpperCase();
      return '%' + (hex.length < 2 ? '0' + hex : hex);
    });
}

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NUM = '[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:%|deg|turn|rad|grad)?';
const FUNC_COLOR_RE = new RegExp(
  '^(?:rgb|hsl)a?\\(\\s*' + NUM + '(?:(?:\\s*,\\s*|\\s+)' + NUM + '){2}(?:\\s*[,/]\\s*' + NUM + ')?\\s*\\)$',
  'i',
);
const NAMED_COLOR_RE = /^[a-z]{3,30}$/i;

/** hex, rgb[a], hsl[a], named colours, transparent, currentColor. Otherwise the fallback (returned as given). */
export function safeColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const v = value.replace(CONTROL_RE, '').trim();
  if (!v || v.length > 100) return fallback;
  if (HEX_COLOR_RE.test(v) || FUNC_COLOR_RE.test(v) || NAMED_COLOR_RE.test(v)) return v;
  return fallback;
}

const EMBED_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'www.google.com',
];

/** https embed URL from an allow-listed host (Google only under /maps). Empty string otherwise. */
export function safeEmbedUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const cleaned = url.replace(CONTROL_WS_RE, '');
  if (!cleaned || !/^https:\/\//i.test(cleaned)) return '';
  let u: URL;
  try {
    u = new URL(cleaned);
  } catch {
    return '';
  }
  if (u.protocol !== 'https:') return '';
  if (u.username || u.password) return '';
  const host = u.hostname.toLowerCase();
  if (EMBED_HOSTS.indexOf(host) === -1) return '';
  if (host === 'www.google.com' && !/^\/maps(?:\/|$)/.test(u.pathname)) return '';
  return u.href;
}
