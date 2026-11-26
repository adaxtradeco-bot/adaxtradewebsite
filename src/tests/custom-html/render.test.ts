import { describe, it, expect, vi } from 'vitest';
import { renderCustomHtml, renderWithDefaults } from '@/lib/custom-html/render';
import type { CustomHtmlData, FieldDef, FieldValue } from '@/lib/custom-html/types';

const SCOPE = '0123456789';

function mk(
  html: string,
  fields: FieldDef[],
  values: Record<string, FieldValue> = {},
  cssScoped = '',
): Pick<CustomHtmlData, 'template' | 'fields' | 'values'> {
  return {
    template: {
      html,
      css: '',
      cssScoped,
      js: '',
      jsSource: '',
      externalScripts: [],
      externalStylesheets: [],
      scope: SCOPE,
    },
    fields,
    values,
  };
}

const render = (d: ReturnType<typeof mk>, builder = false) => renderCustomHtml(d, { builder });

function parse(html: string): Document {
  return new DOMParser().parseFromString('<!doctype html><html><body>' + html + '</body></html>', 'text/html');
}

/** No <script>, no on* attribute, no javascript: URL anywhere in the rendered output. */
function assertSafe(html: string): Document {
  const doc = parse(html);
  expect(doc.querySelectorAll('script').length).toBe(0);
  const all = doc.querySelectorAll('*');
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    for (let a = 0; a < el.attributes.length; a++) {
      const attr = el.attributes[a];
      expect(attr.name.toLowerCase().indexOf('on')).not.toBe(0);
      if (/^(href|src|poster|data-src|action|formaction)$/i.test(attr.name)) {
        expect(attr.value.replace(/[\s\u0000-\u001f]/g, '')).not.toMatch(/^javascript:/i);
      }
    }
  }
  return doc;
}

const XSS = '"><img src=x onerror=alert(1)>';
const f = (id: string, type: FieldDef['type'], def: FieldValue): FieldDef => ({ id, type, label: id, default: def });

describe('defaults', () => {
  it('reproduces the source when values are empty', () => {
    const html =
      '<section class="hero"><h1 data-cf="f1">{{cf:f1}}</h1><p data-cf="f2">{{cf:f2}}</p>' +
      '<a href="{{cf:f3.href}}" class="btn" data-cf="f3">{{cf:f3.text}}</a>' +
      '<img src="{{cf:f4.src}}" alt="{{cf:f4.alt}}" data-cf="f4"></section>';
    const fields = [
      f('f1', 'text', 'Hello & <welcome>'),
      f('f2', 'textarea', 'a\nb'),
      f('f3', 'link', { text: 'Go', href: '/go?a=1&b=2' }),
      f('f4', 'image', { src: '/a.png', alt: 'Alt "q"' }),
    ];
    const out = render(mk(html, fields), true).html;
    const expected =
      '<section class="hero"><h1 data-cf="f1">Hello &amp; &lt;welcome&gt;</h1><p data-cf="f2">a<br>b</p>' +
      '<a href="/go?a=1&amp;b=2" class="btn" data-cf="f3">Go</a>' +
      '<img src="/a.png" alt="Alt &quot;q&quot;" data-cf="f4"></section>';
    expect(parse(out).body.innerHTML).toBe(parse(expected).body.innerHTML);
    expect(renderWithDefaults(mk(html, fields, { f1: 'IGNORED' }))).toBe(out);
  });

  it('falls back to defaults for missing values and wrong shapes', () => {
    const fields = [f('f1', 'text', 'DEF'), f('f2', 'link', { text: 'DT', href: '/d' })];
    const d = mk('<p>{{cf:f1}}</p><a href="{{cf:f2.href}}">{{cf:f2.text}}</a>', fields, {
      f1: { text: 'object for string' } as unknown as FieldValue,
      f2: 'string for object' as unknown as FieldValue,
    });
    expect(render(d).html).toBe('<p>DEF</p><a href="/d">DT</a>');
  });

  it('uses the default for a sub-key missing from an object value', () => {
    const fields = [f('f2', 'link', { text: 'DT', href: '/d' })];
    const d = mk('<a href="{{cf:f2.href}}">{{cf:f2.text}}</a>', fields, { f2: { text: 'Mine' } });
    expect(render(d).html).toBe('<a href="/d">Mine</a>');
  });

  it('renders an explicitly emptied value as empty (not the default)', () => {
    const d = mk('<p>{{cf:f1}}</p>', [f('f1', 'text', 'DEF')], { f1: '' });
    expect(render(d).html).toBe('<p></p>');
  });
});

describe('text / textarea', () => {
  it('escapes markup and attribute breakouts in text', () => {
    const d = mk('<h1>{{cf:f1}}</h1>', [f('f1', 'text', 'x')], { f1: XSS });
    const { html } = render(d);
    expect(html).toBe('<h1>"&gt;&lt;img src=x onerror=alert(1)&gt;</h1>');
    const doc = assertSafe(html);
    expect(doc.querySelector('img')).toBeNull();
    expect(doc.querySelector('h1')!.textContent).toBe(XSS);
  });

  it('escapes </script> and <script> payloads', () => {
    const d = mk('<div>{{cf:f1}}</div>', [f('f1', 'text', '')], { f1: '</div><script>alert(1)</script>' });
    const doc = assertSafe(render(d).html);
    expect(doc.body.children.length).toBe(1);
  });

  it('textarea: escapes and converts newlines to <br>', () => {
    const d = mk('<p>{{cf:f1}}</p>', [f('f1', 'textarea', '')], { f1: '<script>alert(1)</script>\nline2\r\nline3\rline4' });
    const { html } = render(d);
    expect(html).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;<br>line2<br>line3<br>line4</p>');
    assertSafe(html);
  });
});

describe('richtext', () => {
  it('sanitizes through sanitizeRichText', () => {
    const payload =
      '<b>ok</b><img src=x onerror=alert(1)><script>alert(1)</script><a href="javascript:alert(1)" onclick="x()">l</a><a href="https://a.com" target="_blank">m</a>';
    const d = mk('<div>{{cf:f1}}</div>', [f('f1', 'richtext', '')], { f1: payload });
    const { html } = render(d);
    const doc = assertSafe(html);
    expect(doc.querySelector('b')!.textContent).toBe('ok');
    expect(doc.querySelector('img')).toBeNull();
    const links = doc.querySelectorAll('a');
    expect(links[0].getAttribute('href')).toBeNull();
    expect(links[1].getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('in an attribute it is escaped as plain text', () => {
    const d = mk('<div title="{{cf:f1}}"></div>', [f('f1', 'richtext', '')], { f1: '<b onclick=x>"' });
    const doc = assertSafe(render(d).html);
    expect(doc.querySelector('div')!.getAttribute('title')).toBe('<b onclick=x>"');
  });
});

describe('link', () => {
  const fields = [f('f1', 'link', { text: 'Go', href: '/go', target: '_self' })];
  const html = '<a href="{{cf:f1.href}}" data-cf="f1">{{cf:f1.text}}</a>';

  it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)', '\u0000javascript:alert(1)', 'data:text/html,x', 'vbscript:x'])(
    'neutralizes href %j',
    (href) => {
      const doc = assertSafe(render(mk(html, fields, { f1: { text: 'x', href } })).html);
      expect(doc.querySelector('a')!.getAttribute('href')).toBe('#');
    },
  );

  it('keeps safe hrefs', () => {
    for (const href of ['https://a.com/x?y=1&z=2', 'mailto:a@b.co', 'tel:+1', '/rel', '#anchor']) {
      const doc = assertSafe(render(mk(html, fields, { f1: { text: 'x', href } })).html);
      expect(doc.querySelector('a')!.getAttribute('href')).toBe(href);
    }
  });

  it('escapes breakout payloads in href and text', () => {
    const doc = assertSafe(render(mk(html, fields, { f1: { text: XSS, href: XSS } })).html);
    expect(doc.querySelectorAll('a').length).toBe(1);
    expect(doc.querySelector('img')).toBeNull();
    expect(doc.querySelector('a')!.textContent).toBe(XSS);
    expect(doc.querySelector('a')!.getAttribute('href')).toBe(XSS);
  });

  it('adds target and rel from the value when the tag is bound with data-cf', () => {
    const doc = assertSafe(render(mk(html, fields, { f1: { text: 'x', href: 'https://a.com', target: '_blank' } })).html);
    const a = doc.querySelector('a')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('adds nothing for _self, missing or invalid targets', () => {
    for (const target of ['_self', undefined, '_top', 'foo" onclick="x', '_BLANK ']) {
      const out = render(mk(html, fields, { f1: { text: 'x', href: '/a', target } as FieldValue })).html;
      const a = assertSafe(out).querySelector('a')!;
      if (target === '_BLANK ') {
        expect(a.getAttribute('target')).toBe('_blank');
        expect(a.getAttribute('rel')).toBe('noopener noreferrer');
      } else {
        expect(a.hasAttribute('target')).toBe(false);
        expect(a.hasAttribute('rel')).toBe(false);
      }
    }
  });

  it('with an explicit target token only _self/_blank are emitted and _blank gets rel', () => {
    const h = '<a href="{{cf:f1.href}}" target="{{cf:f1.target}}" data-cf="f1">{{cf:f1.text}}</a>';
    const run = (target: unknown) => assertSafe(render(mk(h, fields, { f1: { text: 'x', href: '/a', target } as FieldValue })).html).querySelector('a')!;
    expect(run('_blank').getAttribute('target')).toBe('_blank');
    expect(run('_blank').getAttribute('rel')).toBe('noopener noreferrer');
    expect(run('_top').getAttribute('target')).toBe('_self');
    expect(run('_top').hasAttribute('rel')).toBe(false);
    expect(run('"><script>').getAttribute('target')).toBe('_self');
  });

  it('merges an existing rel instead of duplicating it', () => {
    const h = '<a href="{{cf:f1.href}}" rel="nofollow" data-cf="f1">{{cf:f1.text}}</a>';
    const a = assertSafe(render(mk(h, fields, { f1: { text: 'x', href: '/a', target: '_blank' } })).html).querySelector('a')!;
    expect(a.getAttribute('rel')).toBe('nofollow noopener noreferrer');
    expect(a.getAttribute('target')).toBe('_blank');
  });
});

describe('image', () => {
  const fields = [f('f1', 'image', { src: '/default.png', alt: 'def' })];
  const html = '<img src="{{cf:f1.src}}" alt="{{cf:f1.alt}}" data-cf="f1">';

  it('escapes breakout payloads in src and alt', () => {
    const doc = assertSafe(render(mk(html, fields, { f1: { src: XSS, alt: XSS } })).html);
    expect(doc.body.children.length).toBe(1);
    const img = doc.querySelector('img')!;
    expect(img.getAttribute('src')).toBe(XSS);
    expect(img.getAttribute('alt')).toBe(XSS);
    expect(img.hasAttribute('onerror')).toBe(false);
  });

  it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html;base64,AAA', '\tjavascript:alert(1)'])('blocks src %j', (src) => {
    const doc = assertSafe(render(mk(html, fields, { f1: { src, alt: 'x' } })).html);
    expect(doc.querySelector('img')!.getAttribute('src')).toBe('');
  });

  it('data-src and data-lazy-src are treated as URLs', () => {
    const h = '<img data-src="{{cf:f1.src}}" data-lazy-src="{{cf:f1.src}}" poster="{{cf:f1.src}}">';
    const img = assertSafe(render(mk(h, fields, { f1: { src: 'javascript:alert(1)' } })).html).querySelector('img')!;
    expect(img.getAttribute('data-src')).toBe('');
    expect(img.getAttribute('data-lazy-src')).toBe('');
    expect(img.getAttribute('poster')).toBe('');
  });

  it('keeps srcset, sizes and <picture> sources while the value equals the default', () => {
    const h =
      '<picture><source srcset="/a.webp" type="image/webp"><img src="{{cf:f1.src}}" srcset="/a.png 1x, /a2.png 2x" sizes="100vw" alt="{{cf:f1.alt}}" data-cf="f1"></picture>';
    const doc = assertSafe(render(mk(h, fields, { f1: { src: '/default.png', alt: 'new alt' } })).html);
    expect(doc.querySelectorAll('source').length).toBe(1);
    const img = doc.querySelector('img')!;
    expect(img.getAttribute('srcset')).toBe('/a.png 1x, /a2.png 2x');
    expect(img.getAttribute('sizes')).toBe('100vw');
    expect(img.getAttribute('alt')).toBe('new alt');
  });

  it('drops srcset, sizes and <picture> sources once the src differs from the default', () => {
    const h =
      '<picture><source srcset="/a.webp" type="image/webp"><source srcset="/a.avif"><img src="{{cf:f1.src}}" srcset="/a.png 1x" sizes="100vw" alt="x" data-cf="f1"></picture><picture><source srcset="/keep.webp"><img src="/static.png"></picture>';
    const doc = assertSafe(render(mk(h, fields, { f1: { src: '/uploaded.png', alt: 'x' } })).html);
    const pictures = doc.querySelectorAll('picture');
    expect(pictures[0].querySelectorAll('source').length).toBe(0);
    const img = pictures[0].querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/uploaded.png');
    expect(img.hasAttribute('srcset')).toBe(false);
    expect(img.hasAttribute('sizes')).toBe(false);
    expect(img.getAttribute('alt')).toBe('x');
    // unrelated picture untouched
    expect(pictures[1].querySelectorAll('source').length).toBe(1);
  });
});

describe('bgImage', () => {
  const fields = [f('f1', 'bgImage', { src: '/bg.png' })];

  it('inline style: url value is percent-encoded and stays inside url(\'…\')', () => {
    const h = '<div style="color:red;background-image:url(\'{{cf:f1.src}}\');margin:0" data-cf="f1"></div>';
    const payload = "') ; } body{background:red";
    const { html } = render(mk(h, fields, { f1: { src: payload } }));
    const doc = assertSafe(html);
    const style = doc.querySelector('div')!.getAttribute('style')!;
    expect(style).toMatch(/^color:red;background-image:url\('[^'")\s;{}]*'\);margin:0$/);
    expect(style).not.toContain('body{');
    expect(doc.body.children.length).toBe(1);
  });

  it('inline style: quote / attribute breakouts stay inside the attribute', () => {
    const h = '<div style="background-image:url(\'{{cf:f1.src}}\')"></div>';
    const doc = assertSafe(render(mk(h, fields, { f1: { src: XSS + "'\"" } })).html);
    expect(doc.body.children.length).toBe(1);
    expect(doc.querySelector('div')!.getAttribute('style')).not.toMatch(/['"<>]{2}/);
  });

  it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:image/svg+xml,<svg onload=x>', 'vbscript:x'])(
    'inline style blocks scheme %j',
    (src) => {
      const h = '<div style="background-image:url(\'{{cf:f1.src}}\')"></div>';
      const style = assertSafe(render(mk(h, fields, { f1: { src } })).html).querySelector('div')!.getAttribute('style');
      expect(style).toBe("background-image:url('')");
    },
  );

  it('cssScoped: url token is encoded and cannot break out', () => {
    const css = '[data-chs="0123456789"] .a{background-image:url(\'{{cf:f1.src}}\');color:blue}';
    const { css: out } = render(mk('<p></p>', fields, { f1: { src: "') ; } body{background:red" } }, css));
    expect(out).toMatch(/^\[data-chs="0123456789"\] \.a\{background-image:url\('[^'")\s;{}]*'\);color:blue\}$/);
    expect(out).not.toContain('body{background:red');
  });

  it('cssScoped: unsafe schemes produce an empty url', () => {
    const css = '.a{background:url("{{cf:f1.src}}")}';
    expect(render(mk('', fields, { f1: { src: 'javascript:alert(1)' } }, css)).css).toBe('.a{background:url("")}');
    expect(render(mk('', fields, { f1: { src: '\u0000JaVa\tScRiPt:alert(1)' } }, css)).css).toBe('.a{background:url("")}');
  });

  it('cssScoped: unquoted url() is encoded as well', () => {
    const css = '.a{background:url({{cf:f1.src}})}';
    const out = render(mk('', fields, { f1: { src: 'a b).evil{x:y}' } }, css)).css;
    expect(out).toBe('.a{background:url(a%20b%29.evil%7Bx:y%7D)}');
  });

  it('cssScoped passes through safeStyleText (no raw "<")', () => {
    const css = '.a::after{content:"</style><script>"}';
    expect(render(mk('', [], {}, css)).css).not.toContain('<');
  });
});

describe('color', () => {
  const fields = [f('c1', 'color', { value: '#112233' })];
  const css = ':root{--primary:{{cf:c1.value}}}';

  it('accepts valid colors', () => {
    expect(render(mk('', fields, { c1: { value: '#ff0000' } }, css)).css).toBe(':root{--primary:#ff0000}');
    expect(render(mk('', fields, { c1: { value: 'rgba(1,2,3,.5)' } }, css)).css).toBe(':root{--primary:rgba(1,2,3,.5)}');
    expect(render(mk('', fields, { c1: { value: 'red' } }, css)).css).toBe(':root{--primary:red}');
  });

  it.each(['red;}body{background:red', 'url(javascript:alert(1))', '#12', 'expression(alert(1))', '</style><script>alert(1)</script>', "'); } body{background:red", ''])(
    'falls back to the default for %j',
    (value) => {
      const out = render(mk('', fields, { c1: { value } }, css)).css;
      expect(out).toBe(':root{--primary:#112233}');
    },
  );

  it('works in a style attribute too', () => {
    const h = '<div style="color:{{cf:c1.value}}"></div>';
    expect(assertSafe(render(mk(h, fields, { c1: { value: '#abc' } })).html).querySelector('div')!.getAttribute('style')).toBe('color:#abc');
    expect(assertSafe(render(mk(h, fields, { c1: { value: '"><b>' } })).html).querySelector('div')!.getAttribute('style')).toBe('color:#112233');
  });
});

describe('video', () => {
  const fields = [f('v1', 'video', { src: '/v.mp4', poster: '/p.png' })];
  const html = '<video poster="{{cf:v1.poster}}" data-cf="v1"><source src="{{cf:v1.src}}" type="video/mp4"></video>';

  it('keeps <source type> while the value equals the default', () => {
    const doc = assertSafe(render(mk(html, fields, { v1: { src: '/v.mp4', poster: '/other.png' } })).html);
    expect(doc.querySelector('source')!.getAttribute('type')).toBe('video/mp4');
    expect(doc.querySelector('video')!.getAttribute('poster')).toBe('/other.png');
  });

  it('removes <source type> when the src differs', () => {
    const doc = assertSafe(render(mk(html, fields, { v1: { src: '/new.webm', poster: '/p.png' } })).html);
    const source = doc.querySelector('source')!;
    expect(source.getAttribute('src')).toBe('/new.webm');
    expect(source.hasAttribute('type')).toBe(false);
  });

  it('neutralizes javascript: and breakout payloads in src and poster', () => {
    const doc = assertSafe(render(mk(html, fields, { v1: { src: 'javascript:alert(1)', poster: 'JaVaScRiPt:alert(1)' } })).html);
    expect(doc.querySelector('source')!.getAttribute('src')).toBe('');
    expect(doc.querySelector('video')!.getAttribute('poster')).toBe('');
    const doc2 = assertSafe(render(mk(html, fields, { v1: { src: XSS, poster: XSS } })).html);
    expect(doc2.querySelectorAll('img').length).toBe(0);
    expect(doc2.querySelector('video')!.getAttribute('poster')).toBe(XSS);
  });
});

describe('embed', () => {
  const fields = [f('e1', 'embed', { src: 'https://www.youtube.com/embed/abc' })];
  const html = '<iframe src="{{cf:e1.src}}" data-cf="e1"></iframe>';

  it('allows allow-listed hosts', () => {
    const src = 'https://player.vimeo.com/video/123';
    expect(assertSafe(render(mk(html, fields, { e1: { src } })).html).querySelector('iframe')!.getAttribute('src')).toBe(src);
  });

  it.each(['https://evil.com/x', 'javascript:alert(1)', 'http://www.youtube.com/embed/a', 'data:text/html,<script>alert(1)</script>', XSS, '//www.youtube.com/embed/a'])(
    'blocks %j',
    (src) => {
      const doc = assertSafe(render(mk(html, fields, { e1: { src } })).html);
      expect(doc.querySelector('iframe')!.getAttribute('src')).toBe('');
      expect(doc.querySelectorAll('img').length).toBe(0);
    },
  );

  it('uses the embed rules for any iframe src even when the field is not an embed', () => {
    const h = '<iframe src="{{cf:t1}}"></iframe>';
    const out = render(mk(h, [f('t1', 'text', '')], { t1: 'https://evil.com/' })).html;
    expect(out).toBe('<iframe src=""></iframe>');
  });
});

describe('icon', () => {
  const fields = [f('i1', 'icon', { svg: '<svg viewBox="0 0 1 1"><path d="M0 0"/></svg>' })];
  const html = '<span class="ico" data-cf="i1">{{cf:i1.svg}}</span>';

  it('renders the default svg', () => {
    const doc = assertSafe(render(mk(html, fields)).html);
    expect(doc.querySelector('path')!.getAttribute('d')).toBe('M0 0');
  });

  it('sanitizes script, handlers, foreignObject and external refs', () => {
    const svg =
      '<svg onload="alert(1)" viewBox="0 0 1 1"><script>alert(1)</script><foreignObject><img src=x onerror=alert(1)></foreignObject><a href="javascript:alert(1)"><path d="M0 0" onclick="x()"/></a><use href="https://evil.com/x.svg#a"/><image href="x"/></svg><img src=x onerror=alert(1)>';
    const doc = assertSafe(render(mk(html, fields, { i1: { svg } })).html);
    expect(doc.querySelector('img')).toBeNull();
    expect(doc.querySelector('foreignObject')).toBeNull();
    expect(doc.querySelector('svg')!.hasAttribute('onload')).toBe(false);
    expect(doc.querySelector('use')!.hasAttribute('href')).toBe(false);
  });

  it('in an attribute the svg is escaped text', () => {
    const h = '<div data-x="{{cf:i1.svg}}"></div>';
    const doc = assertSafe(render(mk(h, fields, { i1: { svg: '"><script>alert(1)</script>' } })).html);
    expect(doc.body.children.length).toBe(1);
  });
});

describe('token handling', () => {
  it('never substitutes tokens that appear inside values (single pass)', () => {
    const fields = [f('a', 'text', ''), f('b', 'text', 'SECRET'), f('c', 'link', {}), f('d', 'color', { value: 'red' })];
    const d = mk(
      '<p>{{cf:a}}</p><a href="{{cf:c.href}}" title="{{cf:a}}">{{cf:c.text}}</a>',
      fields,
      { a: '{{cf:b}}', c: { text: '{{cf:b}}', href: '/{{cf:b}}' } },
      '.x{--c:{{cf:d.value}}}',
    );
    const out = render(d);
    expect(out.html).not.toContain('SECRET');
    expect(out.html).toContain('<p>{{cf:b}}</p>');
    expect(out.html).toContain('title="{{cf:b}}"');
    expect(out.html).toContain('href="/{{cf:b}}"');
    expect(out.css).toBe('.x{--c:red}');
  });

  it('does not substitute a token that a value tries to assemble', () => {
    const d = mk('<p>{{cf:a}}{{cf:b}}</p>', [f('a', 'text', ''), f('b', 'text', ''), f('c', 'text', 'SECRET')], { a: '{{cf:', b: 'c}}' });
    expect(render(d).html).toBe('<p>{{cf:c}}</p>');
  });

  it('{{cf:__lit}} renders the literal token opener', () => {
    const d = mk('<p>use {{cf:__lit}}id}} syntax</p><b title="{{cf:__lit}}">x</b>', []);
    const out = render(d).html;
    expect(out).toBe('<p>use {{cf:id}} syntax</p><b title="{{cf:">x</b>');
  });

  it('unknown tokens render as empty string in every context', () => {
    const d = mk('<p title="{{cf:nope}}">a{{cf:nope.x}}b{{cf:f1.nope}}c</p>', [f('f1', 'text', 'T')], {}, '.a{color:{{cf:nope}}}');
    const out = render(d);
    expect(out.html).toBe('<p title="">abc</p>');
    expect(out.css).toBe('.a{color:}');
  });

  it('a token with the wrong sub-key for its type renders empty', () => {
    const d = mk('<p>{{cf:f1.x}}{{cf:f2}}{{cf:f2.constructor}}{{cf:f2.__proto__}}</p>', [f('f1', 'text', 'T'), f('f2', 'link', { text: 'L' })]);
    expect(render(d).html).toBe('<p></p>');
  });

  it('constructor / __proto__ / prototype keys do not resolve', () => {
    const fields = [f('f1', 'text', 'DEF')];
    const values = JSON.parse('{"constructor":"EVIL","__proto__":"EVIL2","toString":"EVIL3","f1":"ok"}');
    const d = mk('<p>{{cf:constructor}}|{{cf:__proto__}}|{{cf:toString}}|{{cf:hasOwnProperty}}|{{cf:prototype}}|{{cf:f1}}</p>', fields, values);
    expect(render(d).html).toBe('<p>|||||ok</p>');
  });

  it('a field named "constructor" uses its own value only', () => {
    const fields = [f('constructor', 'text', 'DEFAULT')];
    expect(render(mk('<p>{{cf:constructor}}</p>', fields, {})).html).toBe('<p>DEFAULT</p>');
    expect(render(mk('<p>{{cf:constructor}}</p>', fields, { constructor: 'mine' })).html).toBe('<p>mine</p>');
  });

  it('ignores values inherited through the prototype chain', () => {
    const inherited = Object.create({ f1: 'INHERITED' });
    const d = mk('<p>{{cf:f1}}</p>', [f('f1', 'text', 'DEF')]);
    d.values = inherited;
    expect(render(d).html).toBe('<p>DEF</p>');
  });

  it('on* attributes never receive token values', () => {
    const d = mk('<a onclick="{{cf:f1}}" onmouseover="x{{cf:f1}}" href="/">x</a>', [f('f1', 'text', 'alert(1)')], { f1: 'alert(1)' });
    const out = render(d).html;
    expect(out).not.toContain('alert');
  });

  it('srcset, srcdoc and sizes never receive token values', () => {
    const d = mk('<img srcset="{{cf:f1}}" sizes="{{cf:f1}}"><iframe srcdoc="{{cf:f1}}"></iframe>', [f('f1', 'text', '<script>alert(1)</script>')]);
    const out = render(d).html;
    expect(out).not.toContain('alert');
  });

  it('tokens inside <script> are dropped and <style> tokens use CSS rules', () => {
    const d = mk(
      '<script>var x = "{{cf:f1}}";</script><style>.a{color:{{cf:c1.value}}}</style>',
      [f('f1', 'text', 'v'), f('c1', 'color', { value: 'blue' })],
      { c1: { value: 'red;}x{y:z' } },
    );
    expect(render(d).html).toBe('<script>var x = "";</script><style>.a{color:blue}</style>');
  });

  it('handles single-quoted, unquoted and boolean attributes', () => {
    const d = mk("<a href='{{cf:f1}}' title={{cf:f2}} hidden data-x=\"y\">x</a>", [f('f1', 'text', ''), f('f2', 'text', '')], {
      f1: "/a'b",
      f2: 'a b" onclick="x',
    });
    const doc = assertSafe(render(d).html);
    const a = doc.querySelector('a')!;
    expect(a.getAttribute('href')).toBe("/a'b");
    expect(a.getAttribute('title')).toBe('a b" onclick="x');
    expect(a.hasAttribute('hidden')).toBe(true);
    expect(a.getAttribute('data-x')).toBe('y');
  });

  it('tokens in attribute names are dropped', () => {
    const d = mk('<p {{cf:f1}}="x" class="c">t</p>', [f('f1', 'text', 'onclick')], { f1: 'onclick' });
    expect(render(d).html).toBe('<p class="c">t</p>');
  });

  it('tokens in comments are dropped, repeater markers removed', () => {
    const d = mk('<!-- {{cf:f1}} --><p>x</p><!--cf:rep:nope--><i>y</i><!--/cf:rep:nope-->', [f('f1', 'text', 'v')]);
    const out = render(d).html;
    expect(out).toBe('<!--  --><p>x</p>');
  });

  it('preserves template whitespace and attribute order', () => {
    const html = '<div  class="a"\n   id="b" data-cf="f1" >{{cf:f1}}</div>';
    expect(render(mk(html, [f('f1', 'text', 'x')]), true).html).toBe('<div  class="a"\n   id="b" data-cf="f1" >x</div>');
  });
});

describe('data-cf', () => {
  const html = '<h1 data-cf="f1" class="t">{{cf:f1}}</h1><img src="/a.png" data-cf=\'f2\'><p data-cf>z</p>';
  const fields = [f('f1', 'text', 'T'), f('f2', 'image', { src: '/a.png' })];

  it('is kept in builder mode', () => {
    expect(render(mk(html, fields), true).html).toBe('<h1 data-cf="f1" class="t">T</h1><img src="/a.png" data-cf=\'f2\'><p data-cf>z</p>');
  });

  it('is stripped when builder is false', () => {
    const out = render(mk(html, fields), false).html;
    expect(out).toBe('<h1 class="t">T</h1><img src="/a.png"><p>z</p>');
    expect(out).not.toContain('data-cf');
  });

  it('is kept by renderWithDefaults', () => {
    expect(renderWithDefaults(mk(html, fields))).toContain('data-cf="f1"');
  });
});

describe('repeater', () => {
  const fields: FieldDef[] = [
    {
      id: 'r1',
      type: 'repeater',
      label: 'List',
      default: [
        { title: 'One', link: { text: 'L1', href: '/1' } },
        { title: 'Two', link: { text: 'L2', href: '/2' } },
      ],
      children: [
        { id: 'title', type: 'text', label: 'Title', default: 'DefTitle' },
        { id: 'link', type: 'link', label: 'Link', default: { text: 'DefLink', href: '/def' } },
      ],
    },
    f('h', 'text', 'Heading'),
  ];
  const html =
    '<h2>{{cf:h}}</h2><ul data-cf="r1"><!--cf:rep:r1--><li data-cf="r1.$.title"><span>{{cf:r1.$.title}}</span><a href="{{cf:r1.$.link.href}}" data-cf="r1.$.link">{{cf:r1.$.link.text}}</a></li><!--/cf:rep:r1--></ul>';

  it('renders defaults once per item', () => {
    const doc = assertSafe(render(mk(html, fields)).html);
    const lis = doc.querySelectorAll('li');
    expect(lis.length).toBe(2);
    expect(lis[0].querySelector('span')!.textContent).toBe('One');
    expect(lis[1].querySelector('a')!.getAttribute('href')).toBe('/2');
    expect(doc.querySelector('h2')!.textContent).toBe('Heading');
    expect(render(mk(html, fields)).html).not.toContain('<!--');
  });

  it('renders the item count from values', () => {
    const items = [{ title: 'A' }, { title: 'B', link: { text: 'LB', href: '/b' } }, { title: 'C' }];
    const doc = assertSafe(render(mk(html, fields, { r1: items as unknown as FieldValue })).html);
    const lis = doc.querySelectorAll('li');
    expect(lis.length).toBe(3);
    expect(lis[0].querySelector('span')!.textContent).toBe('A');
    // child missing from the item -> child default
    expect(lis[0].querySelector('a')!.textContent).toBe('DefLink');
    expect(lis[0].querySelector('a')!.getAttribute('href')).toBe('/def');
    expect(lis[1].querySelector('a')!.textContent).toBe('LB');
    expect(lis[2].querySelector('span')!.textContent).toBe('C');
  });

  it('an empty array renders nothing', () => {
    const out = render(mk(html, fields, { r1: [] })).html;
    expect(out).toBe('<h2>Heading</h2><ul data-cf="r1"></ul>'.replace(' data-cf="r1"', ''));
    expect(render(mk(html, fields, { r1: [] }), true).html).toBe('<h2>Heading</h2><ul data-cf="r1"></ul>');
  });

  it('escapes and sanitizes values inside items', () => {
    const items = [{ title: XSS, link: { text: XSS, href: 'javascript:alert(1)', target: '_blank' } }, { title: '{{cf:h}}' }];
    const { html: out } = render(mk(html, fields, { r1: items as unknown as FieldValue }));
    const doc = assertSafe(out);
    expect(doc.querySelector('img')).toBeNull();
    const lis = doc.querySelectorAll('li');
    expect(lis[0].querySelector('span')!.textContent).toBe(XSS);
    expect(lis[0].querySelector('a')!.getAttribute('href')).toBe('#');
    expect(lis[0].querySelector('a')!.getAttribute('target')).toBe('_blank');
    expect(lis[0].querySelector('a')!.getAttribute('rel')).toBe('noopener noreferrer');
    expect(lis[1].querySelector('span')!.textContent).toBe('{{cf:h}}');
    expect(out).not.toContain('Heading</span>');
  });

  it('item data-cf markers get the item index in builder mode', () => {
    const out = render(mk(html, fields), true).html;
    expect(out).toContain('data-cf="r1.$0.title"');
    expect(out).toContain('data-cf="r1.$1.link"');
    expect(render(mk(html, fields), false).html).not.toContain('data-cf');
  });

  it('non-object items are ignored, wrong shape falls back to the default', () => {
    const bad = render(mk(html, fields, { r1: [null, 'x', { title: 'ok' }] as unknown as FieldValue })).html;
    expect(assertSafe(bad).querySelectorAll('li').length).toBe(1);
    const wrong = render(mk(html, fields, { r1: 'nope' as unknown as FieldValue })).html;
    expect(assertSafe(wrong).querySelectorAll('li').length).toBe(2);
  });

  it('caps the number of rendered items', () => {
    const many = Array.from({ length: 150 }, (_, i) => ({ title: 't' + i }));
    expect(assertSafe(render(mk(html, fields, { r1: many })).html).querySelectorAll('li').length).toBe(100);
  });

  it('an item token for a repeater index that does not exist renders empty', () => {
    const d = mk('<p>{{cf:r1.$7.title}}|{{cf:r1}}|{{cf:r1.$.title}}</p>', fields);
    expect(render(d).html).toBe('<p>||</p>');
  });

  it('a repeater block for an unknown field is removed', () => {
    expect(render(mk('<p>a</p><!--cf:rep:zzz--><i>{{cf:zzz.$.x}}</i><!--/cf:rep:zzz--><p>b</p>', [])).html).toBe('<p>a</p><p>b</p>');
  });
});

describe('robustness', () => {
  it('never throws on malformed data, falling back to empty output', () => {
    const bad = { template: null, fields: null, values: null } as unknown as ReturnType<typeof mk>;
    expect(render(bad)).toEqual({ html: '', css: '' });
    expect(renderWithDefaults(bad)).toBe('');
    const partial = { template: { html: 5, cssScoped: {} }, fields: [null, 1, { id: 3 }], values: 'x' } as unknown as ReturnType<typeof mk>;
    expect(render(partial)).toEqual({ html: '', css: '' });
  });

  it('falls back to defaults when rendering with values throws', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const poisoned = {} as Record<string, FieldValue>;
    Object.defineProperty(poisoned, 'f1', {
      enumerable: true,
      get() {
        throw new Error('boom');
      },
    });
    const out = render(mk('<p>{{cf:f1}}</p>', [f('f1', 'text', 'DEF')], poisoned));
    expect(out.html).toBe('<p>DEF</p>');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('survives malformed markup', () => {
    const d = mk('<div class="a{{cf:f1}}<p {{cf:f1}} <a href="{{cf:f1}}', [f('f1', 'text', 'x')]);
    expect(() => render(d)).not.toThrow();
    expect(render(d).html.length).toBeGreaterThan(0);
  });

  it('every field type with hostile values produces output with no script, on* or javascript: URLs', () => {
    const hostile = {
      t: XSS,
      ta: XSS + '\n' + XSS,
      rt: '<img src=x onerror=alert(1)><script>alert(1)</script>' + XSS,
      lk: { text: XSS, href: 'javascript:alert(1)', target: XSS },
      im: { src: 'java\tscript:alert(1)', alt: XSS },
      bg: { src: "javascript:alert(1)') ; } body{background:red" },
      vd: { src: 'JaVaScRiPt:alert(1)', poster: '\u0000javascript:alert(1)' },
      em: { src: 'https://evil.example/' + XSS },
      ic: { svg: '<svg onload=alert(1)><script>alert(1)</script></svg>' },
      co: { value: 'red;}</style><script>alert(1)</script>' },
    } as unknown as Record<string, FieldValue>;
    const fields = [
      f('t', 'text', ''),
      f('ta', 'textarea', ''),
      f('rt', 'richtext', ''),
      f('lk', 'link', {}),
      f('im', 'image', {}),
      f('bg', 'bgImage', {}),
      f('vd', 'video', {}),
      f('em', 'embed', {}),
      f('ic', 'icon', {}),
      f('co', 'color', { value: 'blue' }),
    ];
    const html =
      '<h1>{{cf:t}}</h1><p>{{cf:ta}}</p><div>{{cf:rt}}</div><a href="{{cf:lk.href}}" target="{{cf:lk.target}}" title="{{cf:t}}">{{cf:lk.text}}</a>' +
      '<img src="{{cf:im.src}}" alt="{{cf:im.alt}}"><div style="background-image:url(\'{{cf:bg.src}}\');color:{{cf:co.value}}"></div>' +
      '<video poster="{{cf:vd.poster}}"><source src="{{cf:vd.src}}"></video><iframe src="{{cf:em.src}}"></iframe><i>{{cf:ic.svg}}</i>';
    const out = render(mk(html, fields, hostile, '.a{background:url("{{cf:bg.src}}");color:{{cf:co.value}}}'), false);
    const doc = assertSafe(out.html);
    expect(doc.querySelectorAll('img').length).toBe(1);
    expect(out.css).not.toContain('body{background:red');
    expect(out.css).toMatch(/^\.a\{background:url\("[^"'()\s;{}]*"\);color:blue\}$/);
    expect(out.css).toMatch(/color:blue\}$/);
  });
});

describe('integration with extract / detect / tokenize', () => {
  const normalize = (root: Element): string => {
    const clone = root.cloneNode(true) as Element;
    const all = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
    all.forEach((el: Element) => {
      ['data-cf', 'target', 'rel', 'style'].forEach((a) => el.removeAttribute(a));
    });
    return clone.innerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  };

  const fixtures = ['partner-showcase', 'fleet-tailwind', 'flow-builder-tabs'];
  it.each(fixtures)('renderWithDefaults(tokenized %s) matches the detected DOM', async (name) => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { extractSource } = await import('@/lib/custom-html/extract');
    const { detectFields } = await import('@/lib/custom-html/detect');
    const { tokenizeHtml } = await import('@/lib/custom-html/tokenize');
    const source = readFileSync(join(__dirname, 'fixtures', name + '.html'), 'utf8');
    const extracted = extractSource(source);
    const detected = detectFields(extracted.html);
    const tokenized = tokenizeHtml(detected.root, detected.fields);
    const data = mk(tokenized, detected.fields);
    const rendered = renderWithDefaults(data);
    expect(rendered).not.toContain('{{cf:');
    const doc = parse(rendered);
    const text = (el: Element) => (el.textContent || '').replace(/\s+/g, ' ').trim();
    // defaults reproduce the detected source (text content)
    expect(text(doc.body)).toBe(text(detected.root));
    // public render strips editor markers
    const pub = render(data, false).html;
    expect(parse(pub).querySelectorAll('[data-cf]').length).toBe(0);
  });
});
