/**
 * Custom HTML section — strict zod schemas (spec §3, §8.2).
 * Every object is .strict(); unknown keys are rejected.
 */
import { z } from 'zod';
import {
  CUSTOM_HTML_LIMITS as LIMITS,
  CUSTOM_HTML_SCHEMA_VERSION,
  type CustomHtmlData,
  type FieldDef,
  type FieldType,
  type FieldValue,
} from './types';

const ID_RE = /^[a-zA-Z0-9_.-]+$/;
const SCOPE_RE = /^[0-9a-f]{10}$/;
const MAX_FIELD_DEPTH = 4;

const idSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(ID_RE, 'id must match [a-zA-Z0-9_.-]+')
  .refine((s) => s !== '__proto__', { message: 'reserved id' });

const urlStr = z.string().max(4096);
const textStr = z.string().max(100_000);

export const LinkValueSchema = z
  .object({
    text: z.string().max(10_000).optional(),
    href: urlStr.optional(),
    target: z.enum(['_self', '_blank']).optional(),
  })
  .strict();

export const MediaValueSchema = z
  .object({
    src: urlStr.optional(),
    alt: z.string().max(10_000).optional(),
    poster: urlStr.optional(),
  })
  .strict();

export const IconValueSchema = z.object({ svg: z.string().max(100_000).optional() }).strict();
export const ColorValueSchema = z.object({ value: z.string().max(200).optional() }).strict();

export const FieldValueSchema: z.ZodType<FieldValue> = z.lazy(() =>
  z.union([
    textStr,
    LinkValueSchema,
    MediaValueSchema,
    IconValueSchema,
    ColorValueSchema,
    z.array(z.record(idSchema, FieldValueSchema)).max(LIMITS.repeaterItems),
  ]),
) as z.ZodType<FieldValue>;

const FIELD_TYPES = [
  'text',
  'textarea',
  'richtext',
  'link',
  'image',
  'bgImage',
  'video',
  'embed',
  'icon',
  'color',
  'repeater',
] as const;
export const FieldTypeSchema = z.enum(FIELD_TYPES);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Returns an error message when `value` is not valid for a field of this definition, else null. */
function validateValue(def: FieldDef, value: unknown, depth: number): string | null {
  const t: FieldType = def.type;
  switch (t) {
    case 'text':
    case 'textarea':
    case 'richtext':
      return typeof value === 'string' && value.length <= 100_000 ? null : `expected string for ${t}`;
    case 'link':
      return LinkValueSchema.safeParse(value).success ? null : 'invalid link value';
    case 'image':
    case 'bgImage':
    case 'video':
    case 'embed':
      return MediaValueSchema.safeParse(value).success ? null : `invalid ${t} value`;
    case 'icon':
      return IconValueSchema.safeParse(value).success ? null : 'invalid icon value';
    case 'color':
      return ColorValueSchema.safeParse(value).success ? null : 'invalid color value';
    case 'repeater': {
      if (!Array.isArray(value)) return 'expected array for repeater';
      if (value.length > LIMITS.repeaterItems) return `repeater has more than ${LIMITS.repeaterItems} items`;
      if (depth > MAX_FIELD_DEPTH) return 'repeater nested too deeply';
      const children = def.children || [];
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!isPlainObject(item)) return `repeater item ${i} must be an object`;
        for (let c = 0; c < children.length; c++) {
          const child = children[c];
          if (Object.prototype.hasOwnProperty.call(item, child.id)) {
            const err = validateValue(child, item[child.id], depth + 1);
            if (err) return `item ${i}.${child.id}: ${err}`;
          }
        }
      }
      return null;
    }
  }
  return 'unknown field type';
}

export const FieldDefSchema: z.ZodType<FieldDef> = z.lazy(() =>
  z
    .object({
      id: idSchema,
      type: FieldTypeSchema,
      label: z.string().max(200),
      group: z.string().max(100).optional(),
      hidden: z.boolean().optional(),
      default: FieldValueSchema,
      children: z.array(FieldDefSchema).max(LIMITS.fields).optional(),
      min: z.number().int().min(0).max(LIMITS.repeaterItems).optional(),
      max: z.number().int().min(0).max(LIMITS.repeaterItems).optional(),
    })
    .strict()
    .superRefine((def, ctx) => {
      if (def.children && def.type !== 'repeater') {
        ctx.addIssue({ code: 'custom', message: 'children are only allowed on repeater fields', path: ['children'] });
      }
      const err = validateValue(def as FieldDef, def.default, 0);
      if (err) ctx.addIssue({ code: 'custom', message: `default: ${err}`, path: ['default'] });
    }),
) as z.ZodType<FieldDef>;

function isHttpUrl(s: string): boolean {
  if (/[\s\u0000-\u001f\u007f]/.test(s)) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const externalUrl = z
  .string()
  .max(2048)
  .refine(isHttpUrl, { message: 'must be an http(s) URL' });
const externalUrls = z.array(externalUrl).max(LIMITS.externalUrls);

export const CustomHtmlTemplateSchema = z
  .object({
    html: z.string().max(LIMITS.html),
    css: z.string().max(LIMITS.css),
    cssScoped: z.string().max(LIMITS.cssScoped),
    js: z.string().max(LIMITS.js),
    jsSource: z.string().max(LIMITS.jsSource),
    externalScripts: externalUrls,
    externalStylesheets: externalUrls,
    tailwind: z
      .object({ enabled: z.boolean(), config: z.record(z.string().max(200), z.unknown()).optional() })
      .strict()
      .optional(),
    dir: z.enum(['auto', 'ltr', 'rtl']).optional(),
    scope: z.string().regex(SCOPE_RE, 'scope must be 10 lowercase hex chars'),
  })
  .strict();

function countFields(defs: FieldDef[], depth: number, state: { count: number; maxDepth: number }): void {
  state.count += defs.length;
  if (depth > state.maxDepth) state.maxDepth = depth;
  for (let i = 0; i < defs.length; i++) {
    if (defs[i].children && defs[i].children!.length) countFields(defs[i].children!, depth + 1, state);
  }
}

function duplicateId(defs: FieldDef[]): string | null {
  const seen: Record<string, true> = Object.create(null);
  for (let i = 0; i < defs.length; i++) {
    if (seen[defs[i].id]) return defs[i].id;
    seen[defs[i].id] = true;
    const children = defs[i].children;
    if (children) {
      const d = duplicateId(children);
      if (d) return d;
    }
  }
  return null;
}

export const CustomHtmlDataSchema = z
  .object({
    schemaVersion: z.literal(CUSTOM_HTML_SCHEMA_VERSION),
    name: z.string().max(200),
    libraryId: z.string().max(200).optional(),
    template: CustomHtmlTemplateSchema,
    fields: z.array(FieldDefSchema).max(LIMITS.fields),
    values: z
      .unknown()
      .refine((v) => !isPlainObject(v) || !Object.prototype.hasOwnProperty.call(v, '__proto__'), { message: 'reserved key' })
      .pipe(z.record(idSchema, FieldValueSchema)),
    runInBuilder: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const fields = data.fields as FieldDef[];
    const state = { count: 0, maxDepth: 0 };
    countFields(fields, 0, state);
    if (state.count > LIMITS.fields) {
      ctx.addIssue({ code: 'custom', message: `more than ${LIMITS.fields} fields (including children)`, path: ['fields'] });
    }
    if (state.maxDepth > MAX_FIELD_DEPTH) {
      ctx.addIssue({ code: 'custom', message: 'fields nested too deeply', path: ['fields'] });
    }
    const dup = duplicateId(fields);
    if (dup) ctx.addIssue({ code: 'custom', message: `duplicate field id "${dup}"`, path: ['fields'] });

    for (let i = 0; i < fields.length; i++) {
      const def = fields[i];
      if (Object.prototype.hasOwnProperty.call(data.values, def.id)) {
        const err = validateValue(def, (data.values as Record<string, unknown>)[def.id], 0);
        if (err) ctx.addIssue({ code: 'custom', message: err, path: ['values', def.id] });
      }
    }
  });

export type CustomHtmlDataParseResult =
  | { success: true; data: CustomHtmlData }
  | { success: false; error: string };

/** Validates untrusted input against the strict schema and limits. */
export function parseCustomHtmlData(input: unknown): CustomHtmlDataParseResult {
  let result: ReturnType<typeof CustomHtmlDataSchema.safeParse>;
  try {
    result = CustomHtmlDataSchema.safeParse(input);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'invalid data' };
  }
  if (result.success) return { success: true, data: result.data as unknown as CustomHtmlData };
  const issues = result.error.issues.slice(0, 10).map((i) => {
    const path = i.path.map((p) => String(p)).join('.');
    return (path || '(root)') + ': ' + i.message;
  });
  return { success: false, error: issues.join('; ') };
}
