/**
 * Custom HTML section — multilingual sync (spec §9).
 * The template always comes from the source; per-language values survive when the target
 * already has a value of the same shape for that field.
 */
import { CUSTOM_HTML_TYPE, type CustomHtmlData, type FieldDef, type FieldValue, type RepeaterItem } from './types';

const has = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

/** Minimal shape of a builder section carrying custom-html data. */
export interface CustomHtmlSectionLike {
  type: string;
  data: CustomHtmlData;
  [key: string]: unknown;
}

/** Same JS type and array-ness (null is its own shape). */
function sameShape(a: unknown, b: unknown): boolean {
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  return Array.isArray(a) === Array.isArray(b);
}

function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => deepClone(v)) as unknown as T;
  const out: Record<string, unknown> = {};
  const src = value as unknown as Record<string, unknown>;
  const keys = Object.keys(src);
  for (let i = 0; i < keys.length; i++) {
    Object.defineProperty(out, keys[i], {
      value: deepClone(src[keys[i]]),
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return out as T;
}

function setOwn(obj: Record<string, FieldValue>, key: string, value: FieldValue): void {
  Object.defineProperty(obj, key, { value, enumerable: true, writable: true, configurable: true });
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** The shape a stored value of this field must have. */
function fitsType(field: FieldDef, value: unknown): boolean {
  if (field.type === 'text' || field.type === 'textarea' || field.type === 'richtext') return typeof value === 'string';
  if (field.type === 'repeater') return Array.isArray(value);
  return isRecord(value);
}

/**
 * Keeps the target's list (its length and order) and fits every item to the source's child fields:
 * a child the target item lacks (new in the source, or of another shape) comes from the source item at
 * the same position, and keys that are no longer children are dropped.
 */
function mergeItems(field: FieldDef, sourceItems: unknown, targetItems: unknown[]): RepeaterItem[] {
  const children = Array.isArray(field.children) ? field.children : [];
  const source = Array.isArray(sourceItems) ? sourceItems : [];
  return targetItems.filter(isRecord).map((item, i) => {
    const fallback: unknown = source[i];
    const merged: RepeaterItem = {};
    for (const child of children) {
      if (has(item, child.id) && fitsType(child, item[child.id])) {
        setOwn(merged, child.id, deepClone(item[child.id]) as FieldValue);
      } else if (isRecord(fallback) && has(fallback, child.id) && fitsType(child, fallback[child.id])) {
        setOwn(merged, child.id, deepClone(fallback[child.id]) as FieldValue);
      }
    }
    return merged;
  });
}

/**
 * Returns a copy of `source` whose values keep the target's translated values where the target is a
 * custom-html section with a value of the same shape; otherwise the source's value is used.
 * Repeater values are merged item by item. Neither argument is mutated.
 */
export function mergeForLanguageSync<S extends CustomHtmlSectionLike>(
  source: S,
  target?: { type?: unknown; data?: unknown } | null,
): S {
  const srcData = source.data;
  const fields = Array.isArray(srcData.fields) ? srcData.fields : [];
  const srcValues = (srcData.values && typeof srcData.values === 'object' ? srcData.values : {}) as Record<string, FieldValue>;

  let targetValues: Record<string, unknown> | null = null;
  if (target && target.type === CUSTOM_HTML_TYPE && target.data && typeof target.data === 'object') {
    const tv = (target.data as { values?: unknown }).values;
    if (tv && typeof tv === 'object' && !Array.isArray(tv)) targetValues = tv as Record<string, unknown>;
  }

  const values: Record<string, FieldValue> = {};
  for (let i = 0; i < fields.length; i++) {
    const id = fields[i].id;
    const srcHas = has(srcValues, id);
    const model: unknown = srcHas ? srcValues[id] : fields[i].default;
    if (targetValues && has(targetValues, id) && sameShape(model, targetValues[id])) {
      const translated = targetValues[id];
      setOwn(
        values,
        id,
        fields[i].type === 'repeater' && Array.isArray(translated)
          ? mergeItems(fields[i], model, translated)
          : (deepClone(translated) as FieldValue),
      );
    } else if (srcHas) {
      setOwn(values, id, deepClone(srcValues[id]));
    }
  }

  return { ...source, data: { ...srcData, values } };
}
