const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFormBuilderPage() {
  try {
    // Delete existing form builder page
    await prisma.page.deleteMany({
      where: {
        slug: {
          in: ['/en/form-builder', '/ar/form-builder']
        }
      }
    });

    // Create the form builder page with all sections
    const formBuilderSections = [
      {
        id: 'hero-1',
        type: 'form-builder-hero',
        order: 1,
        data: {
          badge: 'Collect form data seamlessly. Gain real-time visibility.',
          title: 'Design Forms that',
          titleHighlight: 'Run Your Processes',
          description: 'Build multi-step, responsive forms with AI assistance, dynamic logic, and deep integrations. Validate at the source, automate downstream, and keep a complete audit trail.',
          primaryButton: {
            text: 'Open the Designer',
            href: '#designer'
          },
          secondaryButton: {
            text: 'Browse Templates',
            href: '#templates'
          },
          badges: ['No-Code', 'AI-Assisted', 'Enterprise'],
          mediaType: 'placeholder',
          canvasIcon: 'fas fa-palette',
          canvasLabel: 'Form Canvas | Fields | Rules | Preview',
          features: [
            { icon: 'fas fa-puzzle-piece', label: 'Drag & Drop' },
            { icon: 'fas fa-check-circle', label: 'Validations' },
            { icon: 'fas fa-link', label: 'Integrations' }
          ]
        },
        style: {
          backgroundColor: 'bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900',
          textColor: 'text-white',
          padding: 'py-20 lg:py-32'
        }
      },
      {
        id: 'why-2',
        type: 'form-builder-why',
        order: 2,
        data: {
          title: 'Why Choose an Enterprise Form Builder?',
          description: 'Replace fragile spreadsheets and rigid off-the-shelf forms with tailored, governed data collection that plugs into your systems. Ship faster, standardize quality, and keep security tight.',
          benefits: [
            'Build in days, not months',
            'Multi-step, responsive layouts',
            'Conditional logic & validations',
            'CRM/ERP/API integrations',
            'Audit trails & role-based access',
            'AI assistance for speed'
          ]
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'designer-3',
        type: 'two-column-media',
        order: 3,
        data: {
          title: 'Visual Designer & Real-Time Preview',
          description: 'Assemble forms by dragging fields onto the canvas. Switch between desktop, tablet and mobile views, and see every change instantly. Start from templates or build from scratch.',
          features: [
            { text: 'Drag-and-drop canvas' },
            { text: 'Responsive previews' },
            { text: 'Multi-column layouts' },
            { text: 'Starter templates' }
          ],
          mediaIcon: 'fas fa-drafting-compass',
          mediaText: 'Designer Drag & Drop',
          mediaPosition: 'left',
          badge: 'Visual Designer'
        },
        style: {
          backgroundColor: 'bg-gradient-to-b from-cyan-500/8 to-transparent',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'fields-4',
        type: 'field-types',
        order: 4,
        data: {
          tabs: [
            {
              id: 'basics',
              label: 'Basics',
              title: 'Rich Field Library & Customization',
              description: 'Choose from 30+ field types—text, numbers, dates, files, signatures, maps and more. Add defaults, help text and options, then fine-tune visibility and roles.',
              features: [
                'Text, number, choice',
                'File & image upload',
                'Date & time, signatures',
                'Maps & location'
              ]
            },
            {
              id: 'advanced',
              label: 'Advanced',
              title: 'Advanced & Relational Fields',
              description: 'Capture complex data with computational fields, master-detail (child tables), API-connected lookups and nested forms. Import rows in bulk via CSV.',
              features: [
                'Computational fields',
                'Master-detail tables',
                'API lookups',
                'Nested forms'
              ]
            },
            {
              id: 'appearance',
              label: 'Appearance',
              title: 'Branding & Appearance',
              description: 'Apply your brand with themes and custom CSS. Group fields into sections, add icons or placeholders, and keep layouts clean and consistent.',
              features: [
                'Themes & CSS classes',
                'Field grouping',
                'Help text & hints',
                'Icons & placeholders'
              ]
            },
            {
              id: 'validation',
              label: 'Validation',
              title: 'Validation & Role-Based Visibility',
              description: 'Validate inputs in real time and restrict visibility by role. Enforce patterns for email, phone and IDs, and toggle mandatory status dynamically.',
              features: [
                'Regex & pattern rules',
                'Mandatory/optional toggles',
                'Role-based visibility',
                'Inline error messages'
              ]
            }
          ]
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'smart-5',
        type: 'dynamic-forms-content',
        order: 5,
        data: {
          title: 'Dynamic Logic, Multi-Step, and Events',
          description: 'Make forms adapt in real time: show only what matters, compute live totals, and trigger downstream actions. Break lengthy inputs into easy steps to boost completion.',
          features: [
            {
              title: 'Conditional Logic',
              description: 'Show/hide fields, set required/optional, enable/disable based on inputs.'
            },
            {
              title: 'Wizard Steps',
              description: 'Split into pages with progress indicators and validation at each step.'
            },
            {
              title: 'Events & Actions',
              description: 'On submit/update: notify, create records, call APIs, or start workflows.'
            }
          ]
        },
        style: {
          backgroundColor: 'bg-gradient-to-b from-purple-500/8 to-transparent',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'templates-6',
        type: 'form-builder-templates',
        order: 6,
        data: {
          title: 'Start Faster with Templates',
          description: 'Download pre-built forms for HR, Finance, Sales, Ops and IT—or use them as blueprints. Customize fields, steps and validations to match policy.',
          templates: [
            { title: 'Employee Onboarding', description: 'Checklists, docs, signatures, approvals.' },
            { title: 'Leave Requests', description: 'Policy-aware approvals and calendars.' },
            { title: 'Expense Claims', description: 'Receipts, limits, multi-level approvals.' },
            { title: 'IT Access', description: 'Provisioning, de-provisioning, audit.' },
            { title: 'Marketing Brief', description: 'Intake, assets, deadlines, approvals.' }
          ]
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'integrations-7',
        type: 'form-builder-integrations',
        order: 7,
        data: {
          title: 'Integrations & Automation',
          description: 'Connect forms to everyday apps so data flows automatically. Pre-populate fields, validate against master data, and push submissions to CRM, ERP and project tools.',
          integrations: [
            'CRM & email lists',
            'Accounting & invoices',
            'Project & tickets',
            'File storage & e-signature'
          ],
          diagramAlt: 'Integration diagram showing form connections'
        },
        style: {
          backgroundColor: 'bg-gradient-to-b from-indigo-500/8 to-transparent',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'analytics-8',
        type: 'form-builder-analytics',
        order: 8,
        data: {
          title: 'Reporting, Analytics & Visualization',
          description: 'Explore responses in real time with views and filters. Build tabular reports, pivots and charts—then export to XLS/CSV/PDF or feed dashboards.',
          features: [
            { title: 'Custom Views', description: 'Tables, galleries, spreadsheet-like editors.' },
            { title: 'Pivot & Charts', description: 'Slice metrics, visualize trends and KPIs.' },
            { title: 'Exports', description: 'Export XLS/CSV/PDF for sharing and audit.' },
            { title: 'Live Dashboards', description: 'Embed widgets and reports in portals.' }
          ]
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'mobile-9',
        type: 'form-builder-mobile-voice',
        order: 9,
        data: {
          title: 'Mobile & Voice — Forms Anywhere',
          description: 'Capture data on the go. Forms are responsive, can work offline, and even collect answers via phone with voice or keypad—ideal for outreach at scale.',
          features: [
            { title: 'Responsive by Default', description: 'Optimized for phones and tablets.' },
            { title: 'Offline Mode', description: 'Fill forms offline and sync later.' },
            { title: 'Voice Forms', description: 'Automated call campaigns & capture.' }
          ],
          illustrationAlt: 'Mobile and voice illustration'
        },
        style: {
          backgroundColor: 'bg-gradient-to-b from-cyan-500/8 to-transparent',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'governance-10',
        type: 'form-builder-governance',
        order: 10,
        data: {
          title: 'Governance, Security & Compliance',
          description: 'Protect sensitive data with role-based access, field-level permissions and full audit trails. Meet policy and regulatory requirements with confidence.',
          features: [
            { title: 'Role-Based Access', description: 'Control who can view, edit, or approve.' },
            { title: 'Audit Trails', description: 'Track every submission and change.' },
            { title: 'Encryption & SSO', description: 'SOC2/GDPR ready, SSL, and SSO support.' }
          ]
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'bpms-11',
        type: 'form-builder-bpms',
        order: 11,
        data: {
          title: 'Integrated with Your BPMS',
          description: 'Use forms to kick off and participate in workflows. Route approvals, update records, and sync dashboards—end-to-end.',
          useCases: [
            { title: 'Onboarding Flow', description: 'Multi-step forms + approvals.' },
            { title: 'Service Requests', description: 'SLAs, notifications, escalations.' },
            { title: 'Compliance Checks', description: 'Conditional steps + signatures.' },
            { title: 'Vendor Intake', description: 'Data validation + integrations.' },
            { title: 'Change Requests', description: 'Approvals + audit logs.' }
          ]
        },
        style: {
          backgroundColor: 'bg-gradient-to-b from-purple-500/8 to-transparent',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'faq-12',
        type: 'form-builder-faq',
        order: 12,
        data: {
          title: 'FAQ',
          description: 'Everything you need to know before building your first form.',
          categories: [
            {
              title: 'Getting Started',
              items: [
                { question: 'Do I need coding skills?', answer: 'No—build visually. Add custom code only if you want extra control.' },
                { question: 'How do templates work?', answer: 'Pick a template, customize steps, fields and rules, connect systems.' }
              ]
            },
            {
              title: 'Security & Scaling',
              items: [
                { question: 'Is it enterprise-ready?', answer: 'Yes. Role-based access, SSO, audit logs, encryption, and compliance.' },
                { question: 'Can it integrate with our stack?', answer: 'Use native connectors, REST APIs, and webhooks to sync data.' }
              ]
            }
          ]
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16'
        }
      },
      {
        id: 'cta-13',
        type: 'form-builder-final-cta',
        order: 13,
        data: {
          title: 'Ready to modernize your forms?',
          description: 'Book a tailored demo or start from a template to see results fast.',
          buttonText: 'Request a Demo',
          buttonHref: '#'
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16'
        }
      }
    ];

    // Create the page
    const page = await prisma.page.create({
      data: {
        title: 'Form Builder - Enterprise No-Code Forms',
        slug: '/en/form-builder',
        metaTitle: 'Form Builder - Enterprise No-Code Forms | Setiran',
        metaDescription: 'Build multi-step, responsive forms with AI assistance, dynamic logic, and deep integrations. No-code form builder for enterprises.',
        status: 'published',
        language: 'en',
        isBuilderPage: true,
        builderData: JSON.stringify({
          sections: formBuilderSections
        })
      }
    });

    console.log('✅ Form Builder page created successfully!');
    console.log(`Page ID: ${page.id}`);
    console.log(`Sections: ${formBuilderSections.length}`);
    
  } catch (error) {
    console.error('❌ Error creating form builder page:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFormBuilderPage();