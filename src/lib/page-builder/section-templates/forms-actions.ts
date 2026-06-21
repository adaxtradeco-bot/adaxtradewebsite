import { SECTION_CATEGORIES, SectionTemplate } from '../section-registry.types';

export const FORMS_ACTIONS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'contact-form-default',
    name: 'Contact Form',
    type: 'contact-form',
    category: SECTION_CATEGORIES.ACTIONS,
    description:
      'A form section that emails its submissions to a destination address. Supports Contact, Demo Request, and Partnership presets, with Standard / Minimal / Glass themes that adapt to light and dark mode.',
    icon: '📨',
    defaultData: {
      id: 'contact-form-1',
      type: 'contact-form',
      order: 0,
      data: {
        formType: 'contact',
        destinationEmail: 'info@yourcompany.com',
        theme: 'standard',
        title: 'Get in Touch',
        subtitle: 'Contact Us',
        description: 'Fill out the form below and our team will get back to you within 24 hours.',
        features: [
          { icon: '⚡', title: 'Quick Response', description: 'We respond within 24 hours on business days' },
          { icon: '🔒', title: 'Secure & Private', description: 'Your information is never shared with third parties' },
        ],
        successTitle: 'Thank you!',
        successMessage: "We've received your submission and will get back to you soon.",
      },
    },
    configSchema: {},
  },
];
