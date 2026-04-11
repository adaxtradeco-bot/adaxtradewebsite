/**
 * Field Helper Component - Inline Help Tooltip
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import type { FieldHelper } from '@/lib/page-builder/field-helpers';

interface FieldHelperProps {
  helper: FieldHelper;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function FieldHelperTooltip({
  helper,
  position = 'right',
}: FieldHelperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="ml-1.5 text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
        title="Show help"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-80 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl ${
            position === 'right'
              ? 'left-full ml-2 top-0'
              : position === 'left'
                ? 'right-full mr-2 top-0'
                : position === 'bottom'
                  ? 'top-full mt-2 left-0'
                  : 'bottom-full mb-2 left-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {helper.label}
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            {helper.description}
          </p>

          {/* Allowed Values */}
          {helper.allowedValues && helper.allowedValues.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Allowed Values:
              </div>
              <div className="space-y-1">
                {helper.allowedValues.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900/50"
                  >
                    {item.preview && (
                      <div
                        className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0 mt-0.5"
                        style={{
                          background: item.preview.startsWith('#')
                            ? item.preview
                            : item.preview.includes('gradient')
                              ? `linear-gradient(to right, var(--tw-gradient-stops))`
                              : undefined,
                        }}
                        title={item.preview}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400 break-all">
                        {item.value}
                      </code>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {helper.examples && helper.examples.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Examples:
              </div>
              <div className="space-y-1">
                {helper.examples.map((example, idx) => (
                  <code
                    key={idx}
                    className="block text-xs font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded"
                  >
                    {example}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {helper.note && (
            <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded border-l-2 border-amber-500">
              💡 {helper.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
