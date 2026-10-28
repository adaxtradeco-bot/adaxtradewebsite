'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { MediaUpload } from '@/components/ui/MediaUpload';
import { normalizeGatewayData, DEFAULT_GATEWAY_CARD } from '@/lib/page-builder/split-gateway';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

type Path = (string | number)[];

/* ─── Immutable path helpers ─── */
export function getIn(obj: any, path: Path): any {
  return path.reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setIn(obj: any, path: Path, value: any): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const base = obj == null ? (typeof head === 'number' ? [] : {}) : obj;
  const copy: any = Array.isArray(base) ? [...base] : { ...base };
  copy[head] = setIn(base[head], rest, value);
  return copy;
}

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

function Group({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
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

const MEDIA_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

/* ─── Main panel ─── */
export function SplitGatewayPropertyPanel({ section, onUpdate }: Props) {
  const raw = (section.data ?? {}) as Record<string, any>;
  const n = normalizeGatewayData(raw);
  const set = (path: Path, value: any) => onUpdate({ data: setIn(raw, path, value) });

  /* controls — plain functions (not components) so inputs keep focus while typing */
  const txt = (label: string, path: Path, opts: { placeholder?: string; hint?: string; dir?: 'ltr' | 'rtl' } = {}) => (
    <Field label={label} hint={opts.hint}>
      <input
        className={inputCls}
        dir={opts.dir}
        value={getIn(n, path) ?? ''}
        placeholder={opts.placeholder}
        onChange={(e) => set(path, e.target.value)}
      />
    </Field>
  );
  const area = (label: string, path: Path, rows = 3) => (
    <Field label={label}>
      <textarea className={`${inputCls} resize-y`} rows={rows} value={getIn(n, path) ?? ''} onChange={(e) => set(path, e.target.value)} />
    </Field>
  );
  const sel = (label: string, path: Path, options: { value: string | number; label: string }[]) => (
    <Field label={label}>
      <select
        className={inputCls}
        value={String(getIn(n, path) ?? '')}
        onChange={(e) => {
          const v = e.target.value;
          const asNum = typeof options[0].value === 'number';
          set(path, asNum ? Number(v) : v);
        }}
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
          <input
            type="range"
            aria-label={label}
            min={min}
            max={max}
            step={step}
            value={v}
            onChange={(e) => set(path, Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
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

  /* cards */
  const cards = n.cards;
  const writeCards = (next: any[]) => onUpdate({ data: { ...raw, cards: next } });
  const addCard = () =>
    writeCards([
      ...cards,
      { ...DEFAULT_GATEWAY_CARD, id: `card-${Date.now()}`, title: 'New card', cta: { ...DEFAULT_GATEWAY_CARD.cta, text: 'Enter' } },
    ]);
  const removeCard = (i: number) => writeCards(cards.filter((_, idx) => idx !== i));
  const moveCard = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= cards.length) return;
    const next = [...cards];
    [next[i], next[j]] = [next[j], next[i]];
    writeCards(next);
  };
  const setCard = (i: number, path: Path, value: any) => writeCards(cards.map((c, idx) => (idx === i ? setIn(c, path, value) : c)));

  const bgType = n.background.type;

  return (
    <div className="space-y-4">
      {/* ── Background ── */}
      <Group title="Background" badge={bgType} defaultOpen>
        {sel('Background type', ['background', 'type'], [
          { value: 'none', label: 'None (transparent)' },
          { value: 'color', label: 'Solid colour' },
          { value: 'gradient', label: 'Gradient' },
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
        ])}

        {bgType === 'color' && col('Colour', ['background', 'color'])}

        {bgType === 'gradient' && (
          <>
            {sel('Gradient type', ['background', 'gradient', 'type'], [
              { value: 'linear', label: 'Linear' },
              { value: 'radial', label: 'Radial' },
            ])}
            {n.background.gradient.type === 'linear' && num('Angle', ['background', 'gradient', 'angle'], 0, 360, 5, '°')}
            {col('From', ['background', 'gradient', 'from'])}
            {col('Middle (optional — clear to skip)', ['background', 'gradient', 'via'])}
            {col('To', ['background', 'gradient', 'to'])}
            {tog('Soft glow', ['background', 'gradient', 'glow', 'enabled'])}
            {n.background.gradient.glow.enabled && (
              <>
                {col('Glow colour', ['background', 'gradient', 'glow', 'color'])}
                {num('Glow position X', ['background', 'gradient', 'glow', 'x'], 0, 100, 1, '%')}
                {num('Glow position Y', ['background', 'gradient', 'glow', 'y'], 0, 100, 1, '%')}
                {num('Glow size', ['background', 'gradient', 'glow', 'size'], 200, 2000, 50, 'px')}
              </>
            )}
          </>
        )}

        {bgType === 'image' && (
          <>
            {media('Desktop image', ['background', 'image'], 'image/*')}
            {media('Mobile image (optional)', ['background', 'mobileImage'], 'image/*')}
          </>
        )}

        {bgType === 'video' && (
          <>
            {media('Background video', ['background', 'video'], 'video/*')}
            {media('Poster image (shown while loading)', ['background', 'poster'], 'image/*', 160, 90)}
            <div className="grid grid-cols-1 gap-2">
              {tog('Autoplay', ['background', 'videoAutoplay'])}
              {tog('Loop', ['background', 'videoLoop'])}
              {tog('Muted (required for autoplay)', ['background', 'videoMuted'])}
            </div>
          </>
        )}

        {(bgType === 'image' || bgType === 'video') && (
          <>
            {sel('Fit', ['background', 'fit'], [
              { value: 'cover', label: 'Cover (fill)' },
              { value: 'contain', label: 'Contain (whole image)' },
            ])}
            {txt('Focal point', ['background', 'position'], { placeholder: 'center, 50% 30%, left top…', dir: 'ltr' })}
            {num('Blur', ['background', 'blur'], 0, 30, 1, 'px')}
          </>
        )}

        {bgType !== 'none' && (
          <>
            {tog('Keep fixed while scrolling', ['background', 'fixed'])}
            {tog('Colour overlay (tint)', ['background', 'overlay', 'enabled'])}
            {n.background.overlay.enabled && (
              <>
                {col('Overlay colour', ['background', 'overlay', 'color'])}
                {num('Overlay opacity', ['background', 'overlay', 'opacity'], 0, 1, 0.05)}
              </>
            )}
          </>
        )}
      </Group>

      {/* ── Heading ── */}
      <Group title="Slogan / Heading" badge={n.heading.enabled ? 'on' : 'off'}>
        {tog('Show heading', ['heading', 'enabled'])}
        {n.heading.enabled && (
          <>
            {txt('Eyebrow (small line above)', ['heading', 'eyebrow'])}
            {txt('Title — main line', ['heading', 'title'])}
            {txt('Title — accent line', ['heading', 'accentTitle'])}
            {txt('Signature (closing line)', ['heading', 'signature'])}
            {sel('Alignment', ['heading', 'align'], [
              { value: 'start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'end', label: 'End' },
            ])}
            {num('Title size', ['heading', 'titleSize'], 20, 96, 1, 'px')}
            {num('Title weight', ['heading', 'titleWeight'], 300, 900, 100)}
            {num('Signature size', ['heading', 'signatureSize'], 12, 40, 1, 'px')}
            {num('Max width', ['heading', 'maxWidth'], 320, 1400, 20, 'px')}
            {num('Space below', ['heading', 'marginBottom'], 0, 200, 4, 'px')}
            {col('Title colour', ['heading', 'color'])}
            {col('Accent colour', ['heading', 'accentColor'])}
            {tog('Text shadow (readable on photos/video)', ['heading', 'textShadow'])}
            {tog('Panel behind the heading', ['heading', 'box', 'enabled'])}
            {n.heading.box.enabled && (
              <>
                {col('Panel background', ['heading', 'box', 'background'])}
                {col('Panel border', ['heading', 'box', 'borderColor'])}
                {num('Panel radius', ['heading', 'box', 'radius'], 0, 60, 1, 'px')}
              </>
            )}
          </>
        )}
      </Group>

      {/* ── Cards ── */}
      <Group title="Cards" badge={String(cards.length)} defaultOpen>
        <div className="space-y-3">
          {cards.map((card, i) => (
            <Group key={card.id} title={`${i + 1}. ${card.title || 'Untitled card'}`}>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => moveCard(i, -1)} disabled={i === 0} aria-label={`Move card ${i + 1} up`} className="px-2 py-1 text-xs border rounded disabled:opacity-40">
                  ↑
                </button>
                <button type="button" onClick={() => moveCard(i, 1)} disabled={i === cards.length - 1} aria-label={`Move card ${i + 1} down`} className="px-2 py-1 text-xs border rounded disabled:opacity-40">
                  ↓
                </button>
                <button type="button" onClick={() => removeCard(i)} aria-label={`Remove card ${i + 1}`} className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded">
                  Remove
                </button>
              </div>

              <Field label="Badge (optional tag above the title)">
                <input className={inputCls} value={card.badge} onChange={(e) => setCard(i, ['badge'], e.target.value)} />
              </Field>
              <Field label="Title">
                <input className={inputCls} value={card.title} onChange={(e) => setCard(i, ['title'], e.target.value)} />
              </Field>
              <Field label="Description">
                <textarea className={`${inputCls} resize-y`} rows={3} value={card.description} onChange={(e) => setCard(i, ['description'], e.target.value)} />
              </Field>

              <div className="rounded-md border border-gray-200 dark:border-gray-600 p-3 space-y-3">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Media</div>
                <Field label="Media type">
                  <select className={inputCls} value={card.media.type} onChange={(e) => setCard(i, ['media', 'type'], e.target.value)}>
                    {MEDIA_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {card.media.type !== 'none' && (
                  <>
                    <Field label={card.media.type === 'video' ? 'Video' : 'Image'}>
                      <MediaUpload
                        src={card.media.src}
                        width={240}
                        height={135}
                        objectFit="cover"
                        onMediaChange={(src) => setCard(i, ['media', 'src'], src)}
                        uploadButtonText={card.media.type === 'video' ? 'Upload Video' : 'Upload Image'}
                        acceptedTypes={card.media.type === 'video' ? 'video/*' : 'image/*'}
                      />
                    </Field>
                    {card.media.type === 'video' && (
                      <Field label="Poster image">
                        <MediaUpload
                          src={card.media.poster}
                          width={160}
                          height={90}
                          objectFit="cover"
                          onMediaChange={(src) => setCard(i, ['media', 'poster'], src)}
                          uploadButtonText="Upload Poster"
                          acceptedTypes="image/*"
                        />
                      </Field>
                    )}
                    <Field label="Alt text / label">
                      <input className={inputCls} value={card.media.alt} onChange={(e) => setCard(i, ['media', 'alt'], e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Fit">
                        <select className={inputCls} value={card.media.fit} onChange={(e) => setCard(i, ['media', 'fit'], e.target.value)}>
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                        </select>
                      </Field>
                      <Field label="Focal point">
                        <input className={inputCls} dir="ltr" value={card.media.position} onChange={(e) => setCard(i, ['media', 'position'], e.target.value)} />
                      </Field>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-md border border-gray-200 dark:border-gray-600 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Services ({card.services.length})</div>
                  <button
                    type="button"
                    onClick={() => setCard(i, ['services'], [...card.services, { text: 'New service', href: '' }])}
                    className="px-2 py-1 text-xs border rounded"
                  >
                    + Add
                  </button>
                </div>
                {card.services.map((s, si) => (
                  <div key={si} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      aria-label={`Service ${si + 1} text`}
                      className={inputCls}
                      value={s.text}
                      onChange={(e) => setCard(i, ['services', si, 'text'], e.target.value)}
                    />
                    <input
                      aria-label={`Service ${si + 1} link`}
                      className={inputCls}
                      dir="ltr"
                      placeholder="link (optional)"
                      value={s.href}
                      onChange={(e) => setCard(i, ['services', si, 'href'], e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={`Remove service ${si + 1}`}
                      onClick={() => setCard(i, ['services'], card.services.filter((_, k) => k !== si))}
                      className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-gray-200 dark:border-gray-600 p-3 space-y-3">
                <Switch label="Button" value={card.cta.enabled} onChange={(v) => setCard(i, ['cta', 'enabled'], v)} />
                {card.cta.enabled && (
                  <>
                    <Field label="Button text">
                      <input className={inputCls} value={card.cta.text} onChange={(e) => setCard(i, ['cta', 'text'], e.target.value)} />
                    </Field>
                    <Field label="Link">
                      <input className={inputCls} dir="ltr" value={card.cta.href} onChange={(e) => setCard(i, ['cta', 'href'], e.target.value)} />
                    </Field>
                    <Switch label="Open in new tab" value={card.cta.openInNewTab} onChange={(v) => setCard(i, ['cta', 'openInNewTab'], v)} />
                    <Switch label="Arrow" value={card.cta.showArrow} onChange={(v) => setCard(i, ['cta', 'showArrow'], v)} />
                  </>
                )}
              </div>

              <Field label="Card accent colour (empty = section accent)">
                <input className={inputCls} dir="ltr" value={card.accentColor} onChange={(e) => setCard(i, ['accentColor'], e.target.value)} placeholder="#hex" />
              </Field>
            </Group>
          ))}
          <button type="button" onClick={addCard} disabled={cards.length >= 4} className="w-full py-2 text-sm border border-dashed border-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">
            + Add card {cards.length >= 4 && '(max 4)'}
          </button>
        </div>
      </Group>

      {/* ── Layout & sizes ── */}
      <Group title="Layout & sizes">
        {num('Columns (0 = automatic)', ['layout', 'columns'], 0, 4)}
        {n.layout.columns === 0 && num('Minimum card width', ['layout', 'minCardWidth'], 240, 700, 10, 'px')}
        {num('Gap between cards', ['layout', 'gap'], 0, 80, 2, 'px')}
        {num('Content max width', ['layout', 'maxWidth'], 640, 1800, 20, 'px')}
        {sel('Media position', ['layout', 'mediaPosition'], [
          { value: 'top', label: 'Above the text' },
          { value: 'bottom', label: 'Below the text' },
          { value: 'start', label: 'Beside the text (start)' },
          { value: 'end', label: 'Beside the text (end)' },
        ])}
        {(n.layout.mediaPosition === 'top' || n.layout.mediaPosition === 'bottom') && num('Media height', ['layout', 'mediaHeight'], 80, 800, 10, 'px')}
        {(n.layout.mediaPosition === 'start' || n.layout.mediaPosition === 'end') && (
          <>
            {num('Media width (share of card)', ['layout', 'mediaWidthPercent'], 15, 70, 1, '%')}
            {num('Media minimum height', ['layout', 'mediaHeight'], 80, 800, 10, 'px')}
          </>
        )}
        {num('Card padding', ['layout', 'cardPadding'], 0, 60, 1, 'px')}
        {num('Card corner radius', ['layout', 'cardRadius'], 0, 60, 1, 'px')}
        {num('Media corner radius', ['layout', 'mediaRadius'], 0, 60, 1, 'px')}
        {sel('Text alignment', ['layout', 'textAlign'], [
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
        ])}
        {num('Extra space above', ['layout', 'paddingTop'], 0, 400, 4, 'px')}
        {num('Extra space below', ['layout', 'paddingBottom'], 0, 400, 4, 'px')}
        {num('Minimum section height', ['layout', 'minHeight'], 0, 1400, 10, 'px')}
      </Group>

      {/* ── Typography ── */}
      <Group title="Text sizes">
        {num('Card title size', ['typography', 'titleSize'], 14, 72, 1, 'px')}
        {num('Card title weight', ['typography', 'titleWeight'], 300, 900, 100)}
        {num('Description size', ['typography', 'descSize'], 11, 28, 1, 'px')}
        {num('Description line height', ['typography', 'descLineHeight'], 1.2, 3, 0.1)}
        {num('Service text size', ['typography', 'serviceSize'], 10, 24, 1, 'px')}
        {num('Badge size', ['typography', 'badgeSize'], 9, 20, 1, 'px')}
        {num('Button text size', ['typography', 'ctaSize'], 11, 24, 1, 'px')}
      </Group>

      {/* ── Colours & card style ── */}
      <Group title="Colours & card style">
        {col('Accent colour', ['colors', 'accent'])}
        {col('Card background', ['colors', 'cardBackground'])}
        {num('Card background opacity', ['colors', 'cardOpacity'], 0, 1, 0.05)}
        {num('Card backdrop blur', ['colors', 'cardBlur'], 0, 30, 1, 'px')}
        {col('Card border', ['colors', 'cardBorder'])}
        {num('Card border width', ['colors', 'cardBorderWidth'], 0, 6, 1, 'px')}
        {col('Title colour', ['colors', 'title'])}
        {col('Description colour', ['colors', 'text'])}
        {col('Service text colour', ['colors', 'serviceText'])}
        {col('Service dividers', ['colors', 'serviceBorder'])}
        {col('Button text', ['colors', 'ctaColor'])}
        {col('Button background', ['colors', 'ctaBackground'])}
        {col('Button border', ['colors', 'ctaBorder'])}
        {col('Button hover background', ['colors', 'ctaHoverBackground'])}
        {col('Button hover text', ['colors', 'ctaHoverText'])}
      </Group>

      {/* ── Services ── */}
      <Group title="Services display">
        {sel('Layout', ['services', 'layout'], [
          { value: 'columns', label: 'Columns side by side' },
          { value: 'list', label: 'Vertical list' },
          { value: 'chips', label: 'Chips' },
        ])}
        {tog('Show numbers', ['services', 'showNumbers'])}
        {tog('Show dividers', ['services', 'showDividers'])}
      </Group>

      {/* ── Motion ── */}
      <Group title="Hover & motion">
        {sel('Card hover', ['motion', 'cardHover'], [
          { value: 'none', label: 'None' },
          { value: 'lift', label: 'Lift' },
          { value: 'glow', label: 'Glow' },
          { value: 'scale', label: 'Scale up' },
          { value: 'border', label: 'Accent border' },
        ])}
        {n.motion.cardHover === 'lift' && num('Lift distance', ['motion', 'liftDistance'], 0, 24, 1, 'px')}
        {sel('Image / video hover', ['motion', 'mediaHover'], [
          { value: 'none', label: 'None' },
          { value: 'zoom', label: 'Slow zoom' },
          { value: 'pan', label: 'Zoom + pan' },
          { value: 'brighten', label: 'Brighten' },
          { value: 'grayscale', label: 'Grayscale → colour' },
          { value: 'blur', label: 'Blur → sharp' },
        ])}
        {n.motion.mediaHover === 'zoom' && num('Zoom amount', ['motion', 'zoomScale'], 1, 1.3, 0.01, '×')}
        {sel('Button hover', ['motion', 'ctaHover'], [
          { value: 'none', label: 'None' },
          { value: 'fill', label: 'Fill with colour' },
          { value: 'invert', label: 'Invert' },
          { value: 'slide', label: 'Slide-in fill' },
        ])}
        {sel('Service hover', ['motion', 'serviceHover'], [
          { value: 'none', label: 'None' },
          { value: 'highlight', label: 'Highlight' },
          { value: 'accent', label: 'Accent text' },
        ])}
        {num('Hover speed', ['motion', 'duration'], 0, 1500, 50, 'ms')}
        {sel('Button style', ['motion', 'ctaVariant'], [
          { value: 'outline', label: 'Outline' },
          { value: 'solid', label: 'Solid' },
          { value: 'text', label: 'Text only' },
        ])}
        {num('Button corner radius', ['motion', 'ctaRadius'], 0, 40, 1, 'px')}
        {sel('Entrance animation', ['motion', 'entrance'], [
          { value: 'none', label: 'None' },
          { value: 'fade', label: 'Fade' },
          { value: 'fade-up', label: 'Fade up' },
          { value: 'scale', label: 'Scale in' },
          { value: 'slide', label: 'Slide in' },
        ])}
        {n.motion.entrance !== 'none' && (
          <>
            {num('Entrance duration', ['motion', 'entranceDuration'], 100, 2000, 50, 'ms')}
            {num('Delay between cards', ['motion', 'stagger'], 0, 600, 20, 'ms')}
          </>
        )}
      </Group>

      {/* ── Accessibility ── */}
      <Group title="Accessibility">
        {txt('Section label (screen readers)', ['ariaLabel'])}
      </Group>
    </div>
  );
}
