import { describe, it, expect } from 'vitest';
import { escapeAttr, escapeText, safeColor, safeCssUrl, safeEmbedUrl, safeUrl } from '@/lib/custom-html/escape';

describe('escapeText / escapeAttr', () => {
  it('escapes HTML text metacharacters', () => {
    expect(escapeText('<b>"a" & \'b\'</b>')).toBe('&lt;b&gt;"a" &amp; \'b\'&lt;/b&gt;');
  });
  it('escapes both quote styles for attributes', () => {
    expect(escapeAttr('"><img src=x onerror=alert(1)>')).toBe('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
    expect(escapeAttr("' onmouseover='x")).toBe('&#39; onmouseover=&#39;x');
    expect(escapeAttr('a`b')).toBe('a&#96;b');
  });
  it('escapes ampersands', () => {
    expect(escapeAttr('&amp;')).toBe('&amp;amp;');
  });
  it('tolerates non-strings', () => {
    expect(escapeText(undefined)).toBe('');
    expect(escapeText(null)).toBe('');
    expect(escapeAttr(42)).toBe('42');
    expect(escapeAttr({})).toBe('');
  });
});

describe('safeUrl', () => {
  it('allows http, https, mailto, tel, relative and fragments', () => {
    expect(safeUrl('https://example.com/a?b=1#c', 'href')).toBe('https://example.com/a?b=1#c');
    expect(safeUrl('HTTP://example.com', 'src')).toBe('HTTP://example.com');
    expect(safeUrl('mailto:a@b.co', 'href')).toBe('mailto:a@b.co');
    expect(safeUrl('tel:+123', 'href')).toBe('tel:+123');
    expect(safeUrl('/images/a.png', 'src')).toBe('/images/a.png');
    expect(safeUrl('images/a b.png', 'src')).toBe('images/a b.png');
    expect(safeUrl('#section', 'href')).toBe('#section');
    expect(safeUrl('?q=a:b', 'href')).toBe('?q=a:b');
    expect(safeUrl('/a:b', 'href')).toBe('/a:b');
  });

  const evil = [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    '\u0000javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'java\r\nscript:alert(1)',
    '\u0001\u001fjavascript:alert(1)',
    'jav\u0000ascript:alert(1)',
    '   \t\n javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'file:///etc/passwd',
    'blob:https://x/1',
    'javascript' + String.fromCharCode(0x2028) + ':alert(1)',
  ];
  it.each(evil)('blocks %j', (u) => {
    expect(safeUrl(u, 'href')).toBe('#');
    expect(safeUrl(u, 'src')).toBe('');
  });

  it('uses the per-kind fallback for empty and non-string input', () => {
    expect(safeUrl('', 'href')).toBe('#');
    expect(safeUrl('  ', 'src')).toBe('');
    expect(safeUrl(undefined, 'href')).toBe('#');
    expect(safeUrl(5, 'src')).toBe('');
  });

  it('removes control characters from allowed URLs', () => {
    expect(safeUrl(' https://a.com/\u0000x\t', 'href')).toBe('https://a.com/x');
  });
});

describe('safeCssUrl', () => {
  it('allows http(s) and relative URLs', () => {
    expect(safeCssUrl('https://a.com/b.png')).toBe('https://a.com/b.png');
    expect(safeCssUrl('/img/a.png')).toBe('/img/a.png');
  });
  it('percent-encodes characters that could leave the url token or the rule', () => {
    const out = safeCssUrl("a') ; } body{background:red /* \" \\ <x>");
    expect(out).not.toMatch(/['"()\\<>;{}\s]/);
    expect(out).toContain('%27%29%20%3B%20%7D%20body%7Bbackground:red');
  });
  it('blocks dangerous and non-http schemes', () => {
    [
      'javascript:alert(1)',
      'JaVa\tScRiPt:alert(1)',
      ' \u0000javascript:x',
      'data:image/png;base64,AAA',
      'mailto:a@b.c',
      'vbscript:x',
    ].forEach((u) => expect(safeCssUrl(u)).toBe(''));
    expect(safeCssUrl('')).toBe('');
    expect(safeCssUrl(null)).toBe('');
  });
});

describe('safeColor', () => {
  it.each([
    '#fff',
    '#FFFF',
    '#ff00aa',
    '#ff00aa80',
    'rgb(1,2,3)',
    'rgba(1, 2, 3, 0.5)',
    'rgb(1 2 3 / 50%)',
    'hsl(120, 50%, 50%)',
    'hsla(120deg 50% 50% / .3)',
    'red',
    'Transparent',
    'currentColor',
  ])('accepts %s', (c) => expect(safeColor(c, 'FB')).toBe(c));

  it.each([
    'red;}body{background:red',
    'url(javascript:alert(1))',
    'expression(alert(1))',
    '#ff',
    '#gggggg',
    'rgb(1,2,3);x:y',
    'rgb(1,2)',
    'red /* x */',
    'var(--x)',
    '',
    '</style><script>',
    'x'.repeat(200),
  ])('rejects %j', (c) => expect(safeColor(c, 'FB')).toBe('FB'));

  it('uses fallback for non-strings', () => {
    expect(safeColor(undefined, 'FB')).toBe('FB');
    expect(safeColor(12, 'FB')).toBe('FB');
  });
});

describe('safeEmbedUrl', () => {
  it.each([
    'https://www.youtube.com/embed/abc',
    'https://youtube.com/embed/abc',
    'https://www.youtube-nocookie.com/embed/abc',
    'https://youtube-nocookie.com/embed/abc',
    'https://player.vimeo.com/video/123',
    'https://www.google.com/maps/embed?pb=1',
  ])('allows %s', (u) => expect(safeEmbedUrl(u)).toBe(u));

  it.each([
    'http://www.youtube.com/embed/abc',
    'https://evil.com/embed',
    'https://www.youtube.com.evil.com/embed',
    'https://evil.com/?https://www.youtube.com/',
    'https://www.google.com/search?q=1',
    'https://www.google.com/mapsx',
    'https://user:pw@www.youtube.com/embed/a',
    'https://vimeo.com/123',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//www.youtube.com/embed/abc',
    '/relative',
    '"><script>alert(1)</script>',
    '',
  ])('blocks %j', (u) => expect(safeEmbedUrl(u)).toBe(''));

  it('strips control characters and whitespace before checking', () => {
    expect(safeEmbedUrl(' https://www.youtube.com/embed/abc\n')).toBe('https://www.youtube.com/embed/abc');
    expect(safeEmbedUrl('ht\ttps://evil.com/')).toBe('');
  });
  it('tolerates non-strings', () => {
    expect(safeEmbedUrl(undefined)).toBe('');
  });
});
