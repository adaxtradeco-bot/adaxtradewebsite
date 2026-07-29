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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-1 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700 shrink-0"
        />
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="#hex or rgba(...)" />
      </div>
    </Field>
  );
}

/* ─── Main panel ─── */
export function HomeCoverPropertyPanel({ section, onUpdate }: Props) {
  const data = section.data as any;
  const update = (patch: Record<string, any>) => onUpdate({ data: { ...data, ...patch } });
  const updateNested = (key: string, patch: Record<string, any>) =>
    update({ [key]: { ...(data[key] ?? {}), ...patch } });

  const mediaType = data.mediaType ?? 'video';
  const scrollEffect = data.scrollEffect ?? 'parallax';
  const cta = data.cta ?? { text: '', href: '', enabled: false };
  const opening = data.opening ?? { enabled: false };

  return (
    <div className="space-y-4">
      {/* ── Background Media ── */}
      <Collapsible title="Background Media" defaultOpen>
        <Field label="Media Type">
          <select className={inputCls} value={mediaType} onChange={(e) => update({ mediaType: e.target.value })}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </Field>

        {mediaType === 'video' && (
          <Field label="Background Video">
            <MediaUpload
              src={data.videoUrl ?? ''}
              width={240}
              height={135}
              objectFit="cover"
              onMediaChange={(src) => update({ videoUrl: src })}
              uploadButtonText="Upload Video"
              acceptedTypes="video/*"
            />
          </Field>
        )}

        <Field label={mediaType === 'video' ? 'Fallback / Preview Image' : 'Background Image'}>
          <MediaUpload
            src={data.imageUrl ?? ''}
            width={240}
            height={135}
            objectFit="cover"
            onMediaChange={(src) => update({ imageUrl: src })}
            uploadButtonText="Upload Image"
            acceptedTypes="image/*"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Poster · Desktop">
            <MediaUpload
              src={data.posterImageDesktop ?? ''}
              width={140}
              height={90}
              objectFit="cover"
              onMediaChange={(src) => update({ posterImageDesktop: src })}
              uploadButtonText="Upload"
              acceptedTypes="image/*"
            />
          </Field>
          <Field label="Poster · Mobile">
            <MediaUpload
              src={data.posterImageMobile ?? ''}
              width={140}
              height={90}
              objectFit="cover"
              onMediaChange={(src) => update({ posterImageMobile: src })}
              uploadButtonText="Upload"
              acceptedTypes="image/*"
            />
          </Field>
        </div>

        {mediaType === 'video' && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Autoplay">
                <Toggle value={data.videoAutoplay !== false} onChange={(v) => update({ videoAutoplay: v })} />
              </Field>
              <Field label="Loop">
                <Toggle value={data.videoLoop !== false} onChange={(v) => update({ videoLoop: v })} />
              </Field>
              <Field label="Muted">
                <Toggle value={data.videoMuted !== false} onChange={(v) => update({ videoMuted: v })} />
              </Field>
            </div>

            <Field label="Video Start">
              <select
                className={inputCls}
                value={data.videoStartMode ?? 'immediate'}
                onChange={(e) => update({ videoStartMode: e.target.value })}
              >
                <option value="immediate">Immediate — play as soon as it loads</option>
                <option value="after-poster">Show poster first, then start on a timer</option>
              </select>
            </Field>

            {data.videoStartMode === 'after-poster' && (
              <Field label={`Start Video After — ${data.videoStartDelayMs ?? 1800}ms`}>
                <input
                  type="range"
                  min={0}
                  max={6000}
                  step={100}
                  value={data.videoStartDelayMs ?? 1800}
                  onChange={(e) => update({ videoStartDelayMs: parseInt(e.target.value, 10) })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Needs a poster image — the still is held on screen until the timer fires, then cross-fades to the video.
                </p>
              </Field>
            )}
          </>
        )}
      </Collapsible>

      {/* ── Overlay ── */}
      <Collapsible title="Overlay">
        <ColorField label="Overlay Color" value={data.overlayColor ?? '#000000'} onChange={(v) => update({ overlayColor: v })} />
        <Field label={`Overlay Opacity — ${Math.round((data.overlayOpacity ?? 0.35) * 100)}%`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={data.overlayOpacity ?? 0.35}
            onChange={(e) => update({ overlayOpacity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </Field>
      </Collapsible>

      {/* ── Content ── */}
      <Collapsible title="Content" defaultOpen>
        <Field label="Tagline">
          <input className={inputCls} value={data.tagline ?? ''} onChange={(e) => update({ tagline: e.target.value })} />
        </Field>
        <Field label="Body (one line per row)">
          <textarea
            className={textareaCls}
            rows={3}
            value={data.body ?? ''}
            onChange={(e) => update({ body: e.target.value })}
          />
        </Field>

        <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
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
        </div>
      </Collapsible>

      {/* ── Opening Reveal ── */}
      <Collapsible title="Opening Reveal">
        <Field label="Enable Opening Reveal">
          <Toggle value={opening.enabled === true} onChange={(v) => updateNested('opening', { enabled: v })} />
        </Field>
        {opening.enabled && (
          <>
            <Field label="Logo / Wordmark">
              <MediaUpload
                src={opening.logoUrl ?? ''}
                width={160}
                height={80}
                objectFit="contain"
                onMediaChange={(src) => updateNested('opening', { logoUrl: src })}
                uploadButtonText="Upload Logo"
                acceptedTypes="image/*"
              />
            </Field>
            <ColorField
              label="Panel Background"
              value={opening.backgroundColor ?? '#fafafa'}
              onChange={(v) => updateNested('opening', { backgroundColor: v })}
            />
            <Field label={`Backdrop Opacity — ${Math.round((opening.backgroundOpacity ?? 1) * 100)}%`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opening.backgroundOpacity ?? 1}
                onChange={(e) => updateNested('opening', { backgroundOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Below 100% the background video/image stays visible behind the logo during the opening. The logo itself
                always stays fully opaque.
              </p>
            </Field>
            <Field label={`Duration — ${opening.durationMs ?? 1200}ms`}>
              <input
                type="range"
                min={300}
                max={4000}
                step={100}
                value={opening.durationMs ?? 1200}
                onChange={(e) => updateNested('opening', { durationMs: parseInt(e.target.value, 10) })}
                className="w-full"
              />
            </Field>
          </>
        )}
      </Collapsible>

      {/* ── Theme & Motion ── */}
      <Collapsible title="Theme & Motion" defaultOpen>
        <Field label="Theme">
          <select className={inputCls} value={data.theme ?? 'dark'} onChange={(e) => update({ theme: e.target.value })}>
            <option value="dark">Dark (light text)</option>
            <option value="light">Light (dark text)</option>
          </select>
        </Field>

        <Field label="Show Scroll Cue">
          <Toggle value={data.showScrollCue !== false} onChange={(v) => update({ showScrollCue: v })} />
        </Field>

        <Field label="Scroll Effect">
          <select className={inputCls} value={scrollEffect} onChange={(e) => update({ scrollEffect: e.target.value })}>
            <option value="none">None — static</option>
            <option value="parallax">Parallax — background drifts as you scroll</option>
            <option value="pin-reveal">Pin & Reveal — cover pins, content cross-fades</option>
          </select>
        </Field>

        {scrollEffect === 'parallax' && (
          <Field label={`Parallax Intensity — ${data.parallaxIntensity ?? 30}`}>
            <input
              type="range"
              min={0}
              max={100}
              value={data.parallaxIntensity ?? 30}
              onChange={(e) => update({ parallaxIntensity: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </Field>
        )}

        {scrollEffect === 'pin-reveal' && (
          <Field label={`Pin Distance — ${data.pinDistanceVh ?? 80}vh`}>
            <input
              type="range"
              min={20}
              max={200}
              value={data.pinDistanceVh ?? 80}
              onChange={(e) => update({ pinDistanceVh: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </Field>
        )}
      </Collapsible>

      {/* ── Layout ── */}
      <Collapsible title="Layout">
        <Field label="Minimum Height (CSS value)">
          <input
            className={inputCls}
            value={data.minHeight ?? '100vh'}
            onChange={(e) => update({ minHeight: e.target.value })}
            placeholder="100vh"
          />
        </Field>
      </Collapsible>
    </div>
  );
}
