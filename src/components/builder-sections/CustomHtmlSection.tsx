'use client';

/**
 * Custom HTML section renderer (spec §10, §7.3 "When it runs").
 *
 * Markup:
 *   <div data-chs={scope} data-chs-instance={instanceId} dir={dir}>
 *     <style>{css}</style>
 *     <div ref dangerouslySetInnerHTML={{ __html: html }} />
 *   </div>
 */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { parseCustomHtmlData } from '@/lib/custom-html/schema';
import { renderCustomHtml } from '@/lib/custom-html/render';
import { runCustomHtmlScript } from '@/lib/custom-html/runtime';
import { djb2 } from '@/lib/custom-html/hash';
import { CHS_EVENTS, hoverCustomHtmlField, selectCustomHtmlField } from '@/lib/custom-html/client-role';
import type { RuntimeHandle } from '@/lib/custom-html/types';

export interface CustomHtmlSectionProps {
  data: unknown;
  style?: Record<string, unknown>;
  isBuilder?: boolean;
  sectionId?: string;
}

const BUILDER_RERUN_DEBOUNCE_MS = 600;
const RTL_LANGS = ['ar', 'fa'];
const HIGHLIGHT_ATTR = 'data-chs-highlight';
const HIGHLIGHT_CSS = `[${HIGHLIGHT_ATTR}]{outline:2px solid #2563eb !important;outline-offset:2px !important}`;

function isRtlLang(lang: string | null | undefined): boolean {
  if (!lang) return false;
  const primary = lang.toLowerCase().split(/[-_]/)[0];
  return RTL_LANGS.indexOf(primary) !== -1;
}

/** 'auto' → rtl when <html lang> or the URL's first path segment is ar/fa. */
function detectAutoDir(): 'rtl' | 'ltr' {
  if (typeof document === 'undefined') return 'ltr';
  if (isRtlLang(document.documentElement.getAttribute('lang'))) return 'rtl';
  try {
    const seg = window.location.pathname.split('/').filter(Boolean)[0];
    if (isRtlLang(seg)) return 'rtl';
  } catch {
    /* ignore */
  }
  return 'ltr';
}

/**
 * Public payloads have template.css / template.jsSource stripped (spec §8.5) while the strict schema
 * requires them as strings, so default the two admin-only keys before validating.
 */
function normalizeForParse(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data;
  const d = data as Record<string, unknown>;
  const t = d.template;
  if (typeof t !== 'object' || t === null || Array.isArray(t)) return data;
  const tpl = t as Record<string, unknown>;
  if (typeof tpl.css === 'string' && typeof tpl.jsSource === 'string') return data;
  return {
    ...d,
    template: {
      ...tpl,
      css: typeof tpl.css === 'string' ? tpl.css : '',
      jsSource: typeof tpl.jsSource === 'string' ? tpl.jsSource : '',
    },
  };
}

function ensureExternalStylesheets(urls: string[]): void {
  if (typeof document === 'undefined') return;
  for (const href of urls) {
    if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) continue;
    const exists = Array.from(document.head.querySelectorAll('link[data-chs-ext]')).some(
      (l) => l.getAttribute('data-chs-ext') === href,
    );
    if (exists) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-chs-ext', href);
    document.head.appendChild(link);
  }
}

export default function CustomHtmlSection({ data, isBuilder = false, sectionId = '' }: CustomHtmlSectionProps) {
  const reactId = useId();
  // Stable per mount, unique per instance, and identical between SSR and hydration.
  const instanceId = `${sectionId || 'chs'}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const rootRef = useRef<HTMLDivElement | null>(null);

  const parsed = useMemo(() => parseCustomHtmlData(normalizeForParse(data)), [data]);
  const valid = parsed.success ? parsed.data : null;

  const rendered = useMemo(
    () => (valid ? renderCustomHtml(valid, { builder: isBuilder }) : { html: '', css: '' }),
    [valid, isBuilder],
  );
  const htmlKey = useMemo(() => djb2(rendered.html), [rendered.html]);

  const templateDir = valid?.template.dir ?? 'ltr';
  const [autoDir, setAutoDir] = useState<'rtl' | 'ltr'>('ltr');
  useEffect(() => {
    if (templateDir === 'auto') setAutoDir(detectAutoDir());
  }, [templateDir]);
  const dir = templateDir === 'auto' ? autoDir : templateDir;

  const js = valid?.template.js ?? '';
  const externalScripts = valid?.template.externalScripts;
  const externalStylesheets = valid?.template.externalStylesheets;
  const scriptsKey = (externalScripts || []).join('\n');
  const stylesKey = (externalStylesheets || []).join('\n');
  const runInBuilder = !!valid?.runInBuilder;
  const hasValid = !!valid;

  // External stylesheets: appended once to <head>, deduplicated by href.
  useEffect(() => {
    if (!hasValid || !stylesKey) return;
    ensureExternalStylesheets(stylesKey.split('\n'));
  }, [hasValid, stylesKey]);

  // Template JS. Public: once after mount, disposed on unmount. Builder: only with runInBuilder,
  // re-run (debounced) whenever the rendered html changes.
  const rerunKey = isBuilder ? htmlKey : '';
  useEffect(() => {
    if (!hasValid) return;
    if (isBuilder && !runInBuilder) return;
    const scripts = scriptsKey ? scriptsKey.split('\n') : [];
    if (!js && scripts.length === 0) return;

    let cancelled = false;
    let handle: RuntimeHandle | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const start = () => {
      const root = rootRef.current;
      if (!root || cancelled) return;
      runCustomHtmlScript({ instanceId, root, js, externalScripts: scripts })
        .then((h) => {
          if (cancelled) h.dispose();
          else handle = h;
        })
        .catch((e) => console.error('[custom-html] script failed', sectionId, e));
    };

    if (isBuilder) timer = setTimeout(start, BUILDER_RERUN_DEBOUNCE_MS);
    else start();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (handle) {
        handle.dispose();
        handle = null;
      }
    };
  }, [hasValid, isBuilder, runInBuilder, js, scriptsKey, instanceId, sectionId, rerunKey]);

  // Builder only (spec §11): hovering a panel row outlines the matching element(s) here, and
  // hovering a [data-cf] element here is reported to the panel.
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const reportHover = (fieldId: string | null) => {
    if (hoveredRef.current === fieldId) return;
    hoveredRef.current = fieldId;
    hoverCustomHtmlField(sectionId, fieldId);
  };

  useEffect(() => {
    if (!isBuilder) return;
    const onHighlight = (ev: Event) => {
      const detail = (ev as CustomEvent<{ sectionId?: string; fieldId?: string | null }>).detail;
      if (detail && detail.sectionId === sectionId) setHighlightId(detail.fieldId || null);
    };
    window.addEventListener(CHS_EVENTS.highlightField, onHighlight);
    return () => {
      window.removeEventListener(CHS_EVENTS.highlightField, onHighlight);
      setHighlightId(null);
      if (hoveredRef.current !== null) {
        hoveredRef.current = null;
        hoverCustomHtmlField(sectionId, null);
      }
    };
  }, [isBuilder, sectionId]);

  // htmlKey: the content is re-created when the html changes, so the outline must be re-applied.
  const highlightRepeater = !!valid?.fields.some((f) => f.id === highlightId && f.type === 'repeater');
  useEffect(() => {
    const root = rootRef.current;
    if (!isBuilder || !root || !highlightId) return;
    const matched = Array.from(root.querySelectorAll('[data-cf]')).filter((el) => {
      const id = el.getAttribute('data-cf') || '';
      return id === highlightId || (highlightRepeater && id.indexOf(highlightId + '.') === 0);
    });
    matched.forEach((el) => el.setAttribute(HIGHLIGHT_ATTR, ''));
    return () => matched.forEach((el) => el.removeAttribute(HIGHLIGHT_ATTR));
  }, [isBuilder, highlightId, highlightRepeater, htmlKey]);

  if (!valid) {
    if (!isBuilder) return null;
    return (
      <div
        role="alert"
        className="m-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        data-testid="custom-html-invalid"
      >
        Custom HTML section: data is invalid and cannot be rendered.
        {!parsed.success ? ` (${parsed.error.slice(0, 160)})` : ''}
      </div>
    );
  }

  const builderProps = isBuilder
    ? {
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          const target = e.target as Element | null;
          if (!target || typeof target.closest !== 'function') return;
          // Never navigate away from the canvas. The click still bubbles so the section gets selected.
          if (target.closest('a[href]')) e.preventDefault();
          const field = target.closest('[data-cf]');
          if (field && e.currentTarget.contains(field)) {
            const fieldId = field.getAttribute('data-cf');
            if (fieldId) {
              selectCustomHtmlField(sectionId, fieldId);
            }
          }
        },
        onSubmit: (e: React.FormEvent<HTMLDivElement>) => e.preventDefault(),
        onMouseOver: (e: React.MouseEvent<HTMLDivElement>) => {
          const target = e.target as Element | null;
          if (!target || typeof target.closest !== 'function') return;
          const field = target.closest('[data-cf]');
          reportHover(field && e.currentTarget.contains(field) ? field.getAttribute('data-cf') || null : null);
        },
        onMouseLeave: () => reportHover(null),
      }
    : {};

  return (
    <div data-chs={valid.template.scope} data-chs-instance={instanceId} dir={dir} {...builderProps}>
      {isBuilder && highlightId && <style data-chs-highlight-style="">{HIGHLIGHT_CSS}</style>}
      {/* raw text: React would HTML-escape `>` in a text child of <style> during SSR */}
      <style dangerouslySetInnerHTML={{ __html: rendered.css }} />
      <div key={htmlKey} ref={rootRef} dangerouslySetInnerHTML={{ __html: rendered.html }} />
    </div>
  );
}

export { CustomHtmlSection };
