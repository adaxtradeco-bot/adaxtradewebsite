/**
 * Theme Selector Component
 * For selecting color themes in PropertyPanel
 */

'use client';

import React from 'react';
import { PRODUCT_HERO_THEMES, ColorTheme } from '@/lib/themes/product-hero-themes';

interface ThemeSelectorProps {
  value?: string;
  onChange: (themeId: string) => void;
  onCustom?: () => void;
  className?: string;
}

export function ThemeSelector({ value, onChange, onCustom, className = '' }: ThemeSelectorProps) {
  const selectedTheme = PRODUCT_HERO_THEMES.find(t => t.id === value);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        {PRODUCT_HERO_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            className={`relative p-3 rounded-lg border-2 transition-all ${
              value === theme.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-4 h-4 rounded-full ${theme.titleGradient.from} bg-gradient-to-r ${theme.titleGradient.to}`} />
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {theme.name}
              </span>
            </div>
            <div className={`h-8 rounded ${theme.background}`} />
            {value === theme.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {onCustom && (
        <button
          type="button"
          onClick={onCustom}
          className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          🎨 Custom Gradient
        </button>
      )}

      {selectedTheme && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
          <div className="font-medium text-gray-900 dark:text-white mb-1">
            Selected: {selectedTheme.name}
          </div>
          <div className="text-gray-600 dark:text-gray-400 space-y-1">
            <div>Background: <code className="text-xs">{selectedTheme.background.substring(0, 40)}...</code></div>
            <div>Title: <code className="text-xs">{selectedTheme.titleGradient.from} {selectedTheme.titleGradient.to}</code></div>
          </div>
        </div>
      )}
    </div>
  );
}
