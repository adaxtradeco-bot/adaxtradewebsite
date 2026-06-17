'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

/* ─── Shared helpers ─── */
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

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-1 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700 shrink-0"
        />
        <input
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex or rgba(...)"
        />
      </div>
    </Field>
  );
}

/* ─── Main panel ─── */
export function TopStripPropertyPanel({ section, onUpdate }: Props) {
  const data = section.data as any;
  const update = (patch: Record<string, any>) => onUpdate({ data: { ...data, ...patch } });

  const leftItems: any[] = data.leftItems ?? [];
  const rightLinks: any[] = data.rightLinks ?? [];

  const updateLeftItem = (idx: number, field: string, val: string) => {
    const next = leftItems.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
    update({ leftItems: next });
  };

  const updateRightLink = (idx: number, field: string, val: string) => {
    const next = rightLinks.map((link, i) => (i === idx ? { ...link, [field]: val } : link));
    update({ rightLinks: next });
  };

  return (
    <div className="space-y-4">

      {/* ── Visibility & Layout ── */}
      <Collapsible title="Visibility & Layout" defaultOpen>
        <Field label="Show Top Strip">
          <div className="flex items-center gap-2">
            <Toggle
              value={data.visible !== false}
              onChange={(v) => update({ visible: v })}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {data.visible !== false ? 'Visible' : 'Hidden'}
            </span>
          </div>
        </Field>

        <Field label="Vertical Padding">
          <select
            className={inputCls}
            value={data.paddingY ?? 'normal'}
            onChange={(e) => update({ paddingY: e.target.value })}
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>
        </Field>

        <Field label="Bottom Border">
          <div className="flex items-center gap-2">
            <Toggle
              value={!!data.borderBottom}
              onChange={(v) => update({ borderBottom: v })}
            />
          </div>
        </Field>

        {data.borderBottom && (
          <ColorField
            label="Border Color"
            value={data.borderColor ?? 'rgba(255,255,255,0.08)'}
            onChange={(v) => update({ borderColor: v })}
          />
        )}
      </Collapsible>

      {/* ── Colors ── */}
      <Collapsible title="Colors (Light / Dark Mode)">
        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2">
          Set separate colors for light and dark mode.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-2">
            <ColorField
              label="Background · Light"
              value={data.backgroundColor ?? '#1e293b'}
              onChange={(v) => update({ backgroundColor: v })}
            />
            <ColorField
              label="Background · Dark"
              value={data.darkBackgroundColor ?? '#0f172a'}
              onChange={(v) => update({ darkBackgroundColor: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ColorField
              label="Text · Light"
              value={data.textColor ?? '#94a3b8'}
              onChange={(v) => update({ textColor: v })}
            />
            <ColorField
              label="Text · Dark"
              value={data.darkTextColor ?? '#cbd5e1'}
              onChange={(v) => update({ darkTextColor: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ColorField
              label="Link · Light"
              value={data.linkColor ?? '#e2e8f0'}
              onChange={(v) => update({ linkColor: v })}
            />
            <ColorField
              label="Link · Dark"
              value={data.darkLinkColor ?? '#f1f5f9'}
              onChange={(v) => update({ darkLinkColor: v })}
            />
          </div>
        </div>
      </Collapsible>

      {/* ── Pulse indicator ── */}
      <Collapsible title="Live Pulse Indicator">
        <Field label="Show Pulse Dot">
          <div className="flex items-center gap-2">
            <Toggle
              value={data.showPulse !== false}
              onChange={(v) => update({ showPulse: v })}
            />
          </div>
        </Field>
        {data.showPulse !== false && (
          <ColorField
            label="Pulse Color"
            value={data.pulseColor ?? '#22c55e'}
            onChange={(v) => update({ pulseColor: v })}
          />
        )}
      </Collapsible>

      {/* ── Left Items ── */}
      <Collapsible title="Left Items" badge={`${leftItems.length}`} defaultOpen>
        {leftItems.map((item: any, i: number) => (
          <div key={i} className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Item {i + 1}</span>
              <button
                type="button"
                onClick={() => update({ leftItems: leftItems.filter((_, li) => li !== i) })}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕ Remove
              </button>
            </div>
            <Field label="Icon">
              <select
                className={inputCls}
                value={item.icon ?? 'none'}
                onChange={(e) => updateLeftItem(i, 'icon', e.target.value)}
              >
                <option value="none">No Icon</option>
                <option value="location">📍 Location</option>
                <option value="clock">🕐 Clock / Hours</option>
                <option value="info">ℹ️ Info</option>
              </select>
            </Field>
            <Field label="Text">
              <input
                className={inputCls}
                value={item.text ?? ''}
                onChange={(e) => updateLeftItem(i, 'text', e.target.value)}
              />
            </Field>
            <Field label="Link (optional)">
              <input
                className={inputCls}
                value={item.href ?? ''}
                onChange={(e) => updateLeftItem(i, 'href', e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({ leftItems: [...leftItems, { icon: 'none', text: 'New Item' }] })
          }
          className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Add Item
        </button>
      </Collapsible>

      {/* ── Right Links ── */}
      <Collapsible title="Right Links" badge={`${rightLinks.length}`} defaultOpen>
        {rightLinks.map((link: any, i: number) => (
          <div key={i} className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Link {i + 1}</span>
              <button
                type="button"
                onClick={() => update({ rightLinks: rightLinks.filter((_, li) => li !== i) })}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕ Remove
              </button>
            </div>
            <Field label="Type">
              <select
                className={inputCls}
                value={link.type ?? 'custom'}
                onChange={(e) => updateRightLink(i, 'type', e.target.value)}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="custom">Custom Link</option>
              </select>
            </Field>
            <Field label="Display Text">
              <input
                className={inputCls}
                value={link.text ?? ''}
                onChange={(e) => updateRightLink(i, 'text', e.target.value)}
              />
            </Field>
            <Field label="href">
              <input
                className={inputCls}
                value={link.href ?? ''}
                onChange={(e) => updateRightLink(i, 'href', e.target.value)}
                placeholder={
                  link.type === 'email'
                    ? 'mailto:info@company.com'
                    : link.type === 'phone'
                    ? 'tel:+989123456789'
                    : 'https://...'
                }
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              rightLinks: [...rightLinks, { text: 'New Link', href: '#', type: 'custom' }],
            })
          }
          className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Add Link
        </button>
      </Collapsible>

    </div>
  );
}
