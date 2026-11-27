/**
 * Full pages -> extract -> split -> per-section assemble (real CSS compiler) -> render -> run the
 * scripts with the real runtime in jsdom.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import postcss from 'postcss';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { extractSource } from '@/lib/custom-html/extract';
import { buildSplit, createSplitPlan, mergeWithPrevious, type SplitPlan } from '@/lib/custom-html/split-page';
import { assembleSplit } from '@/lib/custom-html/split-assemble';
import { compileCss } from '@/lib/custom-html/css-scope';
import { renderCustomHtml } from '@/lib/custom-html/render';
import { runCustomHtmlScript } from '@/lib/custom-html/runtime';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import type { CustomHtmlData, RuntimeHandle } from '@/lib/custom-html/types';

const SAMPLES: string[] = execFileSync('git', ['ls-files', '-z', 'sample pages'])
  .toString()
  .split('\0')
  .filter((f) => f.endsWith('.html'));

const read = (file: string) => readFileSync(path.resolve(file), 'utf8');
const sample = (name: string) => read(`sample pages/${name}`);
const fixture = (name: string) => read(`src/tests/custom-html/fixtures/${name}`);

/** all text except code, without whitespace */
function textOf(html: string): string {
  const doc = new DOMParser().parseFromString(`<!DOCTYPE html><body>${html}</body>`, 'text/html');
  doc.querySelectorAll('script, style').forEach((el) => el.remove());
  return (doc.body.textContent ?? '').replace(/\s+/g, '');
}

async function importPlan(plan: SplitPlan, pruneCss = false): Promise<CustomHtmlData[]> {
  const out = buildSplit(plan, { pruneCss });
  const { sections } = await assembleSplit({ parts: out.parts, compile: compileCss });
  return sections;
}

const handles: RuntimeHandle[] = [];

/** Renders the sections one after another, like the public page, and runs their scripts. */
async function mount(sections: CustomHtmlData[]): Promise<HTMLElement[]> {
  const roots = sections.map((data) => {
    const { html, css } = renderCustomHtml(data, { builder: false });
    const outer = document.createElement('div');
    outer.setAttribute('data-chs', data.template.scope);
    const style = document.createElement('style');
    style.textContent = css;
    const root = document.createElement('div');
    root.innerHTML = html;
    outer.append(style, root);
    document.body.appendChild(outer);
    return root;
  });
  for (let i = 0; i < sections.length; i++) {
    const { js } = sections[i].template;
    handles.push(await runCustomHtmlScript({ instanceId: `split-${i}`, root: roots[i], js, externalScripts: [] }));
  }
  return roots;
}

const click = (root: Element, selector: string, index = 0) =>
  (root.querySelectorAll(selector)[index] as HTMLElement).click();
const active = (root: Element, selector: string) =>
  Array.from(root.querySelectorAll(selector)).map((el) => el.classList.contains('active'));

let warn: MockInstance<any[], any>;
let observed: Element[] = [];
/** errors thrown inside event listeners (jsdom reports them on the window) */
let errors: string[] = [];
const onError = (event: ErrorEvent) => {
  errors.push(event.message);
  event.preventDefault();
};
/** the global of the realm template scripts run in (vitest exposes the JSDOM instance) */
const scriptWindow = () =>
  (globalThis as unknown as { jsdom: { window: Window & Record<string, unknown> } }).jsdom.window;

beforeEach(() => {
  document.body.innerHTML = '';
  observed = [];
  errors = [];
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  // registered on vitest's window so it counts as handled
  window.addEventListener('error', onError);
  // jsdom has no IntersectionObserver
  scriptWindow().IntersectionObserver = class {
    observe(el: Element) {
      observed.push(el);
    }
    unobserve() {}
    disconnect() {}
  };
});
afterEach(() => {
  handles.splice(0).forEach((h) => h.dispose());
  window.removeEventListener('error', onError);
  delete scriptWindow().IntersectionObserver;
  vi.restoreAllMocks();
});

describe('every tracked sample page', () => {
  it('finds the sample pages', () => {
    expect(SAMPLES.length).toBeGreaterThan(20);
  });

  it.each(SAMPLES)(
    '%s: splits, assembles and renders without losing text',
    async (file) => {
      const extract = extractSource(read(file));
      expect(extract.errors).toEqual([]);
      const plan = createSplitPlan(extract);
      const out = buildSplit(plan);
      expect(textOf(out.parts.map((p) => p.extract.html).join(''))).toBe(textOf(extract.html));

      const sections = await importPlan(plan, true);
      expect(sections).toHaveLength(plan.sections.length);
      sections.forEach((s) => expect(parseCustomHtmlData(s).success).toBe(true));
      const rendered = sections.map((s) => renderCustomHtml(s, { builder: false }).html).join('');
      expect(textOf(rendered)).toBe(textOf(extract.html));
      // every script block lands in exactly one section
      expect(buildSplit(plan).parts.flatMap((p) => p.extract.jsBlocks).sort()).toEqual([...extract.jsBlocks].sort());
    },
    60_000
  );

  it.each(SAMPLES)('%s: pruning keeps every rule that styles an element of the section', (file) => {
    const plan = createSplitPlan(extractSource(read(file)));
    const full = buildSplit(plan).parts;
    const pruned = buildSplit(plan, { pruneCss: true }).parts;
    full.forEach((part, i) => {
      const body = document.implementation.createHTMLDocument('').body;
      body.innerHTML = part.extract.html;
      const elements = Array.from(body.querySelectorAll('*'));
      const matching = (css: string) => {
        const out: string[] = [];
        postcss.parse(css).walkRules((rule) => {
          for (const selector of rule.selectors) {
            try {
              if (elements.some((el) => el.matches(selector))) out.push(`${selector}{${rule.nodes.join(';')}}`);
            } catch {
              /* pseudo-elements and the like cannot be matched */
            }
          }
        });
        return out;
      };
      expect(matching(pruned[i].extract.css)).toEqual(matching(part.extract.css));
    });
  });
});

describe('two onclick tab sections, each with its own script (fixture)', () => {
  it.each([false, true])('works per section (pruned CSS: %s)', async (prune) => {
    const plan = createSplitPlan(extractSource(fixture('split-tabs-page.html')));
    const out = buildSplit(plan, { pruneCss: prune });
    expect(out.parts.map((p) => p.name)).toEqual(['Pick a plan', 'Common questions']);
    expect(out.parts.map((p) => p.extract.jsBlocks.length)).toEqual([1, 1]);
    expect(out.issues).toEqual([]);

    const sections = await importPlan(plan, prune);
    const [plans, answers] = await mount(sections);
    expect(warn).not.toHaveBeenCalled();

    expect(active(plans, '.plan-panel')).toEqual([true, false]);
    click(plans, '.plan-tab', 1);
    expect(active(plans, '.plan-panel')).toEqual([false, true]);

    const open = () => Array.from(answers.querySelectorAll('.answer')).map((a) => a.classList.contains('is-open'));
    click(answers, '.question', 1);
    expect(open()).toEqual([false, true]);
    expect(active(plans, '.plan-panel')).toEqual([false, true]);

    // wrapper styling survives, under each section's own scope, without full-height sections
    expect(new Set(sections.map((s) => s.template.scope)).size).toBe(2);
    // nothing targets #content, so only the first copy keeps the id
    expect(sections.map((s) => s.template.html.includes('<main id="content" class="page">'))).toEqual([true, false]);
    for (const s of sections) {
      expect(s.template.html).toContain('class="page"');
      expect(s.template.cssScoped).toContain(`[data-chs="${s.template.scope}"] .page`);
      expect(s.template.cssScoped).not.toContain('100vh');
      expect(s.template.cssScoped).toContain('@keyframes fade');
      expect(s.template.externalStylesheets).toHaveLength(1);
    }
    // the class added by the script is still styled
    expect(sections[1].template.cssScoped).toContain('.answer.is-open');
    expect(sections[0].template.cssScoped.includes('.answer.is-open')).toBe(!prune);
  });

  it('works when the whole split page is placed twice', async () => {
    const sections = await importPlan(createSplitPlan(extractSource(fixture('split-tabs-page.html'))));
    const [first, , second] = await mount([...sections, ...sections]);
    click(second, '.plan-tab', 1);
    expect(active(second, '.plan-panel')).toEqual([false, true]);
    expect(active(first, '.plan-panel')).toEqual([true, false]);
  });
});

describe('sample: we automate your busiiness 2 (FAQ script)', () => {
  it('splits cleanly and the FAQ toggles in its own section', async () => {
    const plan = createSplitPlan(extractSource(sample('we automate your busiiness 2 .html')));
    const out = buildSplit(plan);
    expect(out.issues).toEqual([]);
    const faq = out.parts.findIndex((p) => p.extract.jsBlocks.length);
    expect(out.parts[faq].name).toBe('Frequently Asked Questions');

    const roots = await mount(await importPlan(plan));
    expect(warn).not.toHaveBeenCalled();
    const item = roots[faq].querySelector('.faq-item')!;
    click(roots[faq], '.faq-question');
    expect(item.classList.contains('active')).toBe(true);
    click(roots[faq], '.faq-question');
    expect(item.classList.contains('active')).toBe(false);
  });
});

describe('sample: flow_builder_sections (one script drives both tab sections)', () => {
  const load = () => createSplitPlan(extractSource(sample('flow_builder_sections.html')));

  it('cannot work as proposed: the split says so and the scripts do fail', async () => {
    const plan = load();
    expect(plan.sections).toHaveLength(2);
    const out = buildSplit(plan);
    expect(out.issues.map((i) => i.kind)).toEqual(['script-elements', 'handler-function']);

    const [, second] = await mount(await importPlan(plan));
    // the script looks for the second section's elements and stops there
    expect(warn).toHaveBeenCalled();
    click(second, '#rail2 .tab-btn-dark', 2);
    expect(errors.join(' ')).toContain('switchTab is not defined');
    expect(active(second, '#rail2 .tab-btn-dark')[2]).toBe(false);
  });

  it('works once the two sections are merged', async () => {
    let plan = load();
    plan = mergeWithPrevious(plan, plan.sections[1].id);
    expect(buildSplit(plan).issues).toEqual([]);

    const [root] = await mount(await importPlan(plan, true));
    expect(warn).not.toHaveBeenCalled();
    click(root, '#rail1 .tab-btn', 2);
    expect(active(root, '#panels1 .tab-panel')).toEqual([false, false, true, false, false]);
    click(root, '#rail2 .tab-btn-dark', 3);
    expect(active(root, '#panels2 .tab-panel-dark')).toEqual([false, false, false, true, false]);
    expect(active(root, '#panels1 .tab-panel')[2]).toBe(true);
    expect(errors).toEqual([]);
  });
});

describe('sample: ivaflow-partner-showcase (scroll reveal across all sections)', () => {
  const load = () => createSplitPlan(extractSource(sample('ivaflow-partner-showcase.html')));

  it('only reveals the section that got the script, and warns about it', async () => {
    const plan = load();
    expect(buildSplit(plan).issues.map((i) => i.kind)).toEqual(['script-elements']);
    const roots = await mount(await importPlan(plan));
    const withReveal = roots.filter((r) => r.querySelector('.reveal'));
    expect(withReveal.length).toBeGreaterThan(1);
    expect(roots.filter((r) => observed.some((el) => r.contains(el)))).toHaveLength(1);
  });

  it('reveals everything once the sections are merged', async () => {
    let plan = load();
    while (plan.sections.length > 1) plan = mergeWithPrevious(plan, plan.sections[1].id);
    expect(buildSplit(plan).issues).toEqual([]);
    const [root] = await mount(await importPlan(plan));
    expect(observed).toHaveLength(root.querySelectorAll('.reveal').length);
  });
});

describe('sample: setiran formbuilder-light (Tailwind + one jQuery script)', () => {
  it('splits and compiles, but the shared script is reported as cross-section', async () => {
    const plan = createSplitPlan(extractSource(sample('setiran formbuilder-light.html')));
    const out = buildSplit(plan);
    const issue = out.issues.find((i) => i.kind === 'script-elements')!;
    // jQuery cannot be loaded here, so the script itself is not run
    expect(issue.sectionIds.length).toBeGreaterThan(5);
    const sections = await importPlan(plan, true);
    for (const s of sections) {
      expect(s.template.tailwind?.enabled).toBe(true);
      expect(s.template.html).toContain('data-chs-body');
      expect(s.template.cssScoped).toContain(`[data-chs="${s.template.scope}"]`);
      expect(s.template.externalScripts).toEqual(['https://code.jquery.com/jquery-3.7.1.min.js']);
    }
  }, 60_000);
});
