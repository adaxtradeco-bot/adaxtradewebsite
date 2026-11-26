'use client';

/**
 * Custom HTML section — one value editor per FieldType (phase 1).
 * Spec: docs/custom-html-section-spec.md §11.3
 */
import React, { useId, useRef, useState } from 'react';
import { safeEmbedUrl } from '@/lib/custom-html/escape';
import { sanitizeSvg } from '@/lib/sanitize';
import type {
  ColorValue,
  FieldDef,
  FieldValue,
  IconValue,
  LinkValue,
  MediaValue,
} from '@/lib/custom-html/types';

export interface FieldEditorProps {
  field: FieldDef;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  /** Briefly true after the canvas selected this field. */
  highlight?: boolean;
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const btnCls =
  'px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50';
const subLabelCls = 'block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1';
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
        <button
          type="button"
          onClick={() => onChange(field.default)}
          disabled={isDefault}
          aria-label={`Reset ${field.label}`}
          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-default"
        >
          Reset
        </button>
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
  const clean = svg ? sanitizeSvg(svg) : '';
  return (
    <FieldShell {...p} labelFor={id}>
      <textarea id={id} rows={4} className={`${inputCls} resize-y font-mono text-xs`} value={svg} placeholder="<svg …>…</svg>" onChange={(e) => p.onChange({ ...v, svg: e.target.value })} />
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

function ColorEditor(p: FieldEditorProps) {
  const base = useId();
  const v = asObject<ColorValue>(p.value);
  const value = asString(v.value);
  const pickerValue = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000';
  return (
    <FieldShell {...p} labelFor={`${base}-text`}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${p.field.label} picker`}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-transparent p-0.5"
          value={pickerValue}
          onChange={(e) => p.onChange({ ...v, value: e.target.value })}
        />
        <input id={`${base}-text`} type="text" className={inputCls} value={value} placeholder="#1a73e8" onChange={(e) => p.onChange({ ...v, value: e.target.value })} />
      </div>
    </FieldShell>
  );
}

function RepeaterPlaceholder(p: FieldEditorProps) {
  return (
    <FieldShell {...p}>
      <p className="text-xs italic text-gray-500 dark:text-gray-400">Repeater editing is coming in phase 2.</p>
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
      return <RepeaterPlaceholder {...props} />;
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
  RepeaterPlaceholder,
};
