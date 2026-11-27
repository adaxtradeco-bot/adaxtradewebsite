'use client';

/**
 * Import wizard, "Split into sections" step (spec §13): review the proposed split, merge / split /
 * remove / rename sections, assign scripts, then insert every kept section at once.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import { analyzeExtract } from '@/lib/custom-html/assemble';
import { assembleSplit } from '@/lib/custom-html/split-assemble';
import {
  assignScript,
  buildSplit,
  canSplit,
  createSplitPlan,
  describeSection,
  mergeWithPrevious,
  renameSection,
  setDropped,
  splitFurther,
  type SplitPart,
  type SplitPlan,
} from '@/lib/custom-html/split-page';
import {
  CUSTOM_HTML_TYPE,
  type CompileRequest,
  type CompileResult,
  type CustomHtmlData,
  type ExtractResult,
} from '@/lib/custom-html/types';
import { Messages, btnGhost, btnPrimary, inputCls } from './wizard-ui';

export interface SplitImportPanelProps {
  /** the extracted page (no blocking errors) */
  extract: ExtractResult;
  compile: (req: CompileRequest) => Promise<CompileResult>;
  /** receives the kept sections in page order, all in one call */
  onInsert: (sections: SectionConfig[]) => void;
  onBack: () => void;
  onClose: () => void;
}

interface PartInfo {
  fields: number;
  warnings: string[];
}

const smallBtn = `${btnGhost} !px-2 !py-1 !text-xs`;

export function SplitImportPanel({ extract, compile, onInsert, onBack, onClose }: SplitImportPanelProps) {
  const [plan, setPlan] = useState<SplitPlan>(() => createSplitPlan(extract));
  const [prune, setPrune] = useState(false);
  const [dir, setDir] = useState<'ltr' | 'rtl' | 'auto'>('ltr');
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** compiled with warnings: waits for the admin to confirm */
  const [pending, setPending] = useState<{ sections: CustomHtmlData[]; warnings: string[] } | null>(null);
  const infoCache = useRef(new Map<string, PartInfo>());
  const mounted = useRef(true);
  const busy = progress !== null;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // A confirmed build must match what is on screen.
  useEffect(() => {
    setPending(null);
    setError(null);
  }, [plan, prune, dir]);

  const output = useMemo(() => buildSplit(plan, { pruneCss: prune }), [plan, prune]);

  const partInfo = useMemo(() => {
    const info = (part: SplitPart): PartInfo => {
      const key = JSON.stringify([part.extract.html, part.extract.jsBlocks]);
      let hit = infoCache.current.get(key);
      if (!hit) {
        const analysis = analyzeExtract(part.extract);
        hit = { fields: analysis.detect.fields.length, warnings: analysis.warnings };
        infoCache.current.set(key, hit);
      }
      return hit;
    };
    return new Map(output.parts.map((p) => [p.sectionId, info(p)]));
  }, [output]);

  const kept = plan.sections.filter((s) => !s.dropped);
  const unnamed = kept.some((s) => !s.name.trim());
  const warnings = [
    ...extract.warnings,
    ...output.warnings,
    ...output.parts.flatMap((p) => (partInfo.get(p.sectionId)?.warnings ?? []).map((w) => `${p.name}: ${w}`)),
    ...(pending?.warnings ?? []),
  ];

  const submit = async () => {
    setError(null);
    let built = pending;
    try {
      if (!built) {
        setProgress('Compiling…');
        built = await assembleSplit({
          parts: output.parts,
          dir,
          compile,
          onProgress: (done, total) => {
            if (mounted.current) setProgress(`Compiling ${done + 1} of ${total}…`);
          },
        });
        // closed or went back while compiling: insert nothing
        if (!mounted.current) return;
        if (built.warnings.length > 0) {
          setPending(built);
          return;
        }
      }
      const stamp = Date.now();
      onInsert(
        built.sections.map(
          (data, i) =>
            ({ id: `section-${stamp + i}`, type: CUSTOM_HTML_TYPE, order: i, data }) as unknown as SectionConfig
        )
      );
      onClose();
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      if (mounted.current) setProgress(null);
    }
  };

  const count = `${kept.length} section${kept.length === 1 ? '' : 's'}`;

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        <fieldset disabled={busy} className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {count} will be inserted
            </span>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              Text direction
              <select
                aria-label="Text direction"
                className={`${inputCls} !w-auto`}
                value={dir}
                onChange={(e) => setDir(e.target.value as 'ltr' | 'rtl' | 'auto')}
              >
                <option value="ltr">Left to right (ltr)</option>
                <option value="rtl">Right to left (rtl)</option>
                <option value="auto">Follow page language (auto)</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={prune} onChange={(e) => setPrune(e.target.checked)} />
              Remove unused CSS
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Each section gets the full page CSS unless you remove unused rules; check the result if you do. Fields are
            detected automatically and can be changed later with &quot;Edit code&quot;.
          </p>

          <ol className="space-y-2">
            {plan.sections.map((section, i) => {
              const summary = describeSection(plan, section.id);
              const part = output.parts.find((p) => p.sectionId === section.id);
              const n = i + 1;
              return (
                <li
                  key={section.id}
                  data-testid="split-section"
                  className={`rounded-md border border-gray-200 p-2 dark:border-gray-700 ${section.dropped ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 text-right text-xs text-gray-500 dark:text-gray-400">{n}.</span>
                    <input
                      aria-label={`Name of section ${n}`}
                      className={`${inputCls} min-w-0 flex-1 basis-48`}
                      value={section.name}
                      maxLength={200}
                      disabled={section.dropped}
                      onChange={(e) => setPlan((p) => renameSection(p, section.id, e.target.value))}
                    />
                    <button
                      type="button"
                      className={smallBtn}
                      disabled={i === 0}
                      aria-label={`Merge section ${n} with previous`}
                      onClick={() => setPlan((p) => mergeWithPrevious(p, section.id))}
                    >
                      Merge with previous
                    </button>
                    <button
                      type="button"
                      className={smallBtn}
                      disabled={!canSplit(plan, section.id)}
                      aria-label={`Split section ${n} further`}
                      onClick={() => setPlan((p) => splitFurther(p, section.id))}
                    >
                      Split further
                    </button>
                    <button
                      type="button"
                      className={smallBtn}
                      aria-label={`${section.dropped ? 'Restore' : 'Remove'} section ${n}`}
                      onClick={() => setPlan((p) => setDropped(p, section.id, !section.dropped))}
                    >
                      {section.dropped ? 'Restore' : 'Remove'}
                    </button>
                  </div>
                  <p className="mt-1 pl-8 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono">{summary.elements}</span>
                    {part
                      ? ` · ${partInfo.get(section.id)?.fields ?? 0} fields · CSS ${part.extract.css.length.toLocaleString('en-US')} chars`
                      : ' · will not be imported'}
                  </p>
                  {summary.snippet && (
                    <p dir="auto" className="truncate pl-8 text-xs text-gray-600 dark:text-gray-300">{summary.snippet}</p>
                  )}
                </li>
              );
            })}
          </ol>

          {output.scripts.length > 0 && (
            <section aria-label="Scripts" className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Scripts</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A script only sees the section it belongs to. Sections that share a script must be merged.
              </p>
              {output.scripts.map((script) => (
                <div key={script.index} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-900 dark:text-white">Script {script.index + 1}</span>
                  <code dir="ltr" className="min-w-0 flex-1 basis-40 truncate text-xs text-gray-500 dark:text-gray-400">
                    {script.preview}
                  </code>
                  <select
                    aria-label={`Section for script ${script.index + 1}`}
                    className={`${inputCls} !w-auto max-w-full`}
                    value={script.target ?? ''}
                    onChange={(e) => setPlan((p) => assignScript(p, script.index, e.target.value || null))}
                  >
                    {plan.sections.map((s, i) =>
                      s.dropped ? null : (
                        <option key={s.id} value={s.id}>{`${i + 1}. ${s.name}`}</option>
                      )
                    )}
                    <option value="">Do not import</option>
                  </select>
                </div>
              ))}
            </section>
          )}

          {output.issues.length > 0 && (
            <div data-testid="split-issues">
              <Messages tone="warn" items={output.issues.map((i) => i.message)} />
            </div>
          )}
          {pending && (
            <p role="status" data-testid="confirm-warnings" className="text-sm font-medium text-amber-800 dark:text-amber-200">
              The styles compiled with warnings. Review them, then confirm.
            </p>
          )}
          {warnings.length > 0 && (
            <div data-testid="split-warnings">
              <Messages tone="warn" items={warnings} />
            </div>
          )}
        </fieldset>
        {error && (
          <div className="mt-3">
            <Messages tone="error" items={[error]} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
        <div className="flex items-center gap-2">
          <button type="button" className={btnGhost} onClick={onBack} disabled={busy}>Back</button>
          <button type="button" className={btnPrimary} disabled={busy || kept.length === 0 || unnamed} onClick={submit}>
            {progress ?? (pending ? 'Insert anyway' : `Insert ${count}`)}
          </button>
        </div>
      </div>
    </>
  );
}

export default SplitImportPanel;
