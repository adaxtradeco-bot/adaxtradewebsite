/**
 * Field Helper Definitions - Property Panel Guide System
 * Author: Amazon Q
 * Created: 2024-01-20
 */

export interface FieldHelper {
  label: string;
  description: string;
  allowedValues?: Array<{
    value: string;
    label: string;
    preview?: string; // CSS class or color preview
  }>;
  examples?: string[];
  note?: string;
}

export interface SectionFieldHelpers {
  [fieldPath: string]: FieldHelper;
}

/**
 * Global field helpers - applicable to all sections
 */
export const GLOBAL_FIELD_HELPERS: SectionFieldHelpers = {
  'style.backgroundColor': {
    label: 'Background Color',
    description: 'Tailwind CSS background color class',
    allowedValues: [
      { value: 'bg-white', label: 'White', preview: '#ffffff' },
      { value: 'bg-slate-50', label: 'Slate 50', preview: '#f8fafc' },
      { value: 'bg-slate-900', label: 'Slate 900', preview: '#0f172a' },
      { value: 'bg-gradient-to-br from-violet-50 to-cyan-50', label: 'Gradient Violet-Cyan', preview: 'linear-gradient' },
      { value: 'bg-gradient-to-r from-indigo-500 to-purple-500', label: 'Gradient Indigo-Purple', preview: 'linear-gradient' },
    ],
    examples: ['bg-white', 'bg-slate-50 dark:bg-slate-900'],
    note: 'Use dark: prefix for dark mode variants',
  },
  'style.textColor': {
    label: 'Text Color',
    description: 'Tailwind CSS text color class',
    allowedValues: [
      { value: 'text-slate-900', label: 'Slate 900', preview: '#0f172a' },
      { value: 'text-white', label: 'White', preview: '#ffffff' },
      { value: 'text-slate-600', label: 'Slate 600', preview: '#475569' },
    ],
    examples: ['text-slate-900 dark:text-white'],
  },
  'style.padding': {
    label: 'Padding',
    description: 'Tailwind CSS padding classes',
    allowedValues: [
      { value: 'py-12', label: 'Small (py-12)' },
      { value: 'py-16', label: 'Medium (py-16)' },
      { value: 'py-20', label: 'Large (py-20)' },
      { value: 'py-24 lg:py-32', label: 'Extra Large (responsive)' },
    ],
    examples: ['py-16', 'py-20 lg:py-32'],
  },
};

/**
 * Section-specific field helpers
 */
export const SECTION_FIELD_HELPERS: Record<string, SectionFieldHelpers> = {
  'governance-grid': {
    'cards[].color': {
      label: 'Card Color Theme',
      description: 'Gradient color for card top border',
      allowedValues: [
        { value: 'green', label: 'Green → Cyan', preview: 'from-green-500 to-cyan-500' },
        { value: 'indigo', label: 'Indigo → Violet', preview: 'from-indigo-500 to-violet-500' },
        { value: 'amber', label: 'Amber → Red', preview: 'from-amber-500 to-red-500' },
        { value: 'cyan', label: 'Cyan → Blue', preview: 'from-cyan-500 to-blue-500' },
        { value: 'violet', label: 'Violet → Purple', preview: 'from-violet-500 to-purple-500' },
      ],
      examples: ['green', 'indigo', 'violet'],
      note: 'Each color creates a unique gradient border',
    },
    'cards[].infographic.type': {
      label: 'Infographic Type',
      description: 'Visual representation style for the card',
      allowedValues: [
        { value: 'audit', label: 'Audit Trail - Timeline of actions with icons' },
        { value: 'stats', label: 'Stats - Metrics grid with trends' },
        { value: 'flow', label: 'Flow - Process flowchart with nodes' },
        { value: 'timeline', label: 'Timeline - Sequential steps with status' },
        { value: 'roles', label: 'Roles - User role cards with access levels' },
        { value: 'exception', label: 'Exception - Warning/error display' },
      ],
      examples: ['audit', 'stats', 'timeline'],
      note: 'Each type requires specific data structure',
    },
    'cards[].infographic.data.trail[].type': {
      label: 'Audit Trail Item Type',
      description: 'Icon and color for audit trail entry',
      allowedValues: [
        { value: 'success', label: 'Success (green checkmark)' },
        { value: 'warning', label: 'Warning (yellow alert)' },
        { value: 'error', label: 'Error (red cross)' },
        { value: 'info', label: 'Info (cyan info icon)' },
        { value: 'ai', label: 'AI Action (indigo/purple)' },
      ],
      examples: ['success', 'warning', 'ai'],
    },
    'cards[].infographic.data.steps[].status': {
      label: 'Timeline Step Status',
      description: 'Visual status indicator for timeline steps',
      allowedValues: [
        { value: 'completed', label: 'Completed (green dot)' },
        { value: 'active', label: 'Active (blue pulsing dot)' },
        { value: 'pending', label: 'Pending (gray dot)' },
      ],
      examples: ['completed', 'active', 'pending'],
    },
    'cards[].infographic.data.nodes[].type': {
      label: 'Flow Node Type',
      description: 'Shape and color for flowchart nodes',
      allowedValues: [
        { value: 'start', label: 'Start (green circle)' },
        { value: 'process', label: 'Process (blue rectangle)' },
        { value: 'decision', label: 'Decision (yellow diamond)' },
        { value: 'end', label: 'End (red circle)' },
      ],
      examples: ['start', 'process', 'end'],
    },
    'cards[].infographic.data.metrics[].trend': {
      label: 'Metric Trend',
      description: 'Trend indicator with arrow and color',
      allowedValues: [
        { value: 'up', label: 'Up (green ↑)' },
        { value: 'down', label: 'Down (red ↓)' },
        { value: 'neutral', label: 'Neutral (gray →)' },
      ],
      examples: ['up', 'down', 'neutral'],
    },
  },

  'product-hero': {
    'data.theme': {
      label: 'Hero Theme',
      description: 'Visual style and color scheme',
      allowedValues: [
        { value: 'gradient-modern', label: 'Gradient Modern (violet-cyan)' },
        { value: 'dark-elegant', label: 'Dark Elegant (slate-900)' },
        { value: 'light-minimal', label: 'Light Minimal (white)' },
        { value: 'brand-primary', label: 'Brand Primary (indigo)' },
      ],
      examples: ['gradient-modern', 'dark-elegant'],
    },
    'data.media.type': {
      label: 'Media Type',
      description: 'Type of visual content',
      allowedValues: [
        { value: 'image', label: 'Static Image' },
        { value: 'video', label: 'Video Player' },
        { value: 'animation', label: 'Animated Graphic' },
        { value: 'none', label: 'No Media' },
      ],
      examples: ['image', 'video'],
    },
  },

  'hero': {
    'data.layout': {
      label: 'Hero Layout',
      description: 'Content arrangement style',
      allowedValues: [
        { value: 'centered', label: 'Centered - Text in center' },
        { value: 'split', label: 'Split - Text left, media right' },
        { value: 'full-width', label: 'Full Width - Background image' },
      ],
      examples: ['centered', 'split'],
    },
  },

  'features': {
    'data.layout': {
      label: 'Features Layout',
      description: 'Grid arrangement',
      allowedValues: [
        { value: 'grid-2', label: '2 Columns' },
        { value: 'grid-3', label: '3 Columns' },
        { value: 'grid-4', label: '4 Columns' },
        { value: 'masonry', label: 'Masonry (varied heights)' },
      ],
      examples: ['grid-3', 'grid-4'],
    },
    'data.features[].icon': {
      label: 'Feature Icon',
      description: 'Lucide React icon name or emoji',
      examples: ['Zap', 'Shield', 'Rocket', '🚀', '⚡', '🎯'],
      note: 'Use Lucide icon names or emoji characters',
    },
  },

  'cta': {
    'data.style': {
      label: 'CTA Style',
      description: 'Visual emphasis level',
      allowedValues: [
        { value: 'primary', label: 'Primary (high emphasis)' },
        { value: 'secondary', label: 'Secondary (medium emphasis)' },
        { value: 'minimal', label: 'Minimal (low emphasis)' },
      ],
      examples: ['primary', 'secondary'],
    },
  },
};

/**
 * Get helper for a specific field path in a section
 */
export function getFieldHelper(
  sectionType: string,
  fieldPath: string
): FieldHelper | undefined {
  // Check section-specific helpers first
  const sectionHelpers = SECTION_FIELD_HELPERS[sectionType];
  if (sectionHelpers?.[fieldPath]) {
    return sectionHelpers[fieldPath];
  }

  // Fall back to global helpers
  return GLOBAL_FIELD_HELPERS[fieldPath];
}

/**
 * Get all helpers for a section
 */
export function getSectionHelpers(sectionType: string): SectionFieldHelpers {
  return {
    ...GLOBAL_FIELD_HELPERS,
    ...(SECTION_FIELD_HELPERS[sectionType] || {}),
  };
}
