'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { MediaUpload } from '@/components/ui/MediaUpload';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

/* ─── Shared helpers (matches TopStripPropertyPanel.tsx convention) ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
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

function newCardId() {
  return `card-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/* ─── Main panel ─── */
export function HomeInnovationPropertyPanel({ section, onUpdate }: Props) {
  const data = section.data as any;
  const update = (patch: Record<string, any>) => onUpdate({ data: { ...data, ...patch } });
  const updateNested = (key: string, patch: Record<string, any>) =>
    update({ [key]: { ...(data[key] ?? {}), ...patch } });

  const cards: any[] = data.cards ?? [];
  const cta = data.cta ?? { text: '', href: '', enabled: false };
  const locationMap = data.locationMap ?? { enabled: false };

  const updateCard = (idx: number, patch: Record<string, any>) => {
    const next = cards.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    update({ cards: next });
  };

  const updateCardLocationTag = (idx: number, patch: Record<string, any>) => {
    const card = cards[idx];
    updateCard(idx, { locationTag: { ...(card.locationTag ?? { label: '', x: 50, y: 50 }), ...patch } });
  };

  const moveCard = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[idx], next[target]] = [next[target], next[idx]];
    update({ cards: next });
  };

  return (
    <div className="space-y-4">
      {/* ── Headline ── */}
      <Collapsible title="Headline" defaultOpen>
        <Field label="Eyebrow">
          <input className={inputCls} value={data.eyebrow ?? ''} onChange={(e) => update({ eyebrow: e.target.value })} />
        </Field>
        <Field label="Headline">
          <input className={inputCls} value={data.headline ?? ''} onChange={(e) => update({ headline: e.target.value })} />
        </Field>
        <Field label="Supporting Copy">
          <textarea
            className={textareaCls}
            rows={2}
            value={data.supportingCopy ?? ''}
            onChange={(e) => update({ supportingCopy: e.target.value })}
          />
        </Field>
      </Collapsible>

      {/* ── Side Panel ── */}
      <Collapsible title="Side Panel" defaultOpen>
        <Field label="Side Title">
          <input className={inputCls} value={data.sideTitle ?? ''} onChange={(e) => update({ sideTitle: e.target.value })} />
        </Field>
        <Field label="Side Description">
          <textarea
            className={textareaCls}
            rows={3}
            value={data.sideDescription ?? ''}
            onChange={(e) => update({ sideDescription: e.target.value })}
          />
        </Field>
      </Collapsible>

      {/* ── Layout & Motion ── */}
      <Collapsible title="Layout & Motion">
        <Field label="Column Count (desktop)">
          <input
            type="number"
            min={1}
            max={4}
            className={inputCls}
            value={data.columnCount ?? 3}
            onChange={(e) => update({ columnCount: Math.max(1, Math.min(4, parseInt(e.target.value, 10) || 1)) })}
          />
        </Field>
        <Field label={`Parallax Intensity — ${data.parallaxIntensity ?? 20}`}>
          <input
            type="range"
            min={0}
            max={100}
            value={data.parallaxIntensity ?? 20}
            onChange={(e) => update({ parallaxIntensity: parseInt(e.target.value, 10) })}
            className="w-full"
          />
        </Field>
        <Field label="Theme">
          <select className={inputCls} value={data.theme ?? 'dark'} onChange={(e) => update({ theme: e.target.value })}>
            <option value="dark">Dark (light text)</option>
            <option value="light">Light (dark text)</option>
          </select>
        </Field>
      </Collapsible>

      {/* ── Call to Action ── */}
      <Collapsible title="Call to Action">
        <Field label="Show CTA Button">
          <Toggle value={cta.enabled === true} onChange={(v) => updateNested('cta', { enabled: v })} />
        </Field>
        {cta.enabled && (
          <>
            <Field label="Button Text">
              <input
                className={inputCls}
                value={cta.text ?? ''}
                onChange={(e) => updateNested('cta', { text: e.target.value })}
              />
            </Field>
            <Field label="Button Link">
              <input
                className={inputCls}
                value={cta.href ?? ''}
                onChange={(e) => updateNested('cta', { href: e.target.value })}
                placeholder="https://..."
              />
            </Field>
          </>
        )}
      </Collapsible>

      {/* ── Cards ── */}
      <Collapsible title="Cards" badge={`${cards.length}`} defaultOpen>
        {cards.map((card, i) => (
          <div key={card.id ?? i} className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Card {i + 1}{card.title ? ` — ${card.title}` : ''}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveCard(i, -1)} disabled={i === 0} className="text-xs text-gray-500 hover:text-blue-500 disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => moveCard(i, 1)} disabled={i === cards.length - 1} className="text-xs text-gray-500 hover:text-blue-500 disabled:opacity-30">
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => update({ cards: cards.filter((_, ci) => ci !== i) })}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ✕ Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Category">
                <input className={inputCls} value={card.category ?? ''} onChange={(e) => updateCard(i, { category: e.target.value })} />
              </Field>
              <Field label="Column (blank = auto)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={typeof card.column === 'number' ? card.column : ''}
                  onChange={(e) => updateCard(i, { column: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })}
                />
              </Field>
            </div>

            <Field label="Title">
              <input className={inputCls} value={card.title ?? ''} onChange={(e) => updateCard(i, { title: e.target.value })} />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Format">
                <select className={inputCls} value={card.format ?? 'horizontal'} onChange={(e) => updateCard(i, { format: e.target.value })}>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </Field>
              <Field label="Media Type">
                <select className={inputCls} value={card.mediaType ?? 'image'} onChange={(e) => updateCard(i, { mediaType: e.target.value })}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </Field>
            </div>

            <Field label="Media">
              <MediaUpload
                src={card.mediaUrl ?? ''}
                width={160}
                height={100}
                objectFit="cover"
                onMediaChange={(src) => updateCard(i, { mediaUrl: src })}
                uploadButtonText="Upload"
                acceptedTypes={card.mediaType === 'video' ? 'video/*' : 'image/*'}
              />
            </Field>

            <Field label="Link (href)">
              <input className={inputCls} value={card.href ?? ''} onChange={(e) => updateCard(i, { href: e.target.value })} placeholder="https:// or /page" />
            </Field>

            <Field label="Force Open in New Tab">
              <Toggle value={card.openInNewTab === true} onChange={(v) => updateCard(i, { openInNewTab: v })} />
            </Field>

            {/* Location Tag sub-section */}
            <div className="p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md space-y-2">
              <Field label="Location Tag (shows a pin on the map)">
                <Toggle
                  value={!!card.locationTag}
                  onChange={(v) =>
                    updateCard(i, { locationTag: v ? { label: card.title || 'Location', x: 50, y: 50 } : undefined })
                  }
                />
              </Field>
              {card.locationTag && (
                <>
                  <Field label="Label">
                    <input
                      className={inputCls}
                      value={card.locationTag.label ?? ''}
                      onChange={(e) => updateCardLocationTag(i, { label: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="X — %">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className={inputCls}
                        value={card.locationTag.x ?? 50}
                        onChange={(e) => updateCardLocationTag(i, { x: parseFloat(e.target.value) })}
                      />
                    </Field>
                    <Field label="Y — %">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className={inputCls}
                        value={card.locationTag.y ?? 50}
                        onChange={(e) => updateCardLocationTag(i, { y: parseFloat(e.target.value) })}
                      />
                    </Field>
                  </div>
                  <Field label="Thumbnail (optional)">
                    <MediaUpload
                      src={card.locationTag.thumbnailUrl ?? ''}
                      width={100}
                      height={70}
                      objectFit="cover"
                      onMediaChange={(src) => updateCardLocationTag(i, { thumbnailUrl: src })}
                      uploadButtonText="Upload"
                      acceptedTypes="image/*"
                    />
                  </Field>
                </>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              cards: [
                ...cards,
                {
                  id: newCardId(),
                  category: 'Category',
                  title: 'New card',
                  format: 'horizontal',
                  mediaType: 'image',
                  mediaUrl: '',
                  href: '#',
                },
              ],
            })
          }
          className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Add Card
        </button>
      </Collapsible>

      {/* ── Location Map ── */}
      <Collapsible title="Location Map">
        <Field label="Enable Location Map">
          <Toggle value={locationMap.enabled === true} onChange={(v) => updateNested('locationMap', { enabled: v })} />
        </Field>
        {locationMap.enabled && (
          <>
            <Field label="Map Image (flat world map)">
              <MediaUpload
                src={locationMap.mapImageUrl ?? ''}
                width={240}
                height={140}
                objectFit="contain"
                onMediaChange={(src) => updateNested('locationMap', { mapImageUrl: src })}
                uploadButtonText="Upload Map"
                acceptedTypes="image/*"
              />
            </Field>
            <Field label="Pin Reveal Mode">
              <select
                className={inputCls}
                value={locationMap.pinRevealMode ?? 'auto'}
                onChange={(e) => updateNested('locationMap', { pinRevealMode: e.target.value === 'auto' ? undefined : e.target.value })}
              >
                <option value="auto">Auto (hover on pointer, scroll on touch)</option>
                <option value="hover">Always hover</option>
                <option value="scroll">Always scroll-into-view</option>
              </select>
            </Field>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add a "Location Tag" on individual cards above to place pins on the map.
            </p>
          </>
        )}
      </Collapsible>
    </div>
  );
}
