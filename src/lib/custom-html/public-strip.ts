/**
 * Custom HTML section — public payload stripping (spec §8.5).
 * Removes template.css and template.jsSource (admin re-edit only) from every custom-html section.
 */
import { CUSTOM_HTML_TYPE } from './types';

type Json = unknown;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function stripSection(section: Record<string, unknown>): Record<string, unknown> {
  const data = section.data;
  if (!isObject(data) || !isObject(data.template)) return section;
  if (!('css' in data.template) && !('jsSource' in data.template)) return section;
  const template: Record<string, unknown> = {};
  const keys = Object.keys(data.template);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'css' || keys[i] === 'jsSource') continue;
    template[keys[i]] = data.template[keys[i]];
  }
  return { ...section, data: { ...data, template } };
}

/** Maps stripNode over a list, returning the same array when no entry changed. */
function stripList(list: Json[]): Json[] {
  const out = list.map(stripNode);
  return out.every((item, i) => item === list[i]) ? list : out;
}

function stripNode(node: Json): Json {
  if (Array.isArray(node)) return stripList(node);
  if (!isObject(node)) return node;
  let out: Record<string, unknown> = node;
  if (node.type === CUSTOM_HTML_TYPE) out = stripSection(node);
  // containers: { sections: [...] } and nested { children: [...] }
  const keys = ['sections', 'children'];
  for (let i = 0; i < keys.length; i++) {
    const list = out[keys[i]];
    if (!Array.isArray(list)) continue;
    const next = stripList(list);
    if (next !== list) out = { ...out, [keys[i]]: next };
  }
  return out;
}

/**
 * Accepts any stored builderData shape (array of sections, { sections }, single section object)
 * and returns the same shape with template.css / template.jsSource removed from custom-html sections.
 * Does not mutate the input; untouched branches are shared by reference.
 */
export function stripCustomHtmlForPublic<T>(builderData: T): T {
  return stripNode(builderData) as T;
}
