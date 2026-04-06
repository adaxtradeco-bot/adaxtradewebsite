/**
 * HERO_TABS_FEATURE_WALLS_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const HERO_TABS_FEATURE_WALLS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'home-slider-pro',
    name: 'HOMEsLIDERpRO',
    type: 'home-slider-pro',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Professional BPMS industry slider with animated process word clouds',
    icon: '🔄',
    defaultData: {
      id: '',
      type: 'home-slider-pro',
      order: 0,
      data: {
        autoplay: true,
        interval: 6000,
        slides: [
          {
            industry: 'Fleet & Logistics',
            headline: 'Design fleet workflows without hardcoding',
            description:
              'Model, automate, and evolve fleet-related operational processes using a flexible BPMS.',
            bullets: [
              'Visual process modeling',
              'Role-based task flows',
              'Exception handling',
              'Integration-ready workflows',
            ],
            processTags: [
              { text: 'Vehicle Onboarding', size: 'md' },
              { text: 'Maintenance Request', size: 'lg' },
              { text: 'Dispatch Approval', size: 'sm' },
              { text: 'Incident Report', size: 'md' },
              { text: 'Driver Assignment', size: 'lg' },
              { text: 'Compliance Check', size: 'sm' },
            ],
          },
        ],
      },
      style: {
        backgroundColor:
          'bg-gradient-to-br from-slate-50 via-white to-blue-50/30',
        textColor: 'text-slate-900',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'fusion-teams-tabs',
    name: 'Fusion Teams Tabs',
    type: 'fusion-teams-tabs',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Interactive tabs showcasing different team types with enable/disable options',
    icon: '👥',
    defaultData: {
      id: '',
      type: 'fusion-teams-tabs',
      order: 0,
      data: {
        mainTitle: 'Building apps with fusion teams',
        mainDescription:
          'Fusion teams are a blend of business and technology experts who come together to build custom solutions',
        trustedByText: 'Trusted by',
        tabs: [
          {
            id: 'it-leaders',
            title: 'IT Leaders',
            subtitle:
              'If you have a huge backlog of internal applications and processes to be built',
            description: 'IVAFlow is the IDEAL platform for',
            benefits: [
              'Building dozens of custom applications',
              'Automating simple to complex processes',
              'Handling ticketing and support requests',
            ],
            image: '/assets/it-leaders.webp',
            imageAlt: 'Low Code platform for IT Leaders',
            trustedByImage: '/assets/logo-strip-desktop-1.webp',
            trustedByAlt: 'Logo Strip - Desktop-1',
            enabled: true,
          },
          {
            id: 'developers',
            title: 'Developers',
            subtitle:
              'If you want to accelerate app development and reduce manual coding efforts',
            description: 'IVAFlow is the right choice for your team',
            benefits: [
              'Delivers 10x productivity',
              'Uses AI to automate repetitive tasks',
              'Integrates smoothly with enterprise systems',
            ],
            image: '/assets/developers.webp',
            imageAlt: 'Low code platform for Developers',
            trustedByImage: '/assets/logo-strip-desktop-2.webp',
            trustedByAlt: 'Logo Strip - Desktop-2',
            enabled: true,
          },
          {
            id: 'process-owners',
            title: 'Process owners',
            subtitle:
              'If you need to streamline workflows without relying on IT',
            description: 'IVAFlow is the right choice for your team',
            benefits: [
              'Automates simple to complex processes',
              'Provides no-code tools for faster execution',
              'Enhances operational efficiency with AI',
            ],
            image: '/assets/process-owners.webp',
            imageAlt: 'Process owners to build required custom apps',
            trustedByImage: '/assets/logo-strip-desktop-2.webp',
            trustedByAlt: 'Logo Strip - Desktop-2',
            enabled: true,
          },
          {
            id: 'business-users',
            title: 'Business users',
            subtitle:
              'If you need a user-friendly platform to simplify daily tasks',
            description: 'IVAFlow is the right choice for your team',
            benefits: [
              'Requires no coding to create and modify processes',
              'Uses AI to automate and optimize work',
              'Improves efficiency with intuitive workflows',
            ],
            image: '/assets/business-users.webp',
            imageAlt: 'User friendly platform for Business users',
            trustedByImage: '/assets/logo-strip-desktop-2.webp',
            trustedByAlt: 'Logo Strip - Desktop-2',
            enabled: true,
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20 lg:py-28',
      },
    },
    configSchema: {},
  },

  {
    id: 'platform-features',
    name: 'Platform Features',
    type: 'platform-features',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Two-column feature list with optional content and background image',
    icon: '⚡',
    defaultData: {
      id: '',
      type: 'platform-features',
      order: 0,
      data: {
        title: 'is the answer',
        titleHighlight: 'A low-code/no-code platform',
        subtitle: 'You need a platform that',
        backgroundImage: '/assets/fold-5.png',
        leftFeatures: [
          {
            icon: '/assets/dt-icon-1.webp',
            text: 'Is governed by IT',
            enabled: true,
          },
          {
            icon: '/assets/dt-icon2.webp',
            text: 'Keeps your data protected',
            enabled: true,
          },
          {
            icon: '/assets/dt-3.svg',
            text: 'Handles multiple types of work',
            enabled: true,
          },
          {
            icon: '/assets/dt-icon4.webp',
            text: 'Turns business users into responsible citizen developers',
            enabled: true,
          },
        ],
        rightFeatures: [
          {
            icon: '/assets/dt-r-1.svg',
            text: 'Loves integrations',
            enabled: true,
          },
          {
            icon: '/assets/dt-r-2.svg',
            text: 'Generates analytics across apps',
            enabled: true,
          },
          {
            icon: '/assets/dt-r-3.svg',
            text: 'Scales up for large enterprises',
            enabled: true,
          },
          {
            icon: '/assets/dt-r-4.webp',
            text: "Doesn't restrict developers",
            enabled: true,
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'interactive-feature-wall',
    name: 'Interactive Feature Wall',
    type: 'interactive-feature-wall',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Interactive grid of feature tiles with dynamic preview area',
    icon: '🎯',
    defaultData: {
      id: '',
      type: 'interactive-feature-wall',
      order: 0,
      data: {
        title: 'Everything you need in one converged AI platform',
        subtitle: '100+ features to maximize human and AI productivity.',
        gridColumns: 3,
        previewAspectRatio: 'video',
        theme: 'light',
        showDescriptions: false,
        features: [
          {
            id: 'tasks',
            key: 'tasks',
            title: 'Tasks',
            icon: 'check',
            previewImage: '/images/features/tasks.png',
            description: 'Manage and track tasks efficiently',
          },
          {
            id: 'docs',
            key: 'docs',
            title: 'Docs',
            icon: 'doc',
            previewImage: '/images/features/docs.png',
            description: 'Create and collaborate on documents',
          },
          {
            id: 'calendar',
            key: 'calendar',
            title: 'Calendar',
            icon: 'calendar',
            previewImage: '/images/features/calendar.png',
            description: 'Schedule and manage events',
          },
          {
            id: 'chat',
            key: 'chat',
            title: 'Chat',
            icon: 'users',
            previewImage: '/images/features/chat.png',
            description: 'Real-time team communication',
          },
          {
            id: 'dashboards',
            key: 'dashboards',
            title: 'Dashboards',
            icon: 'chart',
            previewImage: '/images/features/dashboards.png',
            description: 'Visualize data and metrics',
          },
          {
            id: 'automations',
            key: 'automations',
            title: 'Automations',
            icon: 'zap',
            previewImage: '/images/features/automations.png',
            description: 'Automate repetitive workflows',
          },
        ],
        defaultActiveFeature: 'tasks',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'wall-of-features',
    name: 'Wall of Features',
    type: 'wall-of-features',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Feature grid with tiles like ClickUp - interactive wall of features',
    icon: '🧩',
    defaultData: {
      id: '',
      type: 'wall-of-features',
      order: 0,
      data: {
        title: 'Everything you need in one converged AI platform',
        subtitle: '100+ features to maximize human and AI productivity.',
        features: [
          // Empty tiles for spacing
          {
            id: '1',
            title: '',
            type: 'empty',
            position: { row: 1, column: 1 },
          },
          {
            id: '2',
            title: '',
            type: 'empty',
            position: { row: 1, column: 2 },
          },
          {
            id: '3',
            title: '',
            type: 'empty',
            position: { row: 1, column: 3 },
          },
          {
            id: '4',
            title: '',
            type: 'empty',
            position: { row: 1, column: 4 },
          },
          {
            id: '5',
            title: '',
            type: 'empty',
            position: { row: 1, column: 5 },
          },
          {
            id: '6',
            title: '',
            type: 'empty',
            position: { row: 1, column: 6 },
          },
          {
            id: '7',
            title: '',
            type: 'empty',
            position: { row: 1, column: 7 },
          },
          {
            id: '8',
            title: '',
            type: 'empty',
            position: { row: 1, column: 8 },
          },
          {
            id: '9',
            title: '',
            type: 'empty',
            position: { row: 1, column: 9 },
          },
          {
            id: '10',
            title: '',
            type: 'empty',
            position: { row: 1, column: 10 },
          },

          // Feature tiles
          {
            id: '11',
            title: 'Dependencies',
            type: 'button',
            position: { row: 2, column: 1 },
          },
          {
            id: '12',
            title: 'Connected Search',
            type: 'button',
            position: { row: 2, column: 2 },
          },
          {
            id: '13',
            title: 'Tasks',
            type: 'button',
            position: { row: 2, column: 3 },
          },
          {
            id: '14',
            title: 'Mind Maps',
            type: 'button',
            position: { row: 2, column: 4 },
          },
          {
            id: '15',
            title: 'Wikis',
            type: 'button',
            position: { row: 2, column: 5 },
          },
          {
            id: '16',
            title: 'AI Notetaker',
            type: 'button',
            position: { row: 2, column: 6 },
          },
          {
            id: '17',
            title: 'Calendar',
            type: 'button',
            position: { row: 2, column: 7 },
          },
          {
            id: '18',
            title: 'Proofing',
            type: 'button',
            position: { row: 2, column: 8 },
          },
          {
            id: '19',
            title: 'Portfolios',
            type: 'button',
            position: { row: 2, column: 9 },
          },
          {
            id: '20',
            title: 'Templates',
            type: 'button',
            position: { row: 2, column: 10 },
          },

          // More feature tiles
          {
            id: '21',
            title: 'Reminders',
            type: 'button',
            position: { row: 3, column: 1 },
          },
          {
            id: '22',
            title: 'Reporting',
            type: 'button',
            position: { row: 3, column: 2 },
          },
          {
            id: '23',
            title: 'Goals',
            type: 'button',
            position: { row: 3, column: 3 },
          },

          // Parent tiles (large)
          {
            id: '24',
            title: 'Projects',
            type: 'parent',
            size: 'large',
            href: '/teams/project-management',
            image:
              'https://images.ctfassets.net/w8fc6tgspyjz/3SIBpiSpDlsgeZOt1H2pLh/ca8361470a3b4d2abced5749b7c65aa8/feature-projects.png',
            position: { row: 3, column: 4, rowSpan: 2, columnSpan: 2 },
          },
          {
            id: '25',
            title: 'Docs',
            type: 'parent',
            size: 'large',
            href: '/features/docs',
            image:
              'https://images.ctfassets.net/w8fc6tgspyjz/7mdFNyxKlaswOGGUAgxM2p/bcb9154ce8ec1e023087cab1f3d94b94/feature-docs.png',
            position: { row: 3, column: 6, rowSpan: 2, columnSpan: 2 },
          },

          // Continue with more tiles...
          {
            id: '26',
            title: 'Sprints',
            type: 'button',
            position: { row: 3, column: 8 },
          },
          {
            id: '27',
            title: 'Custom Status',
            type: 'button',
            position: { row: 3, column: 9 },
          },
          {
            id: '28',
            title: 'AI Writer',
            type: 'button',
            position: { row: 3, column: 10 },
          },
        ],
        backgroundColor: '#e8e8e8',
        tileBackgroundColor: '#ffffff',
        textColor: '#838383',
        hoverTextColor: '#202020',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
        alignment: 'center',
      },
    },
    configSchema: {},
  },
];
