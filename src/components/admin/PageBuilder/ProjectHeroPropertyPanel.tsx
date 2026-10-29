'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { MediaUpload } from '@/components/ui/MediaUpload';
import {
  normalizeProjectHeroData,
  DEFAULT_PROJECT_HERO_ITEM,
  DEFAULT_PROJECT_HERO_BUTTON,
  PROJECT_HERO_ICONS,
} from '@/lib/page-builder/project-hero';
import { getIn, setIn } from './SplitGatewayPropertyPanel';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

type Path = (string | number)[];

/* ─── Shared UI (same look as the other property panels) ─── */
const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Group({ title, badge, defaultOpen = false, children }: { title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
          {title}
          {badge && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{badge}</span>}
        </span>
        <span className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && <div className="p-3 space-y-3 bg-white dark:bg-gray-800">{children}</div>}
    </div>
  );
}

function Switch({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

const BG_TYPES = ['none', 'color', 'gradient', 'image', 'video'].map((v) => ({ value: v, label: v }));
const DIRECTIONS = [
  { value: 'start', label: 'Darkest on the text side' },
  { value: 'end', label: 'Darkest on the opposite side' },
  { value: 'top', label: 'Darkest at the top' },
  { value: 'bottom', label: 'Darkest at the bottom' },
  { value: 'uniform', label: 'Uniform (start opacity)' },
];
const ALIGN = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'end', label: 'End' },
];

/* ─── Main panel ─── */
export function ProjectHeroPropertyPanel({ section, onUpdate }: Props) {
  const raw = (section.data ?? {}) as Record<string, any>;
  const n = normalizeProjectHeroData(raw);
  const set = (path: Path, value: any) => onUpdate({ data: setIn(raw, path, value) });

  /* controls — plain functions (not components) so inputs keep focus while typing */
  const txt = (label: string, path: Path, opts: { placeholder?: string; hint?: string; dir?: 'ltr' | 'rtl' } = {}) => (
    <Field label={label} hint={opts.hint}>
      <input className={inputCls} dir={opts.dir} value={getIn(n, path) ?? ''} placeholder={opts.placeholder} onChange={(e) => set(path, e.target.value)} />
    </Field>
  );
  const area = (label: string, path: Path, rows = 3, hint?: string) => (
    <Field label={label} hint={hint}>
      <textarea className={`${inputCls} resize-y`} rows={rows} value={getIn(n, path) ?? ''} onChange={(e) => set(path, e.target.value)} />
    </Field>
  );
  const sel = (label: string, path: Path, options: { value: string | number; label: string }[]) => (
    <Field label={label}>
      <select
        className={inputCls}
        value={String(getIn(n, path) ?? '')}
        onChange={(e) => set(path, typeof options[0].value === 'number' ? Number(e.target.value) : e.target.value)}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
  const num = (label: string, path: Path, min: number, max: number, step = 1, unit = '') => {
    const v = Number(getIn(n, path) ?? 0);
    return (
      <Field label={`${label}${unit ? ` (${unit})` : ''}`}>
        <div className="flex items-center gap-2">
          <input type="range" aria-label={label} min={min} max={max} step={step} value={v} onChange={(e) => set(path, Number(e.target.value))} className="flex-1 accent-blue-600" />
          <input
            type="number"
            aria-label={`${label} value`}
            min={min}
            max={max}
            step={step}
            value={v}
            onChange={(e) => set(path, Number(e.target.value))}
            className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </Field>
    );
  };
  const col = (label: string, path: Path) => {
    const v: string = getIn(n, path) ?? '';
    const hex = /^#[0-9a-f]{6}$/i.test(v) ? v : '#000000';
    return (
      <Field label={label}>
        <div className="flex gap-1 items-center">
          <input
            type="color"
            aria-label={`${label} picker`}
            value={hex}
            onChange={(e) => set(path, e.target.value)}
            className="w-9 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700 shrink-0"
          />
          <input className={inputCls} value={v} onChange={(e) => set(path, e.target.value)} placeholder="#hex or rgba(...)" />
        </div>
      </Field>
    );
  };
  const tog = (label: string, path: Path) => <Switch label={label} value={!!getIn(n, path)} onChange={(v) => set(path, v)} />;
  const media = (label: string, path: Path, accept: string, w = 240, h = 135) => (
    <Field label={label}>
      <MediaUpload
        src={getIn(n, path) ?? ''}
        width={w}
        height={h}
        objectFit="cover"
        onMediaChange={(src) => set(path, src)}
        uploadButtonText={accept.startsWith('video') ? 'Upload Video' : 'Upload Image'}
        acceptedTypes={accept}
      />
    </Field>
  );

  /* buttons + picker items */
  const buttons = n.content.buttons;
  const writeButtons = (next: any[]) => set(['content', 'buttons'], next);
  const items = n.picker.items;
  const writeItems = (next: any[]) => set(['picker', 'items'], next);
  const move = <T,>(list: T[], i: number, dir: -1 | 1, write: (next: T[]) => void) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    write(next);
  };
  const rowTools = (i: number, len: number, onMove: (d: -1 | 1) => void, onRemove: () => void) => (
    <div className="flex gap-1">
      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => onMove(-1)} className="px-2 py-1 text-xs border rounded disabled:opacity-40">↑</button>
      <button type="button" aria-label="Move down" disabled={i === len - 1} onClick={() => onMove(1)} className="px-2 py-1 text-xs border rounded disabled:opacity-40">↓</button>
      <button type="button" aria-label="Remove" onClick={onRemove} className="px-2 py-1 text-xs border rounded text-red-600">✕</button>
    </div>
  );
  const setItem = (i: number, path: Path, value: any) => writeItems(items.map((it, idx) => (idx === i ? setIn(it, path, value) : it)));
  const setButton = (i: number, key: string, value: any) => writeButtons(buttons.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)));

  const bgType = n.background.type;

  return (
    <div className="space-y-4">
      {/* ── Background ── */}
      <Group title="Background" badge={bgType} defaultOpen>
        {sel('Background type', ['background', 'type'], BG_TYPES)}
        {bgType === 'color' && col('Colour', ['background', 'color'])}
        {bgType === 'gradient' && (
          <>
            {sel('Gradient type', ['background', 'gradient', 'type'], [{ value: 'linear', label: 'Linear' }, { value: 'radial', label: 'Radial' }])}
            {num('Angle', ['background', 'gradient', 'angle'], 0, 360, 5, 'deg')}
            {col('From', ['background', 'gradient', 'from'])}
            {col('Via', ['background', 'gradient', 'via'])}
            {col('To', ['background', 'gradient', 'to'])}
            {tog('Soft glow', ['background', 'gradient', 'glow', 'enabled'])}
            {n.background.gradient.glow.enabled && (
              <>
                {col('Glow colour', ['background', 'gradient', 'glow', 'color'])}
                {num('Glow X', ['background', 'gradient', 'glow', 'x'], 0, 100, 1, '%')}
                {num('Glow Y', ['background', 'gradient', 'glow', 'y'], 0, 100, 1, '%')}
                {num('Glow size', ['background', 'gradient', 'glow', 'size'], 200, 1600, 50, 'px')}
              </>
            )}
          </>
        )}
        {bgType === 'image' && (
          <>
            {media('Image', ['background', 'image'], 'image/*')}
            {media('Mobile image (optional)', ['background', 'mobileImage'], 'image/*')}
          </>
        )}
        {bgType === 'video' && (
          <>
            {media('Video', ['background', 'video'], 'video/*')}
            {media('Poster', ['background', 'poster'], 'image/*')}
            {tog('Autoplay', ['background', 'videoAutoplay'])}
            {tog('Loop', ['background', 'videoLoop'])}
            {tog('Muted', ['background', 'videoMuted'])}
          </>
        )}
        {(bgType === 'image' || bgType === 'video') && (
          <>
            {sel('Fit', ['background', 'fit'], [{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }])}
            {txt('Position', ['background', 'position'], { placeholder: 'center, 50% 30%…', dir: 'ltr' })}
            {num('Blur', ['background', 'blur'], 0, 30, 1, 'px')}
            {tog('Fixed while scrolling', ['background', 'fixed'])}
          </>
        )}
        {tog('Scrim over the background', ['background', 'overlay', 'enabled'])}
        {n.background.overlay.enabled && (
          <>
            {col('Scrim colour', ['background', 'overlay', 'color'])}
            {sel('Scrim direction', ['background', 'overlay', 'direction'], DIRECTIONS)}
            {num('Opacity at the dark edge', ['background', 'overlay', 'startOpacity'], 0, 1, 0.01)}
            {num('Opacity at the middle stop', ['background', 'overlay', 'midOpacity'], 0, 1, 0.01)}
            {num('Opacity at the far edge', ['background', 'overlay', 'endOpacity'], 0, 1, 0.01)}
            {num('Middle stop position', ['background', 'overlay', 'midStop'], 0, 100, 1, '%')}
          </>
        )}
      </Group>

      {/* ── Text column ── */}
      <Group title="Text column" defaultOpen>
        {tog('Show text column', ['content', 'enabled'])}
        {tog('Show eyebrow chip', ['content', 'eyebrow', 'enabled'])}
        {txt('Eyebrow text', ['content', 'eyebrow', 'text'])}
        {tog('Dot before eyebrow', ['content', 'eyebrow', 'showDot'])}
        {col('Dot colour', ['content', 'eyebrow', 'dotColor'])}
        {col('Eyebrow text colour', ['content', 'eyebrow', 'textColor'])}
        {col('Eyebrow border', ['content', 'eyebrow', 'borderColor'])}
        {col('Eyebrow background', ['content', 'eyebrow', 'background'])}
        {area('Headline', ['content', 'title'], 3, 'A new line makes a line break.')}
        {txt('Accent tagline', ['content', 'tagline'])}
        {area('Description', ['content', 'description'], 4)}
        {tog('Text shadow (readability on photos)', ['content', 'textShadow'])}
      </Group>

      <Group title="Text sizes & colours">
        {col('Headline colour', ['content', 'titleColor'])}
        {num('Headline size', ['content', 'titleSize'], 24, 96, 1, 'px')}
        {num('Headline weight', ['content', 'titleWeight'], 300, 900, 100)}
        {num('Headline line height', ['content', 'titleLineHeight'], 1, 2, 0.05)}
        {col('Tagline colour', ['content', 'taglineColor'])}
        {num('Tagline size', ['content', 'taglineSize'], 12, 48, 1, 'px')}
        {num('Tagline weight', ['content', 'taglineWeight'], 300, 900, 100)}
        {col('Description colour', ['content', 'descriptionColor'])}
        {num('Description size', ['content', 'descriptionSize'], 12, 32, 1, 'px')}
        {num('Description line height', ['content', 'descriptionLineHeight'], 1, 2.4, 0.05)}
        {num('Description max width', ['content', 'descriptionMaxWidth'], 240, 900, 10, 'px')}
      </Group>

      {/* ── Buttons ── */}
      <Group title="Buttons" badge={String(buttons.length)}>
        {buttons.map((b, i) => (
          <div key={b.id} className="border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Button {i + 1}</span>
              {rowTools(i, buttons.length, (d) => move(buttons, i, d, writeButtons), () => writeButtons(buttons.filter((_, idx) => idx !== i)))}
            </div>
            <Field label="Text"><input className={inputCls} value={b.text} onChange={(e) => setButton(i, 'text', e.target.value)} /></Field>
            <Field label="Link" hint="A page URL or an anchor such as #section-id."><input className={inputCls} dir="ltr" value={b.href} onChange={(e) => setButton(i, 'href', e.target.value)} /></Field>
            <Field label="Style">
              <select className={inputCls} value={b.variant} onChange={(e) => setButton(i, 'variant', e.target.value)}>
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
              </select>
            </Field>
            <Switch label="Open in new tab" value={b.openInNewTab} onChange={(v) => setButton(i, 'openInNewTab', v)} />
          </div>
        ))}
        {buttons.length < 3 && (
          <button
            type="button"
            onClick={() => writeButtons([...buttons, { ...DEFAULT_PROJECT_HERO_BUTTON, id: `button-${Date.now()}`, text: 'New button' }])}
            className="w-full py-2 text-sm border border-dashed rounded-md text-blue-600"
          >
            + Add button
          </button>
        )}
        {num('Button height', ['content', 'buttonHeight'], 36, 72, 1, 'px')}
        {num('Button radius', ['content', 'buttonRadius'], 0, 36, 1, 'px')}
        {num('Button font size', ['content', 'buttonFontSize'], 12, 24, 1, 'px')}
        {num('Gap between buttons', ['content', 'buttonGap'], 0, 40, 1, 'px')}
      </Group>

      {/* ── Picker ── */}
      <Group title="Type picker panel" badge={String(items.length)} defaultOpen>
        {tog('Show picker panel', ['picker', 'enabled'])}
        {txt('Panel title', ['picker', 'title'])}
        {col('Panel title colour', ['picker', 'titleColor'])}
        {num('Panel title size', ['picker', 'titleSize'], 11, 28, 1, 'px')}
        {items.map((it, i) => (
          <div key={it.id} className="border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Row {i + 1}: {it.title || '(untitled)'}</span>
              {rowTools(i, items.length, (d) => move(items, i, d, writeItems), () => writeItems(items.filter((_, idx) => idx !== i)))}
            </div>
            <Field label="Title"><input className={inputCls} value={it.title} onChange={(e) => setItem(i, ['title'], e.target.value)} /></Field>
            <Field label="Badge (scale tag)"><input className={inputCls} value={it.badge} onChange={(e) => setItem(i, ['badge'], e.target.value)} /></Field>
            <Field label="Description"><input className={inputCls} value={it.description} onChange={(e) => setItem(i, ['description'], e.target.value)} /></Field>
            <Field label="Link" hint="Anchor of the section this row leads to, e.g. #section-section-1781700102.">
              <input className={inputCls} dir="ltr" value={it.href} onChange={(e) => setItem(i, ['href'], e.target.value)} />
            </Field>
            <Switch label="Open in new tab" value={it.openInNewTab} onChange={(v) => setItem(i, ['openInNewTab'], v)} />
            <Field label="Thumbnail">
              <select className={inputCls} value={it.media.type} onChange={(e) => setItem(i, ['media', 'type'], e.target.value)}>
                <option value="icon">Icon</option>
                <option value="image">Image</option>
                <option value="none">None</option>
              </select>
            </Field>
            {it.media.type === 'icon' && (
              <Field label="Icon">
                <select className={inputCls} value={it.media.icon} onChange={(e) => setItem(i, ['media', 'icon'], e.target.value)}>
                  {PROJECT_HERO_ICONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </Field>
            )}
            {it.media.type === 'image' && (
              <>
                <Field label="Image">
                  <MediaUpload src={it.media.src} width={160} height={90} objectFit="cover" onMediaChange={(src) => setItem(i, ['media', 'src'], src)} uploadButtonText="Upload Image" acceptedTypes="image/*" />
                </Field>
                <Field label="Alt text"><input className={inputCls} value={it.media.alt} onChange={(e) => setItem(i, ['media', 'alt'], e.target.value)} /></Field>
                <Field label="Fit">
                  <select className={inputCls} value={it.media.fit} onChange={(e) => setItem(i, ['media', 'fit'], e.target.value)}>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                  </select>
                </Field>
                <Field label="Position"><input className={inputCls} dir="ltr" value={it.media.position} onChange={(e) => setItem(i, ['media', 'position'], e.target.value)} /></Field>
              </>
            )}
            <Field label="Accent colour (optional)" hint="Hover border and arrow of this row only.">
              <input className={inputCls} value={it.accentColor} placeholder="#34D399" onChange={(e) => setItem(i, ['accentColor'], e.target.value)} />
            </Field>
          </div>
        ))}
        {items.length < 5 && (
          <button
            type="button"
            onClick={() => writeItems([...items, { ...DEFAULT_PROJECT_HERO_ITEM, id: `item-${Date.now()}`, title: 'New type' }])}
            className="w-full py-2 text-sm border border-dashed rounded-md text-blue-600"
          >
            + Add row
          </button>
        )}
      </Group>

      {/* ── Layout ── */}
      <Group title="Layout">
        {sel('Text column side', ['layout', 'textSide'], [{ value: 'start', label: 'Start (right in RTL)' }, { value: 'end', label: 'End (left in RTL)' }])}
        {sel('Text alignment', ['layout', 'textAlign'], ALIGN)}
        {sel('Vertical alignment', ['layout', 'verticalAlign'], ALIGN)}
        {sel('Order on small screens', ['layout', 'mobileOrder'], [{ value: 'text-first', label: 'Text first' }, { value: 'picker-first', label: 'Picker first' }])}
        {num('Content max width', ['layout', 'maxWidth'], 720, 1600, 10, 'px')}
        {num('Gap between columns', ['layout', 'gap'], 0, 160, 4, 'px')}
        {num('Text column width', ['layout', 'textBasis'], 280, 900, 10, 'px')}
        {num('Picker panel width', ['layout', 'pickerBasis'], 280, 800, 10, 'px')}
        {num('Padding top', ['layout', 'paddingTop'], 24, 240, 4, 'px')}
        {num('Padding bottom', ['layout', 'paddingBottom'], 24, 240, 4, 'px')}
        {tog('Fill the screen (screen height minus header)', ['layout', 'fillScreen'])}
        {!n.layout.fillScreen && num('Minimum height', ['layout', 'minHeight'], 0, 1200, 10, 'px')}
        {n.layout.fillScreen && num('Header height fallback', ['layout', 'headerHeight'], 0, 240, 1, 'px')}
        {num('Panel padding', ['layout', 'panelPadding'], 0, 60, 1, 'px')}
        {num('Panel radius', ['layout', 'panelRadius'], 0, 60, 1, 'px')}
        {num('Row gap', ['layout', 'rowGap'], 0, 40, 1, 'px')}
        {num('Row padding', ['layout', 'rowPadding'], 0, 40, 1, 'px')}
        {num('Row radius', ['layout', 'rowRadius'], 0, 40, 1, 'px')}
        {num('Thumbnail size', ['layout', 'thumbSize'], 40, 160, 2, 'px')}
        {num('Thumbnail radius', ['layout', 'thumbRadius'], 0, 40, 1, 'px')}
        {tog('Show arrow', ['layout', 'showArrow'])}
      </Group>

      <Group title="Row typography">
        {num('Row title size', ['typography', 'rowTitleSize'], 12, 36, 1, 'px')}
        {num('Row title weight', ['typography', 'rowTitleWeight'], 300, 900, 100)}
        {num('Row description size', ['typography', 'rowDescSize'], 10, 24, 1, 'px')}
        {num('Badge size', ['typography', 'badgeSize'], 9, 20, 1, 'px')}
      </Group>

      <Group title="Colours">
        {col('Accent', ['colors', 'accent'])}
        {col('Panel background', ['colors', 'panelBackground'])}
        {num('Panel opacity', ['colors', 'panelOpacity'], 0, 1, 0.01)}
        {num('Panel blur', ['colors', 'panelBlur'], 0, 30, 1, 'px')}
        {col('Panel border', ['colors', 'panelBorder'])}
        {col('Row background', ['colors', 'rowBackground'])}
        {col('Row border', ['colors', 'rowBorder'])}
        {col('Row hover background', ['colors', 'rowHoverBackground'])}
        {col('Row hover border', ['colors', 'rowHoverBorder'])}
        {col('Row title', ['colors', 'rowTitle'])}
        {col('Row text', ['colors', 'rowText'])}
        {col('Badge background', ['colors', 'badgeBackground'])}
        {col('Badge text', ['colors', 'badgeText'])}
        {col('Arrow', ['colors', 'arrow'])}
        {col('Thumbnail background', ['colors', 'thumbBackground'])}
        {col('Thumbnail icon', ['colors', 'thumbIcon'])}
        {col('Primary button background', ['colors', 'primaryBackground'])}
        {col('Primary button text', ['colors', 'primaryText'])}
        {col('Primary button hover background', ['colors', 'primaryHoverBackground'])}
        {col('Primary button hover text', ['colors', 'primaryHoverText'])}
        {col('Secondary button border', ['colors', 'secondaryBorder'])}
        {col('Secondary button text', ['colors', 'secondaryText'])}
        {col('Secondary button hover background', ['colors', 'secondaryHoverBackground'])}
        {col('Secondary button hover text', ['colors', 'secondaryHoverText'])}
      </Group>

      <Group title="Motion">
        {sel('Row hover', ['motion', 'rowHover'], ['none', 'border', 'lift', 'glow', 'slide'].map((v) => ({ value: v, label: v })))}
        {num('Hover duration', ['motion', 'duration'], 0, 1200, 20, 'ms')}
        {num('Lift distance', ['motion', 'liftDistance'], 0, 20, 1, 'px')}
        {tog('Nudge arrow on hover', ['motion', 'arrowNudge'])}
        {sel('Entrance', ['motion', 'entrance'], ['none', 'fade', 'fade-up', 'slide'].map((v) => ({ value: v, label: v })))}
        {num('Entrance duration', ['motion', 'entranceDuration'], 100, 2000, 50, 'ms')}
        {num('Row stagger', ['motion', 'stagger'], 0, 400, 10, 'ms')}
      </Group>

      <Field label="Accessible label">
        <input className={inputCls} value={n.ariaLabel} onChange={(e) => set(['ariaLabel'], e.target.value)} />
      </Field>
    </div>
  );
}
