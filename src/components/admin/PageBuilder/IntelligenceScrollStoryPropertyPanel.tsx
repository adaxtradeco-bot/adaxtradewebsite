'use client';

import React, { useMemo, useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { MediaUpload } from '@/components/ui/MediaUpload';
import { IconButton, type IconConfig } from '@/components/ui/IconPicker';
import {
  MAX_CHAPTERS,
  MIN_CHAPTERS,
  STORY_THEME_PALETTES,
  chapterNumberLabel,
  createStoryChapter,
  normalizeStoryData,
  type IntelligenceScrollStoryData,
  type StoryChapter,
  type StoryColors,
  type StoryIcon,
} from '@/lib/page-builder/intelligence-scroll-story';
import { STORY_ICON_NAMES, STORY_ICON_REGISTRY } from '@/lib/page-builder/intelligence-story-icons';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

/* ─── Shared helpers (matches HomeCoverPropertyPanel / TopStripPropertyPanel convention) ─── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const textareaCls = inputCls + ' resize-none';

function Collapsible({
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <Toggle value={value} onChange={onChange} label={label} />
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} — ${value}${unit}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </Field>
  );
}

/** Colour input that can be reset to "use the theme default" (value undefined). */
function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (v: string | undefined) => void;
}) {
  const swatch = /^#[0-9a-fA-F]{6}$/.test(value ?? '') ? (value as string) : /^#[0-9a-fA-F]{6}$/.test(fallback) ? fallback : '#000000';
  return (
    <Field label={label}>
      <div className="flex gap-1 items-center">
        <input
          type="color"
          value={swatch}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700 shrink-0"
          aria-label={`${label} picker`}
        />
        <input
          className={inputCls}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value.trim() === '' ? undefined : e.target.value)}
          placeholder={`Theme default (${fallback})`}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-gray-500 hover:text-red-500 px-1 shrink-0"
            title="Reset to theme default"
          >
            ↺
          </button>
        )}
      </div>
    </Field>
  );
}

/* ─── Proof-badge icon editor: Lucide grid or Font Awesome picker ─── */
function IconField({
  value,
  color,
  onChange,
  onColorChange,
}: {
  value: StoryIcon;
  color?: string;
  onChange: (icon: StoryIcon) => void;
  onColorChange: (c: string | undefined) => void;
}) {
  const derivedMode: 'none' | 'lucide' | 'fa' = typeof value === 'string' ? 'lucide' : value ? 'fa' : 'none';
  const [mode, setMode] = useState(derivedMode);
  const [query, setQuery] = useState('');

  const names = useMemo(
    () => STORY_ICON_NAMES.filter((n) => !query.trim() || n.includes(query.trim().toLowerCase())),
    [query]
  );

  const modeBtn = (m: 'none' | 'lucide' | 'fa', text: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        if (m === 'none') onChange(null);
        else if (m === 'lucide' && typeof value !== 'string') onChange('sparkles');
        else if (m === 'fa' && typeof value === 'string') onChange(null);
      }}
      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
        mode === m
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {modeBtn('lucide', 'Icon set')}
        {modeBtn('fa', 'Font Awesome')}
        {modeBtn('none', 'None')}
      </div>

      {mode === 'lucide' && (
        <>
          <input
            className={inputCls}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            aria-label="Search icons"
          />
          <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto p-1 border border-gray-200 dark:border-gray-600 rounded-md">
            {names.map((name) => {
              const Icon = STORY_ICON_REGISTRY[name];
              const selected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={name}
                  aria-pressed={selected}
                  onClick={() => onChange(name)}
                  className={`flex items-center justify-center p-1.5 rounded-md text-gray-700 dark:text-gray-200 ${
                    selected ? 'bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            {names.length === 0 && (
              <p className="col-span-8 text-xs text-gray-500 py-2 text-center">No icons match “{query}”.</p>
            )}
          </div>
        </>
      )}

      {mode === 'fa' && (
        <IconButton
          value={typeof value === 'object' && value ? (value as IconConfig) : undefined}
          onChange={(icon) => onChange(icon ?? null)}
          placeholder="Choose a Font Awesome icon"
        />
      )}

      {mode !== 'none' && (
        <ColorField label="Icon Color" value={color} fallback="inherits text colour" onChange={onColorChange} />
      )}
    </div>
  );
}

const POSITION_PRESETS = ['center', 'left center', 'right center', 'top', 'bottom', '30% 50%', '70% 50%'];

/* ─── One chapter card ─── */
function ChapterCard({
  chapter,
  index,
  total,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: {
  chapter: StoryChapter;
  index: number;
  total: number;
  onChange: (patch: Partial<StoryChapter>) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };
  const patchImage = (patch: Partial<StoryChapter['image']>) => onChange({ image: { ...chapter.image, ...patch } });
  const patchProof = (patch: Partial<StoryChapter['proof']>) => onChange({ proof: { ...chapter.proof, ...patch } });
  const patchCta = (patch: Partial<StoryChapter['cta']>) => onChange({ cta: { ...chapter.cta, ...patch } });

  const iconBtn = 'text-xs text-gray-500 hover:text-blue-500 disabled:opacity-30 px-1';

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400 mr-2">{chapterNumberLabel(chapter, index)}</span>
          {chapter.name || 'Untitled chapter'}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <button type="button" aria-label="Move chapter up" className={iconBtn} disabled={index === 0} onClick={stop(() => onMove(-1))}>
            ↑
          </button>
          <button
            type="button"
            aria-label="Move chapter down"
            className={iconBtn}
            disabled={index === total - 1}
            onClick={stop(() => onMove(1))}
          >
            ↓
          </button>
          <button
            type="button"
            aria-label="Duplicate chapter"
            className={iconBtn}
            disabled={total >= MAX_CHAPTERS}
            onClick={stop(onDuplicate)}
          >
            ⧉
          </button>
          <button
            type="button"
            aria-label="Remove chapter"
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-30 px-1"
            disabled={total <= MIN_CHAPTERS}
            onClick={stop(onRemove)}
          >
            ✕
          </button>
        </span>
      </div>

      {open && (
        <div className="p-3 space-y-3 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-3 gap-2">
            <Field label="Number" hint="Blank = auto">
              <input className={inputCls} value={chapter.number ?? ''} onChange={(e) => onChange({ number: e.target.value })} placeholder="01" />
            </Field>
            <div className="col-span-2">
              <Field label="Name (label + navigation)">
                <input className={inputCls} value={chapter.name} onChange={(e) => onChange({ name: e.target.value })} />
              </Field>
            </div>
          </div>

          <Field label="Title (one line per row)">
            <textarea className={textareaCls} rows={2} value={chapter.title} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={textareaCls} rows={4} value={chapter.text} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Text colour over the image" hint="Switch to Light on dark photos, Dark on light ones.">
            <select className={inputCls} value={chapter.tone} onChange={(e) => onChange({ tone: e.target.value as StoryChapter['tone'] })}>
              <option value="default">Default (section colours)</option>
              <option value="light">Light text</option>
              <option value="dark">Dark text</option>
            </select>
          </Field>

          {/* Image */}
          <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Image</span>
            <MediaUpload
              src={chapter.image.src}
              width={240}
              height={160}
              objectFit="cover"
              onMediaChange={(src) => patchImage({ src })}
              uploadButtonText="Upload / change image"
              acceptedTypes="image/*"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Full-bleed backdrop — 1536×1024 or larger. Keep the subject away from the copy side.
            </p>
            <Field label="Alt text">
              <input className={inputCls} value={chapter.image.alt} onChange={(e) => patchImage({ alt: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Focus · desktop">
                <input
                  className={inputCls}
                  list="iss-positions"
                  value={chapter.image.objectPosition ?? ''}
                  onChange={(e) => patchImage({ objectPosition: e.target.value })}
                  placeholder="center"
                />
              </Field>
              <Field label="Focus · mobile">
                <input
                  className={inputCls}
                  list="iss-positions"
                  value={chapter.image.mobileObjectPosition ?? ''}
                  onChange={(e) => patchImage({ mobileObjectPosition: e.target.value })}
                  placeholder="right center"
                />
              </Field>
            </div>
            <datalist id="iss-positions">
              {POSITION_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            <Field label="Mobile image (optional)" hint="Used under 760px wide instead of the image above.">
              <MediaUpload
                src={chapter.image.mobileSrc ?? ''}
                width={140}
                height={180}
                objectFit="cover"
                onMediaChange={(src) => patchImage({ mobileSrc: src })}
                uploadButtonText="Upload mobile image"
                acceptedTypes="image/*"
              />
            </Field>
          </div>

          {/* Proof badge */}
          <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
            <ToggleRow label="Proof badge (icon + bold line)" value={chapter.proof.enabled} onChange={(v) => patchProof({ enabled: v })} />
            {chapter.proof.enabled && (
              <>
                <Field label="Text">
                  <input className={inputCls} value={chapter.proof.text} onChange={(e) => patchProof({ text: e.target.value })} />
                </Field>
                <Field label="Icon">
                  <IconField
                    value={chapter.proof.icon}
                    color={chapter.proof.iconColor}
                    onChange={(icon) => patchProof({ icon })}
                    onColorChange={(c) => patchProof({ iconColor: c })}
                  />
                </Field>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
            <ToggleRow label="Call-to-action button" value={chapter.cta.enabled} onChange={(v) => patchCta({ enabled: v })} />
            {chapter.cta.enabled && (
              <>
                <Field label="Button text">
                  <input className={inputCls} value={chapter.cta.text} onChange={(e) => patchCta({ text: e.target.value })} />
                </Field>
                <Field label="Link">
                  <input
                    className={inputCls}
                    value={chapter.cta.href}
                    onChange={(e) => patchCta({ href: e.target.value })}
                    placeholder="https://… or /page or #section"
                  />
                </Field>
                <ToggleRow label="Open in a new tab" value={chapter.cta.openInNewTab === true} onChange={(v) => patchCta({ openInNewTab: v })} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main panel ─── */
export function IntelligenceScrollStoryPropertyPanel({ section, onUpdate }: Props) {
  const raw = section.data as any;
  const d = useMemo(() => normalizeStoryData(raw), [raw]);

  const commit = (next: IntelligenceScrollStoryData) => onUpdate({ data: next as any });
  const setGroup = <K extends keyof IntelligenceScrollStoryData>(key: K, patch: Partial<IntelligenceScrollStoryData[K]>) =>
    commit({ ...d, [key]: { ...(d[key] as object), ...(patch as object) } } as IntelligenceScrollStoryData);

  const setChapters = (chapters: StoryChapter[]) => commit({ ...d, chapters });
  const patchChapter = (i: number, patch: Partial<StoryChapter>) =>
    setChapters(d.chapters.map((c, ci) => (ci === i ? { ...c, ...patch } : c)));
  const moveChapter = (i: number, dir: -1 | 1) => {
    const target = i + dir;
    if (target < 0 || target >= d.chapters.length) return;
    const next = [...d.chapters];
    [next[i], next[target]] = [next[target], next[i]];
    setChapters(next);
  };
  const duplicateChapter = (i: number) => {
    if (d.chapters.length >= MAX_CHAPTERS) return;
    const copy: StoryChapter = {
      ...createStoryChapter(i),
      ...JSON.parse(JSON.stringify(d.chapters[i])),
      id: createStoryChapter(i).id,
      number: '',
    };
    const next = [...d.chapters];
    next.splice(i + 1, 0, copy);
    setChapters(next);
  };
  const removeChapter = (i: number) => {
    if (d.chapters.length <= MIN_CHAPTERS) return;
    setChapters(d.chapters.filter((_, ci) => ci !== i));
  };
  const addChapter = () => {
    if (d.chapters.length >= MAX_CHAPTERS) return;
    setChapters([...d.chapters, createStoryChapter(d.chapters.length)]);
  };

  const palette = STORY_THEME_PALETTES[d.colors.theme === 'dark' ? 'dark' : 'light'];
  const setColor = (key: keyof Omit<StoryColors, 'theme'>, v: string | undefined) => setGroup('colors', { [key]: v } as Partial<StoryColors>);

  return (
    <div className="space-y-4">
      {/* ── Chapters ── */}
      <Collapsible title="Chapters" badge={`${d.chapters.length}/${MAX_CHAPTERS}`} defaultOpen>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Each chapter is one image + its copy. They hand over to each other as the visitor scrolls. Add as many as
          you need.
        </p>
        {d.chapters.map((chapter, i) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            index={i}
            total={d.chapters.length}
            onChange={(patch) => patchChapter(i, patch)}
            onMove={(dir) => moveChapter(i, dir)}
            onDuplicate={() => duplicateChapter(i)}
            onRemove={() => removeChapter(i)}
          />
        ))}
        <button
          type="button"
          onClick={addChapter}
          disabled={d.chapters.length >= MAX_CHAPTERS}
          className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-500"
        >
          + Add Chapter
        </button>
      </Collapsible>

      {/* ── Top bar ── */}
      <Collapsible title="Top Line (overline)">
        <ToggleRow label="Show top line" value={d.overline.enabled} onChange={(v) => setGroup('overline', { enabled: v })} />
        {d.overline.enabled && (
          <>
            <Field label="Left text">
              <input className={inputCls} value={d.overline.leftText} onChange={(e) => setGroup('overline', { leftText: e.target.value })} />
            </Field>
            <Field label="Right text (brand)">
              <input className={inputCls} value={d.overline.rightText} onChange={(e) => setGroup('overline', { rightText: e.target.value })} />
            </Field>
            <Field label="Right text link (optional)">
              <input
                className={inputCls}
                value={d.overline.rightHref ?? ''}
                onChange={(e) => setGroup('overline', { rightHref: e.target.value })}
                placeholder="https://… or /"
              />
            </Field>
            <ToggleRow label="Arrow icon" value={d.overline.showArrow} onChange={(v) => setGroup('overline', { showArrow: v })} />
          </>
        )}
      </Collapsible>

      {/* ── Navigation / footer ── */}
      <Collapsible title="Navigation & Footer">
        <ToggleRow label="Chapter navigation" value={d.navigation.enabled} onChange={(v) => setGroup('navigation', { enabled: v })} />
        {d.navigation.enabled && (
          <>
            <Field label="Style">
              <select
                className={inputCls}
                value={d.navigation.style}
                onChange={(e) => setGroup('navigation', { style: e.target.value as 'tabs' | 'dots' })}
              >
                <option value="tabs">Tabs — number + name</option>
                <option value="dots">Dots — compact</option>
              </select>
            </Field>
            <ToggleRow label="Show chapter numbers" value={d.navigation.showNumbers} onChange={(v) => setGroup('navigation', { showNumbers: v })} />
            <Field label="Accessible label (screen readers)">
              <input className={inputCls} value={d.navigation.ariaLabel} onChange={(e) => setGroup('navigation', { ariaLabel: e.target.value })} />
            </Field>
          </>
        )}

        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-3">
          <ToggleRow label="Direction label" value={d.direction.enabled} onChange={(v) => setGroup('direction', { enabled: v })} />
          {d.direction.enabled && (
            <>
              <Field label="Text">
                <input className={inputCls} value={d.direction.text} onChange={(e) => setGroup('direction', { text: e.target.value })} />
              </Field>
              <ToggleRow label="Arrow icon" value={d.direction.showArrow} onChange={(v) => setGroup('direction', { showArrow: v })} />
            </>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-3">
          <ToggleRow label="Progress bar" value={d.progress.enabled} onChange={(v) => setGroup('progress', { enabled: v })} />
          {d.progress.enabled && (
            <Range label="Thickness" value={d.progress.height} min={1} max={12} unit="px" onChange={(v) => setGroup('progress', { height: v })} />
          )}
        </div>
      </Collapsible>

      {/* ── Layout ── */}
      <Collapsible title="Layout & Typography">
        <Field label="Copy side">
          <select
            className={inputCls}
            value={d.layout.copyPosition}
            onChange={(e) => setGroup('layout', { copyPosition: e.target.value as 'start' | 'end' })}
          >
            <option value="start">Start (left in LTR)</option>
            <option value="end">End (right in LTR)</option>
          </select>
        </Field>
        <Range label="Copy width" value={d.layout.copyWidth} min={280} max={760} step={10} unit="px" onChange={(v) => setGroup('layout', { copyWidth: v })} />
        <Range label="Title size" value={d.layout.titleSize} min={24} max={96} unit="px" onChange={(v) => setGroup('layout', { titleSize: v })} />
        <Range label="Description size" value={d.layout.bodySize} min={11} max={24} unit="px" onChange={(v) => setGroup('layout', { bodySize: v })} />
        <Field label="Image fit">
          <select
            className={inputCls}
            value={d.layout.imageFit}
            onChange={(e) => setGroup('layout', { imageFit: e.target.value as 'cover' | 'contain' })}
          >
            <option value="cover">Cover — fill the screen</option>
            <option value="contain">Contain — show the whole image</option>
          </select>
        </Field>
        <Range
          label="Minimum stage height"
          value={d.layout.stageMinHeight}
          min={360}
          max={1200}
          step={10}
          unit="px"
          onChange={(v) => setGroup('layout', { stageMinHeight: v })}
        />
        <Range
          label="Scroll length per chapter"
          value={d.layout.scrollPerChapterVh}
          min={30}
          max={200}
          step={5}
          unit="vh"
          onChange={(v) => setGroup('layout', { scrollPerChapterVh: v })}
        />
        <Range
          label="Header offset"
          value={d.layout.headerOffset}
          min={0}
          max={200}
          unit="px"
          onChange={(v) => setGroup('layout', { headerOffset: v })}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
          Pins the stage below a fixed site header so it isn’t covered.
        </p>
        <Field label="Text after the chapter number">
          <input
            className={inputCls}
            value={d.layout.chapterSeparator}
            onChange={(e) => setGroup('layout', { chapterSeparator: e.target.value })}
            placeholder=" /"
          />
        </Field>
      </Collapsible>

      {/* ── Motion ── */}
      <Collapsible title="Motion">
        <Field label="Image reveal">
          <select
            className={inputCls}
            value={d.motion.reveal}
            onChange={(e) => setGroup('motion', { reveal: e.target.value as IntelligenceScrollStoryData['motion']['reveal'] })}
          >
            <option value="right">Curtain from the right</option>
            <option value="left">Curtain from the left</option>
            <option value="up">Wipe upward</option>
            <option value="down">Wipe downward</option>
            <option value="fade">Cross-fade</option>
          </select>
        </Field>
        <Range label="Image zoom" value={d.motion.imageZoom} min={1} max={1.4} step={0.01} unit="×" onChange={(v) => setGroup('motion', { imageZoom: v })} />
        <Range label="Copy slide distance" value={d.motion.copySlide} min={0} max={160} unit="px" onChange={(v) => setGroup('motion', { copySlide: v })} />
        <ToggleRow
          label="Plain stacked layout when visitor prefers reduced motion"
          value={d.motion.respectReducedMotion}
          onChange={(v) => setGroup('motion', { respectReducedMotion: v })}
        />
      </Collapsible>

      {/* ── Colours ── */}
      <Collapsible title="Colours">
        <Field label="Theme">
          <select
            className={inputCls}
            value={d.colors.theme}
            onChange={(e) => setGroup('colors', { theme: e.target.value as StoryColors['theme'] })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto — follow the site’s dark mode</option>
          </select>
        </Field>
        <ColorField label="Background" value={d.colors.background} fallback={palette.background} onChange={(v) => setColor('background', v)} />
        <ColorField label="Text" value={d.colors.text} fallback={palette.text} onChange={(v) => setColor('text', v)} />
        <ColorField label="Muted text" value={d.colors.mutedText} fallback={palette.mutedText} onChange={(v) => setColor('mutedText', v)} />
        <ColorField label="Accent (buttons, hover, progress)" value={d.colors.accent} fallback={palette.accent} onChange={(v) => setColor('accent', v)} />
        <ColorField label="Text on accent" value={d.colors.accentText} fallback={palette.accentText} onChange={(v) => setColor('accentText', v)} />
        <ColorField label="Lines & borders" value={d.colors.border} fallback={palette.border} onChange={(v) => setColor('border', v)} />
      </Collapsible>

      {/* ── Accessibility ── */}
      <Collapsible title="Accessibility">
        <Field label="Section label (screen readers)">
          <input className={inputCls} value={d.ariaLabel} onChange={(e) => commit({ ...d, ariaLabel: e.target.value })} />
        </Field>
      </Collapsible>
    </div>
  );
}
