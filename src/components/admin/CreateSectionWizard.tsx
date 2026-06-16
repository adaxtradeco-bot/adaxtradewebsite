'use client';

import { useState } from 'react';

const CATEGORIES = ['Headers', 'Content', 'Actions', 'Social Proof', 'Navigation'];

const COMMON_ICONS = ['🎯', '⭐', '🚀', '💡', '🔧', '📊', '💬', '🎨', '⚡', '🌟', '🔥', '✅', '🛡️', '📱', '🌐'];

interface WizardProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function toComponentName(typeSlug: string): string {
  return typeSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') + 'Section';
}

function toTypeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const DEFAULT_COMPONENT_TEMPLATE = (componentName: string, typeSlug: string) => `'use client';

import React from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';

interface ${componentName}Props {
  section: SectionConfig;
  isBuilder?: boolean;
}

export default function ${componentName}({ section, isBuilder = false }: ${componentName}Props) {
  const { data } = section;

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {data.title || 'Section Title'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {data.description || 'Section description goes here.'}
          </p>
        </div>
      </div>
    </section>
  );
}
`;

const DEFAULT_DATA_TEMPLATE = {
  title: 'Your Section Title',
  description: 'Your section description goes here.',
};

export default function CreateSectionWizard({ onClose, onSuccess, onError }: WizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic info
  const [name, setName] = useState('');
  const [typeSlug, setTypeSlug] = useState('');
  const [category, setCategory] = useState('Content');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🔧');
  const [customIcon, setCustomIcon] = useState('');

  // Step 2: defaultData
  const [defaultDataStr, setDefaultDataStr] = useState(
    JSON.stringify(DEFAULT_DATA_TEMPLATE, null, 2)
  );
  const [defaultDataError, setDefaultDataError] = useState('');

  // Step 3: Component code
  const componentName = toComponentName(typeSlug || 'new-section');
  const [componentCode, setComponentCode] = useState('');

  function handleNameChange(v: string) {
    setName(v);
    if (!typeSlug || typeSlug === toTypeSlug(name)) {
      setTypeSlug(toTypeSlug(v));
    }
  }

  function handleTypeSlugChange(v: string) {
    const clean = v.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setTypeSlug(clean);
  }

  function goToStep2() {
    if (!name.trim() || !typeSlug.trim()) return;
    setStep(2);
  }

  function goToStep3() {
    try {
      JSON.parse(defaultDataStr);
      setDefaultDataError('');
    } catch {
      setDefaultDataError('Invalid JSON — please fix before continuing.');
      return;
    }
    if (!componentCode) {
      setComponentCode(DEFAULT_COMPONENT_TEMPLATE(componentName, typeSlug));
    }
    setStep(3);
  }

  function goToStep4() {
    if (!componentCode.trim()) return;
    setStep(4);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      let parsedData: object;
      try {
        parsedData = JSON.parse(defaultDataStr);
      } catch {
        onError('Invalid JSON in Default Data step.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/admin/sections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeSlug,
          name,
          category,
          description,
          icon: customIcon || icon,
          defaultData: parsedData,
          componentCode,
          componentName,
        }),
      });

      const result = await res.json();
      if (result.success) {
        onSuccess(result.message);
      } else {
        onError(result.message);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepTitles = ['Basic Info', 'Default Data', 'Component Code', 'Confirm'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Section</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Step {step} of 4 — {stepTitles[step - 1]}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 pt-4 gap-2">
          {stepTitles.map((title, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i + 1 === step
                    ? 'bg-blue-600 text-white'
                    : i + 1 < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {title}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Pricing Table"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type Slug <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-400 font-normal">(kebab-case, unique identifier)</span>
                </label>
                <input
                  value={typeSlug}
                  onChange={e => handleTypeSlugChange(e.target.value)}
                  placeholder="e.g. pricing-table"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                />
                {typeSlug && (
                  <p className="mt-1 text-xs text-gray-500">
                    Component name: <code className="text-blue-600">{componentName}</code>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short description of this section's purpose..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_ICONS.map(e => (
                    <button
                      key={e}
                      onClick={() => { setIcon(e); setCustomIcon(''); }}
                      className={`w-10 h-10 text-xl rounded-lg transition-colors ${
                        icon === e && !customIcon
                          ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  value={customIcon}
                  onChange={e => setCustomIcon(e.target.value)}
                  placeholder="Or type any emoji..."
                  maxLength={4}
                  className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Default Data ── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define the initial data structure for this section. This is what gets populated when the section is added to a page.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Data <span className="text-xs text-gray-400 font-normal">(JSON — the content of <code>section.data</code>)</span>
                </label>
                <textarea
                  value={defaultDataStr}
                  onChange={e => { setDefaultDataStr(e.target.value); setDefaultDataError(''); }}
                  rows={16}
                  spellCheck={false}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 resize-y"
                />
                {defaultDataError && (
                  <p className="mt-1 text-sm text-red-500">{defaultDataError}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Component Code ── */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste the full React TSX component code. The component will be saved as{' '}
                <code className="text-blue-600 dark:text-blue-400">
                  src/components/builder-sections/{componentName}.tsx
                </code>
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
                <strong>Convention:</strong> The component receives <code>{'{ section, isBuilder }'}</code> props.
                Access content via <code>section.data</code>. Export as <code>default</code>.
              </div>
              <textarea
                value={componentCode}
                onChange={e => setComponentCode(e.target.value)}
                rows={22}
                spellCheck={false}
                placeholder={DEFAULT_COMPONENT_TEMPLATE(componentName, typeSlug)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review before creating. The following files will be written/updated:
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{customIcon || icon}</span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{name}</div>
                    <div className="text-sm text-gray-500">{category} · {description}</div>
                    <code className="text-xs text-blue-600 dark:text-blue-400">{typeSlug}</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { path: `src/components/builder-sections/${componentName}.tsx`, label: 'NEW — Component file' },
                  { path: 'src/lib/page-builder/section-templates/custom-sections.ts', label: 'UPDATED — Template registry' },
                  { path: 'src/lib/page-builder/section-registry.ts', label: 'UPDATED — Main registry (first run only)' },
                  { path: 'src/lib/page-builder/section-schemas.ts', label: 'UPDATED — Zod schema types' },
                  { path: 'src/lib/page-builder/section-renderer.tsx', label: 'UPDATED — Section renderer' },
                ].map(f => (
                  <div key={f.path} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <div>
                      <code className="text-gray-700 dark:text-gray-300 text-xs">{f.path}</code>
                      <div className="text-gray-500 text-xs">{f.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300">
                After creation, restart the dev server (<code>npm run dev</code>) to load the new section.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {step > 1 ? '← Back' : 'Cancel'}
          </button>

          <div className="flex gap-3">
            {step < 4 && (
              <button
                onClick={() => {
                  if (step === 1) goToStep2();
                  else if (step === 2) goToStep3();
                  else if (step === 3) goToStep4();
                }}
                disabled={step === 1 && (!name.trim() || !typeSlug.trim())}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next →
              </button>
            )}
            {step === 4 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin text-lg">⟳</span>
                    Creating...
                  </>
                ) : (
                  '✓ Create Section'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
