/**
 * Custom HTML section — server write guard (spec §8.2).
 * Schema + limits are enforced for every role; template code (template + fields) may only be
 * introduced or changed by users with canEditCode. Values are never hash-checked (escaped at render).
 */
import { NextResponse } from 'next/server';
import { getPermissions } from '@/lib/permissions';
import { CUSTOM_HTML_TYPE, type CustomHtmlTemplate, type FieldDef } from './types';
import { parseCustomHtmlData } from './schema';
import { templateHash } from './hash';
import type { GuardResult } from './types';

export type { GuardResult } from './types';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Accepts any stored builder shape: array, { sections }, single section object, JSON string, null. */
export function normalizeSections(input: unknown): unknown[] {
  let value = input;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value;
  if (isObject(value)) {
    if (Array.isArray(value.sections)) return value.sections;
    return [value];
  }
  return [];
}

/** Flattens sections including nested `children` / `sections` containers. */
function collectCustomHtml(sections: unknown[], out: Record<string, unknown>[] = [], depth = 0): Record<string, unknown>[] {
  if (depth > 20) return out;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (!isObject(s)) continue;
    if (s.type === CUSTOM_HTML_TYPE) out.push(s);
    if (Array.isArray(s.children)) collectCustomHtml(s.children, out, depth + 1);
    if (Array.isArray(s.sections)) collectCustomHtml(s.sections, out, depth + 1);
  }
  return out;
}

async function hashOfRaw(data: unknown): Promise<string | null> {
  if (!isObject(data) || !isObject(data.template) || !Array.isArray(data.fields)) return null;
  try {
    return await templateHash(data.template as unknown as CustomHtmlTemplate, data.fields as FieldDef[]);
  } catch {
    return null;
  }
}

/** Minimal structural slice of the Prisma client used here. */
export interface TemplateDb {
  sectionTemplate: {
    findMany(args: { where: { type: string }; select: { defaultData: true } }): Promise<Array<{ defaultData: unknown }>>;
  };
}

export interface CheckArgs {
  canEditCode: boolean;
  prevSections: unknown;
  nextSections: unknown;
  libraryHashes: Set<string>;
}

export async function checkCustomHtmlWrite(args: CheckArgs): Promise<GuardResult> {
  const next = collectCustomHtml(normalizeSections(args.nextSections));
  if (next.length === 0) return { ok: true };

  // 1–2: schema + limits for every role.
  const parsed: Array<{ id?: string; template: CustomHtmlTemplate; fields: FieldDef[] }> = [];
  for (let i = 0; i < next.length; i++) {
    const sectionId = typeof next[i].id === 'string' ? (next[i].id as string) : undefined;
    const res = parseCustomHtmlData(next[i].data);
    if (!res.success) {
      return { ok: false, status: 400, sectionId, reason: 'Invalid custom HTML data: ' + res.error };
    }
    parsed.push({ id: sectionId, template: res.data.template, fields: res.data.fields });
  }

  // 3: admin may change anything that is valid.
  if (args.canEditCode) return { ok: true };

  // 4: non-admin — template hash must already exist in prev (any id) or the library.
  const allowed = new Set<string>(args.libraryHashes);
  const prev = collectCustomHtml(normalizeSections(args.prevSections));
  for (let i = 0; i < prev.length; i++) {
    const h = await hashOfRaw(prev[i].data);
    if (h) allowed.add(h);
  }
  for (let i = 0; i < parsed.length; i++) {
    const h = await templateHash(parsed[i].template, parsed[i].fields);
    if (!allowed.has(h)) {
      return {
        ok: false,
        status: 403,
        sectionId: parsed[i].id,
        reason: 'Editing custom HTML code requires the admin role',
      };
    }
  }
  return { ok: true };
}

/** Hashes of all custom-html templates in the section library. Unparsable rows are skipped. */
export async function getLibraryHashes(prisma: TemplateDb): Promise<Set<string>> {
  const rows = await prisma.sectionTemplate.findMany({
    where: { type: CUSTOM_HTML_TYPE },
    select: { defaultData: true },
  });
  const hashes = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    try {
      const raw = rows[i].defaultData as unknown;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const h = await hashOfRaw(data);
      if (h) hashes.add(h);
    } catch {
      /* skip */
    }
  }
  return hashes;
}

/**
 * Route helper: runs the guard for an authenticated user. Returns null when the write is allowed,
 * otherwise a ready-to-return NextResponse ({ error, sectionId, reason }).
 */
export async function guardBuilderWrite(
  user: { role: string },
  prevSections: unknown,
  nextSections: unknown,
  db?: TemplateDb,
): Promise<NextResponse | null> {
  const canEditCode = getPermissions(user.role).canEditCode;
  let libraryHashes = new Set<string>();
  if (!canEditCode && collectCustomHtml(normalizeSections(nextSections)).length > 0) {
    const client = db ?? (await import('@/lib/prisma')).prisma;
    libraryHashes = await getLibraryHashes(client);
  }
  const result = await checkCustomHtmlWrite({ canEditCode, prevSections, nextSections, libraryHashes });
  if (result.ok) return null;
  return NextResponse.json(
    {
      error: result.status === 403 ? 'Forbidden' : 'Invalid custom HTML section',
      sectionId: result.sectionId,
      reason: result.reason,
    },
    { status: result.status },
  );
}
