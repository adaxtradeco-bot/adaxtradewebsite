import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import type { CustomHtmlData } from '@/lib/custom-html/types';

export const SCOPE = 'abcdef0123';

export function makeFixtureInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 1,
    name: 'Promo banner',
    template: {
      html: '<h1 data-cf="f1">{{cf:f1}}</h1><a href="{{cf:f2.href}}" data-cf="f2">{{cf:f2.text}}</a><p data-cf="f3">{{cf:f3}}</p>',
      css: 'h1{color:red}',
      cssScoped: `[data-chs="${SCOPE}"] h1{color:red}`,
      js: '',
      jsSource: '',
      externalScripts: [],
      externalStylesheets: [],
      scope: SCOPE,
    },
    fields: [
      { id: 'f1', type: 'text', label: 'Headline', group: 'Content', default: 'Hello world' },
      { id: 'f2', type: 'link', label: 'Button', group: 'Content', default: { text: 'Go', href: '/go', target: '_self' } },
      { id: 'f3', type: 'textarea', label: 'Body', group: 'Style', default: 'Body text' },
      { id: 'f4', type: 'color', label: 'Secret colour', hidden: true, default: { value: '#ff0000' } },
    ],
    values: {},
    ...overrides,
  };
}

export function makeFixture(overrides: Record<string, unknown> = {}): CustomHtmlData {
  const res = parseCustomHtmlData(makeFixtureInput(overrides));
  if (!res.success) throw new Error('fixture invalid: ' + res.error);
  return res.data;
}
