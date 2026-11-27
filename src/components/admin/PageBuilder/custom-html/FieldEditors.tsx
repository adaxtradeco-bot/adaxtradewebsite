'use client';

/**
 * Custom HTML section — one value editor per FieldType.
 * Spec: docs/custom-html-section-spec.md §11.3
 */
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { safeColor, safeEmbedUrl } from '@/lib/custom-html/escape';
import { CHS_EVENTS, canEditCodeClient } from '@/lib/custom-html/client-role';
import { sanitizeSvgWithNames, svgNames } from '@/lib/sanitize';
import {
  CUSTOM_HTML_LIMITS,
  parseRepeaterPath,
  type ColorValue,
  type FieldDef,
  type FieldValue,
  type IconValue,
  type LinkValue,
  type MediaValue,
  type RepeaterItem,
} from '@/lib/custom-html/types';

export interface FieldEditorProps {
  field: FieldDef;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  /** Briefly true after the canvas selected this field. */
  highlight?: boolean;
  /** list items: no per-field reset (the list has its own) */
  hideReset?: boolean;
  /** icon: the author's SVGs, whose class names and ids an edited value keeps; default [field.default] */
  svgDefaults?: unknown[];
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const btnCls =
  'px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50';
const itemBtnCls =
  'shrink-0 rounded px-1.5 py-0.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-default';
const subLabelCls ='block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1';
const hintCls = 'mt-1 text-[11px] text-gray-400 dark:text-gray-500';

function asObject<T extends object>(value: unknown): T {
  return (typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {}) as T;
}
function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
function sameValue(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/** Opens the page builder's media browser (same event flow as PropertyPanel / ImageUploader). */
function browseMedia(acceptTypes: string[], onSelect: (url: string) => void): void {
  window.dispatchEvent(new CustomEvent('openMediaBrowser', { detail: { onSelect, acceptTypes } }));
}

/** Same endpoint ImageUploader uses. */
async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  let token: string | null = null;
  try {
    token = window.localStorage.getItem('adminToken');
  } catch {
    /* ignore */
  }
  const response = await fetch('/api/admin/media', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error(`Upload failed (${response.status})`);
  const data = await response.json();
  if (!data || typeof data.url !== 'string') throw new Error('Upload failed');
  return data.url;
}

/* ─── Shell: label + per-field reset ─── */
function FieldShell({
  field,
  value,
  onChange,
  highlight,
  hideReset,
  labelFor,
  children,
}: FieldEditorProps & { labelFor?: string; children: React.ReactNode }) {
  const isDefault = sameValue(value, field.default);
  return (
    <div
      data-field-id={field.id}
      className={`rounded-md p-1 -m-1 transition-shadow ${highlight ? 'ring-2 ring-blue-500 bg-blue-50/60 dark:bg-blue-900/20' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <label htmlFor={labelFor} className="block text-xs font-medium text-gray-600 dark:text-gray-400">
          {field.label}
        </label>
        {!hideReset && (
          <button
            type="button"
            onClick={() => onChange(field.default)}
            disabled={isDefault}
            aria-label={`Reset ${field.label}`}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-default"
          >
            Reset
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Media row: preview + URL + Browse + Upload ─── */
function MediaPicker({
  id,
  label,
  url,
  onUrl,
  acceptTypes,
  preview,
}: {
  id: string;
  label?: string;
  url: string;
  onUrl: (url: string) => void;
  acceptTypes: string[];
  preview: 'image' | 'video' | 'none';
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onUrl(await uploadMedia(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className={subLabelCls}>
          {label}
        </label>
      )}
      {url && preview !== 'none' && (
        <div className="h-20 w-full overflow-hidden rounded border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {preview === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Preview" className="max-h-full max-w-full object-contain" />
          ) : (
            <video src={url} className="max-h-full max-w-full" muted preload="metadata" />
          )}
        </div>
      )}
      <input id={id} type="text" className={inputCls} value={url} placeholder="https://… or /uploads/…" onChange={(e) => onUrl(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnCls} onClick={() => browseMedia(acceptTypes, onUrl)}>
          Browse media
        </button>
        <button type="button" className={btnCls} disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={acceptTypes.join(',')}
          className="hidden"
          aria-label={`${label || 'File'} upload`}
          onChange={onFile}
        />
      </div>
      {error && (
        <p role="alert" className="text-[11px] text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Editors ─── */
function TextEditor(p: FieldEditorProps) {
  const id = useId();
  return (
    <FieldShell {...p} labelFor={id}>
      <input id={id} type="text" className={inputCls} value={asString(p.value)} onChange={(e) => p.onChange(e.target.value)} />
    </FieldShell>
  );
}

function TextareaEditor(p: FieldEditorProps) {
  const id = useId();
  return (
    <FieldShell {...p} labelFor={id}>
      <textarea id={id} rows={4} className={`${inputCls} resize-y`} value={asString(p.value)} onChange={(e) => p.onChange(e.target.value)} />
    </FieldShell>
  );
}

function RichTextEditor(p: FieldEditorProps) {
  const id = useId();
  return (
    <FieldShell {...p} labelFor={id}>
      <textarea id={id} rows={5} className={`${inputCls} resize-y`} value={asString(p.value)} onChange={(e) => p.onChange(e.target.value)} />
      <p className={hintCls}>Allowed: bold, italic, underline, link, line break</p>
    </FieldShell>
  );
}

function LinkEditor(p: FieldEditorProps) {
  const base = useId();
  const v = asObject<LinkValue>(p.value);
  const set = (patch: Partial<LinkValue>) => p.onChange({ ...v, ...patch });
  return (
    <FieldShell {...p} labelFor={`${base}-text`}>
      <div className="space-y-2">
        <div>
          <input id={`${base}-text`} type="text" aria-label={`${p.field.label} text`} className={inputCls} value={asString(v.text)} placeholder="Link text" onChange={(e) => set({ text: e.target.value })} />
        </div>
        <div>
          <label htmlFor={`${base}-href`} className={subLabelCls}>
            URL
          </label>
          <input id={`${base}-href`} type="text" className={inputCls} value={asString(v.href)} placeholder="https://… or /path" onChange={(e) => set({ href: e.target.value })} />
        </div>
        <label htmlFor={`${base}-target`} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <input id={`${base}-target`} type="checkbox" checked={v.target === '_blank'} onChange={(e) => set({ target: e.target.checked ? '_blank' : '_self' })} />
          Open in new tab
        </label>
      </div>
    </FieldShell>
  );
}

function ImageEditor(p: FieldEditorProps & { withAlt: boolean }) {
  const base = useId();
  const v = asObject<MediaValue>(p.value);
  const set = (patch: Partial<MediaValue>) => p.onChange({ ...v, ...patch });
  return (
    <FieldShell {...p} labelFor={`${base}-src`}>
      <div className="space-y-2">
        <MediaPicker id={`${base}-src`} label="Image URL" url={asString(v.src)} onUrl={(src) => set({ src })} acceptTypes={['image/*']} preview="image" />
        {p.withAlt && (
          <div>
            <label htmlFor={`${base}-alt`} className={subLabelCls}>
              Alt text
            </label>
            <input id={`${base}-alt`} type="text" className={inputCls} value={asString(v.alt)} onChange={(e) => set({ alt: e.target.value })} />
          </div>
        )}
      </div>
    </FieldShell>
  );
}

function VideoEditor(p: FieldEditorProps) {
  const base = useId();
  const v = asObject<MediaValue>(p.value);
  const set = (patch: Partial<MediaValue>) => p.onChange({ ...v, ...patch });
  return (
    <FieldShell {...p} labelFor={`${base}-src`}>
      <div className="space-y-3">
        <MediaPicker id={`${base}-src`} label="Video URL" url={asString(v.src)} onUrl={(src) => set({ src })} acceptTypes={['video/*']} preview="none" />
        <MediaPicker id={`${base}-poster`} label="Poster image" url={asString(v.poster)} onUrl={(poster) => set({ poster })} acceptTypes={['image/*']} preview="image" />
      </div>
    </FieldShell>
  );
}

function EmbedEditor(p: FieldEditorProps) {
  const id = useId();
  const v = asObject<MediaValue>(p.value);
  const src = asString(v.src);
  const invalid = src.trim() !== '' && safeEmbedUrl(src) === '';
  return (
    <FieldShell {...p} labelFor={id}>
      <input
        id={id}
        type="text"
        className={inputCls}
        value={src}
        placeholder="https://www.youtube.com/embed/…"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-err` : undefined}
        onChange={(e) => p.onChange({ ...v, src: e.target.value })}
      />
      {invalid && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-[11px] text-red-600 dark:text-red-400">
          Not allowed: use an https URL from YouTube, Vimeo or Google Maps.
        </p>
      )}
    </FieldShell>
  );
}

function IconEditor(p: FieldEditorProps) {
  const id = useId();
  const v = asObject<IconValue>(p.value);
  const svg = asString(v.svg);
  // the preview mirrors the public renderer
  const authored = p.svgDefaults ?? [asObject<IconValue>(p.field.default).svg];
  const clean = svg ? sanitizeSvgWithNames(svg, svgNames(authored)) : '';
  return (
    <FieldShell {...p} labelFor={id}>
      <textarea id={id} rows={4} className={`${inputCls} resize-y font-mono text-xs`} value={svg} placeholder="<svg …>…</svg>" onChange={(e) => p.onChange({ ...v, svg: e.target.value })} />
      <p className={hintCls}>Only the class names and ids of the original icon are kept.</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Preview</span>
        <div
          data-testid="icon-preview"
          className="h-10 w-10 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 flex items-center justify-center [&>svg]:max-h-8 [&>svg]:max-w-8"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      </div>
    </FieldShell>
  );
}

/** "#rrggbb" for the native picker (which has no alpha channel); black when the colour has no such form. */
function pickerColor(value: string): string {
  const v = value.trim();
  const long = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(v);
  if (long) return `#${long[1].toLowerCase()}`;
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])[0-9a-f]?$/i.exec(v);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(v);
  if (rgb) {
    return `#${rgb.slice(1, 4).map((n) => Math.min(255, Number(n)).toString(16).padStart(2, '0')).join('')}`;
  }
  return '#000000';
}

function ColorEditor(p: FieldEditorProps) {
  const base = useId();
  const v = asObject<ColorValue>(p.value);
  const value = asString(v.value);
  const safe = safeColor(value, '');
  const invalid = value.trim() !== '' && safe === '';
  const shown = safe || safeColor(asObject<ColorValue>(p.field.default).value, 'transparent');
  return (
    <FieldShell {...p} labelFor={`${base}-text`}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${p.field.label} picker`}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-transparent p-0.5"
          value={pickerColor(shown)}
          onChange={(e) => p.onChange({ ...v, value: e.target.value })}
        />
        <span
          aria-hidden="true"
          data-testid="color-swatch"
          className="h-9 w-9 shrink-0 rounded border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: shown }}
        />
        <input
          id={`${base}-text`}
          type="text"
          className={inputCls}
          value={value}
          placeholder="#1a73e8"
          aria-invalid={invalid}
          aria-describedby={invalid ? `${base}-err` : undefined}
          onChange={(e) => p.onChange({ ...v, value: e.target.value })}
        />
      </div>
      {invalid && (
        <p id={`${base}-err`} role="alert" className="mt-1 text-[11px] text-red-600 dark:text-red-400">
          Not a colour: use hex, rgb(), hsl() or a colour name. The original colour is shown meanwhile.
        </p>
      )}
    </FieldShell>
  );
}

/* ─── Repeater ─── */

/** How long a canvas selection waits for its list editor to mount. */
const SELECTION_TTL_MS = 2000;
const ITEM_HIGHLIGHT_MS = 1600;

/** The last canvas selection: the panel may mount a list editor only because of that click. */
let lastSelection: { fieldId: string; at: number } | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener(CHS_EVENTS.selectField, (ev) => {
    const fieldId = (ev as CustomEvent<{ fieldId?: string }>).detail?.fieldId;
    lastSelection = fieldId ? { fieldId, at: Date.now() } : null;
  });
}

const copyValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** A short description of an item for its header: the first child that has readable content. */
function itemSummary(children: FieldDef[], item: RepeaterItem): string {
  for (const child of children) {
    const value = Object.prototype.hasOwnProperty.call(item, child.id) ? item[child.id] : child.default;
    const object = asObject<LinkValue & MediaValue>(value);
    const text = (typeof value === 'string' ? value : asString(object.text) || asString(object.alt))
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) return text.length > 40 ? `${text.slice(0, 39).trimEnd()}…` : text;
  }
  return '';
}

function RepeaterEditor(p: FieldEditorProps) {
  const { field } = p;
  const items = (Array.isArray(p.value) ? p.value : []) as RepeaterItem[];
  const limit = Math.min(field.max ?? CUSTOM_HTML_LIMITS.repeaterItems, CUSTOM_HTML_LIMITS.repeaterItems);
  const minimum = field.min ?? 0;

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => setIsAdmin(canEditCodeClient()), []);
  const children = (field.children ?? []).filter((c) => !c.hidden || isAdmin);

  // Stable item keys, so that an open item (and an upload in progress) follows its item when the list
  // is reordered.
  const nextKey = useRef(0);
  const keysRef = useRef<number[]>([]);
  while (keysRef.current.length < items.length) keysRef.current.push(nextKey.current++);
  if (keysRef.current.length > items.length) keysRef.current = keysRef.current.slice(0, items.length);
  // latest props, for callbacks that finish later (media browser, upload)
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onChangeRef = useRef(p.onChange);
  onChangeRef.current = p.onChange;

  const [open, setOpen] = useState<number[]>([]);
  const toggle = (key: number) => setOpen((o) => (o.includes(key) ? o.filter((k) => k !== key) : [...o, key]));

  const commit = (next: RepeaterItem[], keys: number[]) => {
    keysRef.current = keys;
    itemsRef.current = next;
    onChangeRef.current(next);
  };

  const insert = (at: number, item: RepeaterItem) => {
    if (itemsRef.current.length >= limit) return;
    const key = nextKey.current++;
    const next = itemsRef.current.slice();
    const keys = keysRef.current.slice();
    next.splice(at, 0, item);
    keys.splice(at, 0, key);
    setOpen((o) => [...o, key]);
    commit(next, keys);
  };

  const add = () => {
    const item: RepeaterItem = {};
    for (const child of field.children ?? []) item[child.id] = copyValue(child.default);
    insert(itemsRef.current.length, item);
  };

  const remove = (index: number) => {
    if (itemsRef.current.length <= minimum) return;
    commit(
      itemsRef.current.filter((_, i) => i !== index),
      keysRef.current.filter((_, i) => i !== index),
    );
  };

  const move = (index: number, delta: -1 | 1) => {
    const to = index + delta;
    if (to < 0 || to >= itemsRef.current.length) return;
    const swap = <T,>(list: T[]): T[] => {
      const next = list.slice();
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    };
    commit(swap(itemsRef.current), swap(keysRef.current));
  };

  const setChild = (key: number, childId: string, value: FieldValue) => {
    const index = keysRef.current.indexOf(key);
    if (index === -1) return; // removed meanwhile
    const next = itemsRef.current.slice();
    next[index] = { ...next[index], [childId]: value };
    commit(next, keysRef.current);
  };

  // Canvas click on an item child ("<id>.$<n>.<childId>"): open that item, focus and highlight the child.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [target, setTarget] = useState<{ path: string } | null>(null);
  const reveal = useCallback(
    (fieldId: string) => {
      const path = parseRepeaterPath(fieldId);
      if (!path || path.repeaterId !== field.id || path.index === null) return;
      const key = keysRef.current[path.index];
      if (key === undefined) return;
      lastSelection = null;
      setOpen((o) => (o.includes(key) ? o : [...o, key]));
      setTarget({ path: fieldId });
    },
    [field.id],
  );

  useEffect(() => {
    const onSelect = (ev: Event) => {
      const fieldId = (ev as CustomEvent<{ fieldId?: string }>).detail?.fieldId;
      if (fieldId) reveal(fieldId);
    };
    window.addEventListener(CHS_EVENTS.selectField, onSelect);
    if (lastSelection && Date.now() - lastSelection.at < SELECTION_TTL_MS) reveal(lastSelection.fieldId);
    return () => window.removeEventListener(CHS_EVENTS.selectField, onSelect);
  }, [reveal]);

  useEffect(() => {
    if (!target) return;
    // after the panel has scrolled to and focused the list itself
    const focus = setTimeout(() => {
      const el = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[data-field-id]') ?? []).find(
        (node) => node.getAttribute('data-field-id') === target.path,
      );
      if (!el) return;
      if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.querySelector<HTMLElement>('input, textarea, select')?.focus();
    }, 30);
    const clear = setTimeout(() => setTarget(null), ITEM_HIGHLIGHT_MS);
    return () => {
      clearTimeout(focus);
      clearTimeout(clear);
    };
  }, [target]);

  /** Author SVGs of an icon child across the default items. */
  const svgDefaultsFor = (child: FieldDef): unknown[] => {
    const defaults = (Array.isArray(field.default) ? field.default : []) as RepeaterItem[];
    return [child.default, ...defaults.map((d) => d[child.id])].map((v) => asObject<IconValue>(v).svg);
  };

  return (
    <FieldShell {...p}>
      <div ref={containerRef} className="space-y-2" data-testid="repeater-editor">
        {items.length === 0 && <p className={hintCls}>No items: the list is not shown on the page.</p>}
        {items.map((item, index) => {
          const key = keysRef.current[index];
          const isOpen = open.includes(key);
          const n = index + 1;
          return (
            <div key={key} data-testid="repeater-item" className="rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-2 py-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(key)}
                  className="min-w-0 flex-1 truncate text-left text-xs font-medium text-gray-700 dark:text-gray-200"
                >
                  <span aria-hidden="true" className="mr-1 text-gray-400">
                    {isOpen ? '▾' : '▸'}
                  </span>
                  Item {n}
                  <span className="ml-1 font-normal text-gray-400">{itemSummary(children, item)}</span>
                </button>
                <button type="button" className={itemBtnCls} aria-label={`Move item ${n} up`} title="Move up" disabled={index === 0} onClick={() => move(index, -1)}>
                  ↑
                </button>
                <button type="button" className={itemBtnCls} aria-label={`Move item ${n} down`} title="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                  ↓
                </button>
                <button type="button" className={itemBtnCls} aria-label={`Duplicate item ${n}`} title="Duplicate" disabled={items.length >= limit} onClick={() => insert(index + 1, copyValue(item))}>
                  ⧉
                </button>
                <button type="button" className={itemBtnCls} aria-label={`Remove item ${n}`} title="Remove" disabled={items.length <= minimum} onClick={() => remove(index)}>
                  ✕
                </button>
              </div>
              {isOpen && (
                <div className="space-y-3 p-2">
                  {children.map((child) => {
                    const path = `${field.id}.$${index}.${child.id}`;
                    if (child.type === 'repeater') {
                      return (
                        <p key={child.id} className={hintCls}>
                          {child.label}: nested lists cannot be edited.
                        </p>
                      );
                    }
                    return (
                      <FieldEditor
                        key={child.id}
                        field={{ ...child, id: path }}
                        value={Object.prototype.hasOwnProperty.call(item, child.id) ? item[child.id] : child.default}
                        onChange={(value) => setChild(key, child.id, value)}
                        highlight={target?.path === path}
                        hideReset
                        svgDefaults={child.type === 'icon' ? svgDefaultsFor(child) : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex items-center justify-between gap-2">
          <button type="button" className={btnCls} disabled={items.length >= limit} onClick={add}>
            Add item
          </button>
          <span className={hintCls}>
            {items.length} of {limit} items{minimum > 0 ? ` (at least ${minimum})` : ''}
          </span>
        </div>
      </div>
    </FieldShell>
  );
}

/** Dispatches to the editor for field.type. */
export function FieldEditor(props: FieldEditorProps) {
  switch (props.field.type) {
    case 'text':
      return <TextEditor {...props} />;
    case 'textarea':
      return <TextareaEditor {...props} />;
    case 'richtext':
      return <RichTextEditor {...props} />;
    case 'link':
      return <LinkEditor {...props} />;
    case 'image':
      return <ImageEditor {...props} withAlt />;
    case 'bgImage':
      return <ImageEditor {...props} withAlt={false} />;
    case 'video':
      return <VideoEditor {...props} />;
    case 'embed':
      return <EmbedEditor {...props} />;
    case 'icon':
      return <IconEditor {...props} />;
    case 'color':
      return <ColorEditor {...props} />;
    case 'repeater':
      return <RepeaterEditor {...props} />;
    default:
      return null;
  }
}

export {
  TextEditor,
  TextareaEditor,
  RichTextEditor,
  LinkEditor,
  ImageEditor,
  VideoEditor,
  EmbedEditor,
  IconEditor,
  ColorEditor,
  RepeaterEditor,
};
