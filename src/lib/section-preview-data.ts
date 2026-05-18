/**
 * Section Preview Sample Data
 * High-quality sample data for section previews
 */

import { SectionConfig } from './page-builder/section-schemas';

export const SECTION_PREVIEW_SAMPLES: Record<string, SectionConfig> = {
  // Hero Section
  hero: {
    id: 'preview-hero',
    type: 'hero',
    order: 0,
    data: {
      title: 'Transform Your Business with AI',
      subtitle: 'Next-Generation Solutions',
      description:
        'Empower your team with cutting-edge AI technology. Build, deploy, and scale intelligent applications faster than ever before.',
      buttons: [
        {
          text: 'Start Free Trial',
          href: '#',
          variant: 'primary' as const,
          size: 'lg' as const,
        },
        {
          text: 'Watch Demo',
          href: '#',
          variant: 'secondary' as const,
          size: 'lg' as const,
        },
      ],
      badges: [
        { text: '14-Day Free Trial', variant: 'success' },
        { text: 'No Credit Card Required', variant: 'info' },
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

  // Hero Slider
  'hero-slider': {
    id: 'preview-hero-slider',
    type: 'hero-slider',
    order: 0,
    data: {
      autoplay: true,
      interval: 5000,
      globalMinHeight: '90vh',
      slides: [
        {
          title: 'Build Faster, Scale Smarter',
          subtitle: 'Enterprise-Grade Platform',
          description:
            'Deploy production-ready applications in minutes with our powerful no-code platform.',
          tag: 'Featured',
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
              label: 'Faster Deployment',
              value: '10x',
              description: 'Than traditional methods',
            },
            {
              label: 'Uptime',
              value: '99.9%',
              description: 'Guaranteed SLA',
            },
          ],
        },
        {
          title: 'AI-Powered Automation',
          subtitle: 'Intelligent Workflows',
          description:
            'Automate complex business processes with AI-driven decision making and smart routing.',
          tag: 'New',
          backgroundImage: '/assets/hero-bg-2.jpg',
          useImageInsteadOfCard: false,
          cardImage: '',
          minHeight: '',
          buttons: [
            { text: 'Explore Features', href: '#', variant: 'primary' as const },
            { text: 'Contact Sales', href: '#', variant: 'secondary' as const },
          ],
          statistics: [
            {
              label: 'Time Saved',
              value: '80%',
              description: 'On manual tasks',
            },
            {
              label: 'Accuracy',
              value: '99%',
              description: 'Error reduction',
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

  // Features Section
  features: {
    id: 'preview-features',
    type: 'features',
    order: 0,
    data: {
      title: 'Everything You Need to Succeed',
      subtitle: 'Powerful Features',
      description: 'All the tools and capabilities to build amazing products',
      features: [
        {
          icon: '⚡',
          title: 'Lightning Fast',
          description: 'Optimized performance for instant loading and smooth interactions',
        },
        {
          icon: '🔒',
          title: 'Enterprise Security',
          description: 'Bank-level encryption and compliance with SOC2, GDPR, and HIPAA',
        },
        {
          icon: '🎨',
          title: 'Beautiful Design',
          description: 'Stunning pre-built templates and customizable themes',
        },
        {
          icon: '📊',
          title: 'Advanced Analytics',
          description: 'Real-time insights and detailed reporting dashboards',
        },
        {
          icon: '🔄',
          title: 'Seamless Integration',
          description: 'Connect with 100+ popular tools and services',
        },
        {
          icon: '🚀',
          title: 'Scalable Infrastructure',
          description: 'Auto-scaling to handle millions of users effortlessly',
        },
      ],
    },
    style: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-16',
    },
  },

  // Tabs Section
  tabs: {
    id: 'preview-tabs',
    type: 'tabs',
    order: 0,
    data: {
      title: 'Explore Our Platform',
      subtitle: 'Feature Showcase',
      tabs: [
        {
          id: 'automation',
          label: 'Automation',
          icon: '🤖',
          title: 'Intelligent Automation',
          description:
            'Automate repetitive tasks and workflows with AI-powered automation engine.',
          image: '/assets/automation-preview.jpg',
          features: [
            'Visual workflow builder',
            'Smart triggers and conditions',
            'Integration with 100+ apps',
            'Real-time monitoring',
          ],
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: '📈',
          title: 'Advanced Analytics',
          description:
            'Get deep insights into your data with powerful analytics and reporting tools.',
          image: '/assets/analytics-preview.jpg',
          features: [
            'Custom dashboards',
            'Real-time data visualization',
            'Predictive analytics',
            'Export and sharing',
          ],
        },
        {
          id: 'collaboration',
          label: 'Collaboration',
          icon: '👥',
          title: 'Team Collaboration',
          description:
            'Work together seamlessly with built-in collaboration and communication tools.',
          image: '/assets/collaboration-preview.jpg',
          features: [
            'Real-time co-editing',
            'Comments and mentions',
            'Role-based permissions',
            'Activity tracking',
          ],
        },
      ],
    },
    style: {
      backgroundColor: 'bg-slate-50',
      textColor: 'text-slate-900',
      padding: 'py-16',
    },
  },

  // Logo Cloud
  'logo-cloud': {
    id: 'preview-logo-cloud',
    type: 'logo-cloud',
    order: 0,
    data: {
      title: 'Trusted by Industry Leaders',
      subtitle: 'Join thousands of companies worldwide',
      logos: [
        { name: 'Company A', image: '/assets/logo-1.png', url: '#' },
        { name: 'Company B', image: '/assets/logo-2.png', url: '#' },
        { name: 'Company C', image: '/assets/logo-3.png', url: '#' },
        { name: 'Company D', image: '/assets/logo-4.png', url: '#' },
        { name: 'Company E', image: '/assets/logo-5.png', url: '#' },
        { name: 'Company F', image: '/assets/logo-6.png', url: '#' },
      ],
    },
    style: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-12',
    },
  },

  // CTA Section
  cta: {
    id: 'preview-cta',
    type: 'cta',
    order: 0,
    data: {
      title: 'Ready to Get Started?',
      description:
        'Join thousands of teams already building amazing products with our platform.',
      buttons: [
        {
          text: 'Start Free Trial',
          href: '#',
          variant: 'primary' as const,
          size: 'lg' as const,
        },
        {
          text: 'Schedule Demo',
          href: '#',
          variant: 'secondary' as const,
          size: 'lg' as const,
        },
      ],
    },
    style: {
      backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
      textColor: 'text-white',
      padding: 'py-16',
      alignment: 'center',
    },
  },

  // FAQ Section
  faq: {
    id: 'preview-faq',
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
              question: 'How do I get started with the platform?',
              answer:
                'Simply sign up for a free account, complete the onboarding wizard, and you can start building your first project in minutes. Our intuitive interface guides you through every step.',
            },
            {
              question: 'Is there a free trial available?',
              answer:
                'Yes! We offer a 14-day free trial with full access to all premium features. No credit card required to start.',
            },
            {
              question: 'What kind of support do you provide?',
              answer:
                'We provide 24/7 email support, live chat during business hours, comprehensive documentation, video tutorials, and a community forum.',
            },
          ],
        },
        {
          title: 'Billing & Pricing',
          items: [
            {
              question: 'What payment methods do you accept?',
              answer:
                'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans.',
            },
            {
              question: 'Can I cancel my subscription anytime?',
              answer:
                'Absolutely! You can cancel your subscription at any time with no penalties or hidden fees. Your access continues until the end of your billing period.',
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

  // Stats Section
  stats: {
    id: 'preview-stats',
    type: 'stats',
    order: 0,
    data: {
      title: 'Trusted by Thousands Worldwide',
      stats: [
        { value: '50K+', label: 'Active Users', icon: '👥' },
        { value: '1M+', label: 'Projects Created', icon: '🚀' },
        { value: '99.9%', label: 'Uptime SLA', icon: '⚡' },
        { value: '150+', label: 'Countries', icon: '🌍' },
      ],
    },
    style: {
      backgroundColor: 'bg-slate-900',
      textColor: 'text-white',
      padding: 'py-16',
      alignment: 'center',
    },
  },

  // Testimonials Section
  testimonials: {
    id: 'preview-testimonials',
    type: 'testimonials',
    order: 0,
    data: {
      title: 'Loved by Teams Everywhere',
      subtitle: 'See what our customers have to say',
      testimonials: [
        {
          name: 'Sarah Mitchell',
          role: 'Product Manager at TechCorp',
          content:
            'This platform has transformed how we build and ship products. The speed and ease of use are unmatched. Our team productivity increased by 300%!',
          rating: 5,
          avatar: '👩‍💼',
        },
        {
          name: 'James Rodriguez',
          role: 'CTO at StartupXYZ',
          content:
            'Best investment we made this year. The automation features alone saved us countless hours. Highly recommend to any growing team.',
          rating: 5,
          avatar: '👨‍💻',
        },
        {
          name: 'Emily Chen',
          role: 'Founder at DesignStudio',
          content:
            'Intuitive, powerful, and reliable. Everything we needed in one place. The customer support is also exceptional - they truly care about our success.',
          rating: 5,
          avatar: '👩‍🎨',
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

  // Properties/Portfolio Section
  properties: {
    id: 'preview-properties',
    type: 'properties',
    order: 0,
    data: {
      title: 'Featured Projects',
      subtitle: 'Explore our latest work',
      properties: [
        {
          title: 'E-Commerce Platform',
          location: 'SaaS Application',
          price: 'Enterprise',
          beds: 3,
          baths: 2,
          sqft: '50K+ users',
          image: '🛍️',
        },
        {
          title: 'Mobile Banking App',
          location: 'FinTech',
          price: 'Series B',
          beds: 5,
          baths: 4,
          sqft: '1M+ downloads',
          image: '💳',
        },
        {
          title: 'Healthcare Portal',
          location: 'HealthTech',
          price: 'HIPAA Compliant',
          beds: 4,
          baths: 3,
          sqft: '100K+ patients',
          image: '🏥',
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

  // Location/Contact Section
  location: {
    id: 'preview-location',
    type: 'location',
    order: 0,
    data: {
      title: 'Get in Touch',
      subtitle: "We'd love to hear from you",
      address: '123 Innovation Drive, Suite 500',
      city: 'San Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'hello@company.com',
      hours: 'Monday - Friday: 9:00 AM - 6:00 PM PST',
    },
    style: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-16',
      alignment: 'left',
    },
  },
};

/**
 * Get sample data for a section type
 */
export function getSectionPreviewData(sectionType: string): SectionConfig | null {
  return SECTION_PREVIEW_SAMPLES[sectionType] || null;
}
