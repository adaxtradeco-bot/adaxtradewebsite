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
  background: string;
  text: string;
  border: string;
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
}

// Theme Presets Configuration
export const THEME_PRESETS: Record<ThemePreset, ColorPalette> = {
  neon: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    accent: '#ffff00',
    background: 'rgba(0, 255, 255, 0.05)',
    text: '#00ffff',
    border: '#00ffff',
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    background: 'rgba(14, 165, 233, 0.05)',
    text: '#0ea5e9',
    border: '#0ea5e9',
  },
  sunset: {
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#fbbf24',
    background: 'rgba(249, 115, 22, 0.05)',
    text: '#f97316',
    border: '#f97316',
  },
  forest: {
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#6ee7b7',
    background: 'rgba(16, 185, 129, 0.05)',
    text: '#10b981',
    border: '#10b981',
  },
  corporate: {
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#a5b4fc',
    background: 'rgba(99, 102, 241, 0.05)',
    text: '#6366f1',
    border: '#6366f1',
  },
  midnight: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c4b5fd',
    background: 'rgba(139, 92, 246, 0.05)',
    text: '#8b5cf6',
    border: '#8b5cf6',
  },
  candy: {
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#fbcfe8',
    background: 'rgba(236, 72, 153, 0.05)',
    text: '#ec4899',
    border: '#ec4899',
  },
  monochrome: {
    primary: '#64748b',
    secondary: '#94a3b8',
    accent: '#cbd5e1',
    background: 'rgba(100, 116, 139, 0.05)',
    text: '#64748b',
    border: '#64748b',
  },
  custom: {
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#a5b4fc',
    background: 'rgba(99, 102, 241, 0.05)',
    text: '#6366f1',
    border: '#6366f1',
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

// Helper function to generate border style classes
export function getBorderStyleClasses(
  borderStyle: BorderStyle | undefined,
  colors: ColorPalette
): string {
  switch (borderStyle) {
    case 'solid':
      return `border border-[${colors.border}]`;
    case 'gradient':
      return `border-2 border-transparent bg-gradient-to-r from-[${colors.primary}] to-[${colors.secondary}] bg-clip-border`;
    case 'dashed':
      return `border-2 border-dashed border-[${colors.border}]`;
    case 'glow':
      return `border border-[${colors.border}] shadow-[0_0_10px_${colors.border}]`;
    case 'none':
    default:
      return '';
  }
}

// Helper function to generate background effect styles
export function getBackgroundEffectStyles(
  backgroundEffect: BackgroundEffect | undefined,
  backgroundPattern: BackgroundPattern | undefined,
  colors: ColorPalette
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
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`,
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
      return {
        ...baseStyle,
        backgroundColor: colors.background,
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
