/**
 * Icon Selector Component
 * Wrapper for IconPicker with better UX in PropertyPanel
 */

'use client';

import React, { useState } from 'react';
import { IconConfig, IconDisplay, IconPicker } from './IconPicker';

interface IconSelectorProps {
  value?: IconConfig | null;
  emojiValue?: string;
  onChange: (iconConfig: IconConfig | null, emoji?: string) => void;
  label?: string;
  allowEmoji?: boolean;
  className?: string;
}

export function IconSelector({ 
  value, 
  emojiValue,
  onChange, 
  label = 'Icon',
  allowEmoji = true,
  className = '' 
}: IconSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'emoji' | 'fontawesome'>(value ? 'fontawesome' : 'emoji');

  const handleModeChange = (newMode: 'emoji' | 'fontawesome') => {
    setMode(newMode);
    if (newMode === 'emoji') {
      onChange(null, emojiValue || '');
    } else {
      onChange(value || null, '');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {allowEmoji && (
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => handleModeChange('emoji')}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
              mode === 'emoji'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            😀 Emoji
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('fontawesome')}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
              mode === 'fontawesome'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <i className="fas fa-icons mr-1" /> Font Awesome
          </button>
        </div>
      )}

      {mode === 'emoji' ? (
        <input
          type="text"
          value={emojiValue || ''}
          onChange={(e) => onChange(null, e.target.value)}
          placeholder="Enter emoji (e.g., 🚀)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl text-center"
          maxLength={2}
        />
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {value ? (
              <div className="flex items-center gap-2">
                <IconDisplay icon={value} />
                <span className="text-sm text-gray-900 dark:text-white">{value.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  {value.type} • {value.size}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">Select icon...</span>
            )}
          </button>

          {showPicker && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1">
              <IconPicker
                value={value || undefined}
                onChange={(icon) => {
                  onChange(icon, '');
                  setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
              />
            </div>
          )}
        </div>
      )}

      {value && mode === 'fontawesome' && (
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <IconDisplay icon={value} className="text-4xl" />
        </div>
      )}

      {emojiValue && mode === 'emoji' && (
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-4xl">
          {emojiValue}
        </div>
      )}
    </div>
  );
}
