'use client';

/**
 * Property panel for the Custom HTML section.
 * Spec: docs/custom-html-section-spec.md §11.3
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import { CHS_EVENTS, canEditCodeClient, takePendingField } from '@/lib/custom-html/client-role';
import type { FieldDef, FieldValue } from '@/lib/custom-html/types';
import { FieldEditor } from './FieldEditors';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

const SEARCH_THRESHOLD = 12;
const DEFAULT_GROUP = 'General';
const HIDDEN_GROUP = 'Hidden fields';
const HIGHLIGHT_MS = 1600;

const btnCls =
  'px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600';
const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

interface GroupEntry {
  key: string;
  title: string;
  fields: FieldDef[];
}

function GroupBox({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
          {title}
          <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-0.5 rounded-full">{count}</span>
        </span>
        <span className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && <div className="p-3 space-y-4 bg-white dark:bg-gray-800">{children}</div>}
    </div>
  );
}

export function CustomHtmlPropertyPanel({ section, onUpdate }: Props) {
  const rawData = (section.data ?? {}) as Record<string, unknown>;
  const parsed = useMemo(() => parseCustomHtmlData(rawData), [rawData]);

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(canEditCodeClient());
  }, []);

  const fields: FieldDef[] = useMemo(() => (parsed.success ? parsed.data.fields : []), [parsed]);
  const values: Record<string, FieldValue> = useMemo(() => (parsed.success ? parsed.data.values : {}), [parsed]);
  const runInBuilder = parsed.success ? !!parsed.data.runInBuilder : false;
  const name = parsed.success ? parsed.data.name : typeof rawData.name === 'string' ? rawData.name : 'Custom HTML';

  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean> | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = useMemo<GroupEntry[]>(() => {
    const out: GroupEntry[] = [];
    const index: Record<string, GroupEntry> = Object.create(null);
    const hidden: FieldDef[] = [];
    for (const f of fields) {
      if (f.hidden) {
        hidden.push(f);
        continue;
      }
      const title = f.group && f.group.trim() ? f.group : DEFAULT_GROUP;
      const key = `g:${title}`;
      if (!index[key]) {
        index[key] = { key, title, fields: [] };
        out.push(index[key]);
      }
      index[key].fields.push(f);
    }
    if (isAdmin && hidden.length) out.push({ key: 'hidden', title: HIDDEN_GROUP, fields: hidden });
    return out;
  }, [fields, isAdmin]);

  const shownCount = groups.reduce((n, g) => n + g.fields.length, 0);
  const showSearch = shownCount > SEARCH_THRESHOLD;
  const query = showSearch ? search.trim().toLowerCase() : '';

  const defaultOpen = (list: GroupEntry[]): Record<string, boolean> => (list[0] ? { [list[0].key]: true } : {});
  const effectiveOpen = openGroups ?? defaultOpen(groups);
  const isOpen = (key: string): boolean => !!query || !!effectiveOpen[key];
  const toggleGroup = (key: string) => setOpenGroups({ ...effectiveOpen, [key]: !effectiveOpen[key] });

  const update = (patch: Record<string, unknown>) => onUpdate({ data: { ...rawData, ...patch } } as Partial<SectionConfig>);
  const setValue = (id: string, v: FieldValue) => update({ values: { ...values, [id]: v } });

  // Canvas click on a [data-cf] element: open the group, scroll to + focus + highlight the field.
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const sectionId = section.id;

  const handleSelect = useCallback(
    (ev: Event) => {
      const detail = (ev as CustomEvent<{ sectionId?: string; fieldId?: string }>).detail;
      if (!detail || detail.sectionId !== sectionId || !detail.fieldId) return;
      const all = fieldsRef.current;
      const target =
        all.find((f) => f.id === detail.fieldId) ||
        all.find((f) => detail.fieldId!.indexOf(f.id + '.') === 0 && f.type === 'repeater');
      if (!target) return;
      const group = groupsRef.current.find((g) => g.fields.indexOf(target) !== -1);
      if (group) setOpenGroups((prev) => ({ ...(prev ?? defaultOpen(groupsRef.current)), [group.key]: true }));
      setSearch('');
      setHighlightId(target.id);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
      setTimeout(() => {
        const el = containerRef.current?.querySelector<HTMLElement>(`[data-field-id="${target.id}"]`);
        if (!el) return;
        if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el.querySelector<HTMLElement>('input, textarea, select')?.focus();
      }, 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectionId],
  );

  useEffect(() => {
    window.addEventListener(CHS_EVENTS.selectField, handleSelect);
    // The click may have happened just before this panel mounted (section was not selected yet).
    const pending = takePendingField(sectionId);
    if (pending) handleSelect(new CustomEvent(CHS_EVENTS.selectField, { detail: { sectionId, fieldId: pending } }));
    return () => {
      window.removeEventListener(CHS_EVENTS.selectField, handleSelect);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, [handleSelect]);

  const editCode = () => window.dispatchEvent(new CustomEvent(CHS_EVENTS.editCode, { detail: { sectionId } }));

  return (
    <div className="space-y-4" ref={containerRef} data-testid="custom-html-panel">
      <div className="space-y-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-400">Custom HTML</div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white break-words">{name || 'Untitled template'}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button type="button" className={btnCls} onClick={editCode}>
              Edit code
            </button>
          )}
          {parsed.success && (
            <button type="button" className={btnCls} onClick={() => update({ values: {} })}>
              Reset all to defaults
            </button>
          )}
        </div>
        {isAdmin && parsed.success && (
          <label className="flex items-center justify-between gap-3 text-xs font-medium text-gray-600 dark:text-gray-400">
            <span>Run scripts in builder</span>
            <button
              type="button"
              role="switch"
              aria-checked={runInBuilder}
              aria-label="Run scripts in builder"
              onClick={() => update({ runInBuilder: !runInBuilder })}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${runInBuilder ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${runInBuilder ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>
        )}
      </div>

      {!parsed.success && (
        <p role="alert" className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded p-2">
          This section&apos;s data is invalid: {parsed.error.slice(0, 200)}
        </p>
      )}

      {parsed.success && groups.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">This template has no editable fields.</p>
      )}

      {showSearch && (
        <div>
          <label htmlFor="chs-field-search" className="sr-only">
            Search fields
          </label>
          <input id="chs-field-search" type="search" className={inputCls} placeholder="Search fields…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g) => {
          const list = query ? g.fields.filter((f) => f.label.toLowerCase().includes(query)) : g.fields;
          if (query && list.length === 0) return null;
          return (
            <GroupBox key={g.key} title={g.title} count={list.length} open={isOpen(g.key)} onToggle={() => toggleGroup(g.key)}>
              {list.map((f) => (
                <FieldEditor
                  key={f.id}
                  field={f}
                  value={hasOwn(values, f.id) ? values[f.id] : f.default}
                  onChange={(v) => setValue(f.id, v)}
                  highlight={highlightId === f.id}
                />
              ))}
            </GroupBox>
          );
        })}
      </div>
    </div>
  );
}

export default CustomHtmlPropertyPanel;
