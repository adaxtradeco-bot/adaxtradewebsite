'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { IconButton } from '@/components/ui/IconPicker';
import type { IconConfig } from '@/components/ui/IconPicker';
import type { CardTheme, WorkflowItem, WorkflowLink } from '@/components/builder-sections/WorkflowSection';

interface WorkflowSectionPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

/* ─── Shared UI helpers ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const selectCls = inputCls;
const textareaCls = inputCls + ' resize-none';

function Collapsible({
  title, badge, children, defaultOpen = false,
}: { title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </span>
        <span className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && <div className="p-3 space-y-3 bg-white dark:bg-gray-800">{children}</div>}
    </div>
  );
}

const CARD_THEME_OPTIONS: { value: CardTheme; label: string; desc: string }[] = [
  { value: 'default',  label: 'Default',  desc: 'خاکستری روشن با hover' },
  { value: 'flat',     label: 'Flat / Divider', desc: 'بدون بکگراند، خط افقی' },
  { value: 'elevated', label: 'Elevated', desc: 'سفید با سایه عمیق' },
  { value: 'bordered', label: 'Bordered', desc: 'بوردر آبی سمت چپ' },
];

const BG_OPTIONS = [
  { value: 'bg-white', label: 'White' },
  { value: 'bg-slate-50', label: 'Slate 50' },
  { value: 'bg-slate-100', label: 'Slate 100' },
  { value: 'bg-blue-50', label: 'Blue 50' },
  { value: 'bg-gradient-to-br from-slate-50 to-blue-50', label: 'Gradient (slate→blue)' },
];

const PADDING_OPTIONS = [
  { value: 'py-12', label: 'Small (py-12)' },
  { value: 'py-16', label: 'Medium (py-16)' },
  { value: 'py-20', label: 'Large (py-20)' },
  { value: 'py-24', label: 'XL (py-24)' },
];

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

/* ─── Main Panel ─── */
export function WorkflowSectionPropertyPanel({ section, onUpdate }: WorkflowSectionPropertyPanelProps) {
  const data = section.data as any;
  const style = (section as any).style ?? {};

  const updateData = (patch: Record<string, any>) =>
    onUpdate({ data: { ...data, ...patch } });

  const updateStyle = (patch: Record<string, any>) =>
    onUpdate({ style: { ...style, ...patch } } as any);

  const workflows: WorkflowItem[] = data.workflows ?? [];

  /* ── Workflow helpers ── */
  const updateWorkflow = (idx: number, patch: Partial<WorkflowItem>) => {
    const next = workflows.map((w, i) => (i === idx ? { ...w, ...patch } : w));
    updateData({ workflows: next });
  };

  const updateLink = (idx: number, patch: Partial<WorkflowLink>) => {
    const current = workflows[idx]?.link ?? { href: '', label: 'Learn more', style: 'text-icon' as const };
    updateWorkflow(idx, { link: { ...current, ...patch } });
  };

  const updateStep = (wIdx: number, sIdx: number, val: string) => {
    const steps = [...(workflows[wIdx]?.steps ?? [])];
    steps[sIdx] = val;
    updateWorkflow(wIdx, { steps });
  };

  const addStep = (wIdx: number) =>
    updateWorkflow(wIdx, { steps: [...(workflows[wIdx]?.steps ?? []), 'New step'] });

  const removeStep = (wIdx: number, sIdx: number) =>
    updateWorkflow(wIdx, { steps: workflows[wIdx].steps.filter((_, i) => i !== sIdx) });

  const moveStep = (wIdx: number, sIdx: number, dir: -1 | 1) => {
    const steps = [...workflows[wIdx].steps];
    const t = sIdx + dir;
    if (t < 0 || t >= steps.length) return;
    [steps[sIdx], steps[t]] = [steps[t], steps[sIdx]];
    updateWorkflow(wIdx, { steps });
  };

  const addWorkflow = () =>
    updateData({
      workflows: [
        ...workflows,
        { title: 'New Workflow', description: 'Description', icon: '⚙️', steps: ['Step 1', 'Step 2'] },
      ],
    });

  const removeWorkflow = (idx: number) =>
    updateData({ workflows: workflows.filter((_, i) => i !== idx) });

  const moveWorkflow = (idx: number, dir: -1 | 1) => {
    const next = [...workflows];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    updateData({ workflows: next });
  };

  return (
    <div className="space-y-4">

      {/* ── Section Header ── */}
      <Collapsible title="Section Header" defaultOpen>
        <Field label="Title">
          <input className={inputCls} value={data.title ?? ''} onChange={e => updateData({ title: e.target.value })} />
        </Field>
        <Field label="Subtitle">
          <textarea className={textareaCls} rows={2} value={data.subtitle ?? ''} onChange={e => updateData({ subtitle: e.target.value })} />
        </Field>
      </Collapsible>

      {/* ── Visual Settings ── */}
      <Collapsible title="Visual Settings">
        <Field label="Card Theme">
          <div className="grid grid-cols-2 gap-2">
            {CARD_THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateData({ cardTheme: opt.value })}
                className={`px-3 py-2 rounded-lg border text-left transition-all text-xs ${
                  (data.cardTheme ?? 'default') === opt.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Background">
          <select className={selectCls} value={style.backgroundColor ?? 'bg-white'} onChange={e => updateStyle({ backgroundColor: e.target.value })}>
            {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Padding">
          <select className={selectCls} value={style.padding ?? 'py-16'} onChange={e => updateStyle({ padding: e.target.value })}>
            {PADDING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Title Alignment">
          <div className="flex gap-2">
            {ALIGN_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => updateStyle({ alignment: o.value })}
                className={`flex-1 py-1.5 rounded border text-xs font-medium transition-all ${
                  (style.alignment ?? 'left') === o.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>
      </Collapsible>

      {/* ── Workflows ── */}
      <Collapsible title="Workflows" badge={`${workflows.length}`} defaultOpen>
        <div className="space-y-3">
          {workflows.map((wf, idx) => (
            <Collapsible key={idx} title={`${idx + 1}. ${wf.title || '(untitled)'}`}>

              {/* Move / Remove controls */}
              <div className="flex gap-1 mb-2">
                <button type="button" onClick={() => moveWorkflow(idx, -1)} disabled={idx === 0}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600">
                  ↑ Up
                </button>
                <button type="button" onClick={() => moveWorkflow(idx, 1)} disabled={idx === workflows.length - 1}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600">
                  ↓ Down
                </button>
                <button type="button" onClick={() => removeWorkflow(idx)}
                  className="ml-auto px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50">
                  🗑 Remove
                </button>
              </div>

              <Field label="Title">
                <input className={inputCls} value={wf.title} onChange={e => updateWorkflow(idx, { title: e.target.value })} />
              </Field>

              <Field label="Description">
                <textarea className={textareaCls} rows={2} value={wf.description} onChange={e => updateWorkflow(idx, { description: e.target.value })} />
              </Field>

              {/* Icon: emoji fallback */}
              <Field label="Emoji Icon (fallback)">
                <input
                  className={inputCls}
                  value={wf.icon ?? ''}
                  onChange={e => updateWorkflow(idx, { icon: e.target.value })}
                  placeholder="e.g. ⚙️"
                />
              </Field>

              {/* FontAwesome icon */}
              <Field label="FontAwesome Icon (overrides emoji)">
                <IconButton
                  value={wf.faIcon}
                  onChange={(icon: IconConfig | null) => updateWorkflow(idx, { faIcon: icon ?? undefined })}
                  placeholder="Select FA icon..."
                />
                {wf.faIcon && (
                  <button
                    type="button"
                    onClick={() => updateWorkflow(idx, { faIcon: undefined })}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                  >
                    ✕ Remove FA icon
                  </button>
                )}
              </Field>

              {/* Steps */}
              <Field label={`Steps (${wf.steps?.length ?? 0})`}>
                <div className="space-y-1.5">
                  {(wf.steps ?? []).map((step, sIdx) => (
                    <div key={sIdx} className="flex gap-1 items-center">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {sIdx + 1}
                      </span>
                      <input
                        className={inputCls}
                        value={step}
                        onChange={e => updateStep(idx, sIdx, e.target.value)}
                        placeholder={`Step ${sIdx + 1}`}
                      />
                      <button type="button" onClick={() => moveStep(idx, sIdx, -1)} disabled={sIdx === 0}
                        className="px-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 text-xs">↑</button>
                      <button type="button" onClick={() => moveStep(idx, sIdx, 1)} disabled={sIdx === (wf.steps?.length ?? 0) - 1}
                        className="px-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 text-xs">↓</button>
                      <button type="button" onClick={() => removeStep(idx, sIdx)}
                        className="px-1.5 text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addStep(idx)}
                    className="w-full py-1.5 border border-dashed border-gray-300 dark:border-gray-600 rounded text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    + Add Step
                  </button>
                </div>
              </Field>

              {/* Link */}
              <Collapsible title="Link Button" defaultOpen={false}>
                <Field label="URL (href)">
                  <input
                    className={inputCls}
                    value={wf.link?.href ?? ''}
                    onChange={e => updateLink(idx, { href: e.target.value })}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Label">
                  <input
                    className={inputCls}
                    value={wf.link?.label ?? 'Learn more'}
                    onChange={e => updateLink(idx, { label: e.target.value })}
                  />
                </Field>
                <Field label="Button Style">
                  <div className="flex gap-2">
                    {(['button', 'text-icon'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateLink(idx, { style: s })}
                        className={`flex-1 py-1.5 rounded border text-xs font-medium transition-all ${
                          (wf.link?.style ?? 'text-icon') === s
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {s === 'button' ? '[ Button ]' : 'Text + →'}
                      </button>
                    ))}
                  </div>
                </Field>
                {wf.link?.href && (
                  <button
                    type="button"
                    onClick={() => updateWorkflow(idx, { link: undefined })}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ✕ Remove link
                  </button>
                )}
              </Collapsible>

            </Collapsible>
          ))}
        </div>

        <button
          type="button"
          onClick={addWorkflow}
          className="w-full py-2.5 border border-dashed border-blue-300 dark:border-blue-700 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
        >
          + Add Workflow
        </button>
      </Collapsible>

    </div>
  );
}
