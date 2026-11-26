/**
 * Custom HTML section — structure sync rule used by POST pages/[id]/sync-structure (spec 8.3 / 9).
 * Target `data` is never combined with a source `type`.
 */
import { CUSTOM_HTML_TYPE } from './types';
import { mergeForLanguageSync, type CustomHtmlSectionLike } from './sync';

type Section = Record<string, any>;

export function syncSectionStructure(source: Section, target: Section | undefined, syncContent: boolean): Section {
  // New section, or full content sync: copy the (server-stored) source section.
  if (!target || (syncContent && source.type !== CUSTOM_HTML_TYPE)) return { ...source };

  if (source.type === CUSTOM_HTML_TYPE) {
    if (syncContent) return { ...source };
    return mergeForLanguageSync(source as CustomHtmlSectionLike, target);
  }

  // Never mix target data with a different source type.
  if (target.type !== source.type) return { ...source };

  return {
    ...target,
    type: source.type,
    order: source.order,
    style: source.style,
  };
}
