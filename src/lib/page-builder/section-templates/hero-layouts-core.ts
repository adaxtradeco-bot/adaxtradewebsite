/**
 * HERO_LAYOUTS_CORE_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const HERO_LAYOUTS_CORE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero-default',
    name: 'Hero Section',
    type: 'hero',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Large banner with title, subtitle, and call-to-action buttons',
    icon: '🎯',
    defaultData: {
      id: '',
      type: 'hero',
      order: 0,
      data: {
        title: 'Your Amazing Title Here',
        subtitle: 'Compelling Subtitle',
        description:
          'Write a compelling description that explains your value proposition and encourages visitors to take action.',
        buttons: [
          {
            text: 'Get Started',
            href: '#',
            variant: 'primary' as const,
            size: 'lg' as const,
          },
          {
            text: 'Learn More',
            href: '#',
            variant: 'secondary' as const,
            size: 'lg' as const,
          },
        ],
        badges: [
          { text: 'Free Trial', variant: 'success' },
          { text: 'No Credit Card', variant: 'info' },
        ],
      },
      style: {
        backgroundColor:
          'bg-gradient-to-br from-slate-50 via-white to-slate-100/50',
        textColor: 'text-slate-900',
        padding: 'py-20',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'hero-full-gradient',
    name: 'Hero Full Gradient',
    type: 'hero',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Full-width hero with gradient background, visual elements, and dark mode support',
    icon: '🌟',
    defaultData: {
      id: '',
      type: 'hero',
      order: 0,
      data: {
        title: 'Custom Apps. Zero Heavy Code.',
        subtitle: 'Build complete web apps in days',
        description:
          'Design responsive internal tools with pages, workflows, reports, roles, and integrations. AI-assisted builder + enterprise controls = speed with confidence.',
        buttons: [
          {
            text: 'Try the Builder',
            href: '#',
            variant: 'primary' as const,
            size: 'lg' as const,
          },
          {
            text: 'Browse Templates',
            href: '#',
            variant: 'outline' as const,
            size: 'lg' as const,
          },
        ],
        badges: [
          { text: 'No-Code', variant: 'default' },
          { text: 'AI-Assisted', variant: 'info' },
          { text: 'SOC2/GDPR', variant: 'success' },
        ],
      },
      style: {
        backgroundColor:
          'bg-gradient-to-br from-violet-50 via-slate-50 to-cyan-50',
        textColor: 'text-slate-900',
        padding: 'py-20 lg:py-32',
        alignment: 'left',
        layout: 'full',
      },
    },
    configSchema: {},
  },

  {
    id: 'hero-slider',
    name: 'Hero Slider',
    type: 'hero-slider',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Full-screen hero slider with customizable slides and card content',
    icon: '🎞️',
    defaultData: {
      id: '',
      type: 'hero-slider',
      order: 0,
      data: {
        autoplay: true,
        interval: 5000,
        globalMinHeight: '90vh',
        slides: [
          {
            title: 'Transform Your Business',
            subtitle: 'Innovation at Scale',
            description:
              'Discover how our cutting-edge solutions can revolutionize your operations and drive unprecedented growth.',
            tag: 'Featured Solution',
            backgroundImage: '/assets/hero-bg-1.jpg',
            useImageInsteadOfCard: false,
            cardImage: '',
            minHeight: '',
            buttons: [
              { text: 'Get Started', href: '#', variant: 'primary' as const },
              { text: 'Learn More', href: '#', variant: 'secondary' as const },
            ],
            statistics: [
              {
                label: 'Success Rate',
                value: '99%',
                description: 'Client satisfaction',
              },
              {
                label: 'Growth',
                value: '300%',
                description: 'Average improvement',
              },
            ],
          },
          {
            title: 'Advanced Analytics',
            subtitle: 'Data-Driven Insights',
            description:
              'Harness the power of AI and machine learning to unlock actionable insights from your data.',
            tag: 'AI Powered',
            backgroundImage: '/assets/hero-bg-2.jpg',
            useImageInsteadOfCard: false,
            cardImage: '',
            minHeight: '',
            buttons: [
              { text: 'View Demo', href: '#', variant: 'primary' as const },
              {
                text: 'Contact Sales',
                href: '#',
                variant: 'secondary' as const,
              },
            ],
            statistics: [
              {
                label: 'Processing Speed',
                value: '10x',
                description: 'Faster than traditional',
              },
              {
                label: 'Accuracy',
                value: '99.9%',
                description: 'Precision rate',
              },
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },
];
