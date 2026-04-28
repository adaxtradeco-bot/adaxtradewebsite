/**
 * Infographic Theme System
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Advanced theme and animation system for infographics
 */

export type ThemePreset = 'neon' | 'ocean' | 'sunset' | 'forest' | 'corporate' | 'midnight' | 'candy' | 'monochrome' | 'custom';

export type AnimationType = 'fadeIn' | 'slideIn' | 'scaleUp' | 'stagger' | 'bounce' | 'rotateIn' | 'none';

export type AnimationDirection = 'left' | 'right' | 'top' | 'bottom';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export type EasingFunction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

export type DisplayMode = 'compact' | 'normal' | 'expanded';

export type HoverEffect = 'glow' | 'lift' | 'pulse' | 'none';

export type BorderStyle = 'solid' | 'gradient' | 'dashed' | 'glow' | 'none';

export type BackgroundEffect = 'blur' | 'gradient' | 'pattern' | 'solid' | 'transparent';

export type BackgroundPattern = 'dots' | 'lines' | 'grid';

export type IconStyle = 'filled' | 'outlined' | 'duotone' | 'animated';

export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  text: string;
  border: string;
  gradient?: string;
}

export interface InfographicTheme {
  preset: ThemePreset;
  lightModeTheme?: ThemePreset;
  darkModeTheme?: ThemePreset;
  customColors?: ColorPalette;
}

export interface InfographicAnimation {
  type: AnimationType;
  direction?: AnimationDirection;
  speed: AnimationSpeed;
  staggerDelay?: number;
  easing: EasingFunction;
}

export interface InfographicStyle {
  displayMode: DisplayMode;
  hoverEffect: HoverEffect;
  borderStyle: BorderStyle;
  backgroundEffect: BackgroundEffect;
  backgroundPattern?: BackgroundPattern;
  iconStyle?: IconStyle;
  borderRadius: BorderRadius;
  customBackgroundColor?: string;
  customBackgroundColorSecondary?: string;
  gradientDirection?: string;
}

// Theme Presets Configuration
export const THEME_PRESETS: Record<ThemePreset, ColorPalette> = {
  neon: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    accent: '#ffff00',
    success: '#00ff88',
    warning: '#ff8800',
    danger: '#ff0088',
    background: 'rgba(0, 255, 255, 0.05)',
    text: '#00ffff',
    border: '#00ffff',
    gradient: 'linear-gradient(135deg, #00ffff, #ff00ff, #ffff00)',
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(14, 165, 233, 0.05)',
    text: '#0ea5e9',
    border: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4, #22d3ee)',
  },
  sunset: {
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#fbbf24',
    success: '#84cc16',
    warning: '#eab308',
    danger: '#dc2626',
    background: 'rgba(249, 115, 22, 0.05)',
    text: '#f97316',
    border: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c, #fbbf24)',
  },
  forest: {
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#6ee7b7',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(16, 185, 129, 0.05)',
    text: '#10b981',
    border: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
  },
  corporate: {
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#a5b4fc',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(99, 102, 241, 0.05)',
    text: '#6366f1',
    border: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
  },
  midnight: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c4b5fd',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(139, 92, 246, 0.05)',
    text: '#8b5cf6',
    border: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)',
  },
  candy: {
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#fbcfe8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(236, 72, 153, 0.05)',
    text: '#ec4899',
    border: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6, #fbcfe8)',
  },
  monochrome: {
    primary: '#64748b',
    secondary: '#94a3b8',
    accent: '#cbd5e1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(100, 116, 139, 0.05)',
    text: '#64748b',
    border: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8, #cbd5e1)',
  },
  custom: {
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#a5b4fc',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(99, 102, 241, 0.05)',
    text: '#6366f1',
    border: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
  },
};

// Animation Duration Mapping
export const ANIMATION_SPEEDS = {
  slow: 1000,
  normal: 500,
  fast: 250,
};

// Easing Functions for Framer Motion
export const EASING_FUNCTIONS: Record<EasingFunction, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  'ease-in': [0.4, 0, 1, 1],
  'ease-out': [0, 0, 0.2, 1],
  'ease-in-out': [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

// Border Radius Mapping
export const BORDER_RADIUS_MAP = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
};

// Display Mode Scale Factors
export const DISPLAY_MODE_SCALES = {
  compact: 0.85,
  normal: 1,
  expanded: 1.15,
};

// Helper function to get theme colors based on current mode
export function getThemeColors(
  theme: InfographicTheme | undefined,
  isDark: boolean
): ColorPalette {
  if (!theme) {
    return THEME_PRESETS.corporate;
  }

  // Check if separate themes are defined for light/dark modes
  if (isDark && theme.darkModeTheme) {
    return THEME_PRESETS[theme.darkModeTheme];
  }
  
  if (!isDark && theme.lightModeTheme) {
    return THEME_PRESETS[theme.lightModeTheme];
  }

  // Use custom colors if preset is 'custom'
  if (theme.preset === 'custom' && theme.customColors) {
    return theme.customColors;
  }

  // Use the main preset
  return THEME_PRESETS[theme.preset];
}

// Helper function to get animation variants for Framer Motion
export function getAnimationVariants(animation: InfographicAnimation | undefined) {
  if (!animation || animation.type === 'none') {
    return {
      hidden: {},
      visible: {},
    };
  }

  const duration = ANIMATION_SPEEDS[animation.speed] / 1000;
  const ease = EASING_FUNCTIONS[animation.easing];

  switch (animation.type) {
    case 'fadeIn':
      return {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration, ease }
        },
      };

    case 'slideIn':
      const slideDirection = animation.direction || 'left';
      const slideOffset = {
        left: { x: -50 },
        right: { x: 50 },
        top: { y: -50 },
        bottom: { y: 50 },
      };
      return {
        hidden: { opacity: 0, ...slideOffset[slideDirection] },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0,
          transition: { duration, ease }
        },
      };

    case 'scaleUp':
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: { duration, ease }
        },
      };

    case 'bounce':
      return {
        hidden: { opacity: 0, y: -20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration, 
            ease: EASING_FUNCTIONS.bounce 
          }
        },
      };

    case 'rotateIn':
      return {
        hidden: { opacity: 0, rotate: -10, scale: 0.9 },
        visible: { 
          opacity: 1, 
          rotate: 0, 
          scale: 1,
          transition: { duration, ease }
        },
      };

    case 'stagger':
      return {
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration, ease }
        },
      };

    default:
      return {
        hidden: {},
        visible: {},
      };
  }
}

// Helper function to get stagger container variants
export function getStaggerContainerVariants(animation: InfographicAnimation | undefined) {
  if (!animation || animation.type !== 'stagger') {
    return {
      hidden: {},
      visible: {},
    };
  }

  const staggerDelay = (animation.staggerDelay || 100) / 1000;

  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };
}

// Helper function to generate CSS classes for hover effects
export function getHoverEffectClasses(hoverEffect: HoverEffect | undefined): string {
  switch (hoverEffect) {
    case 'glow':
      return 'hover:shadow-lg hover:shadow-current/20 transition-shadow duration-300';
    case 'lift':
      return 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300';
    case 'pulse':
      return 'hover:animate-pulse';
    case 'none':
    default:
      return '';
  }
}

// Helper function to generate border style properties
export function getBorderStyleProperties(
  borderStyle: BorderStyle | undefined,
  colors: ColorPalette
): React.CSSProperties {
  switch (borderStyle) {
    case 'solid':
      return {
        border: `1px solid ${colors.border}`,
      };
    case 'gradient':
      return {
        border: '2px solid transparent',
        backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box',
      };
    case 'dashed':
      return {
        border: `2px dashed ${colors.border}`,
      };
    case 'glow':
      return {
        border: `1px solid ${colors.border}`,
        boxShadow: `0 0 10px ${colors.border}50`,
      };
    case 'none':
    default:
      return {};
  }
}

// Helper function to generate background effect styles
export function getBackgroundEffectStyles(
  backgroundEffect: BackgroundEffect | undefined,
  backgroundPattern: BackgroundPattern | undefined,
  colors: ColorPalette,
  style?: InfographicStyle
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {};

  switch (backgroundEffect) {
    case 'blur':
      return {
        ...baseStyle,
        backgroundColor: colors.background,
        backdropFilter: 'blur(10px)',
      };
    case 'gradient':
      const primaryColor = style?.customBackgroundColor || colors.primary;
      const secondaryColor = style?.customBackgroundColorSecondary || colors.secondary;
      const direction = style?.gradientDirection || '135deg';
      return {
        ...baseStyle,
        background: `linear-gradient(${direction}, ${primaryColor}15, ${secondaryColor}15)`,
      };
    case 'pattern':
      const patterns = {
        dots: `radial-gradient(circle, ${colors.primary}20 1px, transparent 1px)`,
        lines: `repeating-linear-gradient(45deg, ${colors.primary}10, ${colors.primary}10 10px, transparent 10px, transparent 20px)`,
        grid: `linear-gradient(${colors.primary}15 1px, transparent 1px), linear-gradient(90deg, ${colors.primary}15 1px, transparent 1px)`,
      };
      return {
        ...baseStyle,
        backgroundColor: colors.background,
        backgroundImage: patterns[backgroundPattern || 'dots'],
        backgroundSize: backgroundPattern === 'grid' ? '20px 20px' : '10px 10px',
      };
    case 'solid':
      const solidColor = style?.customBackgroundColor || colors.background;
      return {
        ...baseStyle,
        backgroundColor: `${solidColor}20`, // Add transparency
      };
    case 'transparent':
    default:
      return baseStyle;
  }
}

// Default configurations
export const DEFAULT_THEME: InfographicTheme = {
  preset: 'corporate',
};

export const DEFAULT_ANIMATION: InfographicAnimation = {
  type: 'fadeIn',
  speed: 'normal',
  easing: 'ease-out',
};

export const DEFAULT_STYLE: InfographicStyle = {
  displayMode: 'normal',
  hoverEffect: 'none',
  borderStyle: 'solid',
  backgroundEffect: 'transparent',
  borderRadius: 'lg',
};
// Helper function to apply theme colors to infographic data
export function applyThemeToInfographicData(data: any, colors: ColorPalette, type: string): any {
  if (!data || !colors) return data;

  const applyColors = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => {
        const colorIndex = index % 6;
        const colorKeys = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning, colors.danger];
        
        if (typeof item === 'object' && item !== null) {
          return {
            ...applyColors(item),
            color: item.color || colorKeys[colorIndex],
            backgroundColor: item.backgroundColor || `${colorKeys[colorIndex]}20`,
            borderColor: item.borderColor || colorKeys[colorIndex],
          };
        }
        return item;
      });
    }

    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'color' && !value) {
          result[key] = colors.primary;
        } else if (key === 'backgroundColor' && !value) {
          result[key] = colors.background;
        } else if (key === 'borderColor' && !value) {
          result[key] = colors.border;
        } else if (key === 'textColor' && !value) {
          result[key] = colors.text;
        } else {
          result[key] = applyColors(value);
        }
      }
      return result;
    }

    return obj;
  };

  return applyColors(data);
}

// Helper function to get CSS variables for theme colors
export function getThemeCSSVariables(colors: ColorPalette): Record<string, string> {
  return {
    '--infographic-primary': colors.primary,
    '--infographic-secondary': colors.secondary,
    '--infographic-accent': colors.accent,
    '--infographic-success': colors.success,
    '--infographic-warning': colors.warning,
    '--infographic-danger': colors.danger,
    '--infographic-background': colors.background,
    '--infographic-text': colors.text,
    '--infographic-border': colors.border,
    '--infographic-gradient': colors.gradient || `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
  };
}