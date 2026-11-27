'use client';

/**
 * Import wizard — mapping preview (spec §11.2 step 2).
 *
 * Renders the analysed HTML in a sandboxed iframe (allow-same-origin, NO allow-scripts, so author
 * scripts and handlers cannot run). The parent reads iframe.contentDocument to outline [data-cf]
 * elements and to attach click/hover listeners. Clicking a mapped element selects its field;
 * clicking any other element asks the wizard to map it (the clicked element is translated to the
 * same element in the detect root through a path of child indexes from <body>).
 *
 * Tailwind sections have no CSS until compiled, so `tailwind` runs the admin compile for the preview
 * and puts the resulting scope on <body>.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CompileRequest, CompileResult } from '@/lib/custom-html/types';

export interface MappingPreviewProps {
  /** detect root (body) carrying data-cf markers */
  root: Element;
  /** bump after the root was mutated (markElementAsField / unmarkField) */
  version: number;
  css: string;
  externalStylesheets: string[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  /** element of the detect root that the user clicked (not yet mapped) */
  onMarkElement: (el: Element) => void;
  /** set for Tailwind sections; `request` must keep its identity while the source is unchanged */
  tailwind?: { request: CompileRequest; compile: (req: CompileRequest) => Promise<CompileResult> };
}

const MARK_CSS =
  '[data-cf-item]{outline:1px solid #8b5cf6 !important;outline-offset:4px}' +
  '[data-cf]{outline:2px dashed #3b82f6 !important;outline-offset:2px;cursor:pointer}' +
  '[data-cf-hover]{outline:2px dotted #f59e0b !important;outline-offset:2px;cursor:copy}' +
  '[data-cf][data-cf-hover]{cursor:pointer}';

function isHttpUrl(u: string): boolean {
  return /^https?:\/\//i.test(u.trim());
}

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function buildPreviewDoc(html: string, css: string, externalStylesheets: string[], scope?: string): string {
  const links = externalStylesheets
    .filter(isHttpUrl)
    .map((u) => `<link rel="stylesheet" href="${attr(u.trim())}">`)
    .join('');
  const safeCss = css.replace(/<\/style/gi, '<\\/style');
  return (
    '<!doctype html><html><head><meta charset="utf-8"><base target="_blank">' +
    links +
    `<style>${safeCss}</style><style>${MARK_CSS}</style></head>` +
    `<body${scope ? ` data-chs="${attr(scope)}"` : ''}>${html}</body></html>`
  );
}

/** Child-index path from `body` down to `el` (elements only). */
export function pathFromBody(el: Element, body: Element): number[] | null {
  const path: number[] = [];
  let cur: Element | null = el;
  while (cur && cur !== body) {
    const parent: Element | null = cur.parentElement;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.children, cur));
    cur = parent;
  }
  return cur === body ? path : null;
}

export function resolvePath(root: Element, path: number[]): Element | null {
  let cur: Element = root;
  for (const i of path) {
    const next = cur.children[i];
    if (!next) return null;
    cur = next;
  }
  return cur;
}

export function MappingPreview({
  root,
  version,
  css,
  externalStylesheets,
  selectedFieldId,
  onSelectField,
  onMarkElement,
  tailwind,
}: MappingPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [height, setHeight] = useState(240);
  const [compiled, setCompiled] = useState<{ request: CompileRequest; result?: CompileResult; error?: string } | null>(null);

  const cb = useRef({ root, onSelectField, onMarkElement, selectedFieldId });
  cb.current = { root, onSelectField, onMarkElement, selectedFieldId };

  const request = tailwind?.request;
  const compileRef = useRef(tailwind?.compile);
  compileRef.current = tailwind?.compile;
  useEffect(() => {
    if (!request || !compileRef.current) return;
    let cancelled = false;
    compileRef.current(request).then(
      (result) => !cancelled && setCompiled({ request, result }),
      (e) => !cancelled && setCompiled({ request, error: e instanceof Error ? e.message : 'compile failed' }),
    );
    return () => {
      cancelled = true;
    };
  }, [request]);
  const current = request && compiled?.request === request ? compiled : null;
  const previewCss = current?.result ? current.result.cssScoped : css;
  const scope = current?.result?.scope;

  const srcDoc = useMemo(
    () => buildPreviewDoc(root.innerHTML, previewCss, externalStylesheets, scope),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [root, version, previewCss, externalStylesheets, scope],
  );

  const applySelection = useCallback((doc: Document | null | undefined) => {
    if (!doc || !doc.head) return;
    let style = doc.getElementById('chs-selected') as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement('style');
      style.id = 'chs-selected';
      doc.head.appendChild(style);
    }
    const id = cb.current.selectedFieldId?.replace(/["\\]/g, '');
    // a repeater is selected through its items (its container may carry another field)
    style.textContent = id
      ? `[data-cf="${id}"],[data-cf-item="${id}"]{outline:3px solid #2563eb !important;outline-offset:2px;background-color:rgba(37,99,235,.08)}`
      : '';
  }, []);

  useEffect(() => {
    applySelection(iframeRef.current?.contentDocument);
  }, [selectedFieldId, applySelection, srcDoc]);

  useEffect(() => () => cleanupRef.current?.(), []);

  const handleLoad = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    let doc: Document | null = null;
    try {
      doc = iframeRef.current?.contentDocument ?? null;
    } catch {
      doc = null;
    }
    if (!doc || !doc.body) return;
    const body = doc.body;
    applySelection(doc);

    const measure = () => {
      const h = Math.max(doc!.body.scrollHeight + 24, 120);
      const max = Math.round((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.7);
      setHeight(Math.min(h, max));
    };
    measure();

    let hovered: Element | null = null;
    const clearHover = () => {
      hovered?.removeAttribute('data-cf-hover');
      hovered = null;
    };
    const onOver = (e: Event) => {
      const t = e.target as Element | null;
      if (!t || t === body || t === doc!.documentElement) return clearHover();
      if (hovered === t) return;
      clearHover();
      hovered = t;
      t.setAttribute('data-cf-hover', '');
    };
    const onClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.target as Element | null;
      if (!t || t === body || t === doc!.documentElement) return;
      const item = t.closest('[data-cf-item]');
      const marked = t.closest('[data-cf]');
      // inside a repeater item only markers within the item count; anything else there can be mapped
      if (marked && (!item || item.contains(marked))) {
        const id = marked.getAttribute('data-cf');
        if (id) cb.current.onSelectField(id);
        return;
      }
      if (item && t === item) {
        const id = item.getAttribute('data-cf-item');
        if (id) cb.current.onSelectField(id);
        return;
      }
      t.removeAttribute('data-cf-hover');
      const path = pathFromBody(t, body);
      const target = path ? resolvePath(cb.current.root, path) : null;
      if (target) cb.current.onMarkElement(target);
    };

    body.addEventListener('mouseover', onOver);
    body.addEventListener('mouseleave', clearHover);
    doc.addEventListener('click', onClick, true);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(body);
    cleanupRef.current = () => {
      body.removeEventListener('mouseover', onOver);
      body.removeEventListener('mouseleave', clearHover);
      doc!.removeEventListener('click', onClick, true);
      ro?.disconnect();
    };
  }, [applySelection]);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Mapping preview"
        data-testid="mapping-preview"
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
        onLoad={handleLoad}
        dir="ltr"
        className="w-full rounded-md border border-gray-200 bg-white dark:border-gray-600"
        style={{ height, maxHeight: '70vh' }}
      />
      {request && !current && <p className="text-xs text-gray-500 dark:text-gray-400">Compiling styles for the preview…</p>}
      {current?.error && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          The Tailwind styles could not be compiled for the preview: {current.error}
        </p>
      )}
    </>
  );
}
