/**
 * CARDS_INTERACTIVE_CORE_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const CARDS_INTERACTIVE_CORE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'features-grid',
    name: 'Features Grid',
    type: 'features',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Grid layout showcasing key features with icons and descriptions',
    icon: '⭐',
    defaultData: {
      id: '',
      type: 'features',
      order: 0,
      data: {
        title: 'Amazing Features',
        subtitle: 'Everything you need',
        description:
          'Discover the powerful features that make our platform unique',
        items: [
          {
            title: 'Fast Performance',
            description: 'Lightning-fast loading times and smooth interactions',
            icon: '⚡',
          },
          {
            title: 'Secure & Reliable',
            description:
              'Enterprise-grade security with 99.9% uptime guarantee',
            icon: '🔒',
          },
          {
            title: 'Easy to Use',
            description:
              'Intuitive interface designed for users of all skill levels',
            icon: '🎨',
          },
          {
            title: '24/7 Support',
            description:
              'Round-the-clock customer support whenever you need help',
            icon: '🛟',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white',
        textColor: 'text-slate-900',
        padding: 'py-16',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'cta-default',
    name: 'Call to Action',
    type: 'cta',
    category: SECTION_CATEGORIES.ACTIONS,
    description: 'Compelling call-to-action section with buttons',
    icon: '🚀',
    defaultData: {
      id: '',
      type: 'cta',
      order: 0,
      data: {
        title: 'Ready to Get Started?',
        description:
          'Join thousands of satisfied customers and transform your business today.',
        buttons: [
          {
            text: 'Start Free Trial',
            href: '#',
            variant: 'primary' as const,
            size: 'lg' as const,
          },
        ],
      },
      style: {
        backgroundColor: 'bg-gradient-to-r from-violet-600 to-cyan-500',
        textColor: 'text-white',
        padding: 'py-16',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'tabs-interactive',
    name: 'Interactive Tabs',
    type: 'tabs',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Tabbed content with interactive switching',
    icon: '📑',
    defaultData: {
      id: '',
      type: 'tabs',
      order: 0,
      data: {
        tabs: [
          {
            id: 'tab1',
            label: 'Features',
            title: 'Powerful Features',
            description:
              'Discover our comprehensive set of features designed to boost your productivity.',
            features: ['Feature 1', 'Feature 2', 'Feature 3'],
          },
          {
            id: 'tab2',
            label: 'Benefits',
            title: 'Key Benefits',
            description:
              "Learn about the benefits you'll experience when using our platform.",
            features: ['Benefit 1', 'Benefit 2', 'Benefit 3'],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50',
        textColor: 'text-slate-900',
        padding: 'py-16',
        alignment: 'left',
      },
    },
    configSchema: {},
  },

  {
    id: 'faq-expandable',
    name: 'FAQ Section',
    type: 'faq',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Expandable frequently asked questions',
    icon: '❓',
    defaultData: {
      id: '',
      type: 'faq',
      order: 0,
      data: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know',
        categories: [
          {
            title: 'Getting Started',
            items: [
              {
                question: 'How do I get started?',
                answer:
                  'Simply sign up for an account and follow our quick setup guide.',
              },
              {
                question: 'Is there a free trial?',
                answer:
                  'Yes, we offer a 14-day free trial with full access to all features.',
              },
            ],
          },
          {
            title: 'Billing & Pricing',
            items: [
              {
                question: 'What payment methods do you accept?',
                answer:
                  'We accept all major credit cards, PayPal, and bank transfers.',
              },
              {
                question: 'Can I cancel anytime?',
                answer:
                  'Yes, you can cancel your subscription at any time with no penalties.',
              },
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50',
        textColor: 'text-slate-900',
        padding: 'py-16',
        alignment: 'left',
      },
    },
    configSchema: {},
  },

  {
    id: 'stats-counter',
    name: 'Stats Counter',
    type: 'stats',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Display impressive statistics and numbers',
    icon: '📊',
    defaultData: {
      id: '',
      type: 'stats',
      order: 0,
      data: {
        title: 'Our Impact in Numbers',
        stats: [
          { value: '10K+', label: 'Happy Clients', icon: '👥' },
          { value: '50K+', label: 'Properties Sold', icon: '🏠' },
          { value: '$2B+', label: 'Total Value', icon: '💰' },
          { value: '98%', label: 'Satisfaction Rate', icon: '⭐' },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'testimonials-carousel',
    name: 'Testimonials',
    type: 'testimonials',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Customer testimonials and reviews',
    icon: '💬',
    defaultData: {
      id: '',
      type: 'testimonials',
      order: 0,
      data: {
        title: 'What Our Clients Say',
        subtitle: 'Real stories from real people',
        testimonials: [
          {
            name: 'Sarah Johnson',
            role: 'Property Investor',
            content:
              'Outstanding service! They helped me find the perfect investment property.',
            rating: 5,
            avatar: '👩',
          },
          {
            name: 'Michael Chen',
            role: 'First-time Buyer',
            content:
              'Professional team that made my first home purchase stress-free.',
            rating: 5,
            avatar: '👨',
          },
          {
            name: 'Emily Davis',
            role: 'Real Estate Developer',
            content:
              'Excellent market knowledge and negotiation skills. Highly recommended!',
            rating: 5,
            avatar: '👩‍💼',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white',
        textColor: 'text-slate-900',
        padding: 'py-16',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'property-showcase',
    name: 'Property Showcase',
    type: 'properties',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Showcase featured properties with images and details',
    icon: '🏘️',
    defaultData: {
      id: '',
      type: 'properties',
      order: 0,
      data: {
        title: 'Featured Properties',
        subtitle: 'Discover your dream home',
        properties: [
          {
            title: 'Modern Downtown Apartment',
            location: 'New York, NY',
            price: '$850,000',
            beds: 3,
            baths: 2,
            sqft: '2,100',
            image: '🏢',
          },
          {
            title: 'Luxury Beach Villa',
            location: 'Miami, FL',
            price: '$2,500,000',
            beds: 5,
            baths: 4,
            sqft: '4,500',
            image: '🏖️',
          },
          {
            title: 'Suburban Family Home',
            location: 'Austin, TX',
            price: '$650,000',
            beds: 4,
            baths: 3,
            sqft: '3,200',
            image: '🏡',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50',
        textColor: 'text-slate-900',
        padding: 'py-16',
        alignment: 'left',
      },
    },
    configSchema: {},
  },

  {
    id: 'location-map',
    name: 'Location Map',
    type: 'location',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Display location with map and contact information',
    icon: '📍',
    defaultData: {
      id: '',
      type: 'location',
      order: 0,
      data: {
        title: 'Visit Our Office',
        subtitle: "We're here to help",
        address: '123 Main Street, Suite 100',
        city: 'New York, NY 10001',
        phone: '+1 (555) 123-4567',
        email: 'info@realestate.com',
        hours: 'Mon-Fri: 9AM-6PM',
      },
      style: {
        backgroundColor: 'bg-white',
        textColor: 'text-slate-900',
        padding: 'py-16',
        alignment: 'left',
      },
    },
    configSchema: {},
  },
];
