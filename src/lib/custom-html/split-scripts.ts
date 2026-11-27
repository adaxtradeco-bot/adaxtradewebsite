/**
 * Custom HTML section — static analysis of page scripts for the section split (spec §13).
 *
 * Reads code with acorn to find which elements and functions a script block (or an inline handler)
 * refers to. Nothing here executes page code. The result is a heuristic: it drives default script
 * assignment, cross-section warnings and the "keep" rules of CSS pruning.
 */
import * as acorn from 'acorn';

interface AstNode {
  type: string;
  [key: string]: any;
}

/** A reference to markup: a literal selector, or the fixed start of a computed id / class name. */
export type DomRef =
  | { kind: 'selector'; value: string }
  | { kind: 'prefix'; on: 'id' | 'class'; value: string };

export interface ScriptAnalysis {
  /** names declared at the top level (local to a section once split) */
  declared: Set<string>;
  /** names assigned to window.* (visible to every section) */
  globals: Set<string>;
  /** names the code reads but never declares itself */
  used: Set<string>;
  refs: DomRef[];
}

const SELECTOR_CALLS = new Set(['querySelector', 'querySelectorAll', 'closest', 'matches', '$', 'jQuery']);
const LOOKS_LIKE_SELECTOR = /^\s*[#.](?=[A-Za-z_-])/;
const GLOBAL_OBJECTS = new Set(['window', 'self', 'globalThis']);
const MIN_PREFIX = 2;

function parse(code: string): AstNode | null {
  try {
    return acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReturnOutsideFunction: true,
    }) as unknown as AstNode;
  } catch {
    return null;
  }
}

function isNode(value: unknown): value is AstNode {
  return !!value && typeof value === 'object' && typeof (value as AstNode).type === 'string';
}

function walk(node: AstNode, visit: (n: AstNode, parent: AstNode | null, key: string) => void): void {
  const stack: Array<[AstNode, AstNode | null, string]> = [[node, null, '']];
  while (stack.length) {
    const [current, parent, key] = stack.pop()!;
    visit(current, parent, key);
    const children: Array<[AstNode, AstNode | null, string]> = [];
    for (const k of Object.keys(current)) {
      const value = current[k];
      if (Array.isArray(value)) {
        for (const item of value) if (isNode(item)) children.push([item, current, k]);
      } else if (isNode(value)) {
        children.push([value, current, k]);
      }
    }
    // keep source order
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
  }
}

function patternNames(node: AstNode | null | undefined, out: Set<string>): void {
  if (!node) return;
  if (node.type === 'Identifier') out.add(node.name);
  else if (node.type === 'ObjectPattern') {
    for (const p of node.properties) patternNames(p.type === 'RestElement' ? p.argument : p.value, out);
  } else if (node.type === 'ArrayPattern') {
    for (const e of node.elements) patternNames(e, out);
  } else if (node.type === 'AssignmentPattern') patternNames(node.left, out);
  else if (node.type === 'RestElement') patternNames(node.argument, out);
}

function calleeName(callee: AstNode): string {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && !callee.computed) return callee.property.name ?? '';
  return '';
}

const isString = (n: AstNode | undefined): boolean => !!n && n.type === 'Literal' && typeof n.value === 'string';

type RefContext = 'id' | 'class' | 'selector';

function literalRef(value: string, context: RefContext, refs: DomRef[]): void {
  if (!value.trim()) return;
  if (context === 'id') refs.push({ kind: 'selector', value: `#${escapeIdent(value)}` });
  else if (context === 'class') {
    const names = value.trim().split(/\s+/);
    refs.push({ kind: 'selector', value: names.map((n) => `.${escapeIdent(n)}`).join('') });
  } else refs.push({ kind: 'selector', value });
}

function escapeIdent(name: string): string {
  return name.replace(/^[0-9]/, (d) => `\\3${d} `).replace(/[^\w\\ \u0080-￿-]/g, (c) => `\\${c}`);
}

/** Refs from one fixed text piece of a computed string; `open` means an expression follows it. */
function pieceRefs(text: string, open: boolean, context: RefContext, refs: DomRef[]): void {
  if (context !== 'selector') {
    const value = text.trim();
    if (open && value.length >= MIN_PREFIX) refs.push({ kind: 'prefix', on: context, value });
    return;
  }
  let complete = text;
  if (open) {
    const tail = /([#.])([A-Za-z_][\w-]*)$/.exec(text);
    if (tail) {
      complete = text.slice(0, tail.index);
      if (tail[2].length >= MIN_PREFIX) {
        refs.push({ kind: 'prefix', on: tail[1] === '#' ? 'id' : 'class', value: tail[2] });
      }
    }
  }
  for (const m of Array.from(complete.matchAll(/([#.])([A-Za-z_][\w-]*)/g))) {
    refs.push({ kind: 'selector', value: `${m[1]}${m[2]}` });
  }
}

/** `'pane' + i`, `` `#rail${n} .tab` `` and plain literals. Marks the literals it consumed. */
function stringRefs(node: AstNode, context: RefContext, refs: DomRef[], seen: Set<AstNode>): void {
  if (isString(node)) {
    if (seen.has(node)) return;
    seen.add(node);
    literalRef(node.value, context, refs);
    return;
  }
  if (node.type === 'TemplateLiteral') {
    if (seen.has(node)) return;
    seen.add(node);
    const texts: string[] = node.quasis.map((q: AstNode) => q.value.cooked ?? '');
    if (texts.length === 1) literalRef(texts[0], context, refs);
    else if (context !== 'selector') pieceRefs(texts[0], true, context, refs);
    else texts.forEach((t, i) => pieceRefs(t, i < texts.length - 1, context, refs));
    return;
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    let left: AstNode = node;
    while (left.type === 'BinaryExpression' && left.operator === '+') left = left.left;
    if (isString(left) && !seen.has(left)) {
      seen.add(left);
      pieceRefs(left.value, true, context, refs);
    } else if (left.type === 'TemplateLiteral') {
      stringRefs(left, context, refs, seen);
    }
  }
}

export function analyzeScript(code: string): ScriptAnalysis {
  const out: ScriptAnalysis = { declared: new Set(), globals: new Set(), used: new Set(), refs: [] };
  const program = parse(code);
  if (!program) return out;

  for (const stmt of program.body as AstNode[]) {
    if ((stmt.type === 'FunctionDeclaration' || stmt.type === 'ClassDeclaration') && stmt.id) {
      out.declared.add(stmt.id.name);
    } else if (stmt.type === 'VariableDeclaration') {
      for (const d of stmt.declarations) patternNames(d.id, out.declared);
    }
  }

  const local = new Set<string>();
  const referenced = new Set<string>();
  const seen = new Set<AstNode>();

  walk(program, (node, parent, key) => {
    switch (node.type) {
      case 'VariableDeclarator':
        patternNames(node.id, local);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        if (node.id) local.add(node.id.name);
        for (const p of node.params) patternNames(p, local);
        break;
      case 'ClassDeclaration':
        if (node.id) local.add(node.id.name);
        break;
      case 'CatchClause':
        patternNames(node.param, local);
        break;
      case 'AssignmentExpression': {
        const left = node.left as AstNode;
        if (
          left.type === 'MemberExpression' &&
          !left.computed &&
          left.object.type === 'Identifier' &&
          GLOBAL_OBJECTS.has(left.object.name)
        ) {
          out.globals.add(left.property.name);
        }
        break;
      }
      case 'Identifier': {
        const isProperty = parent?.type === 'MemberExpression' && key === 'property' && !parent.computed;
        const isKey =
          key === 'key' && !parent?.computed && /^(Property|MethodDefinition|PropertyDefinition)$/.test(parent!.type);
        const isLabel = key === 'label';
        if (!isProperty && !isKey && !isLabel) referenced.add(node.name);
        break;
      }
      case 'CallExpression': {
        const name = calleeName(node.callee);
        const first = node.arguments[0] as AstNode | undefined;
        if (!first) break;
        if (name === 'getElementById') stringRefs(first, 'id', out.refs, seen);
        else if (name === 'getElementsByClassName') stringRefs(first, 'class', out.refs, seen);
        else if (SELECTOR_CALLS.has(name) && !(isString(first) && /^\s*</.test(first.value))) {
          stringRefs(first, 'selector', out.refs, seen);
        }
        break;
      }
      // any other string that reads like a selector, e.g. an argument of the author's own helper
      case 'Literal':
        if (isString(node) && !seen.has(node) && LOOKS_LIKE_SELECTOR.test(node.value)) {
          stringRefs(node, 'selector', out.refs, seen);
        }
        break;
      case 'TemplateLiteral':
        if (!seen.has(node) && LOOKS_LIKE_SELECTOR.test(node.quasis[0]?.value.cooked ?? '')) {
          stringRefs(node, 'selector', out.refs, seen);
        }
        break;
      case 'BinaryExpression': {
        const left = node.left as AstNode;
        if (node.operator === '+' && isString(left) && LOOKS_LIKE_SELECTOR.test(left.value)) {
          stringRefs(node, 'selector', out.refs, seen);
        }
        break;
      }
    }
  });

  referenced.forEach((name) => {
    if (!local.has(name)) out.used.add(name);
  });
  return out;
}

export interface ScriptMentions {
  /** does any of the code mention this class or id name (literally or as the start of a computed one) */
  name(name: string): boolean;
  /** does the code create elements with this tag */
  tag(tag: string): boolean;
}

/** Deliberately generous: a mention only ever makes CSS pruning keep more. */
export function scriptMentions(sources: string[]): ScriptMentions {
  const code = sources.join('\n');
  const words = new Set(code.match(/[A-Za-z_-][\w-]*/g) ?? []);
  const prefixes = new Set<string>();
  // 'is-' + state, `tab-${n}`, 'pane' + index
  const patterns = [
    /([A-Za-z_][\w-]*[-_])(?=['"`]|\$\{)/g,
    /([A-Za-z_][\w-]+)(?=\$\{)/g,
    /([A-Za-z_][\w-]+)(?=['"]\s*\+)/g,
  ];
  for (const re of patterns) {
    for (const m of Array.from(code.matchAll(re))) prefixes.add(m[1]);
  }
  const tags = new Set<string>();
  for (const m of Array.from(code.matchAll(/createElement(?:NS)?\s*\([^)]*?['"`]([a-zA-Z][\w-]*)['"`]\s*[,)]|<([a-zA-Z][\w-]*)/g))) {
    tags.add((m[1] ?? m[2]).toLowerCase());
  }
  const prefixList = Array.from(prefixes);
  return {
    name: (name) =>
      words.has(name) ||
      (!/^[A-Za-z_-][\w-]*$/.test(name) && code.includes(name)) ||
      prefixList.some((p) => name.startsWith(p)),
    tag: (tag) => tags.has(tag.toLowerCase()),
  };
}
