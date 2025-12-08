/**
 * NWMFlow-style Section Templates
 * Sections inspired by nwmflow-site design
 */

import { SectionTemplate } from './section-registry';

export const NWM_SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero-slider-nwm',
    name: 'Hero Slider (NWM Style)',
    type: 'hero-slider-nwm',
    category: 'Headers',
    description: 'Full-width hero slider with video/image backgrounds and side card',
    icon: '🎬',
    defaultData: {
      id: '',
      type: 'hero-slider-nwm',
      order: 0,
      data: {
        autoPlayInterval: 7000,
        defaultSnapshotCard: {
          title: 'One OS, many live systems.',
          subtitle: 'NWMFlow snapshot',
          description: 'Use NWMFlow as the engine behind HR, citizen services, ticketing, CX and more.',
          stats: [
            { label: 'Designed for', value: 'Enterprise' },
            { label: 'Built-in', value: 'Forms · Workflows · Dashboards' },
            { label: 'Architecture', value: 'Farm & Portals' }
          ],
          placeholderText: 'Product screenshot placeholder'
        },
        slides: [
          {
            id: 0,
            label: 'Citizen Requests',
            title: 'Modern public services without the legacy mess.',
            desc: 'Design and launch end-to-end citizen request systems.',
            badge: 'Government',
            mediaType: 'image',
            mediaSrc: '/placeholder-hero.jpg',
            snapshotCard: {
              title: 'Built for Government',
              subtitle: 'Citizen Services Solution',
              description: 'Complete digital transformation for public sector operations.',
              stats: [
                { label: 'Sector', value: 'Government' },
                { label: 'Features', value: 'Request Management · Workflows' },
                { label: 'Compliance', value: 'GDPR · Accessibility' }
              ],
              placeholderText: 'Government Dashboard Preview'
            }
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },
  {
    id: 'why-nwm',
    name: 'Why Section (NWM Style)',
    type: 'why-nwm',
    category: 'Content',
    description: '3-column card grid with features list',
    icon: '💡',
    defaultData: {
      id: '',
      type: 'why-nwm',
      order: 0,
      data: {
        eyebrow: 'Why NWMFlow',
        title: 'What makes NWMFlow different?',
        description: 'A truly no-code operating system for organizations.',
        cards: [
          {
            title: 'True no-code',
            description: 'Design forms workflows dashboards through visual designer.',
            features: [
              'Drag-and-drop forms',
              'Instant deployment',
              'Business owned',
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'stakeholders-nwm',
    name: 'Stakeholders (NWM Style)',
    type: 'stakeholders-nwm',
    category: 'Content',
    description: '4-column stakeholder cards with pills',
    icon: '👥',
    defaultData: {
      id: '',
      type: 'stakeholders-nwm',
      order: 0,
      data: {
        eyebrow: 'Value for every stakeholder',
        title: 'Solve the problems of key stakeholders.',
        description: 'NWMFlow turns process chaos into guided experience.',
        mediaPlaceholder: 'Drop stakeholder demo video here',
        cards: [
          {
            title: 'Executives',
            description: 'See live performance and SLAs.',
            pills: ['Real-time dashboards', 'SLA compliance'],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'ecosystem-nwm',
    name: 'Ecosystem (NWM Style)',
    type: 'ecosystem-nwm',
    category: 'Content',
    description: '3-column feature list in glass card',
    icon: '🌐',
    defaultData: {
      id: '',
      type: 'ecosystem-nwm',
      order: 0,
      data: {
        eyebrow: 'Complete automation ecosystem',
        title: 'One unified OS for operational needs.',
        description: 'Explore by feature industry or use case.',
        columns: [
          {
            title: 'By core feature',
            items: [
              'No-code Form Builder',
              'Workflow Engine',
              'Dashboard Builder',
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'infographic-nwm',
    name: 'Infographic (NWM Style)',
    type: 'infographic-nwm',
    category: 'Content',
    description: 'Architecture diagram with circular layers',
    icon: '🏗️',
    defaultData: {
      id: '',
      type: 'infographic-nwm',
      order: 0,
      data: {
        eyebrow: 'Architecture snapshot',
        title: 'How NWMFlow becomes your operating system.',
        description: 'A layered multi-tenant architecture.',
        coreLabel: 'NWMFlow Core',
        coreSubLabel: 'Forms Workflows Data Automation',
        farmLabel: 'Farm Multi-org Layer',
        portalLabel: 'Portals Workspaces',
        orgNodes: [
          { title: 'Org A', description: 'Multiple portals.', position: 'top-left' },
        ],
        notesTitle: 'Use this block for a diagram.',
        notesDescription: 'Replace with your own diagram.',
        notesList: [
          'One deploy many organizations.',
          'Dedicated portals per org.',
        ],
        imagePlaceholder: 'Drop architecture diagram here',
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'video-preview-nwm',
    name: 'Video Preview (NWM Style)',
    type: 'video-preview-nwm',
    category: 'Content',
    description: 'Video placeholder with module list',
    icon: '🎥',
    defaultData: {
      id: '',
      type: 'video-preview-nwm',
      order: 0,
      data: {
        eyebrow: 'Platform preview',
        title: 'See the platform in action.',
        description: 'Modern UI designed for speed.',
        videoPlaceholder: 'Embed product tour video here',
        videoNotes: [
          'Highlight form builder and workflows.',
          'Keep it under 90 seconds.',
        ],
        modules: [
          { emoji: '📝', title: 'Form Builder', description: 'Multi-step forms.' },
        ],
        ctaText: 'Watch full product tour',
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'partners-nwm',
    name: 'Partners (NWM Style)',
    type: 'partners-nwm',
    category: 'Content',
    description: '3-column partner cards with CTA buttons',
    icon: '🤝',
    defaultData: {
      id: '',
      type: 'partners-nwm',
      order: 0,
      data: {
        eyebrow: 'Partner program',
        title: 'Build solutions. Grow with NWMFlow.',
        description: 'Package your expertise and scale.',
        cards: [
          {
            title: 'Implementation support',
            description: 'Take ownership of rollout.',
            features: [
              'Enterprise platform',
              'Training tracks',
            ],
          },
        ],
        ctaButtons: {
          primary: { text: 'Become a partner', href: '#apply' },
          secondary: { text: 'Download brief', href: '#download' },
        },
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'features-grid-nwm',
    name: 'Features Grid (NWM Style)',
    type: 'features-grid-nwm',
    category: 'Content',
    description: '3-column feature grid with glow effects',
    icon: '⭐',
    defaultData: {
      id: '',
      type: 'features-grid-nwm',
      order: 0,
      data: {
        eyebrow: 'Core capabilities',
        title: 'Everything you need for digital operations.',
        description: 'From intake to decision to final outcome.',
        features: [
          {
            title: 'No-code form builder',
            description: 'Multi-step conditional forms with validation.',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'final-cta-nwm',
    name: 'Final CTA (NWM Style)',
    type: 'final-cta-nwm',
    category: 'Actions',
    description: 'Horizontal CTA with two buttons in glass card',
    icon: '🚀',
    defaultData: {
      id: '',
      type: 'final-cta-nwm',
      order: 0,
      data: {
        eyebrow: 'Ready to see it live?',
        title: 'Build your first live system on NWMFlow.',
        description: 'Bring a real process and we will help you launch it.',
        primaryButton: {
          text: 'Book a live build session',
          href: '#contact',
        },
        secondaryButton: {
          text: 'Explore solution blueprints',
          href: '#solutions',
        },
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'platform-tabs',
    name: 'Platform Tabs',
    type: 'platform-tabs',
    category: 'Content',
    description: 'Tabbed platform ecosystem with cards (by feature, industry, use case)',
    icon: '📑',
    defaultData: {
      id: '',
      type: 'platform-tabs',
      order: 0,
      data: {
        title: 'The Complete Automation Ecosystem',
        subtitle: 'The Platform',
        description: 'One unified OS for all your operational needs.',
        tabs: [
          {
            id: 'core',
            label: 'By Core Feature',
            cards: [
              {
                title: 'Smart Forms',
                description: 'Intelligent data capture with offline support.',
                image: '/assets/img/2.png',
                link: '/forms',
              },
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
        alignment: 'center',
      },
    },
    configSchema: {},
  },
];
