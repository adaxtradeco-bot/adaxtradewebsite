/**
 * Validates a page-builder JSON (array of sections) against the generated reference.
 *
 *   npx tsx scripts/page-builder/validate-page-json.ts <page.json> [--strict] [--quiet]
 *
 * Exit code 0 = no errors (warnings allowed unless --strict), 1 = errors.
 *
 * What it catches that the editor's JSON import does NOT:
 *   unknown / non-renderable section types, wrong field names (silently ignored by the component),
 *   missing required fields (components crash on `data.items.map`), wrong value types, bad enum values,
 *   unknown infographic types / theme / animation / style values, duplicate ids, order gaps.
 *
 * Needs .claude/section-reference/model.json — regenerate with generate-section-reference.ts.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Node, ReferenceModel } from './model';

export interface Issue { level: 'error' | 'warn'; path: string; message: string }

const MODEL_PATH = path.join(process.cwd(), '.claude', 'section-reference', 'model.json');

export function loadModel(file = MODEL_PATH): ReferenceModel {
  if (!fs.existsSync(file)) {
    throw new Error(`Reference model not found: ${file}\nRun: npx tsx scripts/page-builder/generate-section-reference.ts`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const PLACEHOLDER = /\[(your|insert|add|title|description|text)\b[^\]]*\]|lorem ipsum|\bTODO\b|\bTBD\b|xxxx/i;
const kind = (v: any) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const show = (v: any) => { const s = JSON.stringify(v); return s && s.length > 40 ? s.slice(0, 37) + '…' : s; };

function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** nearest candidate by edit distance, only when it is plausibly a typo or a case/separator variant */
function closest(key: string, candidates: string[]): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/[-_\s]/g, '');
  let best: string | null = null; let bestD = Infinity;
  for (const c of candidates) {
    const dist = norm(c) === norm(key) ? 0 : distance(norm(key), norm(c));
    if (dist < bestD) { bestD = dist; best = c; }
  }
  return best !== null && bestD <= Math.max(1, Math.floor(norm(key).length / 4)) ? best : null;
}

const isStructured = (n: Node): boolean =>
  n.t === 'array' || n.t === 'object' || n.t === 'record' || (n.t === 'union' && n.a.every((a) => isStructured(a)));

class Validator {
  issues: Issue[] = [];
  /** component source file, appended to "unknown field" messages so the claim can be verified */
  file = '';
  /** infographic components use `data?.x?.map`, so missing data renders nothing instead of crashing */
  inInfographic = false;
  constructor(private model: ReferenceModel) {}
  err(p: string, message: string) { this.issues.push({ level: 'error', path: p, message }); }
  warn(p: string, message: string) { this.issues.push({ level: 'warn', path: p, message }); }

  /** returns number of errors added so unions can pick the best alternative */
  node(schema: Node, value: any, p: string, strictUnknown: boolean): void {
    switch (schema.t) {
      case 'any': return;
      case 'infographic': return this.infographic(value, p);
      case 'string':
        if (typeof value !== 'string') return this.err(p, `expected string, got ${kind(value)} ${show(value)}`);
        if (PLACEHOLDER.test(value)) this.warn(p, `looks like placeholder text: ${show(value)}`);
        return;
      case 'number':
        if (typeof value !== 'number') return this.err(p, `expected number, got ${kind(value)} ${show(value)}`);
        return;
      case 'boolean':
        if (typeof value !== 'boolean') return this.err(p, `expected boolean, got ${kind(value)} ${show(value)}`);
        return;
      case 'enum':
        if (!schema.v.includes(value)) {
          const msg = `value ${show(value)} is not one of ${schema.v.map((x) => JSON.stringify(x)).join(' | ')}`;
          return schema.soft ? this.warn(p, msg + ' (renders with fallback styling)') : this.err(p, msg);
        }
        return;
      case 'array':
        if (!Array.isArray(value)) return this.err(p, `expected array, got ${kind(value)}`);
        value.forEach((item, i) => {
          if (item === null || item === undefined) return this.err(`${p}[${i}]`, 'array item is null');
          this.node(schema.i, item, `${p}[${i}]`, strictUnknown);
        });
        return;
      case 'record':
        if (kind(value) !== 'object') return this.err(p, `expected object, got ${kind(value)}`);
        for (const [k, v] of Object.entries(value)) if (v !== null) this.node(schema.v, v, `${p}.${k}`, strictUnknown);
        return;
      case 'union': {
        let best: Issue[] | null = null;
        for (const alt of schema.a) {
          const sub = new Validator(this.model);
          sub.file = this.file;
          sub.inInfographic = this.inInfographic;
          sub.node(alt, value, p, strictUnknown);
          const errors = sub.issues.filter((i) => i.level === 'error');
          if (!errors.length) { this.issues.push(...sub.issues); return; }
          if (!best || errors.length < best.filter((i) => i.level === 'error').length) best = sub.issues;
        }
        // Prefer the alternative whose JS kind matches the value, otherwise report a type mismatch
        const matching = schema.a.filter((a) => (a.t === 'object' || a.t === 'record' ? kind(value) === 'object' : a.t === 'array' ? kind(value) === 'array' : a.t === 'string' ? kind(value) === 'string' : a.t === 'number' ? kind(value) === 'number' : a.t === 'boolean' ? kind(value) === 'boolean' : true));
        if (!matching.length) return this.err(p, `value ${show(value)} (${kind(value)}) matches none of: ${schema.a.map((a) => a.t).join(' | ')}`);
        if (best) this.issues.push(...best);
        return;
      }
      case 'object': {
        if (kind(value) !== 'object') return this.err(p, `expected object, got ${kind(value)}${Array.isArray(value) ? '' : ` ${show(value)}`}`);
        const known = Object.keys(schema.p);
        for (const [k, f] of Object.entries(schema.p)) {
          if (!(k in value) || value[k] === undefined || value[k] === null) {
            if (f.o) continue;
            const what = value[k] === null ? 'is null' : 'is missing';
            // arrays / objects are dereferenced by the components (`.map`, `.x`) → crash; scalars just render empty
            if (isStructured(f.s)) this.err(`${p}.${k}`, `required ${f.s.t === 'array' ? 'array' : 'object'} ${what} — ${this.inInfographic ? 'the infographic renders nothing' : 'the component will crash'}`);
            else this.warn(`${p}.${k}`, `typed as required by the component but ${what} (renders empty)`);
          } else {
            if (f.ignored) this.warn(`${p}.${k}`, 'field is accepted but never rendered');
            if (f.src === 'default' && f.d) this.warn(`${p}.${k}`, f.d);
            this.node(f.s, value[k], `${p}.${k}`, strictUnknown);
          }
        }
        if (!schema.open) {
          for (const k of Object.keys(value)) {
            if (known.includes(k)) continue;
            const hint = closest(k, known);
            const msg = `unknown field "${k}" — not declared by the component, so it is ignored${hint ? `; did you mean "${hint}"?` : ''}${this.file ? ` (verify in ${this.file})` : ''}`;
            strictUnknown ? this.err(`${p}.${k}`, msg) : this.warn(`${p}.${k}`, msg);
          }
        }
        return;
      }
    }
  }

  infographic(v: any, p: string) {
    const ig = this.model.infographic;
    if (kind(v) !== 'object') return this.err(p, `infographic must be an object, got ${kind(v)}`);
    const types = Object.keys(ig.types);
    if (typeof v.type !== 'string') return this.err(`${p}.type`, 'infographic needs a string "type"');
    const spec = ig.types[v.type];
    if (!spec) {
      this.err(`${p}.type`, `unknown infographic type "${v.type}" — renders "Unknown infographic type"${closest(v.type, types) ? `; did you mean "${closest(v.type, types)}"?` : ''}. Valid: ${types.join(', ')}`);
    } else if (v.mediaOverride === undefined || v.type === 'media') {
      if (v.data === undefined) this.err(`${p}.data`, `infographic "${v.type}" needs "data"`);
      else {
        this.inInfographic = true;
        this.node(spec.schema, v.data, `${p}.data`, false);
        this.inInfographic = false;
      }
    }
    for (const k of ['theme', 'animation', 'style'] as const) {
      if (v[k] === undefined) continue;
      this.node(ig[k], v[k], `${p}.${k}`, true);
    }
    if (v.theme?.preset === 'custom' && !v.theme.customColors) this.warn(`${p}.theme`, 'preset "custom" without customColors falls back to the built-in custom palette');
    if (v.mediaOverride !== undefined) this.node(ig.mediaOverride, v.mediaOverride, `${p}.mediaOverride`, true);
    for (const k of Object.keys(v)) if (!['type', 'data', 'theme', 'animation', 'style', 'mediaOverride'].includes(k)) this.warn(`${p}.${k}`, `unknown infographic key "${k}" (ignored)`);
  }
}

export function validatePage(sections: any, model: ReferenceModel): Issue[] {
  const v = new Validator(model);
  if (!Array.isArray(sections)) { v.err('root', 'root must be an array of sections'); return v.issues; }
  if (!sections.length) v.warn('root', 'page has no sections');
  const ids = new Map<string, number>();
  const types = new Map<string, number>();
  const knownTypes = Object.keys(model.sections);

  sections.forEach((s: any, i: number) => {
    const at = `[${i}]`;
    if (kind(s) !== 'object') return v.err(at, 'section must be an object');
    if (typeof s.id !== 'string' || !s.id) v.err(`${at}.id`, 'missing/invalid "id" (non-empty string required)');
    else {
      if (ids.has(s.id)) v.err(`${at}.id`, `duplicate id "${s.id}" (also at [${ids.get(s.id)}])`);
      ids.set(s.id, i);
      if (!/^section-\d{6,}$/.test(s.id)) v.warn(`${at}.id`, `id "${s.id}" does not follow the section-<digits> convention`);
    }
    if (!Number.isInteger(s.order)) v.err(`${at}.order`, 'missing/invalid "order" (integer required)');
    else if (s.order !== i) v.warn(`${at}.order`, `order is ${s.order}, expected ${i} (sequential from 0)`);
    if (kind(s.data) !== 'object') v.err(`${at}.data`, 'missing/invalid "data" (object required)');
    for (const k of Object.keys(s)) if (!['id', 'type', 'order', 'data', 'style', 'responsive'].includes(k)) v.warn(`${at}.${k}`, `unknown section key "${k}" (ignored)`);

    const m = typeof s.type === 'string' ? model.sections[s.type] : undefined;
    if (s.style !== undefined) {
      if (kind(s.style) !== 'object') v.err(`${at}.style`, 'style must be an object');
      else {
        const own = m?.styleSchema && m.styleSchema.t === 'object' ? m.styleSchema.p : {};
        for (const [k, val] of Object.entries<any>(s.style)) {
          if (val === null || val === undefined) continue;
          if (own[k]) v.node(own[k].s, val, `${at}.style.${k}`, true);
          else if (!model.sectionEnvelope.styleKeys.includes(k)) v.warn(`${at}.style.${k}`, `unknown style key "${k}" (known: ${[...model.sectionEnvelope.styleKeys, ...Object.keys(own)].join(', ')})`);
          else if (k === 'alignment' && !model.sectionEnvelope.alignment.includes(val)) v.err(`${at}.style.alignment`, `must be one of ${model.sectionEnvelope.alignment.join(' | ')}`);
          else if (k === 'columns' ? typeof val !== 'number' : typeof val !== 'string') v.err(`${at}.style.${k}`, `expected ${k === 'columns' ? 'number' : 'string'}, got ${kind(val)}`);
        }
        for (const [k, f] of Object.entries(own)) if (!f.o && !(k in s.style)) v.warn(`${at}.style.${k}`, 'style field is declared required by the component (it usually has a built-in default)');
      }
    } else if (m?.styleSchema && m.styleSchema.t === 'object') {
      for (const [k, f] of Object.entries(m.styleSchema.p)) if (!f.o) v.warn(`${at}.style`, `"${s.type}" declares required style field "${k}" — add a style object`);
    }

    if (typeof s.type !== 'string' || !s.type) return v.err(`${at}.type`, 'missing "type"');
    types.set(s.type, (types.get(s.type) ?? 0) + 1);
    if (!m) {
      const hint = closest(s.type, knownTypes);
      return v.err(`${at}.type`, `unknown section type "${s.type}" — the page shows a red "Unknown section type" box${hint ? `; did you mean "${hint}"?` : ''}`);
    }
    if (!m.renderable) return v.err(`${at}.type`, `"${s.type}" has no renderer case — it cannot be displayed`);
    if (!m.inRegistry) v.warn(`${at}.type`, `"${s.type}" is ${m.aliasOf ? `an alias of "${m.aliasOf}"` : 'a legacy type'} (not in the Add-Section menu); prefer ${m.aliasOf ? `"${m.aliasOf}"` : 'a registry type'}`);
    if (!m.schema) { v.warn(`${at}.data`, `no field schema known for "${s.type}" — only the envelope was checked`); return; }
    v.file = m.componentFile ?? '';
    if (kind(s.data) === 'object') v.node(m.schema, s.data, `${at}(${s.type}).data`, m.schemaSource === 'component-types');
    v.file = '';
  });

  for (const [t, n] of types) if (n > 1) v.warn('root', `section type "${t}" is used ${n} times (variety rule: one per page)`);
  return v.issues;
}

// ── CLI ──
if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const strict = args.includes('--strict');
  const quiet = args.includes('--quiet');
  if (!file) { console.error('usage: validate-page-json.ts <page.json> [--strict] [--quiet]'); process.exit(2); }
  let raw: string;
  try { raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, ''); } catch (e: any) { console.error(`cannot read ${file}: ${e.message}`); process.exit(2); }
  let json: any;
  try { json = JSON.parse(raw); } catch (e: any) {
    const m = /position (\d+)/.exec(e.message);
    const line = m ? raw.slice(0, +m[1]).split('\n').length : '?';
    console.error(`✗ JSON syntax error (line ${line}): ${e.message}`);
    process.exit(1);
  }
  const model = loadModel();
  const issues = validatePage(json, model);
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  for (const i of issues) if (!(quiet && i.level === 'warn')) console.log(`${i.level === 'error' ? '✗ ERROR' : '⚠ warn '}  ${i.path}: ${i.message}`);
  const n = Array.isArray(json) ? json.length : 0;
  console.log(`\n${errors.length ? '✗' : '✓'} ${n} sections — ${errors.length} error(s), ${warns.length} warning(s)`);
  process.exit(errors.length || (strict && warns.length) ? 1 : 0);
}
