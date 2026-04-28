/**
 * Infographic Settings Component
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: UI component for configuring infographic theme, animation, and style
 */
'use client';

import React from 'react';
import {
  InfographicTheme,
  InfographicAnimation,
  InfographicStyle,
  ThemePreset,
  AnimationType,
  AnimationDirection,
  AnimationSpeed,
  EasingFunction,
  DisplayMode,
  HoverEffect,
  BorderStyle,
  BackgroundEffect,
  BackgroundPattern,
  BorderRadius,
  THEME_PRESETS,
  ColorPalette,
  getHoverEffectClasses,
  getBackgroundEffectStyles,
  getBorderStyleProperties,
  BORDER_RADIUS_MAP,
  DISPLAY_MODE_SCALES,
} from '@/lib/infographic-themes';

interface InfographicSettingsProps {
  theme?: InfographicTheme;
  animation?: InfographicAnimation;
  style?: InfographicStyle;
  onChange: (config: {
    theme?: InfographicTheme;
    animation?: InfographicAnimation;
    style?: InfographicStyle;
  }) => void;
}

export default function InfographicSettings({
  theme,
  animation,
  style,
  onChange,
}: InfographicSettingsProps) {
  const [activeTab, setActiveTab] = React.useState<'theme' | 'animation' | 'style'>('theme');

  // Theme handlers
  const handleThemeChange = (updates: Partial<InfographicTheme>) => {
    onChange({
      theme: { ...theme, ...updates } as InfographicTheme,
      animation,
      style,
    });
  };

  const handleCustomColorChange = (colorKey: keyof ColorPalette, value: string) => {
    const customColors = theme?.customColors || { ...THEME_PRESETS.custom };
    onChange({
      theme: {
        ...theme,
        preset: 'custom',
        customColors: {
          ...customColors,
          [colorKey]: value,
        },
      } as InfographicTheme,
      animation,
      style,
    });
  };

  // Animation handlers
  const handleAnimationChange = (updates: Partial<InfographicAnimation>) => {
    onChange({
      theme,
      animation: { ...animation, ...updates } as InfographicAnimation,
      style,
    });
  };

  // Style handlers
  const handleStyleChange = (updates: Partial<InfographicStyle>) => {
    onChange({
      theme,
      animation,
      style: { ...style, ...updates } as InfographicStyle,
    });
  };

  const themePresets: ThemePreset[] = [
    'corporate',
    'neon',
    'ocean',
    'sunset',
    'forest',
    'midnight',
    'candy',
    'monochrome',
    'custom',
  ];

  const animationTypes: AnimationType[] = [
    'none',
    'fadeIn',
    'slideIn',
    'scaleUp',
    'stagger',
    'bounce',
    'rotateIn',
  ];

  const animationDirections: AnimationDirection[] = ['left', 'right', 'top', 'bottom'];
  const animationSpeeds: AnimationSpeed[] = ['slow', 'normal', 'fast'];
  const easingFunctions: EasingFunction[] = [
    'linear',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'bounce',
  ];

  const displayModes: DisplayMode[] = ['compact', 'normal', 'expanded'];
  const hoverEffects: HoverEffect[] = ['none', 'glow', 'lift', 'pulse'];
  const borderStyles: BorderStyle[] = ['none', 'solid', 'gradient', 'dashed', 'glow'];
  const backgroundEffects: BackgroundEffect[] = [
    'transparent',
    'solid',
    'blur',
    'gradient',
    'pattern',
  ];
  const backgroundPatterns: BackgroundPattern[] = ['dots', 'lines', 'grid'];
  const borderRadiuses: BorderRadius[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

  return (
    <div className="infographic-settings bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'theme'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🎨 Theme
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('animation')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'animation'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          ✨ Animation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🎭 Style
        </button>
      </div>

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Main Theme Preset
            </label>
            <select
              value={theme?.preset || 'corporate'}
              onChange={(e) => handleThemeChange({ preset: e.target.value as ThemePreset })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
            >
              {themePresets.map((preset) => (
                <option key={preset} value={preset}>
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Light Mode Theme
              </label>
              <select
                value={theme?.lightModeTheme || ''}
                onChange={(e) =>
                  handleThemeChange({
                    lightModeTheme: e.target.value ? (e.target.value as ThemePreset) : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                <option value="">Use Main Theme</option>
                {themePresets.filter((p) => p !== 'custom').map((preset) => (
                  <option key={preset} value={preset}>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Dark Mode Theme
              </label>
              <select
                value={theme?.darkModeTheme || ''}
                onChange={(e) =>
                  handleThemeChange({
                    darkModeTheme: e.target.value ? (e.target.value as ThemePreset) : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                <option value="">Use Main Theme</option>
                {themePresets.filter((p) => p !== 'custom').map((preset) => (
                  <option key={preset} value={preset}>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {theme?.preset === 'custom' && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Custom Colors
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {(['primary', 'secondary', 'accent', 'success', 'warning', 'danger'] as const).map(
                  (colorKey) => (
                    <div key={colorKey}>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 capitalize">
                        {colorKey}
                      </label>
                      <input
                        type="color"
                        value={theme?.customColors?.[colorKey] || THEME_PRESETS.custom[colorKey]}
                        onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                        className="w-full h-8 rounded border border-slate-300 dark:border-slate-600"
                      />
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {(['background', 'text', 'border'] as const).map(
                  (colorKey) => (
                    <div key={colorKey}>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 capitalize">
                        {colorKey}
                      </label>
                      <input
                        type="color"
                        value={theme?.customColors?.[colorKey] || THEME_PRESETS.custom[colorKey]}
                        onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                        className="w-full h-8 rounded border border-slate-300 dark:border-slate-600"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Theme Preview */}
          <div className="mt-4 p-4 rounded-lg border-2" style={{
            backgroundColor: THEME_PRESETS[theme?.preset || 'corporate'].background,
            borderColor: THEME_PRESETS[theme?.preset || 'corporate'].border,
          }}>
            <div className="text-xs font-semibold mb-2" style={{
              color: THEME_PRESETS[theme?.preset || 'corporate'].text,
            }}>
              Theme Preview
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="w-6 h-6 rounded" style={{
                backgroundColor: THEME_PRESETS[theme?.preset || 'corporate'].primary,
              }} title="Primary" />
              <div className="w-6 h-6 rounded" style={{
                backgroundColor: THEME_PRESETS[theme?.preset || 'corporate'].secondary,
              }} title="Secondary" />
              <div className="w-6 h-6 rounded" style={{
                backgroundColor: THEME_PRESETS[theme?.preset || 'corporate'].accent,
              }} title="Accent" />
              <div className="w-6 h-6 rounded" style={{
                backgroundColor: THEME_PRESETS[theme?.preset || 'corporate'].success,
              }} title="Success" />
              <div className="w-6 h-6 rounded" style={{
                backgroundColor: THEME_PRESETS[theme?.preset || 'corporate'].warning,
              }} title="Warning" />
              <div className="w-6 h-6 rounded" style={{
                backgroundColor: THEME_PRESETS[theme?.preset || 'corporate'].danger,
              }} title="Danger" />
            </div>
            {THEME_PRESETS[theme?.preset || 'corporate'].gradient && (
              <div className="mt-2">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Gradient</div>
                <div className="w-full h-4 rounded" style={{
                  background: THEME_PRESETS[theme?.preset || 'corporate'].gradient,
                }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation Tab */}
      {activeTab === 'animation' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Animation Type
            </label>
            <select
              value={animation?.type || 'fadeIn'}
              onChange={(e) => handleAnimationChange({ type: e.target.value as AnimationType })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
            >
              {animationTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'none' ? 'No Animation' : type.replace(/([A-Z])/g, ' $1').trim()}
                </option>
              ))}
            </select>
          </div>

          {animation?.type === 'slideIn' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Slide Direction
              </label>
              <select
                value={animation?.direction || 'left'}
                onChange={(e) =>
                  handleAnimationChange({ direction: e.target.value as AnimationDirection })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                {animationDirections.map((dir) => (
                  <option key={dir} value={dir}>
                    {dir.charAt(0).toUpperCase() + dir.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Speed
              </label>
              <select
                value={animation?.speed || 'normal'}
                onChange={(e) => handleAnimationChange({ speed: e.target.value as AnimationSpeed })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                {animationSpeeds.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Easing
              </label>
              <select
                value={animation?.easing || 'ease-out'}
                onChange={(e) =>
                  handleAnimationChange({ easing: e.target.value as EasingFunction })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                {easingFunctions.map((easing) => (
                  <option key={easing} value={easing}>
                    {easing.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {animation?.type === 'stagger' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Stagger Delay (ms): {animation?.staggerDelay || 100}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={animation?.staggerDelay || 100}
                onChange={(e) => handleAnimationChange({ staggerDelay: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Display Mode
            </label>
            <select
              value={style?.displayMode || 'normal'}
              onChange={(e) => handleStyleChange({ displayMode: e.target.value as DisplayMode })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
            >
              {displayModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Hover Effect
              </label>
              <select
                value={style?.hoverEffect || 'none'}
                onChange={(e) => handleStyleChange({ hoverEffect: e.target.value as HoverEffect })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                {hoverEffects.map((effect) => (
                  <option key={effect} value={effect}>
                    {effect.charAt(0).toUpperCase() + effect.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Border Style
              </label>
              <select
                value={style?.borderStyle || 'solid'}
                onChange={(e) => handleStyleChange({ borderStyle: e.target.value as BorderStyle })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                {borderStyles.map((bStyle) => (
                  <option key={bStyle} value={bStyle}>
                    {bStyle.charAt(0).toUpperCase() + bStyle.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Background Effect
            </label>
            <select
              value={style?.backgroundEffect || 'transparent'}
              onChange={(e) =>
                handleStyleChange({ backgroundEffect: e.target.value as BackgroundEffect })
              }
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
            >
              {backgroundEffects.map((effect) => (
                <option key={effect} value={effect}>
                  {effect.charAt(0).toUpperCase() + effect.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {style?.backgroundEffect === 'pattern' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pattern Type
              </label>
              <select
                value={style?.backgroundPattern || 'dots'}
                onChange={(e) =>
                  handleStyleChange({ backgroundPattern: e.target.value as BackgroundPattern })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                {backgroundPatterns.map((pattern) => (
                  <option key={pattern} value={pattern}>
                    {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Background Color Picker */}
          {(style?.backgroundEffect === 'solid' || style?.backgroundEffect === 'gradient') && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Background Colors
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={style?.customBackgroundColor || '#6366f1'}
                    onChange={(e) => handleStyleChange({ customBackgroundColor: e.target.value })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-600"
                  />
                </div>
                {style?.backgroundEffect === 'gradient' && (
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={style?.customBackgroundColorSecondary || '#8b5cf6'}
                      onChange={(e) => handleStyleChange({ customBackgroundColorSecondary: e.target.value })}
                      className="w-full h-8 rounded border border-slate-300 dark:border-slate-600"
                    />
                  </div>
                )}
              </div>
              {style?.backgroundEffect === 'gradient' && (
                <div className="mt-3">
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Gradient Direction
                  </label>
                  <select
                    value={style?.gradientDirection || '135deg'}
                    onChange={(e) => handleStyleChange({ gradientDirection: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs"
                  >
                    <option value="135deg">Diagonal (↘)</option>
                    <option value="90deg">Vertical (↓)</option>
                    <option value="0deg">Horizontal (→)</option>
                    <option value="45deg">Diagonal (↗)</option>
                    <option value="180deg">Horizontal (←)</option>
                    <option value="270deg">Vertical (↑)</option>
                  </select>
                </div>
              )}
              {/* Preview */}
              <div className="mt-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Preview</div>
                <div 
                  className="w-full h-8 rounded border border-slate-300 dark:border-slate-600"
                  style={{
                    background: style?.backgroundEffect === 'gradient' 
                      ? `linear-gradient(${style?.gradientDirection || '135deg'}, ${style?.customBackgroundColor || '#6366f1'}, ${style?.customBackgroundColorSecondary || '#8b5cf6'})`
                      : style?.customBackgroundColor || '#6366f1'
                  }}
                />
              </div>
            </div>
          )}

          {/* Background Opacity Control */}
          {(style?.backgroundEffect && style?.backgroundEffect !== 'transparent') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Background Opacity: {style?.backgroundOpacity || 50}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={style?.backgroundOpacity || 50}
                onChange={(e) => handleStyleChange({ backgroundOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>10%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Border Radius
            </label>
            <select
              value={style?.borderRadius || 'lg'}
              onChange={(e) => handleStyleChange({ borderRadius: e.target.value as BorderRadius })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
            >
              {borderRadiuses.map((radius) => (
                <option key={radius} value={radius}>
                  {radius === 'none' ? 'None' : radius.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Style Preview */}
          <div className="mt-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
            <div className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Style Preview
            </div>
            <div 
              className={`p-4 ${getHoverEffectClasses(style?.hoverEffect)}`}
              style={{
                ...getBackgroundEffectStyles(
                  style?.backgroundEffect || 'transparent',
                  style?.backgroundPattern,
                  THEME_PRESETS[theme?.preset || 'corporate'],
                  style
                ),
                ...getBorderStyleProperties(
                  style?.borderStyle || 'solid',
                  THEME_PRESETS[theme?.preset || 'corporate']
                ),
                borderRadius: BORDER_RADIUS_MAP[style?.borderRadius || 'lg'],
                transform: `scale(${DISPLAY_MODE_SCALES[style?.displayMode || 'normal']})`,
                transformOrigin: 'top left',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className="text-xs text-center" style={{ 
                color: THEME_PRESETS[theme?.preset || 'corporate'].text 
              }}>
                Sample Infographic Content
                <br />
                <span className="text-[10px] opacity-70">
                  Hover: {style?.hoverEffect || 'none'} | 
                  Size: {style?.displayMode || 'normal'} | 
                  Background: {style?.backgroundEffect || 'transparent'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
