/**
 * CARDS_AND_PARTNERS_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const CARDS_AND_PARTNERS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'simple-cards',
    name: 'Simple Cards',
    type: 'simple-cards',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Grid of simple cards with title and description',
    icon: '🎴',
    defaultData: {
      id: '',
      type: 'simple-cards',
      order: 0,
      data: {
        title: 'Why Intelligent Orchestration?',
        description:
          'Centralization, compliance, collaboration, and automation — all in one place to run processes at scale.',
        cards: [
          {
            title: 'Centralization & Visibility',
            description:
              'Unify requests and track real-time status across all work streams.',
          },
          {
            title: 'Process Compliance',
            description:
              'Map processes and ensure execution standards are followed every time.',
          },
          {
            title: 'Automation & Collaboration',
            description:
              'Replace manual steps with rules, and keep teams aligned.',
          },
          {
            title: 'Reports & Mapping',
            description:
              'Analyze performance and visualize flows to remove bottlenecks.',
          },
        ],
        columns: 4,
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
    id: 'partner-benefits',
    name: 'Partner Benefits',
    type: 'partner-benefits',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Grid of partnership benefits with icons and feature lists',
    icon: '💰',
    defaultData: {
      id: '',
      type: 'partner-benefits',
      order: 0,
      data: {
        badge: 'Partner Benefits',
        title: 'Why Partner with Us?',
        subtitle:
          'Access exclusive benefits, enablement, and support to accelerate your growth.',
        benefits: [
          {
            icon: '💰',
            title: 'Revenue Growth',
            description:
              'Unlock new revenue streams and expand your service offerings.',
            features: [
              'Competitive margins',
              'Recurring revenue',
              'Upsell & cross-sell',
              'Deal registration',
            ],
          },
          {
            icon: '🎓',
            title: 'Training & Certification',
            description:
              'Get your team certified and deliver world-class solutions.',
            features: [
              'Partner training',
              'Tech certifications',
              'Sales enablement',
              'Live webinars',
            ],
          },
          {
            icon: '🤝',
            title: 'Dedicated Support',
            description: 'Work directly with our team for joint success.',
            features: [
              'Partner manager',
              'Priority support',
              'Pre-sales help',
              'Co-marketing',
            ],
          },
          {
            icon: '🛠️',
            title: 'Partner Resources',
            description: 'Tools and templates to streamline delivery.',
            features: [
              'White-label options',
              'Demo environments',
              'Sales & marketing kits',
              'Implementation packs',
            ],
          },
          {
            icon: '📈',
            title: 'Market Expansion',
            description: 'Reach new geographies & industries.',
            features: [
              'Co-marketing campaigns',
              'Lead sharing',
              'Directory listing',
              'Success stories',
            ],
          },
          {
            icon: '🏆',
            title: 'Competitive Advantage',
            description: 'Stand out with an AI-native, IoT-capable platform.',
            features: [
              'Exclusive benefits',
              'Early feature access',
              'Roadmap input',
              'Partner advisory board',
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'partner-types',
    name: 'Partner Types',
    type: 'partner-types',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Display different partnership types with features and CTAs',
    icon: '🤝',
    defaultData: {
      id: '',
      type: 'partner-types',
      order: 0,
      data: {
        badge: 'Partner Types',
        title: 'Choose Your Partnership Path',
        subtitle: 'Flexible models that match your business goals.',
        types: [
          {
            icon: '🔧',
            title: 'Implementation Partner',
            description:
              'Deploy and customize for clients. Ideal for IT consultancies & SIs.',
            features: [
              'Project-based revenue',
              'Technical training',
              'Best practices',
              'Demo access',
              'Pre-sales support',
            ],
            cta: {
              text: 'Learn More →',
              href: '#apply',
            },
          },
          {
            icon: '💼',
            title: 'Reseller Partner',
            description:
              'Sell directly; earn competitive margins. For VARs & solution providers.',
            features: [
              'Reseller discounts',
              'Deal protection',
              'Sales enablement',
              'Co-selling',
              'MDF funds',
            ],
            cta: {
              text: 'Learn More →',
              href: '#apply',
            },
          },
          {
            icon: '🌐',
            title: 'Technology Partner',
            description:
              'Integrate and co-innovate. For software vendors & IoT providers.',
            features: [
              'API/integration support',
              'Joint GTM',
              'Co-innovation',
              'Tech benefits',
              'Marketplace listing',
            ],
            cta: {
              text: 'Learn More →',
              href: '#apply',
            },
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-800',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'requirements',
    name: 'Requirements Section',
    type: 'requirements',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Two-column section with requirements list and visual',
    icon: '✅',
    defaultData: {
      id: '',
      type: 'requirements',
      order: 0,
      data: {
        title: 'Ready to Get Started?',
        description: "Here's what we look for in potential partners:",
        requirements: [
          'Track record in automation/IT consulting',
          'Commitment to customer success',
          'Technical expertise or certification path',
          'Active sales/marketing capability',
          'Alignment with our vision',
        ],
        visualIcon: '🤝',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },
];
