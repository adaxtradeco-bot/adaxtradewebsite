'use client';

/**
 * Custom HTML import wizard (spec §11.2): Source -> Fields -> Details -> Insert/Save.
 * Edit mode re-imports the stored source (§6.6): ids are reused so values survive.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import {
  analyzeSource,
  assembleCustomHtml,
  defaultCompile,
  mergePreviousFieldMeta,
  reconstructSource,
  type Analysis,
} from '@/lib/custom-html/assemble';
import { canMarkAs, markElementAsField, unmarkField } from '@/lib/custom-html/detect';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import {
  CUSTOM_HTML_LIMITS,
  CUSTOM_HTML_TYPE,
  type CompileRequest,
  type CompileResult,
  type CustomHtmlData,
  type FieldDef,
  type FieldType,
} from '@/lib/custom-html/types';
import { MappingPreview } from './MappingPreview';

export interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (section: SectionConfig) => void;
  editSection?: SectionConfig;
  onReplace?: (sectionId: string, data: CustomHtmlData) => void;
  /** test seam; defaults to the admin compile API */
  compile?: (req: CompileRequest) => Promise<CompileResult>;
}

const FIELD_TYPES: FieldType[] = ['text', 'textarea', 'richtext', 'link', 'image', 'bgImage', 'video', 'embed', 'icon'];
const TYPE_LABEL: Record<string, string> = {
  text: 'Text',
  textarea: 'Textarea',
  richtext: 'Rich text',
  link: 'Link',
  image: 'Image',
  bgImage: 'Background image',
  video: 'Video',
  embed: 'Embed',
  icon: 'Icon',
  color: 'Color',
  repeater: 'Repeater',
};
const MAX_UPLOAD = CUSTOM_HTML_LIMITS.uploadBytes;

type Tab = 'html' | 'css' | 'js';
type Step = 1 | 2 | 3;

const inputCls =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100';
const btnCls =
  'rounded-md px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50';
const btnPrimary = `${btnCls} bg-blue-600 text-white hover:bg-blue-700`;
const btnGhost = `${btnCls} border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700`;

function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => reject(r.error ?? new Error('Could not read file'));
    r.readAsText(file);
  });
}

function findMarked(root: Element, id: string): Element | null {
  return Array.from(root.querySelectorAll('[data-cf]')).find((e) => e.getAttribute('data-cf') === id) ?? null;
}

function guessTypes(el: Element): FieldType[] {
  switch (el.tagName.toLowerCase()) {
    case 'img': return ['image'];
    case 'video': return ['video'];
    case 'a': return ['link', 'text'];
    case 'iframe': return ['embed'];
    case 'svg': return ['icon'];
    default: return ['text', 'richtext'];
  }
}

function Messages({ items, tone }: { items: string[]; tone: 'warn' | 'error' }) {
  if (items.length === 0) return null;
  const cls =
    tone === 'error'
      ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200'
      : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200';
  return (
    <ul
      role={tone === 'error' ? 'alert' : undefined}
      data-testid={tone === 'error' ? 'wizard-errors' : 'wizard-warnings'}
      className={`space-y-1 rounded-md border px-3 py-2 text-sm ${cls}`}
    >
      {items.map((m, i) => (
        <li key={i} className="whitespace-pre-wrap">{m}</li>
      ))}
    </ul>
  );
}

export function ImportWizard({ isOpen, onClose, onInsert, editSection, onReplace, compile = defaultCompile }: ImportWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [tab, setTab] = useState<Tab>('html');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [handlerJs, setHandlerJs] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [version, setVersion] = useState(0);
  const [hintsOnly, setHintsOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [dir, setDir] = useState<'ltr' | 'rtl' | 'auto'>('ltr');
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [compileWarnings, setCompileWarnings] = useState<string[]>([]);
  const previous = useRef<CustomHtmlData | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isEdit = !!editSection;

  const runAnalysis = useCallback(
    (source: { html: string; css: string; js: string; handlerJs: string }, hints: boolean) => {
      const a = analyzeSource(source.html, { css: source.css, js: source.js, handlerJs: source.handlerJs }, { hintsOnly: hints });
      setAnalysis(a);
      setFields(previous.current ? mergePreviousFieldMeta(a.detect.fields, previous.current) : a.detect.fields);
      setVersion((v) => v + 1);
      setSelectedId(null);
      setNotice(null);
      setError(null);
      return a;
    },
    []
  );

  // (Re)initialise whenever the wizard opens.
  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setTab('html');
    setHtml('');
    setCss('');
    setJs('');
    setHandlerJs('');
    setAnalysis(null);
    setFields([]);
    setHintsOnly(false);
    setSelectedId(null);
    setName('');
    setDir('ltr');
    setCompiling(false);
    setError(null);
    setNotice(null);
    setCompileWarnings([]);
    previous.current = null;

    if (editSection) {
      const parsed = parseCustomHtmlData((editSection as unknown as { data: unknown }).data);
      if (!parsed.success) {
        setError(`This section's data could not be loaded for editing: ${parsed.error}`);
        return;
      }
      const data = parsed.data;
      previous.current = data;
      const src = reconstructSource(data);
      setHtml(src.html);
      setCss(src.css);
      setJs(src.js);
      setHandlerJs(src.handlerJs);
      setName(data.name);
      setDir(data.template.dir ?? 'ltr');
      const a = runAnalysis(src, false);
      if (!a.blocked) setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editSection?.id]);

  const analyze = useCallback(
    (hints: boolean) => {
      setError(null);
      if (!html.trim()) {
        setError('Paste or upload some HTML first.');
        return;
      }
      runAnalysis({ html, css, js, handlerJs }, hints);
    },
    [html, css, js, handlerJs, runAnalysis]
  );

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_UPLOAD) {
      setError(`File is too large (${(file.size / 1_000_000).toFixed(1)} MB). The limit is 2 MB.`);
      return;
    }
    try {
      setHtml(await readFileText(file));
      setTab('html');
      setAnalysis(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the file.');
    }
  };

  // ---- step 2 handlers ----
  const root = analysis?.detect.root ?? null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const row = rowRefs.current[id];
    row?.scrollIntoView?.({ block: 'nearest' });
  }, []);

  const handleMark = useCallback(
    (el: Element) => {
      if (!root) return;
      const before = new Set(fields.map((f) => f.id));
      let next = fields;
      for (const type of guessTypes(el)) {
        next = markElementAsField(root, el, type, fields);
        if (next !== fields) break;
      }
      if (next === fields) {
        setNotice('This element cannot be mapped as a field (it may already be inside a mapped element).');
        return;
      }
      setNotice(null);
      setFields(next);
      setVersion((v) => v + 1);
      const added = next.find((f) => !before.has(f.id));
      if (added) handleSelect(added.id);
    },
    [root, fields, handleSelect]
  );

  const updateField = (id: string, patch: Partial<FieldDef>) =>
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const changeType = (field: FieldDef, type: FieldType) => {
    if (!root || type === field.type) return;
    const el = findMarked(root, field.id);
    if (!el) return;
    const next = markElementAsField(root, el, type, fields);
    if (next === fields) {
      setNotice(`Could not change "${field.label}" to ${TYPE_LABEL[type]}.`);
      return;
    }
    setNotice(null);
    const newId = el.getAttribute('data-cf');
    // carry the author's label / group / visibility over to the re-mapped field
    const carried = next.map((f) =>
      f.id === newId ? { ...f, label: field.label, group: field.group ?? f.group, hidden: field.hidden } : f
    );
    setFields(carried);
    setVersion((v) => v + 1);
    if (newId) setSelectedId(newId);
  };

  const removeField = (id: string) => {
    if (!root) return;
    setFields(unmarkField(root, id, fields));
    setVersion((v) => v + 1);
    if (selectedId === id) setSelectedId(null);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    for (const f of fields) {
      const g = f.group ?? 'Section';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(f);
    }
    return Array.from(map.entries());
  }, [fields]);

  const removedFields = useMemo(() => {
    const prev = previous.current;
    if (!prev) return [];
    return prev.fields.filter((pf) => !fields.some((f) => f.id === pf.id && f.type === pf.type));
  }, [fields, isOpen, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const allWarnings = useMemo(() => [...(analysis?.warnings ?? []), ...compileWarnings], [analysis, compileWarnings]);

  // ---- step 4: build ----
  const submit = async () => {
    if (!analysis) return;
    if (!name.trim()) {
      setError('Give the section a name.');
      return;
    }
    setError(null);
    setCompiling(true);
    try {
      const res = await assembleCustomHtml({
        name,
        analysis,
        fields,
        dir,
        compile,
        previous: previous.current ?? undefined,
      });
      setCompileWarnings(res.compileWarnings);
      if (isEdit && editSection) {
        onReplace?.(editSection.id, res.data);
      } else {
        onInsert({
          id: `section-${Date.now()}`,
          type: CUSTOM_HTML_TYPE,
          order: 0,
          data: res.data,
        } as unknown as SectionConfig);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setCompiling(false);
    }
  };

  if (!isOpen) return null;

  const ex = analysis?.extract;
  const blocked = !!analysis?.blocked;
  const canNext1 = !!analysis && !blocked;
  const textareaFor: Record<Tab, { value: string; set: (v: string) => void; ph: string }> = {
    html: { value: html, set: (v) => { setHtml(v); setAnalysis(null); }, ph: 'Paste an HTML fragment or a full document…' },
    css: { value: css, set: (v) => { setCss(v); setAnalysis(null); }, ph: 'Optional extra CSS (in addition to <style> blocks)…' },
    js: { value: js, set: (v) => { setJs(v); setAnalysis(null); }, ph: 'Optional extra JavaScript (in addition to <script> blocks)…' },
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit custom HTML' : 'Import HTML'}
        className="flex max-h-[95vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Edit custom HTML' : 'Import HTML'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Step {step} of 3 — {step === 1 ? 'Source' : step === 2 ? 'Fields' : 'Details'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* ---------------- Step 1 ---------------- */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div role="tablist" className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                  {(['html', 'css', 'js'] as const).map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={`rounded-md px-3 py-1 text-sm font-medium uppercase ${
                        tab === t ? 'bg-white text-gray-900 shadow dark:bg-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <label className={`${btnGhost} cursor-pointer`}>
                  Upload .html
                  <input type="file" accept=".html,.htm,text/html" className="hidden" aria-label="Upload HTML file" onChange={onFile} />
                </label>
              </div>
              <textarea
                dir="ltr"
                spellCheck={false}
                aria-label={`${tab.toUpperCase()} source`}
                value={textareaFor[tab].value}
                onChange={(e) => textareaFor[tab].set(e.target.value)}
                placeholder={textareaFor[tab].ph}
                rows={14}
                className={`${inputCls} font-mono text-xs`}
              />
              <div className="flex items-center gap-2">
                <button className={btnPrimary} onClick={() => analyze(hintsOnly)}>
                  Analyze
                </button>
                {analysis && !blocked && <span className="text-sm text-green-700 dark:text-green-400">Analysis complete.</span>}
              </div>

              {ex && (
                <div data-testid="extract-summary" className="space-y-2 rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700 dark:text-gray-200">
                  <div className="font-medium">Extraction summary</div>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                    <li>Styles: {ex.css.trim() ? `${ex.css.length.toLocaleString()} chars` : 'none'}</li>
                    <li>Script blocks: {ex.jsBlocks.length}</li>
                    <li>External stylesheets: {ex.externalStylesheets.length}</li>
                    <li>External scripts: {ex.externalScripts.length}</li>
                  </ul>
                  {ex.tailwind?.enabled && (
                    <p className="text-amber-700 dark:text-amber-300">
                      Tailwind CDN detected. Compiling Tailwind utility classes is planned for phase 2; the classes are kept but their CSS is not generated yet.
                    </p>
                  )}
                </div>
              )}
              {ex && <Messages tone="error" items={ex.errors} />}
              {analysis && <Messages tone="warn" items={[...(ex?.warnings ?? [])]} />}
            </div>
          )}

          {/* ---------------- Step 2 ---------------- */}
          {step === 2 && analysis && root && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dashed outlines are editable fields. Click one to select it, or click any other element to map it.
                </p>
                <MappingPreview
                  root={root}
                  version={version}
                  css={analysis.extract.css}
                  externalStylesheets={analysis.extract.externalStylesheets}
                  selectedFieldId={selectedId}
                  onSelectField={handleSelect}
                  onMarkElement={handleMark}
                />
              </div>
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{fields.length} fields</span>
                  {analysis.detect.hasHints && (
                    <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={hintsOnly}
                        onChange={(e) => {
                          setHintsOnly(e.target.checked);
                          runAnalysis({ html, css, js, handlerJs }, e.target.checked);
                        }}
                      />
                      Hints only (data-edit)
                    </label>
                  )}
                  <button className={btnGhost} onClick={() => runAnalysis({ html, css, js, handlerJs }, hintsOnly)}>
                    Re-detect
                  </button>
                </div>
                {notice && <Messages tone="warn" items={[notice]} />}
                <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                  {fields.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No fields detected. Click elements in the preview to map them.</p>
                  )}
                  {grouped.map(([group, list]) => (
                    <section key={group} aria-label={group}>
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{group}</h3>
                      <div className="space-y-2">
                        {list.map((f) => {
                          const el = findMarked(root, f.id);
                          const types = FIELD_TYPES.filter((t) => t === f.type || (el ? canMarkAs(el, t) : false));
                          if (!types.includes(f.type)) types.push(f.type);
                          return (
                            <div
                              key={f.id}
                              ref={(n) => { rowRefs.current[f.id] = n; }}
                              data-testid="field-row"
                              onClick={() => setSelectedId(f.id)}
                              className={`flex flex-wrap items-center gap-2 rounded-md border p-2 ${
                                selectedId === f.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <input
                                aria-label={`Label for ${f.id}`}
                                className={`${inputCls} min-w-0 flex-1 basis-40`}
                                value={f.label}
                                maxLength={120}
                                onChange={(e) => updateField(f.id, { label: e.target.value })}
                              />
                              <select
                                aria-label={`Type for ${f.id}`}
                                className={`${inputCls} w-auto`}
                                value={f.type}
                                onChange={(e) => changeType(f, e.target.value as FieldType)}
                              >
                                {types.map((t) => (
                                  <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>
                                ))}
                              </select>
                              <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
                                <input
                                  type="checkbox"
                                  aria-label={`Visible ${f.id}`}
                                  checked={!f.hidden}
                                  onChange={(e) => updateField(f.id, { hidden: e.target.checked ? undefined : true })}
                                />
                                Visible
                              </label>
                              <button
                                aria-label={`Remove ${f.id}`}
                                className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={(e) => { e.stopPropagation(); removeField(f.id); }}
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- Step 3 ---------------- */}
          {step === 3 && analysis && (
            <div className="max-w-xl space-y-4">
              <div>
                <label htmlFor="chs-name" className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">Section name *</label>
                <input id="chs-name" className={inputCls} value={name} maxLength={200} onChange={(e) => setName(e.target.value)} placeholder="e.g. Partner showcase hero" />
              </div>
              <div>
                <label htmlFor="chs-dir" className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">Text direction</label>
                <select id="chs-dir" className={inputCls} value={dir} onChange={(e) => setDir(e.target.value as 'ltr' | 'rtl' | 'auto')}>
                  <option value="ltr">Left to right (ltr)</option>
                  <option value="rtl">Right to left (rtl)</option>
                  <option value="auto">Follow page language (auto)</option>
                </select>
              </div>
              {removedFields.length > 0 && (
                <div data-testid="removed-fields">
                  <Messages
                    tone="warn"
                    items={[`These fields will be removed and their values discarded: ${removedFields.map((f) => f.label).join(', ')}`]}
                  />
                </div>
              )}
              <Messages tone="warn" items={allWarnings} />
              {allWarnings.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No warnings.</p>}
            </div>
          )}

          {error && (
            <div className="mt-3">
              <Messages tone="error" items={[error]} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <button className={btnGhost} onClick={onClose} disabled={compiling}>Cancel</button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button className={btnGhost} disabled={compiling} onClick={() => { setError(null); setStep((s) => (s - 1) as Step); }}>
                Back
              </button>
            )}
            {step === 1 && (
              <button className={btnPrimary} disabled={!canNext1} onClick={() => { setError(null); setStep(2); }}>
                Next: map fields
              </button>
            )}
            {step === 2 && (
              <button className={btnPrimary} onClick={() => { setError(null); setStep(3); }}>
                Next: details
              </button>
            )}
            {step === 3 && (
              <button className={btnPrimary} disabled={compiling || !name.trim()} onClick={submit}>
                {compiling ? 'Compiling…' : isEdit ? 'Save changes' : 'Insert section'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportWizard;
