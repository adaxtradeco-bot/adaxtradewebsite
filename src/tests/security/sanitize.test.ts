import { describe, it, expect } from 'vitest';
import { sanitizeRichText, sanitizeSvg, safeStyleText, escapeHtml } from '@/lib/sanitize';

const ICONS = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="#4F7FFF" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  '<svg viewBox="0 0 24 24"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#00f"/></linearGradient></defs><path d="M0 0h24v24H0z" fill="url(#g1)"/><use href="#g1"/></svg>',
];

// compare ignoring self-closing vs explicit close tags
const norm = (s: string) => s.replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>');

describe('sanitizeSvg', () => {
  it('passes real icons through intact (case preserved)', () => {
    for (const icon of ICONS) expect(sanitizeSvg(icon)).toBe(norm(icon));
    expect(sanitizeSvg(ICONS[2])).toContain('viewBox');
    expect(sanitizeSvg(ICONS[2])).toContain('<linearGradient');
  });
  it('removes script, foreignObject and handlers', () => {
    const out = sanitizeSvg('<svg onload="alert(1)"><script>alert(1)</script><foreignObject><div onclick="x()">hi</div><img src=x onerror=alert(1)></foreignObject><path d="M0 0" onclick="y()"/></svg>');
    expect(out).not.toMatch(/script|alert|foreignObject|onload|onclick|onerror|<img|<div/i);
    expect(out).toContain('<path d="M0 0"></path>');
  });
  it('blocks javascript:/data: and external hrefs', () => {
    const out = sanitizeSvg('<svg><use href="javascript:alert(1)"/><use xlink:href="data:image/svg+xml,x"/><use href="https://evil.test/a.svg#x"/><use href="#ok"/><a href="javascript:alert(1)"><path d="M0 0"/></a></svg>');
    expect(out).not.toMatch(/javascript|data:|evil/);
    expect(out).toContain('<use href="#ok"></use>');
    expect(out).not.toContain('<a');
  });
  it('blocks external url() and style attributes', () => {
    const out = sanitizeSvg('<svg style="x:y"><rect fill="url(https://evil.test/x)" stroke="url(#a)"/></svg>');
    expect(out).not.toMatch(/evil|style/);
    expect(out).toContain('stroke="url(#a)"');
  });
  it('handles non-strings and html breakout', () => {
    expect(sanitizeSvg(undefined)).toBe('');
    expect(sanitizeSvg('<svg><style>*{}</style><path d="M0 0"/></svg><img src=x onerror=alert(1)>')).not.toMatch(/<style|<img|onerror/);
  });
});

describe('sanitizeRichText', () => {
  it('passes real rich text through unchanged', () => {
    const samples = [
      'Stage is <strong>entered, approved, rejected,</strong> or <strong>overdue</strong>',
      '<strong>Email</strong> · <strong>SMS</strong> · <strong>Fax</strong> · Internal notification',
      'Leave request rejected → submitter receives <strong>SMS</strong> within 30 seconds. "Account Status" <em>x</em><br />y',
      '<span class="text-red-500">hi</span> <a href="https://a.test/x" title="t">link</a>',
    ];
    for (const s of samples) expect(sanitizeRichText(s)).toBe(s);
  });
  it('strips scripts, handlers and javascript: links', () => {
    const out = sanitizeRichText('<script>alert(1)</script><img src=x onerror=alert(1)><b onclick="x()" style="a:b">b</b><a href="javascript:alert(1)">l</a><svg onload=alert(1)></svg><iframe src="https://x"></iframe>');
    expect(out).not.toMatch(/script|onerror|onclick|style|javascript|<img|<svg|iframe|alert/);
    expect(out).toContain('<b>b</b>');
  });
  it('adds rel for target=_blank', () => {
    expect(sanitizeRichText('<a href="https://a.test" target="_blank">x</a>')).toContain('rel="noopener noreferrer"');
  });
});

describe('safeStyleText / escapeHtml', () => {
  it('prevents </style> breakout', () => {
    const out = safeStyleText('a{color:red}</style><script>alert(1)</script>');
    expect(out).not.toContain('<');
  });
  it('leaves normal css untouched', () => {
    const css = '.a .b{color:#fff;background:linear-gradient(90deg,rgba(0,0,0,.3),transparent)}';
    expect(safeStyleText(css)).toBe(css);
  });
  it('escapes html', () => {
    expect(escapeHtml('<img src=x onerror=1>&"')).toBe('&lt;img src=x onerror=1&gt;&amp;&quot;');
  });
});
