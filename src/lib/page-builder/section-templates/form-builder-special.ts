/**
 * FORM_BUILDER_SPECIAL_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const FORM_BUILDER_SPECIAL_TEMPLATES: SectionTemplate[] = [
  {
    id: 'form-builder-why',
    name: 'Form Builder Why',
    type: 'form-builder-why',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Why choose enterprise form builder with benefit cards',
    icon: '❓',
    defaultData: {
      id: '',
      type: 'form-builder-why',
      order: 0,
      data: {
        title: 'Why Choose an Enterprise Form Builder?',
        description:
          'Replace fragile spreadsheets and rigid off-the-shelf forms with tailored, governed data collection that plugs into your systems. Ship faster, standardize quality, and keep security tight.',
        benefits: [
          'Build in days, not months',
          'Multi-step, responsive layouts',
          'Conditional logic & validations',
          'CRM/ERP/API integrations',
          'Audit trails & role-based access',
          'AI assistance for speed',
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'field-types',
    name: 'Field Types',
    type: 'field-types',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Tabbed interface showing different field types and capabilities',
    icon: '📝',
    defaultData: {
      id: '',
      type: 'field-types',
      order: 0,
      data: {
        tabs: [
          {
            id: 'basics',
            label: 'Basics',
            title: 'Rich Field Library & Customization',
            description:
              'Choose from 30+ field types—text, numbers, dates, files, signatures, maps and more. Add defaults, help text and options, then fine-tune visibility and roles.',
            features: [
              'Text, number, choice',
              'File & image upload',
              'Date & time, signatures',
              'Maps & location',
            ],
          },
          {
            id: 'advanced',
            label: 'Advanced',
            title: 'Advanced & Relational Fields',
            description:
              'Capture complex data with computational fields, master-detail (child tables), API-connected lookups and nested forms. Import rows in bulk via CSV.',
            features: [
              'Computational fields',
              'Master-detail tables',
              'API lookups',
              'Nested forms',
            ],
          },
          {
            id: 'appearance',
            label: 'Appearance',
            title: 'Branding & Appearance',
            description:
              'Apply your brand with themes and custom CSS. Group fields into sections, add icons or placeholders, and keep layouts clean and consistent.',
            features: [
              'Themes & CSS classes',
              'Field grouping',
              'Help text & hints',
              'Icons & placeholders',
            ],
          },
          {
            id: 'validation',
            label: 'Validation',
            title: 'Validation & Role-Based Visibility',
            description:
              'Validate inputs in real time and restrict visibility by role. Enforce patterns for email, phone and IDs, and toggle mandatory status dynamically.',
            features: [
              'Regex & pattern rules',
              'Mandatory/optional toggles',
              'Role-based visibility',
              'Inline error messages',
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'dynamic-forms-content',
    name: 'Dynamic Forms Content',
    type: 'dynamic-forms-content',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Dynamic logic, multi-step, and events features',
    icon: '⚡',
    defaultData: {
      id: '',
      type: 'dynamic-forms-content',
      order: 0,
      data: {
        title: 'Dynamic Logic, Multi-Step, and Events',
        description:
          'Make forms adapt in real time: show only what matters, compute live totals, and trigger downstream actions. Break lengthy inputs into easy steps to boost completion.',
        features: [
          {
            title: 'Conditional Logic',
            description:
              'Show/hide fields, set required/optional, enable/disable based on inputs.',
          },
          {
            title: 'Wizard Steps',
            description:
              'Split into pages with progress indicators and validation at each step.',
          },
          {
            title: 'Events & Actions',
            description:
              'On submit/update: notify, create records, call APIs, or start workflows.',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-gradient-to-b from-purple-500/8 to-transparent',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-templates',
    name: 'Form Builder Templates',
    type: 'form-builder-templates',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Horizontal scrolling template carousel',
    icon: '📋',
    defaultData: {
      id: '',
      type: 'form-builder-templates',
      order: 0,
      data: {
        title: 'Start Faster with Templates',
        description:
          'Download pre-built forms for HR, Finance, Sales, Ops and IT—or use them as blueprints.',
        templates: [
          {
            title: 'Employee Onboarding',
            description: 'Checklists, docs, signatures, approvals.',
          },
          {
            title: 'Leave Requests',
            description: 'Policy-aware approvals and calendars.',
          },
          {
            title: 'Expense Claims',
            description: 'Receipts, limits, multi-level approvals.',
          },
          {
            title: 'IT Access',
            description: 'Provisioning, de-provisioning, audit.',
          },
          {
            title: 'Marketing Brief',
            description: 'Intake, assets, deadlines, approvals.',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-integrations',
    name: 'Form Builder Integrations',
    type: 'form-builder-integrations',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Integrations and automation with diagram',
    icon: '🔗',
    defaultData: {
      id: '',
      type: 'form-builder-integrations',
      order: 0,
      data: {
        title: 'Integrations & Automation',
        description:
          'Connect forms to everyday apps so data flows automatically.',
        integrations: [
          'CRM & email lists',
          'Accounting & invoices',
          'Project & tickets',
          'File storage & e-signature',
        ],
        diagramAlt: 'Integration diagram',
      },
      style: {
        backgroundColor: 'bg-gradient-to-b from-indigo-500/8 to-transparent',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-analytics',
    name: 'Form Builder Analytics',
    type: 'form-builder-analytics',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Reporting and analytics with masonry layout',
    icon: '📊',
    defaultData: {
      id: '',
      type: 'form-builder-analytics',
      order: 0,
      data: {
        title: 'Reporting, Analytics & Visualization',
        description: 'Explore responses in real time with views and filters.',
        features: [
          {
            title: 'Custom Views',
            description: 'Tables, galleries, spreadsheet-like editors.',
          },
          {
            title: 'Pivot & Charts',
            description: 'Slice metrics, visualize trends and KPIs.',
          },
          {
            title: 'Exports',
            description: 'Export XLS/CSV/PDF for sharing and audit.',
          },
          {
            title: 'Live Dashboards',
            description: 'Embed widgets and reports in portals.',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-mobile-voice',
    name: 'Form Builder Mobile & Voice',
    type: 'form-builder-mobile-voice',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Mobile and voice capabilities',
    icon: '📱',
    defaultData: {
      id: '',
      type: 'form-builder-mobile-voice',
      order: 0,
      data: {
        title: 'Mobile & Voice — Forms Anywhere',
        description:
          'Capture data on the go. Forms are responsive, can work offline.',
        features: [
          {
            title: 'Responsive by Default',
            description: 'Optimized for phones and tablets.',
          },
          {
            title: 'Offline Mode',
            description: 'Fill forms offline and sync later.',
          },
          {
            title: 'Voice Forms',
            description: 'Automated call campaigns & capture.',
          },
        ],
        illustrationAlt: 'Mobile and voice illustration',
      },
      style: {
        backgroundColor: 'bg-gradient-to-b from-cyan-500/8 to-transparent',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-governance',
    name: 'Form Builder Governance',
    type: 'form-builder-governance',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Security and compliance features',
    icon: '🛡️',
    defaultData: {
      id: '',
      type: 'form-builder-governance',
      order: 0,
      data: {
        title: 'Governance, Security & Compliance',
        description:
          'Protect sensitive data with role-based access and audit trails.',
        features: [
          {
            title: 'Role-Based Access',
            description: 'Control who can view, edit, or approve.',
          },
          {
            title: 'Audit Trails',
            description: 'Track every submission and change.',
          },
          {
            title: 'Encryption & SSO',
            description: 'SOC2/GDPR ready, SSL, and SSO support.',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-bpms',
    name: 'Form Builder BPMS',
    type: 'form-builder-bpms',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'BPMS integration with use case carousel',
    icon: '⚙️',
    defaultData: {
      id: '',
      type: 'form-builder-bpms',
      order: 0,
      data: {
        title: 'Integrated with Your BPMS',
        description: 'Use forms to kick off and participate in workflows.',
        useCases: [
          {
            title: 'Onboarding Flow',
            description: 'Multi-step forms + approvals.',
          },
          {
            title: 'Service Requests',
            description: 'SLAs, notifications, escalations.',
          },
          {
            title: 'Compliance Checks',
            description: 'Conditional steps + signatures.',
          },
          {
            title: 'Vendor Intake',
            description: 'Data validation + integrations.',
          },
          { title: 'Change Requests', description: 'Approvals + audit logs.' },
        ],
      },
      style: {
        backgroundColor: 'bg-gradient-to-b from-purple-500/8 to-transparent',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-faq',
    name: 'Form Builder FAQ',
    type: 'form-builder-faq',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'FAQ section with accordion',
    icon: '❓',
    defaultData: {
      id: '',
      type: 'form-builder-faq',
      order: 0,
      data: {
        title: 'FAQ',
        description:
          'Everything you need to know before building your first form.',
        categories: [
          {
            title: 'Getting Started',
            items: [
              {
                question: 'Do I need coding skills?',
                answer: 'No—build visually.',
              },
              {
                question: 'How do templates work?',
                answer: 'Pick a template, customize fields and rules.',
              },
            ],
          },
          {
            title: 'Security & Scaling',
            items: [
              {
                question: 'Is it enterprise-ready?',
                answer: 'Yes. Role-based access, SSO, audit logs.',
              },
              {
                question: 'Can it integrate with our stack?',
                answer: 'Use native connectors, REST APIs, and webhooks.',
              },
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },

  {
    id: 'form-builder-final-cta',
    name: 'Form Builder Final CTA',
    type: 'form-builder-final-cta',
    category: SECTION_CATEGORIES.ACTIONS,
    description: 'Final call-to-action section',
    icon: '🚀',
    defaultData: {
      id: '',
      type: 'form-builder-final-cta',
      order: 0,
      data: {
        title: 'Ready to modernize your forms?',
        description:
          'Book a tailored demo or start from a template to see results fast.',
        buttonText: 'Request a Demo',
        buttonHref: '#',
      },
      style: {
        backgroundColor: 'bg-slate-900',
        textColor: 'text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },
];
