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
  const template: Record<string, unknown> = {};
  const keys = Object.keys(data.template);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'css' || keys[i] === 'jsSource') continue;
    template[keys[i]] = data.template[keys[i]];
  }
  return { ...section, data: { ...data, template } };
}

function stripNode(node: Json): Json {
  if (Array.isArray(node)) return node.map(stripNode);
  if (!isObject(node)) return node;
  let out: Record<string, unknown> = node;
  if (node.type === CUSTOM_HTML_TYPE) out = stripSection(node);
  // containers: { sections: [...] } and nested { children: [...] }
  if (Array.isArray(out.sections)) out = { ...out, sections: out.sections.map(stripNode) };
  if (Array.isArray(out.children)) out = { ...out, children: out.children.map(stripNode) };
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
