/**
 * Generates the page-builder reference used by the /build-page command.
 *
 *   npx tsx scripts/page-builder/generate-section-reference.ts
 *
 * Ground truth, nothing hand-copied:
 *   - SECTION_TEMPLATES (section-registry)   -> exact default JSON, name, category
 *   - section-renderer.tsx `switch`           -> which type renders which component
 *   - TypeScript checker on that component    -> every field, optional ones and enums included
 *   - InfographicRenderer + infographic-spec  -> infographic types, theme/animation/style options
 *
 * Output (.claude/section-reference/): INDEX.md, infographics.md, sections/<type>.md, model.json
 * model.json is what scripts/page-builder/validate-page-json.ts checks pages against.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { SECTION_TEMPLATES } from '../../src/lib/page-builder/section-registry';
import { BaseSectionSchema } from '../../src/lib/page-builder/section-schemas';
import { INFOGRAPHIC_DEFAULT_DATA } from '../../src/lib/page-builder/infographic-defaults';
import { THEME_PRESETS } from '../../src/lib/infographic-themes';
import { INFOGRAPHIC_SPEC } from './infographic-spec';
import { validatePage } from './validate-page-json';
import type { Field, InfographicTypeModel, Node, ReferenceModel, SectionModel } from './model';

const ROOT = process.cwd();
const OUT = path.join(ROOT, '.claude', 'section-reference');
const rel = (p: string) => path.relative(ROOT, p).replace(/\\/g, '/');

// ───────────────────────── TypeScript program ─────────────────────────
const cfg = ts.readConfigFile(path.join(ROOT, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, ROOT);
const RENDERER = path.join(ROOT, 'src/lib/page-builder/section-renderer.tsx');
const INFO_RENDERER = path.join(ROOT, 'src/components/builder-sections/InfographicRenderer.tsx');
const THEMES = path.join(ROOT, 'src/lib/infographic-themes.ts');
const program = ts.createProgram([RENDERER, INFO_RENDERER, THEMES], {
  ...parsed.options,
  noEmit: true,
  incremental: false,
  composite: false,
  tsBuildInfoFile: undefined,
});
const checker = program.getTypeChecker();

// ───────────────────────── type → schema serializer ─────────────────────────
const MAX_DEPTH = 8;
const clip = (s: string, n = 180) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function commentFor(sym: ts.Symbol): string | undefined {
  const doc = ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();
  if (doc) return clip(doc.replace(/\s+/g, ' '));
  const decl = sym.declarations?.[0];
  if (!decl) return undefined;
  const text = decl.getSourceFile().text;
  const trailing = ts.getTrailingCommentRanges(text, decl.end);
  const pick = (r: ts.CommentRange) =>
    text.slice(r.pos, r.end).replace(/^\/\/\s?/, '').replace(/^\/\*+\s?|\s?\*+\/$/g, '').replace(/\s+/g, ' ').trim();
  if (trailing?.length) return clip(pick(trailing[0]));
  const leading = ts.getLeadingCommentRanges(text, decl.pos);
  const last = leading?.[leading.length - 1];
  if (last && last.kind === ts.SyntaxKind.SingleLineCommentTrivia) return clip(pick(last));
  return undefined;
}

// UI-library types (React props, CSSProperties, …) are not page data. zod-inferred types and lib arrays are.
const EXTERNAL_RE = /node_modules[\\/](@types[\\/]react|react|react-dom|framer-motion|next|lucide-react|csstype|@radix-ui|@heroicons)[\\/]/;
const LIB_NAMES = /^(ReactNode|ReactElement|Element|CSSProperties|Date|Map|Set|Promise|RegExp|Function|HTMLElement|File|Blob)$/;
const isExternal = (t: ts.Type) => {
  const sym = t.aliasSymbol ?? t.symbol;
  const decl = sym?.declarations?.[0];
  return !!decl && (EXTERNAL_RE.test(decl.getSourceFile().fileName) || (LIB_NAMES.test(sym.name) && /node_modules/.test(decl.getSourceFile().fileName)));
};
const isFunctionish = (t: ts.Type) => t.getCallSignatures().length > 0 || t.getConstructSignatures().length > 0;

const A: Node = { t: 'any' };
const sameNode = (a: Node, b: Node) => JSON.stringify(a) === JSON.stringify(b);

function ser(type: ts.Type, ctx: ts.Node, depth: number, stack: ts.Type[], propName?: string): Node {
  if (propName === 'infographic') return { t: 'infographic' };
  if (propName === 'infographics') return { t: 'array', i: { t: 'infographic' } };
  const f = type.flags;
  if (depth > MAX_DEPTH) return A;
  if (f & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive | ts.TypeFlags.TypeParameter)) return A;
  if (f & ts.TypeFlags.Boolean || f & ts.TypeFlags.BooleanLiteral) return { t: 'boolean' };
  if (f & ts.TypeFlags.StringLiteral) return { t: 'enum', v: [(type as ts.StringLiteralType).value] };
  if (f & ts.TypeFlags.NumberLiteral) return { t: 'enum', v: [(type as ts.NumberLiteralType).value] };
  if (f & (ts.TypeFlags.String | ts.TypeFlags.TemplateLiteral | ts.TypeFlags.StringMapping)) return { t: 'string' };
  if (f & (ts.TypeFlags.Number | ts.TypeFlags.BigInt)) return { t: 'number' };

  if (type.isUnion()) {
    const members = type.types.filter((m) => !(m.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)));
    if (!members.length) return A;
    const nodes = members.map((m) => ser(m, ctx, depth, stack, propName));
    const lits = nodes.filter((n) => n.t === 'enum') as Extract<Node, { t: 'enum' }>[];
    const rest = nodes.filter((n) => n.t !== 'enum');
    const merged: Node[] = [];
    if (lits.length) merged.push({ t: 'enum', v: [...new Set(lits.flatMap((l) => l.v))] });
    for (const n of rest) if (!merged.some((m) => sameNode(m, n))) merged.push(n);
    // `'a' | 'b' | string` style collapses to string
    if (merged.some((n) => n.t === 'string') && merged.length === 2 && merged.some((n) => n.t === 'enum')) return { t: 'string' };
    if (merged.some((n) => n.t === 'any')) return A;
    // `Partial<Data> | Record<string, any>` — the loose record is only an escape hatch; the typed arm is the contract
    const typed = merged.filter((n) => !(n.t === 'record' && n.v.t === 'any'));
    const alts = typed.length && typed.length < merged.length ? typed : merged;
    return alts.length === 1 ? alts[0] : { t: 'union', a: alts };
  }

  if (f & ts.TypeFlags.Object || type.isIntersection()) {
    if (checker.isArrayType(type) || checker.isTupleType(type)) {
      const args = checker.getTypeArguments(type as ts.TypeReference);
      const nodes = args.map((a) => ser(a, ctx, depth + 1, stack));
      const uniq = nodes.filter((n, i) => nodes.findIndex((m) => sameNode(m, n)) === i);
      return { t: 'array', i: !uniq.length ? A : uniq.length === 1 ? uniq[0] : { t: 'union', a: uniq } };
    }
    const idx = checker.getIndexInfoOfType(type, ts.IndexKind.String);
    const props = checker.getPropertiesOfType(type);
    if (idx && !props.length) return { t: 'record', v: ser(idx.type, ctx, depth + 1, stack) };
    if (isExternal(type)) return A;
    if (isFunctionish(type) && !props.length) return A;
    if (stack.includes(type)) return A;
    const next = [...stack, type];
    const p: Record<string, Field> = {};
    for (const prop of props) {
      const pt = checker.getTypeOfSymbolAtLocation(prop, ctx);
      const nonNull = checker.getNonNullableType(pt);
      if (isFunctionish(nonNull) && !checker.getPropertiesOfType(nonNull).length) continue; // callbacks etc.
      if (/^(key|ref|children)$/.test(prop.name)) continue;
      const field: Field = {
        s: ser(pt, ctx, depth + 1, next, prop.name),
        o: !!(prop.flags & ts.SymbolFlags.Optional) || (pt.isUnion() && pt.types.some((m) => m.flags & ts.TypeFlags.Undefined)) || false,
        src: 'type',
      };
      const d = commentFor(prop);
      if (d) field.d = d;
      p[prop.name] = field;
    }
    return { t: 'object', p, ...(idx ? { open: true } : {}) };
  }
  return A;
}

const isAnyLike = (n: Node | null): boolean =>
  !n || n.t === 'any' || (n.t === 'record' && n.v.t === 'any') || (n.t === 'object' && !Object.keys(n.p).length);

// ───────────────────────── renderer: type → component ─────────────────────────
interface Group {
  labels: string[];
  jsx: ts.JsxSelfClosingElement | ts.JsxOpeningElement | null;
  clauseText: string;
}
function readSwitchGroups(file: string, exprIncludes: string): Group[] {
  const sf = program.getSourceFile(file)!;
  const groups: Group[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isSwitchStatement(node) && node.expression.getText().includes(exprIncludes)) {
      let labels: string[] = [];
      for (const clause of node.caseBlock.clauses) {
        labels.push(ts.isCaseClause(clause) ? clause.expression.getText().replace(/^['"]|['"]$/g, '') : 'default');
        if (!clause.statements.length) continue;
        let jsx: Group['jsx'] = null;
        const find = (n: ts.Node) => {
          if (jsx) return;
          if (ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) { jsx = n; return; }
          ts.forEachChild(n, find);
        };
        clause.statements.forEach(find);
        groups.push({ labels, jsx, clauseText: clause.getText() });
        labels = [];
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return groups;
}

interface Resolved {
  schema: Node | null;
  styleSchema: Node | null;
  component: string | null;
  componentFile: string | null;
}

function resolveComponent(g: Group): Resolved {
  const jsx = g.jsx;
  if (!jsx) return { schema: null, styleSchema: null, component: null, componentFile: null };
  const tag = jsx.tagName.getText();
  if (/^[a-z]/.test(tag)) return { schema: null, styleSchema: null, component: null, componentFile: null }; // inline html
  let sym = checker.getSymbolAtLocation(jsx.tagName);
  if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
  const decl = sym?.declarations?.[0];
  const componentFile = decl ? rel(decl.getSourceFile().fileName) : null;
  const attrs = jsx.attributes.properties.map((p) => (ts.isJsxSpreadAttribute(p) ? '...' : p.name.getText()));
  const tagType = checker.getTypeAtLocation(jsx.tagName);
  const sig = tagType.getCallSignatures()[0] ?? tagType.getConstructSignatures()[0];
  if (!sig || !sig.parameters[0]) return { schema: null, styleSchema: null, component: tag, componentFile };
  const propsType = checker.getTypeOfSymbolAtLocation(sig.parameters[0], jsx);

  let dataType: ts.Type | null = null;
  let styleType: ts.Type | null = null;
  const dataProp = propsType.getProperty('data');
  const sectionProp = propsType.getProperty('section');
  const typeOf = (s?: ts.Symbol) => (s ? checker.getTypeOfSymbolAtLocation(s, jsx) : null);
  if (attrs.includes('data') && dataProp) {
    dataType = checker.getTypeOfSymbolAtLocation(dataProp, jsx);
    styleType = typeOf(propsType.getProperty('style'));
  } else if (attrs.includes('section') && sectionProp) {
    const st = checker.getTypeOfSymbolAtLocation(sectionProp, jsx);
    const dp = st.getProperty('data');
    styleType = typeOf(st.getProperty('style'));
    dataType = dp ? checker.getTypeOfSymbolAtLocation(dp, jsx) : null;
    if (!dataType || isAnyLike(ser(dataType, jsx, 0, []))) {
      // component receives the whole section and casts `section.data as X` inside
      dataType = castedDataType(decl?.getSourceFile()) ?? dataType;
    }
  } else if (attrs.includes('...')) {
    dataType = propsType; // <Comp {...section.data} />
  }
  const styleNode = styleType ? ser(styleType, jsx, 0, []) : null;
  const styleSchema = styleNode && !isAnyLike(styleNode) ? styleNode : null;
  if (!dataType) return { schema: null, styleSchema, component: tag, componentFile };
  const schema = ser(dataType, jsx, 0, []);
  return { schema: isAnyLike(schema) ? null : schema, styleSchema, component: tag, componentFile };
}

function castedDataType(sf?: ts.SourceFile): ts.Type | null {
  if (!sf) return null;
  let found: ts.Type | null = null;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isAsExpression(n) && /\.data(\s+as\s+any)?\)?$/.test(n.expression.getText()) && !/any$/.test(n.type.getText())) {
      found = checker.getTypeFromTypeNode(n.type);
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

// ───────────────────────── default-JSON helpers ─────────────────────────
function inferNode(v: any, depth = 0): Node {
  if (v === null || v === undefined || depth > 6) return A;
  if (typeof v === 'string') return { t: 'string' };
  if (typeof v === 'number') return { t: 'number' };
  if (typeof v === 'boolean') return { t: 'boolean' };
  if (Array.isArray(v)) {
    const items = v.filter((x) => x !== null);
    return { t: 'array', i: items.length ? mergeInferred(items.map((x) => inferNode(x, depth + 1))) : A };
  }
  const p: Record<string, Field> = {};
  for (const [k, val] of Object.entries(v)) p[k] = { s: inferNode(val, depth + 1), o: true, src: 'default' };
  return { t: 'object', p };
}
function mergeInferred(nodes: Node[]): Node {
  const objs = nodes.filter((n) => n.t === 'object') as Extract<Node, { t: 'object' }>[];
  if (objs.length === nodes.length) {
    const p: Record<string, Field> = {};
    for (const o of objs) for (const [k, f] of Object.entries(o.p)) p[k] = p[k] ?? f;
    return { t: 'object', p };
  }
  return nodes[0];
}

const kindOf = (v: any) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const join = (p: string, k: string) => (p ? `${p}.${k}` : k);

/**
 * Reconcile the component's TS schema with the registry default JSON (what the editor inserts).
 *  - keys only in the default JSON are kept as `src:'default'` (validator warns: probably ignored by the component)
 *  - primitive kind mismatches (TS `number`, default "10K+") widen the schema: the app itself ships that value
 *  - every disagreement is recorded in `notes` so the reference can warn "this default is stale"
 * Returns the (possibly replaced) schema node.
 */
function mergeDefault(schema: Node, value: any, p: string, notes: string[], depth = 0): Node {
  if (depth > 8 || value === undefined || value === null) return schema;
  const vk = kindOf(value);
  switch (schema.t) {
    case 'any':
    case 'infographic':
    case 'record':
      return schema;
    case 'object': {
      if (vk !== 'object') { notes.push(`${p || 'data'}: component expects an object, default JSON has ${vk}`); return schema; }
      for (const [k, f] of Object.entries(schema.p))
        if (!f.o && !(k in value)) notes.push(`${join(p, k)}: required by the component but missing from the default JSON`);
      for (const [k, v] of Object.entries(value)) {
        const f = schema.p[k];
        if (!f) {
          schema.p[k] = { s: inferNode(v), o: true, src: 'default', d: 'only in the registry default — not declared by the component (probably ignored)' };
          notes.push(`${join(p, k)}: in the default JSON but not declared by the component (probably ignored)`);
          continue;
        }
        if (v === null && !f.o) f.o = true;
        f.s = mergeDefault(f.s, v, join(p, k), notes, depth + 1);
      }
      return schema;
    }
    case 'array': {
      if (vk !== 'array') { notes.push(`${p}: component expects an array, default JSON has ${vk}`); return schema; }
      let item = schema.i;
      for (const it of value) item = mergeDefault(item, it, p + '[]', notes, depth + 1);
      schema.i = item;
      return schema;
    }
    case 'union': {
      const fits = (a: Node) => (a.t === 'object' || a.t === 'record' ? vk === 'object' : a.t === 'array' ? vk === 'array' : a.t === 'any' || a.t === 'infographic' ? true : a.t === 'enum' ? typeof value === typeof (a.v[0] ?? '') : a.t === vk);
      const idx = schema.a.findIndex(fits);
      if (idx < 0) { notes.push(`${p}: default JSON value is a ${vk}, not allowed by the declared type`); schema.a.push(inferNode(value)); return schema; }
      schema.a[idx] = mergeDefault(schema.a[idx], value, p, notes, depth + 1);
      return schema;
    }
    case 'enum': {
      if (!schema.v.includes(value) && (typeof value === 'string' || typeof value === 'number')) {
        notes.push(`${p}: default value ${JSON.stringify(value)} is outside the declared options — option added`);
        schema.v.push(value);
      }
      return schema;
    }
    default: {
      // string | number | boolean
      if (vk !== schema.t) {
        notes.push(`${p}: declared ${schema.t}, default JSON has ${vk} — both accepted`);
        return { t: 'union', a: [schema, inferNode(value)] };
      }
      return schema;
    }
  }
}

function collectPaths(v: any, prefix = '', out = new Set<string>()): Set<string> {
  if (Array.isArray(v)) { for (const x of v) collectPaths(x, prefix + '[]', out); }
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) { const p = prefix ? `${prefix}.${k}` : k; out.add(p); collectPaths(x, p, out); }
  }
  return out;
}

function infographicPaths(n: Node, prefix = '', out: string[] = [], depth = 0): string[] {
  if (depth > 9) return out;
  if (n.t === 'infographic') out.push(prefix);
  else if (n.t === 'object') for (const [k, f] of Object.entries(n.p)) infographicPaths(f.s, prefix ? `${prefix}.${k}` : k, out, depth + 1);
  else if (n.t === 'array') infographicPaths(n.i, prefix + '[]', out, depth + 1);
  else if (n.t === 'union') n.a.forEach((a) => infographicPaths(a, prefix, out, depth + 1));
  else if (n.t === 'record') infographicPaths(n.v, prefix + '{}', out, depth + 1);
  return out;
}

// ───────────────────────── visual catalog notes ─────────────────────────
function readCatalog() {
  const file = path.join(ROOT, '.claude', 'commands', 'section-catalog.md');
  const notes: Record<string, string> = {};
  const groups: Record<string, string> = {};
  if (!fs.existsSync(file)) return { notes, groups };
  let group = '';
  let cur: string | null = null;
  let buf: string[] = [];
  let inFence = false;
  const flush = () => { if (cur) notes[cur] = buf.join('\n').trim(); cur = null; buf = []; };
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const g = line.match(/^#{1,4}\s+═+\s*(.+?)\s*═+\s*$/);
    if (g) { flush(); group = g[1].replace(/\s*\(.*\)\s*$/, '').trim(); continue; }
    const h = line.match(/^#{2,4}\s+`([a-z0-9-]+)`/);
    if (h && !inFence) { flush(); cur = h[1]; groups[cur] = group; buf = []; continue; }
    if (/^#{1,3}\s/.test(line) && !inFence) { flush(); continue; }
    if (/^```/.test(line)) { inFence = !inFence; continue; } // drop the catalog's own (possibly stale) JSON
    if (cur && !inFence) buf.push(line);
  }
  flush();
  for (const k of Object.keys(notes)) notes[k] = clip(notes[k].replace(/\n{3,}/g, '\n\n'), 1400);
  return { notes, groups };
}

// ───────────────────────── build the model ─────────────────────────
const catalog = readCatalog();
const groups = readSwitchGroups(RENDERER, 'section.type');
const declaredTypes: string[] = (BaseSectionSchema.shape.type as any).options;

const registryByType = new Map<string, (typeof SECTION_TEMPLATES)[number][]>();
for (const t of SECTION_TEMPLATES) registryByType.set(t.type, [...(registryByType.get(t.type) ?? []), t]);

const sections: Record<string, SectionModel> = {};
const renderable = new Set<string>();
const resolvedByLabel = new Map<string, Resolved & { primary: string; clauseText: string }>();

for (const g of groups) {
  const labels = g.labels.filter((l) => l !== 'default');
  if (!labels.length) continue;
  const primary = labels.find((l) => registryByType.has(l)) ?? labels[0];
  const res = resolveComponent(g);
  for (const l of labels) { renderable.add(l); resolvedByLabel.set(l, { ...res, primary, clauseText: g.clauseText }); }
}

function scanKeys(clauseText: string, componentFile: string | null): string[] {
  const keys = new Set<string>();
  const texts = [clauseText];
  if (componentFile) { try { texts.push(fs.readFileSync(path.join(ROOT, componentFile), 'utf8')); } catch { /* ignore */ } }
  for (const t of texts) {
    for (const m of t.matchAll(/\bdata\??\.([A-Za-z_]\w*)/g)) keys.add(m[1]);
    for (const m of t.matchAll(/const\s*\{([^}]+)\}\s*=\s*(?:\(?section(?: as any)?\)?\.)?data\b/g))
      m[1].split(',').forEach((s) => { const k = s.split(':')[0].replace(/=.*/, '').trim(); if (/^\w+$/.test(k)) keys.add(k); });
  }
  return [...keys];
}

/**
 * Components that read untyped `data` (destructuring with defaults / inline JSX) have no TS type to
 * serialise. Where the code still declares an interface for the items, link the array field to it.
 */
const INTERFACE_HINTS: Record<string, { file: string; fields: Record<string, string> }> = {
  'integration-marquee': {
    file: 'src/components/builder-sections/IntegrationMarqueeSection.tsx',
    fields: { row1Apps: 'IntegrationApp', row2Apps: 'IntegrationApp', row3Apps: 'IntegrationApp' },
  },
};
/** Inline renderer cases: the only truth is the JSX in section-renderer.tsx (read by hand). */
const INLINE_SCHEMAS: Record<string, Node> = {
  'logo-cloud': {
    t: 'object',
    p: {
      title: { s: { t: 'string' }, o: true },
      subtitle: { s: { t: 'string' }, o: true },
      logos: {
        s: {
          t: 'array',
          i: {
            t: 'object',
            p: {
              name: { s: { t: 'string' }, o: false, d: 'text shown when no image / icon is set; also the alt fallback' },
              image: { s: { t: 'string' }, o: true, d: 'logo image URL (wins over iconConfig and icon)' },
              alt: { s: { t: 'string' }, o: true },
              iconConfig: { s: { t: 'any' }, o: true, d: 'IconConfig object (wins over icon)' },
              icon: { s: { t: 'string' }, o: true, d: 'Font Awesome brand icon name, rendered as fa-brands fa-<icon>' },
            },
          },
        },
        o: false,
      },
    },
  },
};

const allTypes = new Set<string>([...registryByType.keys(), ...renderable]);
for (const type of allTypes) {
  const templates = registryByType.get(type) ?? [];
  const tpl = templates[0];
  const res = resolvedByLabel.get(type);
  const isRenderable = renderable.has(type);
  let schema: Node | null = res?.schema ? (JSON.parse(JSON.stringify(res.schema)) as Node) : null;
  let schemaSource: SectionModel['schemaSource'] = schema ? 'component-types' : 'none';
  const defaultData = tpl?.defaultData?.data;
  const notes: string[] = [];

  if (schema && defaultData) for (const t of templates) schema = mergeDefault(schema, t.defaultData?.data, '', notes);
  if (!schema && INLINE_SCHEMAS[type]) {
    schema = JSON.parse(JSON.stringify(INLINE_SCHEMAS[type])) as Node;
    for (const t of templates) schema = mergeDefault(schema, t.defaultData?.data, '', notes);
    schemaSource = 'component-types';
  }
  if (!schema) {
    // no usable TS type: open schema from the default JSON (+ keys the component source reads)
    const base: Node = defaultData ? inferNode(defaultData) : { t: 'object', p: {} };
    if (base.t === 'object') {
      for (const k of scanKeys(res?.clauseText ?? '', res?.componentFile ?? null))
        if (!base.p[k]) base.p[k] = { s: A, o: true, src: 'scan' };
      const hint = INTERFACE_HINTS[type];
      if (hint)
        for (const [field, iface] of Object.entries(hint.fields)) {
          const item = interfaceNode(path.join(ROOT, hint.file), iface);
          base.p[field] = { s: { t: 'array', i: item }, o: true, src: 'type' };
          for (const t of templates) base.p[field].s = mergeDefault(base.p[field].s, t.defaultData?.data?.[field], field, notes);
        }
      if (Object.keys(base.p).length) { schema = base; schemaSource = hint ? 'component-types' : 'default-json-only'; }
    }
  }
  const aliasOf = res && res.primary !== type ? res.primary : undefined;
  sections[type] = {
    type,
    name: tpl?.name ?? type,
    category: tpl?.category ?? 'Legacy',
    description: tpl?.description ?? '',
    icon: tpl?.icon ?? '',
    inRegistry: !!tpl,
    ...(aliasOf ? { aliasOf } : {}),
    group: catalog.groups[type] ?? null,
    renderable: isRenderable,
    schemaSource,
    component: res?.component ?? null,
    componentFile: res?.componentFile ?? null,
    schema,
    styleSchema: res?.styleSchema ?? null,
    defaultIssues: [...new Set(notes)],
    defaultSection: tpl?.defaultData ?? null,
    alternateDefaults: templates.slice(1).map((t) => t.defaultData),
    infographicFields: schema ? infographicPaths(schema) : [],
    designNotes: catalog.notes[type] ?? null,
  };
}
// aliases (HeroSection → hero, CTA → cta, …) behave exactly like their primary type
for (const s of Object.values(sections)) {
  const base = s.aliasOf ? sections[s.aliasOf] : null;
  if (base && !s.inRegistry) {
    s.schema = base.schema ? (JSON.parse(JSON.stringify(base.schema)) as Node) : null;
    s.styleSchema = base.styleSchema;
    s.schemaSource = base.schemaSource;
    s.infographicFields = base.infographicFields;
    s.name = base.name;
    s.description = base.description;
    s.designNotes = s.designNotes ?? base.designNotes;
  }
}

// ───────────────────────── infographic model ─────────────────────────
const infoGroups = readSwitchGroups(INFO_RENDERER, 'infographic.type');
const rendererInfoTypes = infoGroups.flatMap((g) => g.labels).filter((l) => l !== 'default');
const specTypes = Object.keys(INFOGRAPHIC_SPEC);
const drift: string[] = [];
for (const t of rendererInfoTypes) if (!INFOGRAPHIC_SPEC[t]) drift.push(`renderer handles infographic "${t}" but infographic-spec.ts has no entry`);
for (const t of specTypes) if (!rendererInfoTypes.includes(t)) drift.push(`infographic-spec.ts has "${t}" but InfographicRenderer has no case for it`);
for (const t of rendererInfoTypes) if (!(t in INFOGRAPHIC_DEFAULT_DATA)) console.warn(`  note: no INFOGRAPHIC_DEFAULT_DATA entry for "${t}"`);
if (drift.length) {
  console.error('\nInfographic drift detected — update scripts/page-builder/infographic-spec.ts:\n  - ' + drift.join('\n  - '));
  process.exit(1);
}

function interfaceNode(file: string, name: string): Node {
  const sf = program.getSourceFile(file)!;
  let out: Node = A;
  sf.forEachChild((n) => {
    if (ts.isInterfaceDeclaration(n) && n.name.text === name) out = ser(checker.getTypeAtLocation(n.name), n, 0, []);
  });
  return out;
}
const infoTypes: Record<string, InfographicTypeModel> = {};
for (const t of rendererInfoTypes) {
  const s = INFOGRAPHIC_SPEC[t];
  infoTypes[t] = {
    type: t,
    group: s.group,
    component: s.component,
    description: s.description,
    schema: s.data,
    notes: s.notes ?? [],
    defaultData: (INFOGRAPHIC_DEFAULT_DATA as any)[t] ?? null,
  };
}
const infographic: ReferenceModel['infographic'] = {
  types: infoTypes,
  envelope: interfaceNode(INFO_RENDERER, 'InfographicData'),
  theme: interfaceNode(THEMES, 'InfographicTheme'),
  animation: interfaceNode(THEMES, 'InfographicAnimation'),
  style: interfaceNode(THEMES, 'InfographicStyle'),
  mediaOverride: ((interfaceNode(INFO_RENDERER, 'InfographicData') as any).p?.mediaOverride?.s ?? A) as Node,
  presets: Object.keys(THEME_PRESETS),
};

const model: ReferenceModel = {
  generatedAt: new Date().toISOString(),
  declaredTypes,
  sections,
  infographic,
  sectionEnvelope: {
    styleKeys: ['backgroundColor', 'textColor', 'padding', 'margin', 'alignment', 'layout', 'columns'],
    alignment: ['left', 'center', 'right'],
  },
};

// The registry defaults may also embed infographics with the wrong data shape (renders empty) — record those too.
for (const m of Object.values(sections)) {
  if (!m.defaultSection || !m.schema) continue;
  for (const [i, def] of [m.defaultSection, ...m.alternateDefaults].entries()) {
    const found = validatePage([{ ...def, id: 'section-1000000001', order: 0 }], model).filter((x) => x.level === 'error' && x.path.includes('.infographic'));
    for (const f of found) m.defaultIssues.push(`${f.path.replace(/^\[0\]\([^)]*\)\.data\.?/, '')}${i ? ' (alt default)' : ''}: ${f.message}`);
  }
  m.defaultIssues = [...new Set(m.defaultIssues)];
}

// ───────────────────────── markdown writers ─────────────────────────
function summarize(n: Node): string {
  switch (n.t) {
    case 'enum': return n.v.map((x) => JSON.stringify(x)).join(' | ') + (n.soft ? ' (others fall back)' : '');
    case 'array': return `array<${summarize(n.i)}>`;
    case 'record': return `record<${summarize(n.v)}>`;
    case 'union': return n.a.map(summarize).join(' | ');
    case 'object': return 'object';
    case 'infographic': return '**infographic** (see infographics.md)';
    default: return n.t;
  }
}
interface Row { path: string; type: string; req: boolean; inDefault: boolean | null; note: string; src?: string }
function flatten(n: Node, prefix: string, paths: Set<string> | null, rows: Row[], depth = 0, seen = new Set<string>()) {
  if (depth > 9) return;
  if (n.t === 'object') {
    for (const [k, f] of Object.entries(n.p)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (!seen.has(p)) {
        seen.add(p);
        rows.push({
          path: p, type: summarize(f.s), req: !f.o,
          inDefault: paths ? paths.has(p) : null,
          note: [f.d ?? '', f.ignored ? '(accepted, not rendered)' : '', f.src === 'scan' ? '(found by source scan)' : ''].filter(Boolean).join(' '),
          src: f.src,
        });
      }
      flatten(f.s, p, paths, rows, depth + 1, seen);
    }
  } else if (n.t === 'array') flatten(n.i, prefix + '[]', paths, rows, depth + 1, seen);
  else if (n.t === 'union') n.a.forEach((a) => flatten(a, prefix, paths, rows, depth + 1, seen));
  else if (n.t === 'record') flatten(n.v, prefix + '{}', paths, rows, depth + 1, seen);
}
const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const SECTION_ID = 'section-0000000000';
const withPlaceholderId = (s: any) => ({ ...s, id: SECTION_ID });

/** `CTA` and `cta` would collide on case-insensitive file systems (Windows/macOS) — PascalCase aliases get an `.alias` suffix */
const sectionFile = (type: string) => (/[A-Z]/.test(type) ? `${type}.alias.md` : `${type}.md`);

function sectionMd(m: SectionModel): string {
  const L: string[] = [];
  if (m.aliasOf && !m.inRegistry) {
    L.push(`# \`${m.type}\` — alias of \`${m.aliasOf}\``);
    L.push('');
    L.push(`The renderer maps \`${m.type}\` to the same component as \`${m.aliasOf}\`. Use \`${m.aliasOf}\` instead — read \`${sectionFile(m.aliasOf)}\`.`);
    L.push('');
    return L.join('\n');
  }
  L.push(`# \`${m.type}\` — ${m.name}`);
  L.push('');
  L.push(`- **Add-Section menu:** ${m.inRegistry ? 'yes' : 'NO (legacy / alias — renders, but not offered by the editor)'}${m.aliasOf ? `  ·  alias of \`${m.aliasOf}\`` : ''}`);
  L.push(`- **Renderable:** ${m.renderable ? 'yes' : '**NO — SectionRenderer has no case for this type; the page shows a red "Unknown section type" box. Do not use.**'}`);
  L.push(`- **Component:** ${m.component ? `\`${m.component}\` (${m.componentFile})` : 'rendered inline in section-renderer.tsx'}`);
  L.push(`- **Schema source:** ${m.schemaSource === 'component-types' ? "TypeScript types of the component (complete, incl. optional fields)" : m.schemaSource === 'default-json-only' ? 'only the default JSON + keys the source reads (component has no usable TS type — field list may be incomplete)' : 'none'}`);
  if (m.category) L.push(`- **Registry category:** ${m.category}${m.group ? `  ·  catalog group: ${m.group}` : ''}`);
  if (m.description) L.push(`- **Registry description:** ${m.description}`);
  if (m.infographicFields.length) L.push(`- **Infographic fields:** ${m.infographicFields.map((f) => `\`data.${f}\``).join(', ')} → see \`infographics.md\``);
  L.push('');
  if (m.designNotes) {
    L.push('## Design notes (from the visual catalog — descriptive only, JSON in the catalog may be stale)');
    L.push('');
    L.push(m.designNotes);
    L.push('');
  }
  if (m.defaultIssues.length) {
    L.push(`## ⚠ The registry default JSON disagrees with the component (${m.defaultIssues.length})`);
    L.push('');
    L.push('The editor inserts this default, but the component does not fully support it. **Follow the field table, not the default JSON, for these fields:**');
    L.push('');
    for (const n of m.defaultIssues.slice(0, 25)) L.push(`- \`${n.split(':')[0]}\`${n.includes(':') ? ':' + n.slice(n.indexOf(':') + 1) : ''}`);
    if (m.defaultIssues.length > 25) L.push(`- … and ${m.defaultIssues.length - 25} more`);
    L.push('');
  }
  if (m.schema) {
    const paths = m.defaultSection ? collectPaths(m.defaultSection.data) : null;
    const rows: Row[] = [];
    flatten(m.schema, '', paths, rows);
    L.push('## Data fields  (`data.<path>` — `[]` = array item)');
    L.push('');
    L.push('Req = typed as required by the component: a missing array/object makes the section crash (validator error), a missing text/number renders empty (validator warning). **In default** = present in the exact default JSON below; `no` means a capability you must add yourself.');
    L.push('');
    L.push('| Field | Type | Req | In default | Notes |');
    L.push('|---|---|---|---|---|');
    for (const r of rows) L.push(`| \`${r.path}\` | ${esc(r.type)} | ${r.req ? '**yes**' : ''} | ${r.inDefault === null ? '' : r.inDefault ? 'yes' : '**no**'} | ${esc(r.note)} |`);
    L.push('');
    const hidden = rows.filter((r) => r.inDefault === false && !r.req);
    if (hidden.length) {
      L.push(`## Optional capabilities NOT in the default JSON (${hidden.length})`);
      L.push('');
      L.push(hidden.map((r) => `- \`${r.path}\` — ${r.type}${r.note ? ` — ${r.note}` : ''}`).join('\n'));
      L.push('');
    }
  }
  if (m.styleSchema) {
    const srows: Row[] = [];
    flatten(m.styleSchema, '', m.defaultSection?.style ? collectPaths(m.defaultSection.style) : null, srows);
    L.push('## Section `style` fields declared by this component (besides the base keys)');
    L.push('');
    L.push('| `style.` field | Type | Req | In default | Notes |');
    L.push('|---|---|---|---|---|');
    for (const r of srows) L.push(`| \`${r.path}\` | ${esc(r.type)} | ${r.req ? '**yes**' : ''} | ${r.inDefault === null ? '' : r.inDefault ? 'yes' : '**no**'} | ${esc(r.note)} |`);
    L.push('');
  }
  if (m.defaultSection) {
    L.push('## Default JSON (exact, from the registry — copy, then edit the content)');
    L.push('');
    L.push('```json');
    L.push(JSON.stringify(withPlaceholderId(m.defaultSection), null, 2));
    L.push('```');
    L.push('');
    m.alternateDefaults.forEach((a, i) => {
      L.push(`### Alternate default #${i + 2}`);
      L.push('');
      L.push('```json');
      L.push(JSON.stringify(withPlaceholderId(a), null, 2));
      L.push('```');
      L.push('');
    });
  }
  return L.join('\n');
}

function infographicsMd(): string {
  const L: string[] = [];
  L.push('# Infographic system');
  L.push('');
  L.push('An **infographic** is a small data visual drawn by `InfographicRenderer` inside a card/tab/feature of certain sections. It is *not* a section type — it is an object placed in a field named `infographic`.');
  L.push('');
  L.push('## Which sections accept it');
  L.push('');
  L.push('| Section type | Field path(s) |');
  L.push('|---|---|');
  for (const m of Object.values(sections).filter((s) => s.infographicFields.length).sort((a, b) => a.type.localeCompare(b.type)))
    L.push(`| \`${m.type}\` | ${m.infographicFields.map((f) => `\`data.${f}\``).join(', ')} |`);
  L.push('');
  L.push('No other section renders infographics; putting an `infographic` object anywhere else is ignored.');
  L.push('');
  L.push('## Envelope');
  L.push('');
  L.push('```json');
  L.push(JSON.stringify({
    type: 'sla-bars',
    data: INFOGRAPHIC_DEFAULT_DATA['sla-bars'],
    theme: { preset: 'corporate' },
    animation: { type: 'fadeIn', speed: 'normal', easing: 'ease-out' },
    style: { displayMode: 'normal', hoverEffect: 'none', borderStyle: 'none', backgroundEffect: 'transparent', borderRadius: 'lg' },
  }, null, 2));
  L.push('```');
  L.push('');
  L.push('- Only `type` (+ `data`) is needed. `theme`, `animation`, `style` are optional, but **if you include one it must be complete** (every non-optional key below), otherwise CSS values come out `undefined`.');
  L.push('- If none of the three is present the renderer fills in defaults.');
  L.push('- `mediaOverride` replaces the drawn visual with an image/video: `{ "type": "image" | "video", "src": "...", "alt": "..." }`.');
  L.push('- Colours: list items get the theme palette automatically (primary, secondary, accent, success, warning, danger — cycling). Do not hand-pick hex colours unless the type documents a colour field.');
  L.push('');
  const block = (title: string, n: Node) => {
    const rows: Row[] = [];
    flatten(n, '', null, rows);
    L.push(`### ${title}`);
    L.push('');
    L.push('| Field | Type | Req | Notes |');
    L.push('|---|---|---|---|');
    for (const r of rows) L.push(`| \`${r.path}\` | ${esc(r.type)} | ${r.req ? '**yes**' : ''} | ${esc(r.note)} |`);
    L.push('');
  };
  L.push('## Envelope options');
  L.push('');
  block('infographic (envelope)', infographic.envelope);
  block('theme', infographic.theme);
  block('animation', infographic.animation);
  block('style', infographic.style);
  L.push(`Theme presets: ${infographic.presets.map((p) => `\`${p}\``).join(', ')}. With \`preset: "custom"\` supply \`customColors\` (primary, secondary, accent, success, warning, danger, background, text, border; optional gradient). \`lightModeTheme\` / \`darkModeTheme\` override the preset per colour mode.`);
  L.push('');
  L.push('## Infographic types');
  L.push('');
  L.push('| Type | Group | Draws |');
  L.push('|---|---|---|');
  for (const t of Object.values(infoTypes)) L.push(`| \`${t.type}\` | ${t.group} | ${esc(t.description)} |`);
  L.push('');
  for (const t of Object.values(infoTypes)) {
    const rows: Row[] = [];
    flatten(t.schema, '', null, rows);
    L.push(`### \`${t.type}\``);
    L.push('');
    L.push(`${t.description}  _(component: ${t.component})_`);
    L.push('');
    L.push('| `data.` field | Type | Req | Notes |');
    L.push('|---|---|---|---|');
    for (const r of rows) L.push(`| \`${r.path}\` | ${esc(r.type)} | ${r.req ? '**yes**' : ''} | ${esc(r.note)} |`);
    L.push('');
    for (const n of t.notes) L.push(`- ${n}`);
    if (t.notes.length) L.push('');
    L.push('```json');
    L.push(JSON.stringify({ type: t.type, data: t.defaultData }, null, 2));
    L.push('```');
    L.push('');
  }
  L.push('## Legacy form (automation-events only)');
  L.push('');
  L.push('`automation-events` events may carry `infographicType` + `infographicData` (old format) next to the modern `infographic` object. Prefer `infographic`.');
  L.push('');
  return L.join('\n');
}

function indexMd(): string {
  const L: string[] = [];
  const list = Object.values(sections);
  const primary = list.filter((s) => s.inRegistry && !s.aliasOf).sort((a, b) => (a.group ?? '~').localeCompare(b.group ?? '~') || a.type.localeCompare(b.type));
  L.push('# Section reference — INDEX');
  L.push('');
  L.push(`_Generated ${model.generatedAt} from the code. Do not edit by hand — run \`npx tsx scripts/page-builder/generate-section-reference.ts\`._`);
  L.push('');
  L.push('Pick sections from this table, then read `sections/<type>.md` for every chosen type (exact default JSON + every supported field). Infographics: `infographics.md`.');
  L.push('');
  L.push('## Section envelope (every section)');
  L.push('');
  L.push('```json');
  L.push(JSON.stringify({ id: 'section-1000000001', type: '<type>', order: 0, data: {}, style: { backgroundColor: '', textColor: '', padding: 'py-16', alignment: 'center' } }, null, 2));
  L.push('```');
  L.push('');
  L.push('- Required: `id` (unique string), `type`, `order` (integer, 0,1,2…), `data` (object). `style` and `responsive` are optional.');
  L.push(`- \`style\` keys: ${model.sectionEnvelope.styleKeys.map((k) => `\`${k}\``).join(', ')} (Tailwind class strings; \`alignment\` ∈ left | center | right; \`columns\` is a number).`);
  L.push('- The editor\'s JSON import only checks id/type/order/data — it does **not** check the type or field names. A wrong field name silently renders nothing. Always run the validator.');
  L.push('');
  const blocked = list.filter((s) => !s.renderable);
  if (blocked.length) {
    L.push('## ⛔ Do not use (no renderer case → red "Unknown section type" box)');
    L.push('');
    for (const b of blocked) L.push(`- \`${b.type}\`${b.inRegistry ? ' (listed in the Add-Section menu but not renderable)' : ''}`);
    L.push('');
  }
  L.push(`## Sections available in the editor (${primary.length})`);
  L.push('');
  L.push('| Type | Group | Selection hint (visual / best for) | Fields | Infographic |');
  L.push('|---|---|---|---|---|');
  for (const s of primary) {
    const notes = s.designNotes ?? '';
    const visual = notes.match(/Visual:\s*([^\n]+)/)?.[1] ?? '';
    const best = notes.match(/Best for:\s*([^\n]+)/)?.[1] ?? '';
    const hint = clip([visual, best && `Best for: ${best}`].filter(Boolean).join(' — ') || s.description, 230);
    const nfields = s.schema && s.schema.t === 'object' ? Object.keys(s.schema.p).length : 0;
    L.push(`| \`${s.type}\`${s.renderable ? '' : ' ⛔'} | ${s.group ?? s.category} | ${esc(hint)} | ${nfields} | ${s.infographicFields.length ? 'yes' : ''} |`);
  }
  L.push('');
  const legacy = list.filter((s) => !s.inRegistry && s.renderable);
  L.push(`## Renderable but not in the Add-Section menu (${legacy.length}) — aliases & legacy`);
  L.push('');
  L.push('They render when pasted as JSON. Prefer the sections above; use these only when the brief explicitly needs them (see `sections/<type>.md`).');
  L.push('');
  L.push('| Type | Alias of (read that file) | Component / own file |');
  L.push('|---|---|---|');
  for (const s of legacy.sort((a, b) => a.type.localeCompare(b.type)))
    L.push(`| \`${s.type}\` | ${s.aliasOf ? `\`${s.aliasOf}\`` : ''} | ${s.aliasOf ? '' : `${s.component ?? 'inline'} → \`sections/${sectionFile(s.type)}\``} |`);
  L.push('');
  return L.join('\n');
}

// ───────────────────────── write ─────────────────────────
// clear contents but keep the directories (removing a directory fails with EBUSY if a shell/editor sits inside it)
fs.mkdirSync(path.join(OUT, 'sections'), { recursive: true });
for (const dir of [OUT, path.join(OUT, 'sections')])
  for (const f of fs.readdirSync(dir)) if (f !== 'sections') fs.rmSync(path.join(dir, f), { recursive: true, force: true });
fs.writeFileSync(path.join(OUT, 'model.json'), JSON.stringify(model));
fs.writeFileSync(path.join(OUT, 'INDEX.md'), indexMd());
fs.writeFileSync(path.join(OUT, 'infographics.md'), infographicsMd());
fs.writeFileSync(
  path.join(OUT, 'README.md'),
  `# Section reference (generated)

Machine-checked description of every page-builder section, derived from the code — not hand-written.

| File | Purpose |
|---|---|
| \`INDEX.md\` | every section type with a selection hint; envelope rules; types that must not be used |
| \`sections/<type>.md\` | per type: all fields (incl. optional ones missing from the default JSON), enums, style fields, exact default JSON, stale-default warnings |
| \`infographics.md\` | the infographic system: host sections, envelope, theme/animation/style options, all ${Object.keys(infoTypes).length} infographic types |
| \`model.json\` | the same data for the validator |

## Regenerate (after adding/changing a section, component or infographic)

\`\`\`
npx tsx scripts/page-builder/generate-section-reference.ts
npx tsx scripts/page-builder/selftest.ts
\`\`\`

## Validate a page JSON

\`\`\`
npx tsx scripts/page-builder/validate-page-json.ts path/to/page.json
\`\`\`

Exit code 1 = errors (unknown type, wrong/unknown field, missing array/object, wrong value type, bad enum, bad infographic).

## Where the facts come from

- section list, names, default JSON ← \`SECTION_TEMPLATES\` (section-registry)
- type → component ← the \`switch (section.type)\` in section-renderer.tsx
- fields, optionality, enums ← TypeScript types of that component (compiler API), incl. its \`style\` prop
- infographics ← InfographicRenderer switch + infographic-defaults + \`scripts/page-builder/infographic-spec.ts\` (hand-curated, drift-checked: generation fails if a type is added/removed without updating the spec)
- visual / best-for hints ← headings of .claude/commands/section-catalog.md (descriptive only)

Known limits: a handful of legacy inline sections (showcase, ContentSection, CardsSection, TwoColumnSection) and
the non-renderable \`why-ivaflow-new-version\` have no component types; their field list comes from the default JSON only.
Generated ${model.generatedAt}.
`
);
for (const m of Object.values(sections)) fs.writeFileSync(path.join(OUT, 'sections', sectionFile(m.type)), sectionMd(m));

const list = Object.values(sections);
console.log(`\nSection reference written to ${rel(OUT)}`);
console.log(`  types: ${list.length} (registry ${list.filter((s) => s.inRegistry).length}, legacy/alias ${list.filter((s) => !s.inRegistry).length})`);
console.log(`  schema from component types: ${list.filter((s) => s.schemaSource === 'component-types').length}`);
console.log(`  default-JSON-only schema:    ${list.filter((s) => s.schemaSource === 'default-json-only').map((s) => s.type).join(', ') || '-'}`);
console.log(`  no schema:                   ${list.filter((s) => s.schemaSource === 'none').map((s) => s.type).join(', ') || '-'}`);
console.log(`  NOT renderable:              ${list.filter((s) => !s.renderable).map((s) => s.type).join(', ') || '-'}`);
console.log(`  declared-in-zod but no renderer case: ${declaredTypes.filter((t) => !renderable.has(t)).join(', ') || '-'}`);
console.log(`  infographic types: ${Object.keys(infoTypes).length}; hosts: ${list.filter((s) => s.infographicFields.length).map((s) => s.type).join(', ')}`);
