/**
 * Inline Field Helper - Simple Tooltip
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';

interface FieldHelperProps {
  label: string;
  description?: string;
  values?: Array<{ value: string; label: string; color?: string }>;
  examples?: string[];
  note?: string;
}

export function InlineFieldHelper({ label, description, values, examples, note }: FieldHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        title={`Help: ${label}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-full ml-2 top-0 z-50 w-72 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl p-3 text-left">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {label}
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 -mt-1"
            >
              ✕
            </button>
          </div>

          {description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
              {description}
            </p>
          )}

          {values && values.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Allowed Values:
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {values.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900/50 text-xs"
                  >
                    {item.color && (
                      <div
                        className="w-3 h-3 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
                        style={{ background: item.color }}
                      />
                    )}
                    <code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {item.value}
                    </code>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {examples && examples.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Examples:
              </div>
              {examples.map((ex, idx) => (
                <code
                  key={idx}
                  className="block text-[10px] font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded mb-1"
                >
                  {ex}
                </code>
              ))}
            </div>
          )}

          {note && (
            <div className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
              💡 {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
