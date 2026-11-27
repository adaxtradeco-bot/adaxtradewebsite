import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as acornParse } from 'acorn';
import { describe, expect, it } from 'vitest';
import { detectFields } from '@/lib/custom-html/detect';
import { extractSource } from '@/lib/custom-html/extract';
import { buildRuntimeJs, rewriteInlineHandlers } from '@/lib/custom-html/handlers';
import { renderWithDefaults } from '@/lib/custom-html/render';
import { detectCssFields, tokenizeHtml } from '@/lib/custom-html/tokenize';
import { TOKEN_RE, type FieldDef } from '@/lib/custom-html/types';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

function tokenizeSource(html: string, opts?: Parameters<typeof detectFields>[1]) {
  const r = detectFields(html, opts);
  return { ...r, tokenized: tokenizeHtml(r.root, r.fields) };
}

/** The template rendered with its field defaults, to compare with the source. */
function renderDefaults(tokenized: string, fields: FieldDef[]): string {
  const template = {
    html: tokenized, css: '', cssScoped: '', js: '', jsSource: '',
    externalScripts: [], externalStylesheets: [], scope: '0123456789',
  };
  return renderWithDefaults({ template, fields });
}

/** Fields including repeater children. */
const countFields = (fields: FieldDef[]): number => fields.reduce((n, f) => n + 1 + (f.children?.length ?? 0), 0);

const norm = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();

describe('tokenizeHtml — per field type (spec §5)', () => {
  it('text / richtext / textarea replace the element content', () => {
    const r = tokenizeSource('<h2>Title</h2><p>A<br>B</p><h3>X <em>y</em></h3>');
    expect(r.tokenized).toBe(
      '<h2 data-cf="f1">{{cf:f1}}</h2><p data-cf="f2">{{cf:f2}}</p><h3 data-cf="f3">{{cf:f3}}</h3>'
    );
  });

  it('link tokenises href and text and drops target/rel', () => {
    const r = tokenizeSource('<a class="b" href="/x" target="_blank" rel="noopener" download>Go <span>→</span></a>');
    expect(r.tokenized).toBe(
      '<a class="b" href="{{cf:f1.href}}" download="" data-cf="f1">{{cf:f1.text}}</a>'
    );
  });

  it('link around an image is href-only and the image is tokenised', () => {
    const r = tokenizeSource('<a href="/x"><img src="a.png" alt="A" class="i"></a>');
    expect(r.tokenized).toBe(
      '<a href="{{cf:f1.href}}" data-cf="f1"><img src="{{cf:f2.src}}" alt="{{cf:f2.alt}}" class="i" data-cf="f2"></a>'
    );
  });

  it('image tokenises src, alt and lazy attributes', () => {
    const r = tokenizeSource('<img data-src="https://x/y.png" src="data:image/gif;base64,AAAA" alt="Y" srcset="a 1x, b 2x">');
    expect(r.tokenized).toContain('src="{{cf:f1.src}}"');
    expect(r.tokenized).toContain('alt="{{cf:f1.alt}}"');
    expect(r.tokenized).toContain('data-src="{{cf:f1.src}}"');
    expect(r.tokenized).toContain('srcset="a 1x, b 2x"');
  });

  it('video tokenises poster and own src, or the first <source>', () => {
    const own = tokenizeSource('<video src="a.mp4" poster="p.jpg" controls></video>');
    expect(own.tokenized).toBe(
      '<video src="{{cf:f1.src}}" poster="{{cf:f1.poster}}" controls="" data-cf="f1"></video>'
    );
    const withSource = tokenizeSource('<video poster="p.jpg"><source src="a.mp4" type="video/mp4"><source src="b.webm"></video>');
    expect(withSource.tokenized).toContain('<source src="{{cf:f1.src}}" type="video/mp4">');
    expect(withSource.tokenized).toContain('<source src="b.webm">');
    expect(withSource.tokenized).toContain('poster="{{cf:f1.poster}}"');
  });

  it('embed tokenises the iframe src', () => {
    const r = tokenizeSource('<iframe src="https://www.youtube.com/embed/x" title="T"></iframe>');
    expect(r.tokenized).toBe('<iframe src="{{cf:f1.src}}" title="T" data-cf="f1"></iframe>');
  });

  it('icon replaces the wrapper content (not the svg)', () => {
    const r = tokenizeSource('<div class="ic"><svg viewBox="0 0 1 1"><path d="M0 0"/></svg></div>');
    expect(r.tokenized).toBe('<div class="ic" data-cf="f1">{{cf:f1.svg}}</div>');
  });

  it('bgImage replaces only the url() in the inline style', () => {
    const r = tokenizeSource(
      '<div style="color:red; background: linear-gradient(#000,#111), url(\'a.jpg\') center / cover; margin:0"><p>x</p></div>'
    );
    expect(r.tokenized).toContain("url('{{cf:f1.src}}') center / cover");
    expect(r.tokenized).toContain('linear-gradient(#000,#111)');
    expect(r.tokenized).toContain('color:red');
    expect(r.tokenized).toContain('margin:0');
    expect(r.tokenized).toContain('{{cf:f2}}'); // the paragraph inside is still detected
  });

  it('placeholder fields tokenise the placeholder attribute', () => {
    const r = tokenizeSource('<input type="email" placeholder="Work email"><textarea placeholder="Message"></textarea>');
    expect(r.tokenized).toBe(
      '<input type="email" placeholder="{{cf:f1}}" data-cf="f1"><textarea placeholder="{{cf:f2}}" data-cf="f2"></textarea>'
    );
  });

  it('does not mutate the given root and removes orphan markers', () => {
    const r = detectFields('<p>One</p><p>Two</p>');
    const before = r.root.innerHTML;
    const out = tokenizeHtml(r.root, [r.fields[0]]);
    expect(r.root.innerHTML).toBe(before);
    expect(out).toBe('<p data-cf="f1">{{cf:f1}}</p><p>Two</p>');
  });

  it('escapes literal "{{cf:" in text, comments and attributes', () => {
    const r = tokenizeSource(
      '<div title="a {{cf:evil}} b"><!-- {{cf:c}} --><h2>Title</h2><span class="x">Use {{cf:foo}} syntax</span></div>'
    );
    expect(r.tokenized).toContain('title="a {{cf:__lit}}evil}} b"');
    expect(r.tokenized).toContain('<!-- {{cf:__lit}}c}} -->');
    // the span is a text field, so its literal text lives in the default, not in the template
    expect(r.fields.find((f) => String(f.default).includes('syntax'))?.default).toBe('Use {{cf:foo}} syntax');
    const ids = Array.from(r.tokenized.matchAll(TOKEN_RE)).map((m) => m[1]);
    expect(ids.filter((id) => id !== '__lit').every((id) => r.fields.some((f) => f.id === id.split('.')[0]))).toBe(true);
    // static text outside any field is escaped as well
    const plain = tokenizeHtml(
      detectFields('<div><section><h2>H</h2></section>raw {{cf:z}} text</div>').root,
      []
    );
    expect(plain).toContain('raw {{cf:__lit}}z}} text');
  });

  it('keeps hint-less structure intact', () => {
    const r = tokenizeSource('<div class="a b" id="x"><span></span></div>');
    expect(r.tokenized).toBe('<div class="a b" id="x"><span></span></div>');
  });
});

describe('detectCssFields', () => {
  const scoped = `
[data-chs="abc1234567"] .hero { background-image: url('/img/hero.jpg'); color: red; }
[data-chs="abc1234567"] .card, [data-chs="abc1234567"] .card2 { background: #fff url("card.png") no-repeat; }
@media (max-width: 600px) { [data-chs="abc1234567"] .hero { background-image: url(mobile.jpg); } }
@font-face { font-family: X; src: url('/f/x.woff2') format('woff2'); }
@import url('https://fonts.googleapis.com/css2?family=X');
@keyframes slide { from { background-image: url(a.png) } to { background-image: url(b.png) } }
[data-chs="abc1234567"] .noise { background-image: url("data:image/svg+xml,%3Csvg%3E%3C/svg%3E"); }
[data-chs="abc1234567"] .icon { mask-image: url(mask.svg); cursor: url(c.cur), auto; }
[data-chs="abc1234567"] .tokenised { background-image: url('{{cf:f9.src}}'); }
`;

  it('replaces background urls in normal rules and adds bgImage fields', () => {
    const existing: FieldDef[] = [
      { id: 'f1', type: 'text', label: 'x', default: 'x' },
      { id: 'f7', type: 'text', label: 'y', default: 'y' },
    ];
    const r = detectCssFields(scoped, existing);
    expect(r.fields.slice(0, 2)).toEqual(existing);
    const added = r.fields.slice(2);
    expect(added.map((f) => f.id)).toEqual(['f8', 'f9', 'f10']);
    expect(added.map((f) => (f.default as { src: string }).src)).toEqual(['/img/hero.jpg', 'card.png', 'mobile.jpg']);
    expect(added.every((f) => f.type === 'bgImage' && f.group === 'Styles')).toBe(true);
    expect(r.cssScoped).toContain(".hero { background-image: url('{{cf:f8.src}}'); color: red; }");
    expect(r.cssScoped).toContain('#fff url(\'{{cf:f9.src}}\') no-repeat');
    expect(r.cssScoped).toContain("url('{{cf:f10.src}}')");
  });

  it('labels from the selector (scope prefix removed), unique and <= 48 chars', () => {
    const r = detectCssFields(scoped, []);
    expect(r.fields[0].label).toBe('Styles › .hero Background');
    expect(r.fields[1].label).toBe('Styles › .card Background');
    expect(r.fields[2].label).toBe('Styles › .hero Background 2');
    for (const f of r.fields) expect(f.label.length).toBeLessThanOrEqual(48);
  });

  it('skips @font-face, @import, @keyframes, data: URIs, other properties and existing tokens', () => {
    const r = detectCssFields(scoped, []);
    expect(r.cssScoped).toContain("src: url('/f/x.woff2')");
    expect(r.cssScoped).toContain("@import url('https://fonts.googleapis.com/css2?family=X')");
    expect(r.cssScoped).toContain('from { background-image: url(a.png) }');
    expect(r.cssScoped).toContain('data:image/svg+xml');
    expect(r.cssScoped).toContain('mask-image: url(mask.svg)');
    expect(r.cssScoped).toContain('cursor: url(c.cur)');
    expect(r.cssScoped).toContain("url('{{cf:f9.src}}')");
    expect(r.fields).toHaveLength(3);
  });

  it('returns the css unchanged when there is nothing to do', () => {
    const css = '[data-chs="a"] .x { color: red }';
    expect(detectCssFields(css, [])).toEqual({ cssScoped: css, fields: [] });
  });

  it('ignores url() inside comments and strings', () => {
    const css = '/* .a { background: url(no.png) } */ .b { content: "url(x.png)"; background: url(yes.png) }';
    const r = detectCssFields(css, []);
    expect(r.fields).toHaveLength(1);
    expect((r.fields[0].default as { src: string }).src).toBe('yes.png');
  });
});

describe('extract → detect → tokenize pipeline on fixtures', () => {
  const cases: Array<{ file: string; min: number; max: number }> = [
    { file: 'partner-showcase.html', min: 14, max: 40 },
    { file: 'flow-builder-tabs.html', min: 10, max: 40 },
    { file: 'fleet-tailwind.html', min: 14, max: 40 },
  ];

  for (const { file, min, max } of cases) {
    it(`${file}: reasonable field count and valid tokenised html`, () => {
      const ex = extractSource(fixture(file));
      expect(ex.errors).toEqual([]);
      const handlers = rewriteInlineHandlers(ex.html);
      const det = detectFields(handlers.html);
      expect(countFields(det.fields)).toBeGreaterThanOrEqual(min);
      expect(countFields(det.fields)).toBeLessThanOrEqual(max);

      let tokenized = tokenizeHtml(det.root, det.fields);
      let fields = det.fields;
      const css = detectCssFields(ex.css, fields);
      fields = css.fields;

      // tokenised html still parses and every token refers to a known field (or __lit)
      const reparsed = new DOMParser().parseFromString(`<body>${tokenized}</body>`, 'text/html');
      expect(reparsed.body.childNodes.length).toBeGreaterThan(0);
      for (const m of Array.from(`${tokenized}${css.cssScoped}`.matchAll(TOKEN_RE))) {
        const id = m[1];
        expect(id === '__lit' || fields.some((f) => id === f.id || id.startsWith(`${f.id}.`))).toBe(true);
      }

      // ids are unique and labels bounded
      expect(new Set(fields.map((f) => f.id)).size).toBe(fields.length);
      fields.forEach((f) => expect(f.label.length).toBeLessThanOrEqual(48));

      // rendering the template with defaults reproduces the visible text of the source
      tokenized = renderDefaults(tokenized, det.fields);
      const rendered = new DOMParser().parseFromString(`<body>${tokenized}</body>`, 'text/html').body;
      const source = new DOMParser().parseFromString(`<body>${handlers.html}</body>`, 'text/html').body;
      rendered.querySelectorAll('script, style').forEach((e) => e.remove());
      source.querySelectorAll('script, style').forEach((e) => e.remove());
      expect(norm(rendered)).toBe(norm(source));
    });
  }

  it('the generated runtime js of every fixture parses', () => {
    for (const file of ['partner-showcase.html', 'flow-builder-tabs.html', 'fleet-tailwind.html']) {
      const ex = extractSource(fixture(file));
      const h = rewriteInlineHandlers(ex.html);
      const js = buildRuntimeJs(ex.jsBlocks, h.handlerJs);
      expect(js).not.toBe('');
      expect(() => acornParse(`(${js})`, { ecmaVersion: 'latest', sourceType: 'script' })).not.toThrow();
    }
  });

  it('re-detecting a tokenised-with-defaults template keeps the same fields', () => {
    const ex = extractSource(fixture('partner-showcase.html'));
    const first = detectFields(ex.html);
    const again = detectFields(first.root.innerHTML);
    expect(again.fields.map((f) => f.id)).toEqual(first.fields.map((f) => f.id));
    expect(again.fields.map((f) => f.type)).toEqual(first.fields.map((f) => f.type));
  });
});
