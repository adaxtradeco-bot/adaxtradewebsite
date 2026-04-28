/**
 * Infographic Field Editor - Simple Wrapper
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Simple wrapper for existing infographic fields with optional advanced settings
 */
'use client';

import React, { useState } from 'react';
import { INFOGRAPHIC_TYPE_OPTIONS, INFOGRAPHIC_DEFAULT_DATA, getInfographicStructurePreview } from '@/lib/page-builder/infographic-defaults';
import InfographicSettings from '@/components/ui/InfographicSettings';
import { InfographicTheme, InfographicAnimation, InfographicStyle, DEFAULT_THEME, DEFAULT_ANIMATION, DEFAULT_STYLE } from '@/lib/infographic-themes';
import { ImageUploader } from './ImageUploader';
import { InlineFieldHelper } from './InlineFieldHelper';

interface InfographicFieldEditorProps {
  value?: any; // Legacy infographic object
  onChange: (value: any) => void;
  label?: string;
  showAdvancedSettings?: boolean;
}

export default function InfographicFieldEditor({
  value,
  onChange,
  label = 'Infographic',
  showAdvancedSettings = false,
}: InfographicFieldEditorProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleTypeChange = (type: string) => {
    if (!type) {
      onChange(undefined);
      return;
    }

    const newValue = {
      type,
      data: INFOGRAPHIC_DEFAULT_DATA[type] || {},
      // Add default theme/animation/style if advanced settings are enabled
      ...(showAdvancedSettings && {
        theme: value?.theme || DEFAULT_THEME,
        animation: value?.animation || DEFAULT_ANIMATION,
        style: value?.style || DEFAULT_STYLE,
      }),
    };

    onChange(newValue);
  };

  const handleAdvancedSettingsChange = (updates: {
    theme?: InfographicTheme;
    animation?: InfographicAnimation;
    style?: InfographicStyle;
  }) => {
    if (!value) return;

    onChange({
      ...value,
      ...updates,
    });
  };

  const handleMediaChange = (mediaValue: any) => {
    if (!value) return;

    onChange({
      ...value,
      data: typeof mediaValue === 'object' 
        ? mediaValue 
        : { 
            src: mediaValue, 
            type: 'image', 
            alt: '', 
            maxWidth: null, 
            maxHeight: null, 
            objectFit: 'cover' 
          }
    });
  };

  return (
    <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
      {/* Type Selection */}
      <label className="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label}
        <InlineFieldHelper
          label="Infographic Type"
          description="Visual data representation"
          note={showAdvancedSettings ? "Advanced theming available below" : "Use JSON Editor to configure data"}
        />
      </label>
      
      <select
        value={value?.type || ''}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {INFOGRAPHIC_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Advanced Settings Toggle */}
      {value?.type && showAdvancedSettings && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <span>{showSettings ? '🔽' : '▶️'}</span>
            🎨 Theme & Animation Settings
          </button>
        </div>
      )}

      {/* Data Preview for non-media types */}
      {value?.type && value.type !== 'media' && (
        <div className="mt-1 space-y-1">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-[10px] text-blue-800 dark:text-blue-200">
            💡 Switch to <strong>JSON Editor</strong> to edit data
          </div>
          <pre className="p-2 bg-slate-900 text-green-400 rounded text-[9px] leading-relaxed overflow-x-auto max-h-40 overflow-y-auto">
            {getInfographicStructurePreview(value.type)}
          </pre>
        </div>
      )}

      {/* Media Upload for media type */}
      {value?.type === 'media' && (
        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Media
          </label>
          <ImageUploader
            value={value.data || ''}
            onChange={handleMediaChange}
            acceptTypes={['image/*', 'video/*']}
          />
        </div>
      )}

      {/* Advanced Settings Panel */}
      {value?.type && showSettings && showAdvancedSettings && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              🎨 Advanced Infographic Settings
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Configure theme, animations, and styling for this infographic
            </p>
          </div>
          
          <InfographicSettings
            theme={value.theme}
            animation={value.animation}
            style={value.style}
            onChange={handleAdvancedSettingsChange}
          />
        </div>
      )}

      {/* Current Settings Summary */}
      {value?.type && (value.theme || value.animation || value.style) && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-[10px] text-green-800 dark:text-green-200">
          <div className="font-semibold mb-1">✨ Enhanced Settings Applied:</div>
          <div className="space-y-0.5">
            {value.theme && (
              <div>
                🎨 Theme: {value.theme.preset}
                {value.theme.lightModeTheme && ` (Light: ${value.theme.lightModeTheme})`}
                {value.theme.darkModeTheme && ` (Dark: ${value.theme.darkModeTheme})`}
              </div>
            )}
            {value.animation && (
              <div>
                ✨ Animation: {value.animation.type} ({value.animation.speed})
                {value.animation.type === 'stagger' && ` - ${value.animation.staggerDelay}ms delay`}
              </div>
            )}
            {value.style && (
              <div>
                🎭 Style: {value.style.displayMode} mode, {value.style.hoverEffect} hover, {value.style.borderStyle} border
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}