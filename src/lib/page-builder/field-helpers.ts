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

  'fusion-teams-tabs': {
    'tabs[].enabled': {
      label: 'Tab Enabled',
      description: 'Show or hide this tab',
      allowedValues: [
        { value: 'true', label: 'Enabled - Tab is visible' },
        { value: 'false', label: 'Disabled - Tab is hidden' },
      ],
      note: 'Disabled tabs are completely hidden from users',
    },
  },

  'feature-video-tabs': {
    'tabs[].videoSrc': {
      label: 'Video Source',
      description: 'Video file URL or path',
      examples: ['/videos/demo.mp4', 'https://example.com/video.mp4'],
      note: 'Supports MP4, WebM formats. Can be string or object with src + objectFit',
    },
    'tabs[].videoSrcMobile': {
      label: 'Mobile Video Source',
      description: 'Optional separate video for mobile devices',
      examples: ['/videos/demo-mobile.mp4'],
      note: 'Falls back to videoSrc if not provided',
    },
    'autoplay': {
      label: 'Autoplay',
      description: 'Automatically play video when visible',
      allowedValues: [
        { value: 'true', label: 'Enabled - Auto play on scroll' },
        { value: 'false', label: 'Disabled - Manual play only' },
      ],
    },
    'showFullscreenButton': {
      label: 'Fullscreen Button',
      description: 'Show fullscreen toggle button',
      allowedValues: [
        { value: 'true', label: 'Show button' },
        { value: 'false', label: 'Hide button' },
      ],
    },
  },

  'platform-tabs': {
    'tabs[].cards[].link': {
      label: 'Card Link',
      description: 'URL for the "Explore" button',
      examples: ['/products/crm', '/solutions/automation', '#contact'],
    },
  },

  'hero-slider': {
    'globalMinHeight': {
      label: 'Global Min Height',
      description: 'Default minimum height for all slides',
      allowedValues: [
        { value: '90vh', label: '90vh - 90% of viewport' },
        { value: '80vh', label: '80vh - 80% of viewport' },
        { value: '600px', label: '600px - Fixed height' },
        { value: '100%', label: '100% - Full container' },
      ],
      examples: ['90vh', '600px', '80vh'],
      note: 'Can be overridden per slide with minHeight property',
    },
    'autoplay': {
      label: 'Autoplay',
      description: 'Automatically advance slides',
      allowedValues: [
        { value: 'true', label: 'Enabled' },
        { value: 'false', label: 'Disabled' },
      ],
    },
    'interval': {
      label: 'Interval (ms)',
      description: 'Time between slide transitions',
      examples: ['5000', '7000', '10000'],
      note: 'Minimum recommended: 3000ms (3 seconds)',
    },
    'slides[].useImageInsteadOfCard': {
      label: 'Use Image Instead of Card',
      description: 'Replace card content with image',
      allowedValues: [
        { value: 'true', label: 'Show image only' },
        { value: 'false', label: 'Show card content' },
      ],
    },
  },

  'hero-slider-nwm': {
    'autoPlayInterval': {
      label: 'Autoplay Interval (ms)',
      description: 'Time between automatic slide changes',
      examples: ['5000', '7000', '10000'],
    },
    'slides[].cardImageWidth': {
      label: 'Card Image Width',
      description: 'Image width in pixels',
      examples: ['600', '800', '1000'],
      note: 'Default: 600px',
    },
    'slides[].cardImageHeight': {
      label: 'Card Image Height',
      description: 'Image height in pixels',
      examples: ['400', '500', '600'],
      note: 'Default: 400px',
    },
    'slides[].enableMagnifier': {
      label: 'Enable Magnifier',
      description: 'Zoom effect on hover',
      allowedValues: [
        { value: 'true', label: 'Enabled - Zoom on hover' },
        { value: 'false', label: 'Disabled - No zoom' },
      ],
      note: 'Default: false',
    },
  },

  'metro-grid': {
    'cards[].color': {
      label: 'Card Color Theme',
      description: 'Gradient color for card top border',
      allowedValues: [
        { value: 'indigo', label: 'Indigo → Violet', preview: 'from-indigo-500 to-violet-500' },
        { value: 'cyan', label: 'Cyan → Green', preview: 'from-cyan-500 to-green-500' },
        { value: 'amber', label: 'Amber → Red', preview: 'from-amber-500 to-red-500' },
        { value: 'violet', label: 'Violet → Pink', preview: 'from-violet-500 to-pink-500' },
        { value: 'green', label: 'Green → Cyan', preview: 'from-green-500 to-cyan-500' },
      ],
      examples: ['indigo', 'cyan', 'violet'],
    },
    'cards[].span': {
      label: 'Card Span',
      description: 'Card size in grid',
      allowedValues: [
        { value: 'normal', label: 'Normal - 1x1 grid cell' },
        { value: 'wide', label: 'Wide - 2x1 grid cells' },
        { value: 'tall', label: 'Tall - 1x2 grid cells' },
      ],
      examples: ['normal', 'wide', 'tall'],
      note: 'Wide and tall only work on medium+ screens',
    },
    'cards[].infographic.type': {
      label: 'Infographic Type',
      description: 'Visual data representation',
      allowedValues: [
        { value: 'flow', label: 'Flow - Sequential steps with arrows' },
        { value: 'org', label: 'Org - Hierarchical structure' },
        { value: 'media', label: 'Media - Media placeholder' },
      ],
      examples: ['flow', 'org', 'media'],
    },
  },
    'autoPlayInterval': {
      label: 'Autoplay Interval (ms)',
      description: 'Time between automatic slide changes',
      examples: ['5000', '7000', '10000'],
    },
    'slides[].cardImageWidth': {
      label: 'Card Image Width',
      description: 'Image width in pixels',
      examples: ['600', '800', '1000'],
      note: 'Default: 600px',
    },
    'slides[].cardImageHeight': {
      label: 'Card Image Height',
      description: 'Image height in pixels',
      examples: ['400', '500', '600'],
      note: 'Default: 400px',
    },
    'slides[].enableMagnifier': {
      label: 'Enable Magnifier',
      description: 'Zoom effect on hover',
      allowedValues: [
        { value: 'true', label: 'Enabled - Zoom on hover' },
        { value: 'false', label: 'Disabled - No zoom' },
      ],
      note: 'Default: false',
    },
  },
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

  'rotating-tabs': {
    'tabs[].content.infographic.type': {
      label: 'Infographic Type',
      description: 'Visual representation style for tab content',
      allowedValues: [
        { value: 'workflow', label: 'Workflow - Step-by-step process with badges' },
        { value: 'sla', label: 'SLA - Progress bars with auto-color (90%+ green, 70%+ amber, <70% red)' },
        { value: 'sla-bars', label: 'SLA Bars - Custom colored bars with status (green/amber/red)' },
        { value: 'adaptive', label: 'Adaptive - Custom adaptive visualization' },
      ],
      examples: ['workflow', 'sla-bars'],
      note: 'Each type requires specific data structure',
    },
    'tabs[].content.infographic.data.bars[].status': {
      label: 'Bar Status (for sla-bars type)',
      description: 'Color status for SLA bar',
      allowedValues: [
        { value: 'green', label: 'Green - Good performance' },
        { value: 'amber', label: 'Amber - Warning level' },
        { value: 'red', label: 'Red - Critical level' },
      ],
      examples: ['green', 'amber', 'red'],
      note: 'Only used with sla-bars type. Regular sla type auto-colors based on value',
    },
    'tabs[].content.infographic.data.steps[].type': {
      label: 'Workflow Step Type',
      description: 'Badge style for workflow steps',
      allowedValues: [
        { value: 'auto', label: 'Auto - Automated step (green)' },
        { value: 'ai', label: 'AI - AI-powered step (indigo)' },
        { value: 'conditional', label: 'Conditional - Decision point (amber)' },
        { value: 'manual', label: 'Manual - Human action (cyan)' },
      ],
      examples: ['auto', 'ai', 'conditional'],
      note: 'Only used with workflow infographic type',
    },
    'autoRotate': {
      label: 'Auto Rotate',
      description: 'Automatically cycle through tabs',
      allowedValues: [
        { value: 'true', label: 'Enabled - Auto rotate tabs' },
        { value: 'false', label: 'Disabled - Manual only' },
      ],
      note: 'Default: true',
    },
    'rotateInterval': {
      label: 'Rotate Interval (ms)',
      description: 'Time between automatic tab changes',
      examples: ['4000', '5000', '6000'],
      note: 'Default: 4000ms (4 seconds). Only applies when autoRotate is true',
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
