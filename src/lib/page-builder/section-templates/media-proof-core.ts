/**
 * MEDIA_PROOF_CORE_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const MEDIA_PROOF_CORE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'compliance-badges',
    name: 'Compliance Badges',
    type: 'compliance',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Display compliance certifications and security badges',
    icon: '🛡️',
    defaultData: {
      id: '',
      type: 'compliance',
      order: 0,
      data: {
        title: 'Enterprise-Grade Security & Compliance',
        description:
          'Your data is protected with bank-level encryption and comprehensive compliance certifications.',
        badges: [
          {
            icon: '🔒',
            title: 'HIPAA Compliant',
          },
          {
            icon: '✓',
            title: 'SOC 2 Type II',
          },
          {
            icon: '🛡️',
            title: 'ISO 27001',
          },
          {
            icon: '🔐',
            title: 'AES-256 Encryption',
          },
        ],
        backgroundGradient: 'from-cyan-600 to-blue-600',
      },
      style: {
        backgroundColor: 'bg-gradient-to-br from-cyan-600 to-blue-600',
        textColor: 'text-white',
        padding: 'py-20',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'industry-hero',
    name: 'Industry Hero',
    type: 'industry-hero',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Specialized hero section for industry pages with customizable content',
    icon: '🏭',
    defaultData: {
      id: '',
      type: 'industry-hero',
      order: 0,
      data: {
        title: 'Built for Your Industry',
        subtitle: 'Transform Operations with AI-Native Automation',
        description:
          'See how teams in fleet, construction, healthcare, government and more transform operations with AI-native no-code automation.',
        icon: '🏭',
        buttons: [
          {
            text: 'Explore Solutions',
            href: '#solutions',
            variant: 'primary' as const,
            size: 'lg' as const,
          },
          {
            text: 'Book Demo',
            href: '/contact',
            variant: 'outline' as const,
            size: 'lg' as const,
          },
        ],
        textAlign: 'center' as const,
      },
      style: {
        backgroundColor:
          'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'media-content',
    name: 'Media Content',
    type: 'media-content',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Content section with image or video media on left or right',
    icon: '🎬',
    defaultData: {
      id: '',
      type: 'media-content',
      order: 0,
      data: {
        title: 'Powerful Features',
        subtitle: 'Why Choose Us',
        description:
          'Discover how our platform helps you achieve your goals faster and more efficiently.',
        mediaType: 'image',
        mediaUrl: '/placeholder-image.jpg',
        mediaAlt: 'Feature showcase',
        layout: 'media-right',
        features: [
          {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Optimized performance for the best user experience',
          },
          {
            icon: '🔒',
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security you can trust',
          },
          {
            icon: '🎨',
            title: 'Beautiful Design',
            description: 'Modern interface that users love',
          },
        ],
        ctaText: 'Learn More',
        ctaLink: '#',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-neutral-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
        alignment: 'left',
      },
    },
    configSchema: {},
  },

  {
    id: 'sidebar-content',
    name: 'Sidebar Content',
    type: 'sidebar-content',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Sidebar navigation with content area - perfect for builder interfaces',
    icon: '📐',
    defaultData: {
      id: '',
      type: 'sidebar-content',
      order: 0,
      data: {
        sidebarItems: [
          {
            id: 'ui-blocks',
            label: 'UI Blocks',
            content: {
              title: 'Visual Drag-and-Drop Builder',
              description:
                'Place forms, tables, charts, boards, and buttons; wire actions; set validations. Build pages without code.',
              features: [
                { text: 'Reusable components' },
                { text: 'Conditional UI' },
                { text: 'Inline validation' },
                { text: 'Form states' },
              ],
              placeholderIcon: '🎨',
              placeholderText: 'Canvas with component drawer + properties',
            },
          },
          {
            id: 'flows-rules',
            label: 'Flows & Rules',
            content: {
              title: 'Business Logic & Workflows',
              description:
                'Create complex workflows with conditional logic, approvals, and automated actions without writing code.',
              features: [
                { text: 'Visual workflow designer' },
                { text: 'Conditional branching' },
                { text: 'Approval chains' },
                { text: 'Event triggers' },
              ],
              placeholderIcon: '⚡',
              placeholderText: 'Workflow canvas with nodes and connections',
            },
          },
          {
            id: 'themes',
            label: 'Themes',
            content: {
              title: 'Customizable Themes',
              description:
                'Apply pre-built themes or create your own with custom colors, fonts, and styling options.',
              features: [
                { text: 'Pre-built templates' },
                { text: 'Custom color schemes' },
                { text: 'Typography control' },
                { text: 'Dark mode support' },
              ],
              placeholderIcon: '🎨',
              placeholderText: 'Theme customization panel',
            },
          },
          {
            id: 'custom-code',
            label: 'Custom Code',
            content: {
              title: 'Extend with Custom Code',
              description:
                'Add JavaScript, CSS, or API integrations when you need advanced customization beyond no-code.',
              features: [
                { text: 'JavaScript functions' },
                { text: 'Custom CSS styles' },
                { text: 'API integrations' },
                { text: 'Code snippets library' },
              ],
              placeholderIcon: '💻',
              placeholderText: 'Code editor with syntax highlighting',
            },
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-800',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-16',
        alignment: 'left',
      },
    },
    configSchema: {},
  },

  {
    id: 'product-hero',
    name: 'Product Hero',
    type: 'product-hero',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Unified hero section with theme support, Font Awesome icons, and flexible media',
    icon: '🚀',
    defaultData: {
      id: '',
      type: 'product-hero',
      order: 0,
      data: {
        badge: 'Live orchestration for modern teams',
        title: 'Orchestrate Processes. Reduce Errors.',
        titleHighlight: 'Move Faster.',
        description:
          'Model, automate, and optimize end-to-end workflows without code.',
        primaryButton: { text: 'Explore Features', href: '#features' },
        secondaryButton: { text: 'See Business Impact', href: '#impact' },
        footerText: 'Secure • Extensible • Real-time visibility',
        badges: [],
        titleFontSize: 'text-4xl md:text-5xl lg:text-6xl',
        descriptionFontSize: 'text-lg',
        themeId: 'indigo-cyan',
        customBackground: '',
        customTitleGradientFrom: '',
        customTitleGradientTo: '',
        rightContentType: 'cards',
        cards: [
          {
            icon: '⚙️',
            iconConfig: null,
            title: 'Visual Builder',
            description: 'Drag & drop stages, forms, and rules.',
          },
          {
            icon: '🔗',
            iconConfig: null,
            title: 'Integrations',
            description: 'Connect CRM, ERP, data, and email.',
          },
          {
            icon: '✅',
            iconConfig: null,
            title: 'Approvals',
            description: 'Parallel & sequential with audit trails.',
          },
          {
            icon: '📊',
            iconConfig: null,
            title: 'Reporting',
            description: 'Real-time visibility and KPIs.',
          },
        ],
        mediaUrl: '',
        mediaAlt: 'Product showcase',
        mediaFit: 'cover',
        mediaAspectRatio: '4/3',
        placeholderIcon: '🎨',
        placeholderIconConfig: null,
        placeholderText: 'Product Preview',
        features: [],
      },
      style: {
        backgroundColor: '',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20 lg:py-32',
      },
    },
    configSchema: {},
  },

  {
    id: 'metrics',
    name: 'Metrics Section',
    type: 'metrics',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Display business impact metrics in a grid',
    icon: '📈',
    defaultData: {
      id: '',
      type: 'metrics',
      order: 0,
      data: {
        title: 'Proven Business Impact',
        description:
          'Cut manual effort, minimize errors, and accelerate productivity across the org.',
        metrics: [
          { value: '40%+', label: 'Cycle time reduction' },
          { value: '99.9%', label: 'Process accuracy' },
          { value: '5×', label: 'Faster integrations' },
          { value: '24/7', label: 'Operational visibility' },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'two-column-media',
    name: 'Two Column Media',
    type: 'two-column-media',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Content with media/placeholder on left or right',
    icon: '🖼️',
    defaultData: {
      id: '',
      type: 'two-column-media',
      order: 0,
      data: {
        title: 'No-Code Workflow Builder',
        description:
          'Design multi‑stage workflows with drag‑and‑drop, connect apps in minutes, and adapt logic without deploying code.',
        features: [
          { text: 'Drag‑and‑drop stages & forms' },
          { text: 'Conditional logic & branching' },
          { text: 'Parallel tasks & dynamic roles' },
          { text: 'Manual, time‑based, or event triggers' },
        ],
        mediaIcon: '🔄',
        mediaText: 'Workflow Builder Screenshot',
        mediaPosition: 'right',
        badge: 'Build once, reuse across departments',
      },
      style: {
        backgroundColor:
          'bg-gradient-to-br from-cyan-50/80 via-white to-slate-50/50 dark:bg-gradient-to-b dark:from-cyan-500/5 dark:to-transparent',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'logo-cloud',
    name: 'Logo Cloud',
    type: 'logo-cloud',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Display partner, client, or integration logos in a grid',
    icon: '🏢',
    defaultData: {
      id: '',
      type: 'logo-cloud',
      order: 0,
      data: {
        title: 'Trusted by Industry Leaders',
        subtitle: 'Join thousands of companies using our platform',
        logos: [
          { name: 'Company 1', imageUrl: '', alt: 'Company 1' },
          { name: 'Company 2', imageUrl: '', alt: 'Company 2' },
          { name: 'Company 3', imageUrl: '', alt: 'Company 3' },
          { name: 'Company 4', imageUrl: '', alt: 'Company 4' },
          { name: 'Company 5', imageUrl: '', alt: 'Company 5' },
          { name: 'Company 6', imageUrl: '', alt: 'Company 6' },
          { name: 'Company 7', imageUrl: '', alt: 'Company 7' },
          { name: 'Company 8', imageUrl: '', alt: 'Company 8' },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-neutral-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'integration-marquee',
    name: 'Integration Marquee',
    type: 'integration-marquee',
    category: SECTION_CATEGORIES.SOCIAL,
    description: '3-row animated marquee showcasing connected apps and integrations',
    icon: '🔄',
    defaultData: {
      id: '',
      type: 'integration-marquee',
      order: 0,
      data: {
        label: 'Connected Systems',
        row1Speed: 28,
        row2Speed: 24,
        row3Speed: 32,
        row1Apps: [
          {
            name: 'Figma',
            status: 'Connected',
            statusColor: 'green' as const,
            iconType: 'emoji' as const,
            icon: '🎨',
            bgColor: '#f0abfc22',
            iconColor: '#a855f7',
          },
          {
            name: 'Slack',
            status: 'Connected',
            statusColor: 'green' as const,
            iconType: 'emoji' as const,
            icon: '💬',
            bgColor: '#fef08a22',
            iconColor: '#ca8a04',
          },
          {
            name: 'GitHub',
            status: 'Connected',
            statusColor: 'green' as const,
            iconType: 'emoji' as const,
            icon: '🐙',
            bgColor: '#18181b22',
            iconColor: '#52525b',
          },
        ],
        row2Apps: [
          {
            name: 'Jira',
            status: 'Connected',
            statusColor: 'green' as const,
            iconType: 'emoji' as const,
            icon: '📋',
            bgColor: '#dbeafe33',
            iconColor: '#1d4ed8',
          },
          {
            name: 'Salesforce',
            status: 'Syncing',
            statusColor: 'amber' as const,
            iconType: 'emoji' as const,
            icon: '☁️',
            bgColor: '#e0f2fe33',
            iconColor: '#0284c7',
          },
        ],
        row3Apps: [
          {
            name: 'PostgreSQL',
            status: 'Connected',
            statusColor: 'green' as const,
            iconType: 'emoji' as const,
            icon: '🐘',
            bgColor: '#eff6ff33',
            iconColor: '#1e40af',
          },
          {
            name: 'OpenAI',
            status: 'Active',
            statusColor: 'green' as const,
            iconType: 'emoji' as const,
            icon: '🤖',
            bgColor: '#f0fdf433',
            iconColor: '#166534',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-neutral-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },
];
