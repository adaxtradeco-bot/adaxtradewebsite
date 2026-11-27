/**
 * Custom HTML section — split a full page into several sections (spec §13).
 *
 * createSplitPlan : extract result -> proposed sections (editable with the operations below).
 * buildSplit      : plan -> one ExtractResult per kept section, script targets and warnings. Each
 *                   part then goes through the normal single-section pipeline.
 *
 * Pure and client-usable: pages are parsed into inert documents and nothing is executed.
 *
 * Model: the page is a list of "units" (nodes) in document order, each with the wrapper elements it
 * sits in (the Tailwind body wrapper, a <main>, or an element the admin split open). A section is a
 * run of units; its markup is those units inside fresh copies of their wrappers, so no node of the
 * page is ever lost.
 */
import { detectFields } from './detect';
import { analyzeScript, scriptMentions, type DomRef } from './split-scripts';
import {
  VIEWPORT_HEIGHT,
  checkCssFidelity,
  cssIdNames,
  cssUsesTag,
  parseCss,
  pruneCss,
  removeViewportHeights,
} from './split-css';
import type { ExtractResult } from './types';

const CANDIDATE_TAGS = new Set(['section', 'header', 'footer', 'nav', 'article', 'div']);
/** elements "Split further" may open up and copy around their children */
const EXPANDABLE_TAGS = new Set(['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'ul', 'ol']);
/** elements that never make a section of their own on a manual split */
const SILENT_TAGS = new Set(['script', 'style', 'template', 'noscript', 'br', 'link', 'meta']);
const MIN_TEXT = 200;
const LANDMARK_NAMES: Record<string, string> = { header: 'Header', footer: 'Footer', nav: 'Navigation' };
const LISTED_NAMES = 3;
const SECTION_NAME_MAX = 200;
/** utilities that make an element viewport-high, with any variant prefix */
const VIEWPORT_CLASS = /^(?:\S*:)?!?(?:min-)?h-(?:screen|[dsl]vh|\[[^\]]*100[dsl]?vh[^\]]*\])!?$/;

export interface SplitUnit {
  id: string;
  node: Node;
  /** indexes into SplitPlan.wrappers, outermost first */
  chain: number[];
}

export interface SplitSection {
  /** id of the section's first unit */
  id: string;
  name: string;
  unitIds: string[];
  dropped: boolean;
}

export interface SplitPlan {
  source: ExtractResult;
  /** the parsed page body */
  page: Element;
  wrappers: Element[];
  units: Record<string, SplitUnit>;
  sections: SplitSection[];
  /** admin script choices: block index -> id of a unit in the target section, or null (not imported) */
  assignments: Record<number, string | null>;
}

export interface SplitScript {
  index: number;
  preview: string;
  /** section the block is imported into; null = not imported */
  target: string | null;
  /** sections whose elements or buttons the block refers to */
  references: string[];
}

export interface SplitIssue {
  kind: 'script-elements' | 'script-dependency' | 'handler-function' | 'handler-element' | 'not-imported';
  message: string;
  scriptIndex?: number;
  sectionIds: string[];
}

export interface SplitPart {
  sectionId: string;
  name: string;
  extract: ExtractResult;
}

export interface SplitOutput {
  parts: SplitPart[];
  scripts: SplitScript[];
  issues: SplitIssue[];
  /** places where the sections can look or behave differently from the page */
  warnings: string[];
}

export interface SplitOptions {
  /** remove CSS rules a section does not use (off by default) */
  pruneCss?: boolean;
}

// ---------------------------------------------------------------------------
// Nodes and units
// ---------------------------------------------------------------------------

const isElement = (node: Node): node is Element => node.nodeType === 1;
const tagOf = (el: Element) => el.tagName.toLowerCase();
const isMeaningful = (node: Node): node is Element => isElement(node) && !SILENT_TAGS.has(tagOf(node));

function parseBody(html: string): Element {
  return new DOMParser().parseFromString(`<!DOCTYPE html><html><body>${html}</body></html>`, 'text/html').body;
}

function visibleText(node: Node): string {
  if (!isElement(node)) return node.nodeType === 3 ? (node.textContent ?? '') : '';
  if (/^(script|style|template|noscript)$/.test(tagOf(node))) return '';
  return Array.from(node.childNodes).map(visibleText).join(' ');
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

/** An element large enough to start a section of its own. */
function isSubstantial(node: Node): boolean {
  if (!isElement(node) || !CANDIDATE_TAGS.has(tagOf(node))) return false;
  if (squash(visibleText(node)).length >= MIN_TEXT) return true;
  return detectFields(node.outerHTML).fields.length > 0;
}

function elementChildren(el: Element): Element[] {
  return Array.from(el.children);
}

function collectUnits(body: Element): { units: SplitUnit[]; wrappers: Element[] } {
  const wrappers: Element[] = [];
  const units: SplitUnit[] = [];
  const bodyWrapper = elementChildren(body).find((el) => el.hasAttribute('data-chs-body'));
  const container = bodyWrapper ?? body;
  const mains = elementChildren(container).filter((el) => tagOf(el) === 'main');
  const main = mains.length === 1 && mains[0].children.length > 0 ? mains[0] : null;

  const add = (node: Node, chain: number[]) => units.push({ id: `u${units.length}`, node, chain });
  const visit = (parent: Element, chain: number[]) => {
    for (const node of Array.from(parent.childNodes)) {
      if (node === bodyWrapper && node.hasChildNodes()) {
        wrappers.push(bodyWrapper);
        visit(bodyWrapper, [...chain, wrappers.length - 1]);
      } else if (node === main) {
        // the <main> itself is only copied around sections when styles or scripts can depend on it
        wrappers.push(main!);
        visit(main!, [...chain, wrappers.length - 1]);
      } else {
        add(node, chain);
      }
    }
  };
  visit(body, []);
  return { units, wrappers };
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

/** Groups units so that every unit accepted by `starts` begins a group; the rest joins a neighbour. */
function chunk(units: SplitUnit[], starts: (u: SplitUnit) => boolean): SplitUnit[][] {
  const groups: SplitUnit[][] = [];
  let leading: SplitUnit[] = [];
  for (const unit of units) {
    if (starts(unit)) {
      groups.push([...leading, unit]);
      leading = [];
    } else if (groups.length) groups[groups.length - 1].push(unit);
    else leading.push(unit);
  }
  if (leading.length) groups.push(leading);
  return groups;
}

function humanize(id: string): string {
  const words = squash(id.replace(/[-_]+/g, ' '));
  return words ? words[0].toUpperCase() + words.slice(1) : '';
}

function defaultName(units: SplitUnit[], position: number): string {
  const elements = units.map((u) => u.node).filter(isMeaningful);
  for (const el of elements) {
    // in page chrome only a real headline names the section, not a menu or column title
    const query = LANDMARK_NAMES[tagOf(el)] ? 'h1,h2' : 'h1,h2,h3';
    const heading = el.matches(query) ? el : el.querySelector(query);
    const text = heading ? squash(visibleText(heading)) : '';
    if (text) return text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text;
    if (LANDMARK_NAMES[tagOf(el)]) return LANDMARK_NAMES[tagOf(el)];
  }
  const main = elements.find((el) => squash(visibleText(el))) ?? elements[0];
  if (main) {
    if (main.id) return humanize(main.id);
  }
  return `Section ${position + 1}`;
}

function toSection(group: SplitUnit[], position: number): SplitSection {
  return { id: group[0].id, name: defaultName(group, position), unitIds: group.map((u) => u.id), dropped: false };
}

export function createSplitPlan(source: ExtractResult): SplitPlan {
  const page = parseBody(source.html);
  const { units, wrappers } = collectUnits(page);
  const substantial = new Set(units.filter((u) => isSubstantial(u.node)).map((u) => u.id));
  const sections = chunk(units, (u) => substantial.has(u.id)).map(toSection);
  return {
    source,
    page,
    wrappers,
    units: Object.fromEntries(units.map((u) => [u.id, u])),
    sections,
    assignments: {},
  };
}

function replaceSections(plan: SplitPlan, at: number, count: number, next: SplitSection[]): SplitPlan {
  const sections = plan.sections.slice();
  sections.splice(at, count, ...next);
  return { ...plan, sections };
}

export function mergeWithPrevious(plan: SplitPlan, sectionId: string): SplitPlan {
  const i = plan.sections.findIndex((s) => s.id === sectionId);
  if (i <= 0) return plan;
  const previous = plan.sections[i - 1];
  const current = plan.sections[i];
  return replaceSections(plan, i - 1, 2, [
    {
      ...previous,
      unitIds: [...previous.unitIds, ...current.unitIds],
      dropped: previous.dropped && current.dropped,
    },
  ]);
}

interface Expansion {
  units: SplitUnit[];
  wrappers: Element[];
}

/**
 * The units a section would be split into: its own elements, or — while it holds a single element —
 * that element's children (the element then becomes a copied wrapper). Null when nothing divides.
 */
function expand(plan: SplitPlan, section: SplitSection): Expansion | null {
  let units = section.unitIds.map((id) => plan.units[id]);
  const wrappers = plan.wrappers.slice();
  for (;;) {
    const meaningful = units.filter((u) => isMeaningful(u.node));
    if (meaningful.length >= 2) return { units, wrappers };
    if (meaningful.length !== 1) return null;
    const unit = meaningful[0];
    const el = unit.node as Element;
    if (!EXPANDABLE_TAGS.has(tagOf(el)) || !elementChildren(el).some(isMeaningful)) return null;
    wrappers.push(el);
    const chain = [...unit.chain, wrappers.length - 1];
    const children = Array.from(el.childNodes).map((node, i) => ({ id: `${unit.id}.${i}`, node, chain }));
    units = units.flatMap((u) => (u === unit ? children : [u]));
  }
}

export function canSplit(plan: SplitPlan, sectionId: string): boolean {
  const section = plan.sections.find((s) => s.id === sectionId);
  return !!section && expand(plan, section) !== null;
}

/** Splits a section at child-element boundaries: one section per element. */
export function splitFurther(plan: SplitPlan, sectionId: string): SplitPlan {
  const i = plan.sections.findIndex((s) => s.id === sectionId);
  if (i < 0) return plan;
  const section = plan.sections[i];
  const expansion = expand(plan, section);
  if (!expansion) return plan;
  const units = { ...plan.units };
  section.unitIds.forEach((id) => delete units[id]);
  expansion.units.forEach((u) => (units[u.id] = u));
  const next = chunk(expansion.units, (u) => isMeaningful(u.node)).map((group, k) => ({
    ...toSection(group, i + k),
    dropped: section.dropped,
  }));
  // a script choice anchored to a unit that was opened up falls back to the default
  const assignments = Object.fromEntries(
    Object.entries(plan.assignments).filter(([, unit]) => unit === null || units[unit])
  );
  return replaceSections({ ...plan, units, wrappers: expansion.wrappers, assignments }, i, 1, next);
}

function patchSection(plan: SplitPlan, sectionId: string, patch: Partial<SplitSection>): SplitPlan {
  return { ...plan, sections: plan.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)) };
}

export function setDropped(plan: SplitPlan, sectionId: string, dropped: boolean): SplitPlan {
  return patchSection(plan, sectionId, { dropped });
}

export function renameSection(plan: SplitPlan, sectionId: string, name: string): SplitPlan {
  return patchSection(plan, sectionId, { name: name.slice(0, SECTION_NAME_MAX) });
}

/** `sectionId` null = do not import the block. */
export function assignScript(plan: SplitPlan, index: number, sectionId: string | null): SplitPlan {
  return { ...plan, assignments: { ...plan.assignments, [index]: sectionId } };
}

export interface SectionSummary {
  /** e.g. "header, section#why +2" */
  elements: string;
  snippet: string;
}

export function describeSection(plan: SplitPlan, sectionId: string): SectionSummary {
  const section = plan.sections.find((s) => s.id === sectionId);
  const nodes = section ? section.unitIds.map((id) => plan.units[id].node) : [];
  const labels = nodes.filter(isMeaningful).map((el) => {
    const cls = (el.getAttribute('class') ?? '').trim().split(/\s+/)[0];
    return `${tagOf(el)}${el.id ? `#${el.id}` : cls ? `.${cls}` : ''}`;
  });
  const text = squash(nodes.map(visibleText).join(' '));
  return {
    elements: labels.slice(0, 3).join(', ') + (labels.length > 3 ? ` +${labels.length - 3}` : ''),
    snippet: text.length > 120 ? `${text.slice(0, 117).trimEnd()}…` : text,
  };
}

// ---------------------------------------------------------------------------
// Section markup
// ---------------------------------------------------------------------------

interface SectionDom {
  /** inert <body> holding the section markup */
  root: Element;
  /** wrapper copies by wrapper index */
  copies: Map<number, Element[]>;
}

/** The units of a section inside copies of their wrappers. `skip` leaves a wrapper out. */
function buildDom(plan: SplitPlan, section: SplitSection, skip: Set<number> = new Set()): SectionDom {
  const doc = document.implementation.createHTMLDocument('');
  const copies = new Map<number, Element[]>();
  const open: Array<{ wrapper: number; el: Element }> = [];
  for (const id of section.unitIds) {
    const unit = plan.units[id];
    const chain = unit.chain.filter((w) => !skip.has(w));
    let common = 0;
    while (common < open.length && common < chain.length && open[common].wrapper === chain[common]) common += 1;
    open.length = common;
    for (const wrapper of chain.slice(common)) {
      const el = doc.importNode(plan.wrappers[wrapper], false) as Element;
      (open.length ? open[open.length - 1].el : doc.body).appendChild(el);
      open.push({ wrapper, el });
      copies.set(wrapper, [...(copies.get(wrapper) ?? []), el]);
    }
    (open.length ? open[open.length - 1].el : doc.body).appendChild(doc.importNode(unit.node, true));
  }
  return { root: doc.body, copies };
}

// ---------------------------------------------------------------------------
// Scripts
// ---------------------------------------------------------------------------

interface HandlerInfo {
  used: Set<string>;
  refs: DomRef[];
}

function allElements(root: ParentNode, out: Element[] = []): Element[] {
  root.querySelectorAll('*').forEach((el) => {
    out.push(el);
    if (el.localName === 'template') allElements((el as HTMLTemplateElement).content, out);
  });
  return out;
}

/** Inline `on*` code and `javascript:` links of a section. */
function handlerSources(root: Element): string[] {
  const out: string[] = [];
  for (const el of allElements(root)) {
    for (const attr of Array.from(el.attributes)) {
      if (/^on[a-z]+$/i.test(attr.name)) out.push(attr.value);
    }
    const href = el.getAttribute('href') ?? '';
    const js = /^[\s\u0000-\u001f]*javascript:/i.exec(href);
    if (js) {
      const code = href.slice(js[0].length);
      try {
        out.push(decodeURIComponent(code));
      } catch {
        out.push(code);
      }
    }
  }
  return out;
}

function handlerInfo(sources: string[]): HandlerInfo {
  const info: HandlerInfo = { used: new Set(), refs: [] };
  for (const source of sources) {
    const a = analyzeScript(source);
    a.used.forEach((n) => info.used.add(n));
    info.refs.push(...a.refs);
  }
  return info;
}

/** Does the reference point at an element of this section (wrapper copies do not count)? */
function refMatches(dom: SectionDom, ref: DomRef): boolean {
  const wrappers = new Set<Element>(Array.from(dom.copies.values()).flat());
  const own = (list: ArrayLike<Element>) => Array.from(list).some((el) => !wrappers.has(el));
  if (ref.kind === 'prefix') {
    return Array.from(dom.root.querySelectorAll(ref.on === 'id' ? '[id]' : '[class]')).some(
      (el) =>
        !wrappers.has(el) &&
        (ref.on === 'id'
          ? el.id.startsWith(ref.value)
          : Array.from(el.classList).some((c) => c.startsWith(ref.value)))
    );
  }
  try {
    return own(dom.root.querySelectorAll(ref.value));
  } catch {
    return false;
  }
}

/**
 * Sections each reference points at, with a weight. A selector that matches nothing as written
 * (a state class, a jQuery extension) falls back to its ids, then its first class.
 */
function referencedSections(refs: DomRef[], doms: Map<string, SectionDom>): Map<string, number> {
  const scores = new Map<string, number>();
  const done = new Set<string>();
  for (const ref of refs) {
    const key = JSON.stringify(ref);
    if (done.has(key)) continue;
    done.add(key);
    const find = (r: DomRef) => Array.from(doms).filter(([, dom]) => refMatches(dom, r)).map(([id]) => id);
    let hits = find(ref);
    const isId = ref.kind === 'prefix' ? ref.on === 'id' : ref.value.includes('#');
    if (!hits.length && ref.kind === 'selector') {
      const ids = ref.value.match(/#[A-Za-z_][\w-]*/g);
      const fallback = ids ?? ref.value.match(/\.[A-Za-z_][\w-]*/)?.slice(0, 1) ?? [];
      hits = Array.from(new Set(fallback.flatMap((value) => find({ kind: 'selector', value }))));
    }
    for (const id of hits) scores.set(id, (scores.get(id) ?? 0) + (isId ? 10 : 1));
  }
  return scores;
}

const intersects = (a: Set<string>, b: Set<string>) => Array.from(a).filter((n) => b.has(n));

function previewOf(code: string): string {
  const line = code.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  const text = line.length > 80 ? `${line.slice(0, 77)}…` : line;
  return `${text} (${code.length.toLocaleString('en-US')} chars)`;
}

function planScripts(
  plan: SplitPlan,
  doms: Map<string, SectionDom>
): { scripts: SplitScript[]; issues: SplitIssue[] } {
  const order = plan.sections.map((s) => s.id);
  const kept = new Set(plan.sections.filter((s) => !s.dropped).map((s) => s.id));
  const names = new Map(plan.sections.map((s) => [s.id, s.name]));
  const quote = (ids: string[]) =>
    ids.slice(0, LISTED_NAMES).map((id) => `"${names.get(id)}"`).join(', ') +
    (ids.length > LISTED_NAMES ? ` and ${ids.length - LISTED_NAMES} more` : '');
  const inOrder = (ids: Iterable<string>) => {
    const set = new Set(ids);
    return order.filter((id) => set.has(id));
  };
  const sectionOfUnit = new Map(plan.sections.flatMap((s) => s.unitIds.map((u) => [u, s.id] as const)));
  const handlers = new Map(Array.from(doms).map(([id, dom]) => [id, handlerInfo(handlerSources(dom.root))]));
  const analyses = plan.source.jsBlocks.map(analyzeScript);
  const exported = analyses.map((a) => new Set([...Array.from(a.declared), ...Array.from(a.globals)]));

  const elementRefs = analyses.map((a) => referencedSections(a.refs, doms));
  const callers = exported.map((defined) => {
    const out = new Map<string, string[]>();
    for (const [id, h] of Array.from(handlers)) {
      const called = intersects(h.used, defined);
      if (called.length) out.set(id, called);
    }
    return out;
  });

  const scripts: SplitScript[] = plan.source.jsBlocks.map((code, index) => {
    const scores = new Map(elementRefs[index]);
    callers[index].forEach((called, id) => scores.set(id, (scores.get(id) ?? 0) + 20 * called.length));
    const references = inOrder(scores.keys());
    const best = (ids: string[]) =>
      ids.reduce<string | null>((top, id) => (top === null || scores.get(id)! > scores.get(top)! ? id : top), null);

    const choice = plan.assignments[index];
    const chosen = typeof choice === 'string' ? sectionOfUnit.get(choice) : undefined;
    let target: string | null;
    if (choice === null) target = null;
    else if (chosen && kept.has(chosen)) target = chosen;
    else if (references.length) target = best(references.filter((id) => kept.has(id)));
    else target = order.find((id) => kept.has(id)) ?? null;
    return { index, preview: previewOf(code), target, references };
  });

  const issues: SplitIssue[] = [];
  for (const script of scripts) {
    const n = script.index + 1;
    if (script.target === null) {
      issues.push({
        kind: 'not-imported',
        scriptIndex: script.index,
        sectionIds: script.references,
        message: `Script ${n} will not be imported.`,
      });
    } else {
      const others = inOrder(elementRefs[script.index].keys()).filter((id) => id !== script.target && kept.has(id));
      if (others.length) {
        issues.push({
          kind: 'script-elements',
          scriptIndex: script.index,
          sectionIds: [script.target, ...others],
          message: `Script ${n} goes into ${quote([script.target])} but also uses elements in ${quote(others)}. A section script only sees its own section: merge these sections, or those parts will not work.`,
        });
      }
    }
    // handlers elsewhere that call a function which stays local to the script's section
    const local = new Set(
      Array.from(analyses[script.index].declared).filter((name) => !analyses[script.index].globals.has(name))
    );
    for (const [id, h] of Array.from(handlers)) {
      const called = intersects(h.used, local);
      if (!called.length || id === script.target || !kept.has(id)) continue;
      // another block in that section may declare the same name
      const covered = (name: string) => scripts.some((s) => s.target === id && analyses[s.index].declared.has(name));
      const missing = called.filter((name) => !covered(name));
      if (!missing.length) continue;
      issues.push({
        kind: 'handler-function',
        scriptIndex: script.index,
        sectionIds: script.target ? [script.target, id] : [id],
        message: `Buttons or links in ${quote([id])} call ${missing.map((m) => `${m}()`).join(', ')} from Script ${n}, which ${
          script.target ? `is in ${quote([script.target])}` : 'is not imported'
        }. They will not work until both are in one section.`,
      });
    }
    // top-level names shared between blocks are only shared inside one section
    for (const other of scripts) {
      if (other === script || script.target === null || other.target === script.target) continue;
      const needed = intersects(analyses[script.index].used, analyses[other.index].declared).filter(
        (name) => !analyses[other.index].globals.has(name)
      );
      if (!needed.length) continue;
      issues.push({
        kind: 'script-dependency',
        scriptIndex: script.index,
        sectionIds: [script.target, ...(other.target ? [other.target] : [])],
        message: `Script ${n} uses ${needed.join(', ')} from Script ${other.index + 1}, which is not in the same section. Assign both to one section.`,
      });
    }
  }

  // inline handlers that reach into another section
  for (const [id, h] of Array.from(handlers)) {
    if (!kept.has(id)) continue;
    const own = new Map([[id, doms.get(id)!]]);
    const missing = h.refs.filter((ref) => !referencedSections([ref], own).size);
    const elsewhere = inOrder(referencedSections(missing, doms).keys());
    if (!elsewhere.length) continue;
    issues.push({
      kind: 'handler-element',
      sectionIds: [id, ...elsewhere],
      message: `Inline handlers in ${quote([id])} use elements in ${quote(elsewhere)}. Merge these sections, or the handlers will not work.`,
    });
  }

  return { scripts, issues };
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function removeViewportUtilities(el: Element): boolean {
  let changed = false;
  const classes = (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
  const keep = classes.filter((c) => !VIEWPORT_CLASS.test(c));
  if (keep.length !== classes.length) {
    el.setAttribute('class', keep.join(' '));
    changed = true;
  }
  const style = el.getAttribute('style');
  if (style && VIEWPORT_HEIGHT.test(style)) {
    const next = style
      .split(';')
      .filter((d) => !(/^\s*(?:min-)?height\s*:/i.test(d) && VIEWPORT_HEIGHT.test(d)))
      .join(';');
    if (next !== style) {
      el.setAttribute('style', next.trim());
      changed = true;
    }
  }
  return changed;
}

function wrapperLabel(el: Element): string {
  if (el.hasAttribute('data-chs-body')) return 'The <body> wrapper';
  const cls = (el.getAttribute('class') ?? '').trim().split(/\s+/)[0];
  return `<${tagOf(el)}${el.id ? `#${el.id}` : cls ? `.${cls}` : ''}>`;
}

const isLayoutContainer = (el: Element) =>
  Array.from(el.classList).some((c) => /^(?:\S*:)?(?:inline-)?(?:flex|grid)$/.test(c)) ||
  /display\s*:\s*(?:inline-)?(?:flex|grid)/i.test(el.getAttribute('style') ?? '');

function markupNames(page: Element): Set<string> {
  const out = new Set<string>();
  for (const el of allElements(page)) {
    if (el.id) out.add(el.id);
    el.classList.forEach((c) => out.add(c));
  }
  return out;
}

export function buildSplit(plan: SplitPlan, options: SplitOptions = {}): SplitOutput {
  const { source } = plan;
  const jsText = source.jsBlocks.join('\n');

  // A <main> without attributes that nothing targets is not worth repeating.
  const skip = new Set<number>();
  const usesMain = cssUsesTag(source.css, 'main') || /['"`](?:[^'"`]*[\s>])?main(?![\w-])[^'"`]*['"`]/.test(jsText);
  plan.wrappers.forEach((el, i) => {
    if (tagOf(el) === 'main' && el.attributes.length === 0 && !usesMain) skip.add(i);
  });

  const doms = new Map(plan.sections.map((s) => [s.id, buildDom(plan, s, skip)]));
  const { scripts, issues } = planScripts(plan, doms);
  const kept = plan.sections.filter((s) => !s.dropped);
  const split = kept.length > 1;
  const warnings: string[] = [];

  // ---- repeated wrappers ----------------------------------------------------
  const usage = new Map<number, Element[]>();
  for (const section of kept) {
    doms.get(section.id)!.copies.forEach((els, wrapper) => usage.set(wrapper, [...(usage.get(wrapper) ?? []), ...els]));
  }
  const repeated = Array.from(usage).filter(([, copies]) => copies.length > 1);
  const cssIds = cssIdNames(source.css);
  const handlerCode = handlerSources(plan.page).join('\n');
  let removedUtilities = 0;
  for (const [wrapper, copies] of repeated) {
    const original = plan.wrappers[wrapper];
    const label = wrapperLabel(original);
    if (original.attributes.length) {
      warnings.push(
        `${label} is copied around ${copies.length} sections, so its spacing, background and borders repeat in each.`
      );
    }
    if (isLayoutContainer(original)) {
      warnings.push(`${label} is a flex or grid container: items split into separate sections no longer lay out together.`);
    }
    if (tagOf(original) === 'form') warnings.push(`${label} is a form split over several sections.`);
    copies.forEach((el) => {
      if (removeViewportUtilities(el)) removedUtilities += 1;
    });
    const id = original.id;
    if (id) {
      const referenced =
        cssIds.has(id) || scriptMentions([jsText, handlerCode]).name(id) || source.css.includes(`[id="${id}"]`);
      if (referenced) {
        warnings.push(`The id "${id}" is repeated in ${copies.length} sections because styles or scripts use it.`);
      } else {
        copies.slice(1).forEach((el) => el.removeAttribute('id'));
        warnings.push(`The id "${id}" is kept on the first copy of ${label} only.`);
      }
    }
  }
  if (removedUtilities) {
    warnings.push('Viewport-height classes and styles were removed from the repeated wrappers.');
  }

  // ---- CSS ------------------------------------------------------------------
  let css = source.css;
  if (split && css) {
    if (!parseCss(css)) {
      warnings.push(
        `The CSS could not be parsed, so every section gets it unchanged${options.pruneCss ? ' (nothing was removed)' : ''}.`
      );
    } else {
      const originals = Array.from(usage.keys()).map((i) => plan.wrappers[i]);
      const result = removeViewportHeights(css, originals);
      css = result.css;
      if (result.removed) {
        warnings.push('100vh heights were removed from html/body and wrapper CSS rules so sections are not each a full screen high.');
      }
      const fidelity = checkCssFidelity(
        css,
        plan.page,
        plan.sections.map((s) => doms.get(s.id)!.root)
      );
      if (fidelity.structural.length) {
        warnings.push(
          `Selectors that depend on neighbouring elements or position may apply differently: ${fidelity.structural.slice(0, 4).join(' | ')}${
            fidelity.structural.length > 4 ? ` (+${fidelity.structural.length - 4} more)` : ''
          }`
        );
      }
      if (fidelity.repeatedPageStyles) {
        warnings.push('Page-level (html/body) spacing and background styles apply to every section separately.');
      }
      if (fidelity.sticky) warnings.push('Sticky elements only stick within their own section.');
    }
  }
  if (split && kept.some((s) => doms.get(s.id)!.root.querySelector('.sticky, [class*=":sticky"]'))) {
    const sticky = 'Sticky elements only stick within their own section.';
    if (!warnings.includes(sticky)) warnings.push(sticky);
  }
  if (split && source.externalScripts.length) {
    warnings.push(
      'External scripts are loaded once per page, before section scripts. A library that sets itself up on load may only see the sections rendered at that moment.'
    );
  }

  // ---- parts ----------------------------------------------------------------
  const scripted = jsText.trim() || handlerCode.trim() || source.externalScripts.length;
  const pageNames = scripted ? markupNames(plan.page) : undefined;
  const wrapperNames = new Set(
    Array.from(usage.keys()).flatMap((i) => {
      const el = plan.wrappers[i];
      return [...Array.from(el.classList), ...(el.id ? [el.id] : [])];
    })
  );

  const parts: SplitPart[] = kept.map((section) => {
    const dom = doms.get(section.id)!;
    const blocks = scripts.filter((s) => s.target === section.id).map((s) => source.jsBlocks[s.index]);
    let sectionCss = css;
    if (options.pruneCss && sectionCss) {
      sectionCss = pruneCss(sectionCss, {
        section: dom.root,
        wrapperNames,
        mentions: scriptMentions([...blocks, ...handlerSources(dom.root)]),
        pageNames,
      }).trim();
    }
    // The compiler derives the style scope from html + css: keep it distinct per section so that
    // look-alike sections never share (and overwrite) each other's styles.
    if (split && sectionCss) {
      sectionCss = `/* page section ${plan.sections.indexOf(section) + 1} */\n${sectionCss}`;
    }
    return {
      sectionId: section.id,
      name: section.name,
      extract: {
        html: dom.root.innerHTML.trim(),
        css: sectionCss,
        jsBlocks: blocks,
        externalScripts: [...source.externalScripts],
        externalStylesheets: [...source.externalStylesheets],
        ...(source.tailwind ? { tailwind: source.tailwind } : {}),
        warnings: [],
        errors: [],
        isFullDocument: false,
      },
    };
  });
  return { parts, scripts, issues, warnings };
}
