'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { MediaBrowser } from './MediaBrowser';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Collapsible({
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
        onClick={() => setOpen(v => !v)}
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

function MediaField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [showBrowser, setShowBrowser] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-xs text-gray-600 dark:text-gray-300 break-all">
          {value}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Image/Video URL"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
        <button
          type="button"
          onClick={() => setShowBrowser(true)}
          className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
        >
          📚
        </button>
        <label className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm">
          {uploading ? '⏳' : '📤'}
          <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <MediaBrowser
        isOpen={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSelect={url => {
          onChange(url);
          setShowBrowser(false);
        }}
        acceptTypes={['image/*', 'video/*']}
      />
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const textareaCls = `${inputCls} resize-none`;

export function PlatformCapabilitiesPropertyPanel({ section, onUpdate }: Props) {
  const data = section.data as any;
  const modules = data.modules || [];

  const update = (patch: Record<string, any>) => onUpdate({ data: { ...data, ...patch } });

  const updateModule = (mIdx: number, patch: Record<string, any>) => {
    const next = modules.map((m: any, i: number) => (i === mIdx ? { ...m, ...patch } : m));
    update({ modules: next });
  };

  const updateFeature = (mIdx: number, fIdx: number, patch: Record<string, any>) => {
    const next = modules.map((m: any, mi: number) => {
      if (mi !== mIdx) return m;
      return {
        ...m,
        features: (m.features || []).map((f: any, fi: number) => (fi === fIdx ? { ...f, ...patch } : f)),
      };
    });
    update({ modules: next });
  };

  const updateBadge = (mIdx: number, fIdx: number, bIdx: number, patch: Record<string, any>) => {
    const current = modules[mIdx]?.features?.[fIdx]?.badges || [];
    const next = current.map((b: any, i: number) => (i === bIdx ? { ...b, ...patch } : b));
    updateFeature(mIdx, fIdx, { badges: next });
  };

  const addBadge = (mIdx: number, fIdx: number) => {
    const current = modules[mIdx]?.features?.[fIdx]?.badges || [];
    updateFeature(mIdx, fIdx, { badges: [...current, { text: 'New badge', variant: 'blue' }] });
  };

  const removeBadge = (mIdx: number, fIdx: number, bIdx: number) => {
    const current = modules[mIdx]?.features?.[fIdx]?.badges || [];
    updateFeature(mIdx, fIdx, { badges: current.filter((_: any, i: number) => i !== bIdx) });
  };

  return (
    <div className="space-y-4">
      <Collapsible title="Header" defaultOpen>
        <Field label="Eyebrow Text">
          <input className={inputCls} value={data.eyebrowText || ''} onChange={e => update({ eyebrowText: e.target.value })} />
        </Field>
        <Field label="Title">
          <input className={inputCls} value={data.title || ''} onChange={e => update({ title: e.target.value })} />
        </Field>
        <Field label="Title Highlight">
          <input className={inputCls} value={data.titleHighlight || ''} onChange={e => update({ titleHighlight: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea rows={4} className={textareaCls} value={data.description || ''} onChange={e => update({ description: e.target.value })} />
        </Field>
      </Collapsible>

      <Collapsible title="Accent Colors" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Primary">
            <div className="flex items-center gap-2">
              <input type="color" value={data.accentColor || '#4F7FFF'} onChange={e => update({ accentColor: e.target.value })} className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600" />
              <input className={inputCls} value={data.accentColor || ''} onChange={e => update({ accentColor: e.target.value })} />
            </div>
          </Field>
          <Field label="Secondary">
            <div className="flex items-center gap-2">
              <input type="color" value={data.accentColor2 || '#7B5CFF'} onChange={e => update({ accentColor2: e.target.value })} className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600" />
              <input className={inputCls} value={data.accentColor2 || ''} onChange={e => update({ accentColor2: e.target.value })} />
            </div>
          </Field>
        </div>
      </Collapsible>

      <Collapsible title="Modules & Features" badge={`${modules.length}`} defaultOpen>
        {modules.map((module: any, mIdx: number) => (
          <Collapsible key={mIdx} title={`Module ${mIdx + 1}: ${module.title || '(untitled)'}`} badge={`${(module.features || []).length} features`}>
            <Field label="Module Title">
              <input className={inputCls} value={module.title || ''} onChange={e => updateModule(mIdx, { title: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Emoji">
                <input className={inputCls} value={module.emoji || ''} onChange={e => updateModule(mIdx, { emoji: e.target.value })} />
              </Field>
              <Field label="Dot Color">
                <input className={inputCls} value={module.dotColor || ''} onChange={e => updateModule(mIdx, { dotColor: e.target.value })} />
              </Field>
            </div>
            <Field label="Top Padding (px)">
              <input type="number" className={inputCls} value={module.paddingTop || 0} onChange={e => updateModule(mIdx, { paddingTop: Number(e.target.value) || 0 })} />
            </Field>

            {(module.features || []).map((feature: any, fIdx: number) => (
              <Collapsible key={fIdx} title={`Feature ${fIdx + 1}`} defaultOpen={fIdx === 0}>
                <Field label="Module Tag">
                  <input className={inputCls} value={feature.moduleTag || ''} onChange={e => updateFeature(mIdx, fIdx, { moduleTag: e.target.value })} />
                </Field>
                <Field label="Title">
                  <textarea rows={2} className={textareaCls} value={feature.title || ''} onChange={e => updateFeature(mIdx, fIdx, { title: e.target.value })} />
                </Field>
                <Field label="Body">
                  <textarea rows={4} className={textareaCls} value={feature.body || ''} onChange={e => updateFeature(mIdx, fIdx, { body: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Theme">
                    <select className={inputCls} value={feature.theme || 'blue'} onChange={e => updateFeature(mIdx, fIdx, { theme: e.target.value })}>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                      <option value="amber">Amber</option>
                      <option value="coral">Coral</option>
                    </select>
                  </Field>
                  <Field label="Layout">
                    <select className={inputCls} value={feature.flip ? 'flip' : 'normal'} onChange={e => updateFeature(mIdx, fIdx, { flip: e.target.value === 'flip' })}>
                      <option value="normal">Normal</option>
                      <option value="flip">Flip</option>
                    </select>
                  </Field>
                </div>
                <Field label="Badges">
                  <div className="space-y-2">
                    {(feature.badges || []).map((badge: any, bIdx: number) => (
                      <div key={bIdx} className="grid grid-cols-[1fr_120px_56px] gap-2">
                        <input
                          className={inputCls}
                          value={badge.text || ''}
                          onChange={e => updateBadge(mIdx, fIdx, bIdx, { text: e.target.value })}
                          placeholder="Badge text"
                        />
                        <select
                          className={inputCls}
                          value={badge.variant || 'blue'}
                          onChange={e => updateBadge(mIdx, fIdx, bIdx, { variant: e.target.value })}
                        >
                          <option value="blue">Blue</option>
                          <option value="purple">Purple</option>
                          <option value="green">Green</option>
                          <option value="amber">Amber</option>
                          <option value="coral">Coral</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeBadge(mIdx, fIdx, bIdx)}
                          className="px-2 py-2 text-xs rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBadge(mIdx, fIdx)}
                      className="w-full py-2 border border-dashed border-blue-300 dark:border-blue-700 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      + Add Badge
                    </button>
                  </div>
                </Field>
                <Field label="Visual Badge">
                  <input className={inputCls} value={feature.visualBadge || ''} onChange={e => updateFeature(mIdx, fIdx, { visualBadge: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Visual Icon (emoji)">
                    <input className={inputCls} value={feature.visualIcon || ''} onChange={e => updateFeature(mIdx, fIdx, { visualIcon: e.target.value })} />
                  </Field>
                  <Field label="Visual Label">
                    <input className={inputCls} value={feature.visualLabel || ''} onChange={e => updateFeature(mIdx, fIdx, { visualLabel: e.target.value })} />
                  </Field>
                </div>
                <Field label="Visual Media (image/video)">
                  <MediaField value={feature.visualMedia || ''} onChange={url => updateFeature(mIdx, fIdx, { visualMedia: url })} />
                </Field>
                <Field label="Media Alt">
                  <input className={inputCls} value={feature.visualMediaAlt || ''} onChange={e => updateFeature(mIdx, fIdx, { visualMediaAlt: e.target.value })} />
                </Field>
                
                <Collapsible title="Placeholder Badge Settings" defaultOpen={false}>
                  <Field label="Show Placeholder Badge">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={feature.showPlaceholder !== false} 
                        onChange={e => updateFeature(mIdx, fIdx, { showPlaceholder: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Display placeholder when no media or media fails to load
                      </span>
                    </div>
                  </Field>
                  {feature.showPlaceholder !== false && (
                    <>
                      <Field label="Placeholder Icon (emoji)">
                        <input 
                          className={inputCls} 
                          value={feature.placeholderIcon || feature.visualIcon || ''} 
                          onChange={e => updateFeature(mIdx, fIdx, { placeholderIcon: e.target.value })}
                          placeholder="Leave empty to use Visual Icon"
                        />
                      </Field>
                      <Field label="Placeholder Text">
                        <input 
                          className={inputCls} 
                          value={feature.placeholderText || feature.visualLabel || ''} 
                          onChange={e => updateFeature(mIdx, fIdx, { placeholderText: e.target.value })}
                          placeholder="Leave empty to use Visual Label"
                        />
                      </Field>
                    </>
                  )}
                </Collapsible>
              </Collapsible>
            ))}
          </Collapsible>
        ))}
      </Collapsible>
    </div>
  );
}
