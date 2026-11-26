import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MIXED_RUN_WARNING,
  detectFields,
  findStyleBgUrl,
  groupFor,
  labelFor,
  markElementAsField,
  unmarkField,
} from '@/lib/custom-html/detect';
import { extractSource } from '@/lib/custom-html/extract';
import type { FieldDef } from '@/lib/custom-html/types';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
const byType = (fields: FieldDef[], type: FieldDef['type']) => fields.filter((f) => f.type === type);
const markerFor = (root: Element, id: string) =>
  Array.from(root.querySelectorAll('[data-cf]')).find((e) => e.getAttribute('data-cf') === id) as Element;

describe('detectFields — heuristics on the partner showcase fixture', () => {
  const { html } = extractSource(fixture('partner-showcase.html'));
  const r = detectFields(html);

  it('assigns sequential ids and a data-cf marker per field', () => {
    expect(r.fields.map((f) => f.id)).toEqual(r.fields.map((_, i) => `f${i + 1}`));
    expect(r.root.querySelectorAll('[data-cf]')).toHaveLength(r.fields.length);
    expect(r.hasHints).toBe(false);
  });

  it('detects richtext for phrasing content and plain text for simple elements', () => {
    const h1 = r.fields.find((f) => (f.default as string).includes('will rely on'));
    expect(h1?.type).toBe('richtext');
    expect(h1?.default).toBe('A platform your clients<br>will rely on — <em>forever</em>');
    const label = r.fields.find((f) => (f.default as string).includes('White-label ready</span>'));
    expect(label?.type).toBe('richtext');
    const lead = r.fields.find((f) => f.default === 'From first session to live system in days.');
    expect(lead?.type).toBe('text');
    expect(r.fields.some((f) => f.default === 'Faster delivery')).toBe(true);
  });

  it('detects links with text and keeps target', () => {
    const links = byType(r.fields, 'link');
    expect(links).toHaveLength(2);
    expect(links[0].default).toEqual({ text: 'See the platform in action →', href: '#' });
    expect(links[1].default).toEqual({ text: 'Become a partner', href: '/partners', target: '_blank' });
  });

  it('detects icons on the wrapper element, not inside the svg', () => {
    const icons = byType(r.fields, 'icon');
    expect(icons).toHaveLength(2);
    const wrapper = markerFor(r.root, icons[0].id);
    expect(wrapper.className).toBe('snap-icon');
    expect((icons[0].default as { svg: string }).svg).toMatch(/^<svg[\s\S]*<\/svg>$/);
  });

  it('detects the image', () => {
    const img = byType(r.fields, 'image');
    expect(img).toHaveLength(1);
    expect(img[0].default).toEqual({ src: 'https://placehold.co/600x300', alt: 'Platform overview' });
  });

  it('does not detect empty elements or elements inside svg', () => {
    expect(r.root.querySelector('.hero-grid')?.hasAttribute('data-cf')).toBe(false);
    expect(r.root.querySelector('svg path')?.closest('[data-cf]')?.className).toBe('snap-icon');
  });

  it('builds "<Group> › <Role> <n>" labels of at most 48 chars', () => {
    for (const f of r.fields) {
      expect(f.label).toMatch(/ › .+ \d+$/);
      expect(f.label.length).toBeLessThanOrEqual(48);
      expect(f.group).toBeTruthy();
    }
    const title = r.fields.find((f) => f.type === 'richtext' && String(f.default).startsWith('A platform'));
    expect(title?.label.endsWith('› Title 1')).toBe(true);
    const cardGroup = r.fields.find((f) => f.default === 'From first session to live system in days.');
    // the card has no heading element, so the nearest heading of an outer section is used
    expect(cardGroup?.group).toMatch(/^One platform\. Every process\./);
    expect(cardGroup?.label).toMatch(/^One platform\..* › Text \d+$/);
  });

  it('numbers roles per group', () => {
    const icons = byType(r.fields, 'icon');
    expect(icons.map((f) => f.label.split(' › ')[1])).toEqual(['Icon 1', 'Icon 2']);
  });
});

describe('detectFields — Tailwind/media fixture', () => {
  const { html } = extractSource(fixture('fleet-tailwind.html'));
  const r = detectFields(html);

  it('detects bgImage from an inline style and keeps descending', () => {
    const bg = byType(r.fields, 'bgImage');
    expect(bg).toHaveLength(1);
    expect(bg[0].default).toEqual({ src: 'https://placehold.co/1600x600/eee/333' });
    expect(markerFor(r.root, bg[0].id).id).toBe('features');
    expect(r.fields.some((f) => f.default === 'Features that move fleets')).toBe(true);
  });

  it('uses data-src when src is a data: placeholder', () => {
    const imgs = byType(r.fields, 'image');
    expect(imgs).toHaveLength(2);
    expect((imgs[1].default as { src: string }).src).toBe('https://placehold.co/150x150/FFF0CC/CC8800?text=Cost');
    expect((imgs[1].default as { alt: string }).alt).toBe('Cost savings graph');
  });

  it('detects video and only allow-listed embeds', () => {
    const video = byType(r.fields, 'video');
    expect(video[0].default).toEqual({
      src: 'https://cdn.example.com/promo.mp4',
      poster: 'https://cdn.example.com/promo.jpg',
    });
    const embeds = byType(r.fields, 'embed');
    expect(embeds).toHaveLength(1);
    expect(embeds[0].default).toEqual({ src: 'https://www.youtube.com/embed/abc123' });
  });

  it('detects placeholders as text fields', () => {
    const ph = r.fields.filter((f) => f.default === 'Work email' || f.default === 'Tell us about your fleet');
    expect(ph).toHaveLength(2);
    expect(ph.every((f) => f.type === 'text')).toBe(true);
    expect(ph[0].label).toMatch(/Placeholder \d$/);
  });

  it('detects nav links and the button text', () => {
    expect(byType(r.fields, 'link').map((f) => (f.default as { text: string }).text)).toEqual(['Features', 'Pricing']);
    expect(r.fields.some((f) => f.default === 'Book a demo' && f.label.includes('Button'))).toBe(true);
  });
});

describe('detectFields — links, icons and mixed content', () => {
  it('uses href-only links around images and detects the inner image', () => {
    const r = detectFields('<a href="/x" target="_blank"><img src="a.png" alt="A"></a>');
    expect(r.fields.map((f) => f.type)).toEqual(['link', 'image']);
    expect(r.fields[0].default).toEqual({ href: '/x', target: '_blank' });
  });

  it('uses href-only links around block content and detects the inner text', () => {
    const r = detectFields('<a href="/x"><h3>Title</h3><p>Body</p></a>');
    expect(r.fields.map((f) => f.type)).toEqual(['link', 'text', 'text']);
    expect(r.fields[0].default).toEqual({ href: '/x' });
  });

  it('wraps an svg that sits next to text inside a link', () => {
    const r = detectFields('<div><a href="/x"><svg viewBox="0 0 1 1"><path d="M0 0"/></svg>Go</a></div>');
    const icon = r.fields.find((f) => f.type === 'icon');
    expect(icon).toBeDefined();
    const wrapper = markerFor(r.root, icon!.id);
    expect(wrapper.tagName).toBe('SPAN');
    expect(wrapper.getAttribute('style')).toBe('display:contents');
  });

  it('does not detect a lone svg in a container with other content', () => {
    const r = detectFields('<div><svg><path d="M0 0"/></svg><div class="x"></div><p>Hello</p></div>');
    expect(byType(r.fields, 'icon')).toHaveLength(0);
  });

  it('does not auto-detect mixed content runs', () => {
    const r = detectFields('<div>Intro text <b>bold</b><section><h2>Head</h2></section> trailing</div>');
    expect(r.fields.map((f) => f.default)).toEqual(['Head']);
  });

  it('keeps \\n for textarea candidates (<br> in p)', () => {
    const r = detectFields('<p>Line one<br>Line two</p><h2>A<br>B</h2>');
    expect(r.fields[0]).toMatchObject({ type: 'textarea', default: 'Line one\nLine two' });
    expect(r.fields[1].type).toBe('richtext');
  });

  it('skips script/style/noscript/template and svg contents', () => {
    const r = detectFields(
      '<noscript><p>No JS</p></noscript><template><p>T</p></template><svg><text>In svg</text></svg><p>Real</p>'
    );
    expect(r.fields.map((f) => f.default)).toEqual(['Real']);
  });

  it('caps the number of fields', () => {
    const r = detectFields('<p>x</p>'.repeat(650));
    expect(r.fields).toHaveLength(600);
    expect(r.warnings.some((w) => /limit/i.test(w))).toBe(true);
  });
});

describe('detectFields — explicit hints', () => {
  const html = `
    <section>
      <h1 data-edit="hero.title" data-edit-label="Hero headline" data-edit-group="Hero">Hello <em>world</em></h1>
      <p data-edit="hero title!">Para</p>
      <p data-edit="hero.title">Dup</p>
      <p data-edit-ignore>Ignored <span>child</span></p>
      <div data-edit="box" data-edit-type="richtext"><p>Inner</p><p>Two</p></div>
      <div data-edit-type="text">Typed</div>
      <span data-edit-type="image">bad type on span</span>
      <p>Heuristic only</p>
    </section>`;
  const r = detectFields(html);

  it('flags hints and removes every data-edit* attribute', () => {
    expect(r.hasHints).toBe(true);
    expect(r.root.innerHTML).not.toMatch(/data-edit/);
  });

  it('uses sanitised keys as ids and de-duplicates with -2, -3', () => {
    const ids = r.fields.map((f) => f.id);
    expect(ids).toContain('hero.title');
    expect(ids).toContain('hero_title_');
    expect(ids).toContain('hero.title-2');
    expect(ids).toContain('box');
  });

  it('applies label, group and type hints', () => {
    const title = r.fields.find((f) => f.id === 'hero.title')!;
    expect(title.label).toBe('Hero headline');
    expect(title.group).toBe('Hero');
    expect(title.type).toBe('richtext');
    const box = r.fields.find((f) => f.id === 'box')!;
    expect(box.type).toBe('richtext');
    expect(box.default).toBe('<p>Inner</p><p>Two</p>');
  });

  it('skips data-edit-ignore subtrees and warns on invalid types', () => {
    expect(r.fields.some((f) => String(f.default).includes('Ignored'))).toBe(false);
    expect(r.fields.some((f) => f.default === 'Heuristic only')).toBe(true);
    expect(r.warnings.some((w) => w.includes('data-edit-type="image"'))).toBe(true);
  });

  it('hintsOnly detects only explicitly marked elements', () => {
    const only = detectFields(html, { hintsOnly: true });
    expect(only.fields.some((f) => f.default === 'Heuristic only')).toBe(false);
    expect(only.fields.map((f) => f.id)).toContain('hero.title');
  });

  it('auto ids skip ids already taken by keys', () => {
    const x = detectFields('<p data-edit="f1">A</p><p>B</p>');
    expect(x.fields.map((f) => f.id)).toEqual(['f1', 'f2']);
  });
});

describe('detectFields — re-import', () => {
  it('reuses data-cf ids, including icon wrappers and generated spans', () => {
    const first = detectFields(
      '<h2>Title</h2><p class="a">One</p><div class="ic"><svg><path d="M0 0"/></svg></div><a href="/x"><svg></svg>Go</a>'
    );
    const html = first.root.innerHTML;
    const again = detectFields(html);
    expect(again.fields.map((f) => [f.id, f.type])).toEqual(first.fields.map((f) => [f.id, f.type]));
    expect(again.root.innerHTML).toBe(html);
  });

  it('gives new elements ids that do not collide with reused ones', () => {
    const r = detectFields('<h2 data-cf="f5">Old</h2><p>New</p>');
    expect(r.fields.map((f) => f.id)).toEqual(['f5', 'f1']);
  });

  it('drops data-cf markers that no longer match anything', () => {
    const r = detectFields('<div data-cf="gone"></div>');
    expect(r.fields).toEqual([]);
    expect(r.root.querySelector('[data-cf]')).toBeNull();
  });
});

describe('click-to-map helpers', () => {
  it('markElementAsField wraps the first mixed-content run in a span', () => {
    const r = detectFields('<div class="m">Loose text <section><h2>Head</h2></section> more text</div>');
    expect(r.fields).toHaveLength(1);
    const div = r.root.querySelector('.m')!;
    const next = markElementAsField(r.root, div, 'text', r.fields);
    expect(next).toHaveLength(2);
    const added = next.find((f) => f.default === 'Loose text')!;
    expect(added).toBeDefined();
    const span = markerFor(r.root, added.id);
    expect(span.tagName).toBe('SPAN');
    expect(span.parentElement).toBe(div);
    expect(MIXED_RUN_WARNING).toMatch(/sibling/);
    // the second click maps the next run
    const third = markElementAsField(r.root, div, 'text', next);
    expect(third.some((f) => f.default === 'more text')).toBe(true);
  });

  it('keeps fields in document order', () => {
    const r = detectFields('<p>One</p><div class="m">Loose <section><h2>Head</h2></section></div>');
    const next = markElementAsField(r.root, r.root.querySelector('.m')!, 'text', r.fields);
    expect(next.map((f) => f.default)).toEqual(['One', 'Loose', 'Head']);
  });

  it('maps an element that heuristics skipped (div with inline bg) and refuses wrong types', () => {
    const r = detectFields('<div class="bg" style="background:url(a.jpg) center"><section><p>x</p></section></div>');
    const bg = r.root.querySelector('.bg')!;
    // already detected as bgImage by the heuristics -> remapping keeps one field per element
    const again = markElementAsField(r.root, bg, 'bgImage', r.fields);
    expect(again.filter((f) => f.type === 'bgImage')).toHaveLength(1);
    expect(markElementAsField(r.root, bg, 'image', r.fields)).toBe(r.fields);
    expect(markElementAsField(r.root, bg, 'link', r.fields)).toBe(r.fields);
  });

  it('maps hintsOnly leftovers and continues the f<n> numbering', () => {
    const r = detectFields('<p data-edit="a">A</p><p>B</p><img src="x.png">', { hintsOnly: true });
    expect(r.fields.map((f) => f.id)).toEqual(['a']);
    const withImg = markElementAsField(r.root, r.root.querySelector('img')!, 'image', r.fields);
    expect(withImg.map((f) => f.id)).toEqual(['a', 'f1']);
    const withP = markElementAsField(r.root, r.root.querySelectorAll('p')[1], 'text', withImg);
    expect(withP.map((f) => f.id)).toEqual(['a', 'f2', 'f1']);
  });

  it('does not map inside a text field', () => {
    const r = detectFields('<p>Hello <b>bold</b></p>');
    expect(markElementAsField(r.root, r.root.querySelector('b')!, 'text', r.fields)).toBe(r.fields);
  });

  it('unmarkField removes the marker and the field, unwrapping generated spans', () => {
    const r = detectFields('<div><a href="/x"><svg viewBox="0 0 1 1"></svg>Go</a></div>');
    const icon = r.fields.find((f) => f.type === 'icon')!;
    const next = unmarkField(r.root, icon.id, r.fields);
    expect(next.find((f) => f.id === icon.id)).toBeUndefined();
    expect(r.root.querySelector('span')).toBeNull();
    expect(r.root.querySelector('a > svg')).not.toBeNull();

    const p = detectFields('<p>Text</p>');
    const after = unmarkField(p.root, p.fields[0].id, p.fields);
    expect(after).toEqual([]);
    expect(p.root.querySelector('[data-cf]')).toBeNull();
  });

  it('labelFor continues the per-group numbering and truncates long groups', () => {
    const r = detectFields(
      '<section><h2>An extremely long section heading that keeps going and going</h2><p>One</p><p>Two</p></section>'
    );
    const labels = r.fields.map((f) => f.label);
    expect(labels[1].endsWith('› Text 1')).toBe(true);
    expect(labels[2].endsWith('› Text 2')).toBe(true);
    for (const l of labels) expect(l.length).toBeLessThanOrEqual(48);
    const p = r.root.querySelector('p')!;
    expect(labelFor(p, 'text', r.fields).endsWith('› Text 3')).toBe(true);
    expect(groupFor(p)).toContain('An extremely long');
    expect(groupFor(r.root.firstElementChild!)).toBe('Section');
  });
});

describe('findStyleBgUrl', () => {
  it('finds background urls and ignores other properties, data URIs and fragments', () => {
    expect(findStyleBgUrl("background-image: url('a.png')")?.url).toBe('a.png');
    expect(findStyleBgUrl('color:red; background: #000 url(b.png) no-repeat')?.url).toBe('b.png');
    expect(findStyleBgUrl('mask-image: url(m.svg)')).toBeNull();
    expect(findStyleBgUrl('background-image: url(data:image/png;base64,AAAA)')).toBeNull();
    expect(findStyleBgUrl('background-image: url(#grad)')).toBeNull();
    expect(findStyleBgUrl('background-image: linear-gradient(red, blue), url("c.png")')?.url).toBe('c.png');
  });
});
