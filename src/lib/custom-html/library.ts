/**
 * Custom HTML section library — server helpers (spec §12).
 * Library items are SectionTemplate rows with type 'custom-html'. Their template hashes are trusted
 * by the write guard, so rows of this type may only be written by users with canEditCode.
 */
import { SECTION_CATEGORIES } from '@/lib/page-builder/section-registry.types';
import { parseStoredCustomHtml } from './guard';
import type { CustomHtmlDataParseResult } from './schema';

export const LIBRARY_CATEGORY: string = SECTION_CATEGORIES.CUSTOM;
export const LIBRARY_NAME_MAX = 200;
export const LIBRARY_DESCRIPTION_MAX = 1000;

/** Columns returned by the list and write endpoints (everything except defaultData). */
export const LIBRARY_SUMMARY_SELECT = {
  id: true,
  name: true,
  description: true,
  usageCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Trimmed name, or null when it is not a non-empty string within the limit. */
export function cleanLibraryName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.trim();
  return name && name.length <= LIBRARY_NAME_MAX ? name : null;
}

/** Trimmed description ('' when absent), or null when invalid. */
export function cleanLibraryDescription(raw: unknown): string | null {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  return text.length <= LIBRARY_DESCRIPTION_MAX ? text : null;
}

/**
 * Turns section data into library data: values emptied, runInBuilder and libraryId dropped, then
 * validated with the same strict lossless parse the guard uses. Object rest keeps every other own key
 * (including a literal "__proto__"), so unknown keys are still rejected.
 */
export function prepareLibraryData(raw: unknown, name?: string): CustomHtmlDataParseResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { success: false, error: 'data must be an object' };
  }
  const { values: _values, runInBuilder: _run, libraryId: _id, ...rest } = raw as Record<string, unknown>;
  const candidate: Record<string, unknown> = { ...rest, values: {} };
  if (name !== undefined) candidate.name = name;
  return parseStoredCustomHtml(candidate);
}

/** Parses a stored defaultData string. The row name wins over the name inside the JSON. */
export function readLibraryData(defaultData: string, name: string): CustomHtmlDataParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(defaultData);
  } catch {
    return { success: false, error: 'stored data is not valid JSON' };
  }
  return prepareLibraryData(raw, name.slice(0, LIBRARY_NAME_MAX));
}
