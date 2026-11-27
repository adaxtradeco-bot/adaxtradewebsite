/**
 * Custom HTML section — CSS handling for the page split (spec §13).
 *
 * Works on the raw author CSS in the admin's browser, before the server scopes it:
 * removes viewport heights from page-level / repeated-wrapper rules, reports selectors that change
 * meaning once the page is cut apart, and (optionally) prunes rules a section does not need.
 * Every rule is conservative: when in doubt the CSS is kept.
 */
import postcss, { type AtRule, type Container, type Declaration, type Root, type Rule } from 'postcss';
import selectorParser from 'postcss-selector-parser';
import type { ScriptMentions } from './split-scripts';

type SelectorNode = ReturnType<ReturnType<typeof selectorParser>['astSync']>['nodes'][number];

export const VIEWPORT_HEIGHT = /\b100(?:d|s|l)?vh\b/i;
/** at-rules whose contents are not selectors, kept whole */
const OPAQUE_AT_RULES = /^(?:-[a-z]+-)?(?:keyframes|font-face|font-feature-values|page|property|counter-style)$/i;
const POSITIONAL = /^:(?:nth-|first-child|last-child|only-child|first-of-type|last-of-type|only-of-type|empty)/i;

export function parseCss(css: string): Root | null {
  try {
    return postcss.parse(css);
  } catch {
    return null;
  }
}

export function parseSelectors(selector: string): SelectorNode[] | null {
  try {
    return selectorParser().astSync(selector, { lossless: true }).nodes;
  } catch {
    return null;
  }
}

function inKeyframes(rule: Rule): boolean {
  const parent = rule.parent as AtRule | undefined;
  return parent?.type === 'atrule' && /keyframes$/i.test(parent.name);
}

/**
 * The selector without pseudo-classes / elements (and, unless kept, attribute selectors), usable
 * with querySelector. Empty compounds become `*`.
 */
export function stripSelector(
  selector: SelectorNode,
  keep: { attributes?: boolean; pseudo?: (value: string) => boolean } = {}
): string {
  let out = '';
  let compound = '';
  const flush = () => {
    out += compound || '*';
    compound = '';
  };
  for (const node of (selector as any).nodes as any[]) {
    if (node.type === 'combinator') {
      flush();
      const value = String(node.value).trim();
      out += value ? ` ${value} ` : ' ';
      continue;
    }
    if (node.type === 'comment') continue;
    if (node.type === 'attribute' && !keep.attributes) continue;
    if (node.type === 'pseudo' && !keep.pseudo?.(String(node.value))) continue;
    const copy = node.clone();
    copy.spaces = { before: '', after: '' };
    compound += String(copy);
  }
  flush();
  return out;
}

interface SelectorFacts {
  classes: string[];
  ids: string[];
  tags: string[];
  /** mentions html, body or :root anywhere */
  pageLevel: boolean;
  /** the element being styled is html / body / :root */
  pageSubject: boolean;
  /** nothing but `*` once pseudos and attributes are removed */
  universal: boolean;
}

function facts(selector: SelectorNode): SelectorFacts {
  const out: SelectorFacts = { classes: [], ids: [], tags: [], pageLevel: false, pageSubject: false, universal: false };
  (selector as any).walk((node: any) => {
    if (node.type === 'class') out.classes.push(node.value);
    else if (node.type === 'id') out.ids.push(node.value);
    else if (node.type === 'tag') {
      const tag = String(node.value).toLowerCase();
      out.tags.push(tag);
      if (tag === 'html' || tag === 'body') out.pageLevel = true;
    } else if (node.type === 'pseudo' && String(node.value).toLowerCase() === ':root') out.pageLevel = true;
  });
  const nodes = (selector as any).nodes as any[];
  let start = 0;
  nodes.forEach((n, i) => {
    if (n.type === 'combinator') start = i + 1;
  });
  out.pageSubject = nodes.slice(start).some((n) => {
    const value = String(n.value ?? '').toLowerCase();
    return (n.type === 'tag' && (value === 'html' || value === 'body')) || (n.type === 'pseudo' && value === ':root');
  });
  out.universal = /^[*\s>+~]*$/.test(stripSelector(selector));
  return out;
}

// ---------------------------------------------------------------------------
// Viewport heights on page-level and repeated-wrapper rules
// ---------------------------------------------------------------------------

/**
 * After a split every section has its own root (html/body rules map onto it) and its own copy of
 * the wrappers, so a `100vh` height there would make every section viewport-high.
 */
export function removeViewportHeights(css: string, wrappers: Element[]): { css: string; removed: number } {
  const root = parseCss(css);
  if (!root) return { css, removed: 0 };
  let removed = 0;
  const matchesWrapper = (selector: SelectorNode) => {
    const stripped = stripSelector(selector, { attributes: true });
    // a bare type selector (`div`) also styles ordinary content, so it is left alone
    if (!/[.#\[]|(?:^|[\s>+~])main(?![\w-])/i.test(stripped)) return false;
    return wrappers.some((w) => {
      try {
        return w.matches(stripped);
      } catch {
        return false;
      }
    });
  };
  root.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    const tall = (rule.nodes ?? []).filter(
      (n): n is Declaration => n.type === 'decl' && /^(?:min-)?height$/i.test(n.prop) && VIEWPORT_HEIGHT.test(n.value)
    );
    if (!tall.length) return;
    const parsed = parseSelectors(rule.selector);
    if (!parsed) return;
    const page: string[] = [];
    const other: string[] = [];
    for (const selector of parsed) {
      const hit = facts(selector).pageSubject || matchesWrapper(selector);
      (hit ? page : other).push(String(selector).trim());
    }
    if (!page.length) return;
    removed += tall.length;
    if (other.length) {
      // the other selectors keep the full rule
      rule.cloneBefore({ selector: other.join(', ') });
      rule.selector = page.join(', ');
    }
    tall.forEach((d) => d.remove());
    if (!rule.nodes?.length) rule.remove();
  });
  return removed ? { css: root.toString(), removed } : { css, removed: 0 };
}

// ---------------------------------------------------------------------------
// Fidelity checks
// ---------------------------------------------------------------------------

export interface CssFidelity {
  /** selectors depending on neighbours / position that match differently after the split */
  structural: string[];
  /** body / html spacing or gradients, which now repeat in every section */
  repeatedPageStyles: boolean;
  /** some element is position: sticky */
  sticky: boolean;
}

function count(root: Element, selector: string): number {
  try {
    return root.querySelectorAll(selector).length;
  } catch {
    return 0;
  }
}

export function checkCssFidelity(css: string, page: Element, sections: Element[]): CssFidelity {
  const result: CssFidelity = { structural: [], repeatedPageStyles: false, sticky: false };
  const root = parseCss(css);
  if (!root) return result;
  const structural = new Set<string>();
  root.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    const parsed = parseSelectors(rule.selector);
    if (!parsed) return;
    const decls = (rule.nodes ?? []).filter((n): n is Declaration => n.type === 'decl');
    if (decls.some((d) => d.prop.toLowerCase() === 'position' && /sticky/i.test(d.value))) {
      if (parsed.some((s) => sections.some((el) => count(el, stripSelector(s)) > 0))) result.sticky = true;
    }
    for (const selector of parsed) {
      if (
        facts(selector).pageSubject &&
        decls.some(
          (d) =>
            (/^(?:margin|padding)(?:-|$)/i.test(d.prop) && !/^(?:0[a-z%]*|auto|\s)+(?:\s*!important)?$/i.test(d.value)) ||
            (/^background(?:-image)?$/i.test(d.prop) && /gradient\(|url\(/i.test(d.value))
        )
      ) {
        result.repeatedPageStyles = true;
      }
      const nodes = (selector as any).nodes as any[];
      const positional = nodes.some(
        (n) =>
          (n.type === 'combinator' && /^[+~]$/.test(String(n.value).trim())) ||
          (n.type === 'pseudo' && POSITIONAL.test(String(n.value)))
      );
      if (!positional) continue;
      const query = stripSelector(selector, { attributes: true, pseudo: (v) => POSITIONAL.test(v) });
      const before = count(page, query);
      const after = sections.reduce((sum, el) => sum + count(el, query), 0);
      if (before !== after) structural.add(String(selector).trim());
    }
  });
  result.structural = Array.from(structural);
  return result;
}

// ---------------------------------------------------------------------------
// Pruning
// ---------------------------------------------------------------------------

export interface PruneContext {
  /** the section's markup including its wrappers */
  section: Element;
  /** classes and ids of the repeated wrappers */
  wrapperNames: Set<string>;
  mentions: ScriptMentions;
  /**
   * Set when the page has scripts: every class / id in the page markup. Names that occur nowhere in
   * it are then assumed to be added at runtime (e.g. by a library), and such a rule is kept unless it
   * also needs a name that only other sections have.
   */
  pageNames?: Set<string>;
}

/** Roots to query: the element itself plus the contents of its <template>s. */
function queryRoots(el: ParentNode, out: ParentNode[] = []): ParentNode[] {
  out.push(el);
  el.querySelectorAll('template').forEach((t) => queryRoots((t as HTMLTemplateElement).content, out));
  return out;
}

function hasName(root: ParentNode, name: string): boolean {
  return Array.from(root.querySelectorAll('[id], [class]')).some((el) => el.id === name || el.classList.contains(name));
}

function needsSelector(selector: SelectorNode, ctx: PruneContext, roots: ParentNode[]): boolean {
  const f = facts(selector);
  if (f.pageLevel || f.universal) return true;
  const names = [...f.classes, ...f.ids];
  if (names.some((n) => n === 'dark' || ctx.wrapperNames.has(n) || ctx.mentions.name(n))) return true;
  if (f.tags.some((t) => ctx.mentions.tag(t))) return true;
  const { pageNames } = ctx;
  if (
    pageNames &&
    names.some((n) => !pageNames.has(n)) &&
    names.every((n) => !pageNames.has(n) || roots.some((r) => hasName(r, n)))
  ) {
    return true;
  }
  const query = stripSelector(selector);
  try {
    return roots.some((r) => r.querySelector(query) !== null);
  } catch {
    return true; // cannot be tested
  }
}

function pruneContainer(container: Container, ctx: PruneContext, roots: ParentNode[]): void {
  for (const node of [...(container.nodes ?? [])]) {
    if (node.type === 'rule') {
      const parsed = parseSelectors(node.selector);
      // one needed selector keeps the whole rule (removing list members can change validity)
      if (parsed && !parsed.some((s) => needsSelector(s, ctx, roots))) node.remove();
    } else if (node.type === 'atrule' && node.nodes && !OPAQUE_AT_RULES.test(node.name)) {
      // declarations directly inside an at-rule mean it is not a rule container
      const had = node.nodes.some((n) => n.type === 'rule' || n.type === 'atrule');
      pruneContainer(node, ctx, roots);
      if (had && !node.nodes.some((n) => n.type !== 'comment')) node.remove();
    }
  }
}

/** The CSS without the rules this section cannot use. Unparseable CSS is returned unchanged. */
export function pruneCss(css: string, ctx: PruneContext): string {
  const root = parseCss(css);
  if (!root) return css;
  pruneContainer(root, ctx, queryRoots(ctx.section));
  return root.toString();
}

/** Id names that appear in CSS selectors. */
export function cssIdNames(css: string): Set<string> {
  const out = new Set<string>();
  parseCss(css)?.walkRules((rule) => {
    for (const selector of parseSelectors(rule.selector) ?? []) facts(selector).ids.forEach((id) => out.add(id));
  });
  return out;
}

/** Does any selector style elements by the `main` tag? */
export function cssUsesTag(css: string, tag: string): boolean {
  let found = false;
  parseCss(css)?.walkRules((rule) => {
    for (const selector of parseSelectors(rule.selector) ?? []) {
      if (facts(selector).tags.includes(tag)) found = true;
    }
  });
  return found;
}
