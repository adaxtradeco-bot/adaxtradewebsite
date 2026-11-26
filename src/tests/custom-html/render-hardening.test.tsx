/**
 * F4 (<template> tokens / attribute allow-list), F5 (public payload from PageRenderer) and
 * F6 (richtext class names) regressions.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { detectFields } from '@/lib/custom-html/detect';
import { rewriteInlineHandlers } from '@/lib/custom-html/handlers';
import { renderCustomHtml } from '@/lib/custom-html/render';
import { tokenizeHtml } from '@/lib/custom-html/tokenize';
import type { CustomHtmlData, FieldDef, FieldValue } from '@/lib/custom-html/types';
import { makeFixtureInput } from './fixtures';

const seen = vi.hoisted(() => ({ css: [] as unknown[], sections: [] as unknown[] }));
vi.mock('@/lib/page-builder/section-renderer', () => ({
  SectionRenderer: ({ section }: { section: unknown }) => {
    seen.sections.push(section);
    return null;
  },
}));
vi.mock('@/components/SectionCSSLoader', () => ({
  SectionCSSLoader: ({ sections }: { sections: unknown }) => {
    seen.css.push(sections);
    return null;
  },
}));
vi.mock('@/components/FirstSectionMarker', () => ({
  FirstSectionMarker: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';

const f = (id: string, type: FieldDef['type'], def: FieldValue): FieldDef => ({ id, type, label: id, default: def });

function renderHtml(html: string, fields: FieldDef[], values: Record<string, FieldValue> = {}): string {
  const template: CustomHtmlData['template'] = {
    html, css: '', cssScoped: '', js: '', jsSource: '', externalScripts: [], externalStylesheets: [], scope: '0123456789',
  };
  return renderCustomHtml({ template, fields, values }, { builder: false }).html;
}

const parse = (html: string) => new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html');

describe('F4: <template> contents', () => {
  it('escapes literal tokens in text, comments and attributes, also when nested', () => {
    const src =
      '<h1>Title</h1><template><p title="{{cf:f1}}">{{cf:f1}}</p><!-- {{cf:f1}} -->' +
      '<template><b>{{cf:f1}}</b></template></template>';
    const { root, fields } = detectFields(src);
    const tokenized = tokenizeHtml(root, fields);
    expect(tokenized.match(/\{\{cf:f1\}\}/g)).toHaveLength(1); // only the <h1> binding
    const out = renderHtml(tokenized, fields, { f1: 'EDITED' });
    expect(out.match(/EDITED/g)).toHaveLength(1);
    expect(out).toContain('<b>{{cf:f1}}</b>');
    expect(out).toContain('title="{{cf:f1}}"');
    // the input DOM is left alone
    expect(root.querySelector('template')!.innerHTML).not.toContain('__lit');
  });

  it('rewrites inline handlers and javascript: URLs inside templates', () => {
    const res = rewriteInlineHandlers(
      '<template><button onclick="a()">x</button><template><a href="javascript:b()">y</a></template></template>',
    );
    expect(res.count).toBe(2);
    expect(res.html).not.toMatch(/onclick|javascript:/i);
    expect(res.html.match(/data-chs-h="click:/g)).toHaveLength(2);
  });
});

describe('F4: attribute tokens are default-deny', () => {
  const fields = [f('t', 'text', 'https://evil.example/x')];

  it.each([
    '<object data="{{cf:t}}"></object>',
    '<svg><set attributeName="href" to="{{cf:t}}"></set></svg>',
    '<svg><animate from="{{cf:t}}" values="{{cf:t}}" by="{{cf:t}}"></animate></svg>',
    '<meta http-equiv="{{cf:t}}" content="{{cf:t}}">',
    '<svg><script href="{{cf:t}}"></script></svg>',
    '<svg><script xlink:href="{{cf:t}}"></script></svg>',
    '<script src="{{cf:t}}"></script>',
    '<base href="{{cf:t}}">',
    '<div class="{{cf:t}}" id="{{cf:t}}" data-x="{{cf:t}}" onclick="{{cf:t}}" srcdoc="{{cf:t}}"></div>',
    '<img srcset="{{cf:t}}"><form action="{{cf:t}}"><button formaction="{{cf:t}}"></button></form>',
  ])('drops the value in %s', (html) => {
    expect(renderHtml(html, fields)).not.toContain('evil.example');
  });

  it('keeps the allowed attributes', () => {
    const html =
      '<a href="{{cf:t}}" title="{{cf:t}}" aria-label="{{cf:t}}"></a><input placeholder="{{cf:t}}">' +
      '<img src="{{cf:t}}" alt="{{cf:t}}" data-src="{{cf:t}}" data-lazy-src="{{cf:t}}"><video poster="{{cf:t}}"></video>';
    expect(renderHtml(html, fields).match(/evil\.example/g)).toHaveLength(9);
  });

  it('keeps every attribute the tokenizer emits', () => {
    const src =
      '<input placeholder="Name"><a href="/l">Go</a><img src="/i.png" alt="Alt" data-src="/i.png" data-lazy-src="/i.png">' +
      '<video poster="/p.png"><source src="/v.mp4"></video><iframe src="https://www.youtube.com/embed/x"></iframe>' +
      '<div style="background-image:url(\'/bg.png\')"></div>';
    const { root, fields: detected } = detectFields(src);
    const doc = parse(renderHtml(tokenizeHtml(root, detected), detected));
    const original = parse(src);
    original.body.querySelectorAll('*').forEach((el, i) => {
      const out = doc.body.querySelectorAll('*')[i];
      for (const attr of Array.from(el.attributes)) {
        if (attr.name !== 'style') expect(out.getAttribute(attr.name)).toBe(attr.value);
      }
    });
    expect(doc.querySelector('div')!.getAttribute('style')).toContain('/bg.png');
  });
});

describe('F6: richtext class names', () => {
  const rt = f('r', 'richtext', 'Hi <span class="accent big">x</span> <a class="link" href="/a">y</a>');

  it('keeps default classes and drops the rest', () => {
    const out = renderHtml('<div>{{cf:r}}</div>', [rt], {
      r: '<span class="fixed inset-0 z-50 accent">a</span><a class="absolute\nlink w-screen" href="/b">b</a><b class="big">c</b><i class="h-screen">d</i>',
    });
    const doc = parse(out);
    expect(doc.querySelector('span')!.getAttribute('class')).toBe('accent');
    expect(doc.querySelector('a')!.getAttribute('class')).toBe('link');
    expect(doc.querySelector('a')!.getAttribute('href')).toBe('/b');
    expect(doc.querySelector('b')!.getAttribute('class')).toBe('big');
    expect(doc.querySelector('i')!.hasAttribute('class')).toBe(false);
  });

  it('renders the default unchanged and does not treat * as a wildcard', () => {
    expect(renderHtml('{{cf:r}}', [rt])).toBe(rt.default);
    const star = f('s', 'richtext', '<span class="*">x</span>');
    expect(renderHtml('{{cf:s}}', [star], { s: '<span class="fixed">a</span>' })).toBe('<span>a</span>');
  });

  it('does not share classes between fields', () => {
    const other = f('o', 'richtext', '<span class="other">x</span>');
    expect(renderHtml('{{cf:o}}', [rt, other], { o: '<span class="accent">a</span>' })).toBe('<span>a</span>');
  });

  it('allows the classes of the repeater item defaults', () => {
    const rep: FieldDef = {
      ...f('list', 'repeater', [{ body: '<span class="one">1</span>' }, { body: '<span class="two">2</span>' }]),
      children: [f('body', 'richtext', '<span class="base">b</span>')],
    };
    const out = renderHtml('<!--cf:rep:list--><li>{{cf:list.$.body}}</li><!--/cf:rep:list-->', [rep], {
      list: [{ body: '<span class="one two base fixed">v</span>' }],
    });
    expect(out).toBe('<li><span class="one two base">v</span></li>');
  });
});

describe('F5: PageRenderer strips admin-only source from public sections', () => {
  const data = makeFixtureInput();
  const template = data.template as Record<string, unknown>;
  template.css = 'RAW_CSS';
  template.jsSource = 'RAW_JS';
  const input = [
    { id: 'c1', type: 'custom-html', order: 0, data },
    { id: 'c2', type: 'custom-html', order: 1, data },
  ];

  it.each([
    ['array', input],
    ['{ sections }', { sections: input }],
  ])('%s input', (_shape, sections) => {
    seen.css.length = 0;
    seen.sections.length = 0;
    render(<PageRenderer sections={sections as never} />);
    expect(seen.sections.length).toBeGreaterThanOrEqual(2);
    const passed = JSON.stringify([seen.css, seen.sections]);
    expect(passed).toContain('cssScoped');
    expect(passed).not.toContain('RAW_CSS');
    expect(passed).not.toContain('RAW_JS');
    // the caller's data (which the builder re-edits) is untouched
    expect(template.css).toBe('RAW_CSS');
  });
});
