import { describe, it, expect } from 'vitest';
import { stripCustomHtmlForPublic } from '@/lib/custom-html/public-strip';

const customSection = (id: string) => ({
  id,
  type: 'custom-html',
  data: {
    schemaVersion: 1,
    name: 'X',
    template: {
      html: '<p>{{cf:f1}}</p>',
      css: 'RAW CSS',
      cssScoped: '[data-chs="0123456789"] p{}',
      js: '(function(){})',
      jsSource: 'RAW JS',
      externalScripts: [],
      externalStylesheets: [],
      scope: '0123456789',
    },
    fields: [],
    values: {},
  },
});

const heroSection = {
  id: 'h',
  type: 'hero',
  data: { template: { css: 'keep me', jsSource: 'keep me too' }, title: 'T' },
};

describe('stripCustomHtmlForPublic', () => {
  it('strips css and jsSource from an array of sections', () => {
    const input = [customSection('a'), heroSection, customSection('b')];
    const out = stripCustomHtmlForPublic(input) as Array<{ data: { template: Record<string, unknown> } }>;
    expect(out).toHaveLength(3);
    for (const i of [0, 2]) {
      expect(out[i].data.template).not.toHaveProperty('css');
      expect(out[i].data.template).not.toHaveProperty('jsSource');
      expect(out[i].data.template.html).toBe('<p>{{cf:f1}}</p>');
      expect(out[i].data.template.cssScoped).toContain('data-chs');
      expect(out[i].data.template.js).toBe('(function(){})');
      expect(out[i].data.template.scope).toBe('0123456789');
    }
  });

  it('leaves non-custom sections untouched (same reference)', () => {
    const out = stripCustomHtmlForPublic([customSection('a'), heroSection]) as unknown[];
    expect(out[1]).toBe(heroSection);
    expect((heroSection.data.template as Record<string, unknown>).css).toBe('keep me');
  });

  it('handles the { sections } shape and keeps sibling keys', () => {
    const input = { sections: [customSection('a')], meta: { v: 1 } };
    const out = stripCustomHtmlForPublic(input) as { sections: Array<{ data: { template: object } }>; meta: object };
    expect(out.meta).toEqual({ v: 1 });
    expect(out.sections[0].data.template).not.toHaveProperty('css');
    expect(out.sections[0].data.template).not.toHaveProperty('jsSource');
  });

  it('handles a single section object', () => {
    const out = stripCustomHtmlForPublic(customSection('a')) as ReturnType<typeof customSection>;
    expect(out.id).toBe('a');
    expect(out.data.template).not.toHaveProperty('css');
    expect(out.data.template).not.toHaveProperty('jsSource');
    expect(out.data.template.html).toBeDefined();
  });

  it('strips custom-html sections nested in children arrays', () => {
    const input = [{ id: 'wrap', type: 'container', children: [customSection('inner')] }];
    const out = stripCustomHtmlForPublic(input) as Array<{ children: Array<{ data: { template: object } }> }>;
    expect(out[0].children[0].data.template).not.toHaveProperty('css');
  });

  it('does not mutate the input', () => {
    const input = [customSection('a')];
    const before = JSON.stringify(input);
    stripCustomHtmlForPublic(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(input[0].data.template.css).toBe('RAW CSS');
    const wrapped = { sections: [customSection('b')] };
    const wrappedBefore = JSON.stringify(wrapped);
    stripCustomHtmlForPublic(wrapped);
    expect(JSON.stringify(wrapped)).toBe(wrappedBefore);
    const single = customSection('c');
    const singleBefore = JSON.stringify(single);
    stripCustomHtmlForPublic(single);
    expect(JSON.stringify(single)).toBe(singleBefore);
  });

  it('passes through null, primitives, empty containers and malformed custom sections', () => {
    expect(stripCustomHtmlForPublic(null)).toBeNull();
    expect(stripCustomHtmlForPublic(undefined)).toBeUndefined();
    expect(stripCustomHtmlForPublic('x')).toBe('x');
    expect(stripCustomHtmlForPublic([])).toEqual([]);
    expect(stripCustomHtmlForPublic({})).toEqual({});
    const broken = { id: 'x', type: 'custom-html', data: null };
    expect(stripCustomHtmlForPublic([broken])).toEqual([broken]);
    const noTemplate = { id: 'y', type: 'custom-html', data: { name: 'n' } };
    expect(stripCustomHtmlForPublic(noTemplate)).toEqual(noTemplate);
  });
});
