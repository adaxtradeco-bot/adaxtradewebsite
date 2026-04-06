/**
 * PLATFORM_SHOWCASE_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const PLATFORM_SHOWCASE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'partner-showcase-hero',
    name: 'Partner Showcase Hero',
    type: 'partner-showcase-hero',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Partner-focused hero with animated grid, gradient headline, CTA buttons, and trust-strip stats',
    icon: '🤝',
    defaultData: {
      id: '',
      type: 'partner-showcase-hero',
      order: 0,
      data: {
        label: 'For Technology Partners & Resellers',
        labelHighlight: 'White-label ready',
        title: 'A platform your clients',
        titleHighlight: 'forever',
        description:
          'IVAFLOW is a complete no-code Business Process Management Suite. Visual, modular, and built for any industry. Give your clients the power to automate their operations — and give your practice a product that closes deals.',
        buttons: [
          {
            text: 'See the platform in action →',
            href: '#',
            variant: 'primary',
          },
          { text: 'Become a partner', href: '#', variant: 'secondary' },
        ],
        trustItems: [
          { value: '5–8×', label: 'Faster delivery' },
          { value: '0', label: 'Lines of code needed' },
          { value: '6', label: 'Core modules' },
          { value: '∞', label: 'Industry fit' },
          { value: '100%', label: 'White-label ready' },
        ],
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
        accentColor3: '#00D4A8',
      },
      style: {
        backgroundColor: 'bg-[#07080A]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'platform-snapshot',
    name: 'Platform Snapshot',
    type: 'platform-snapshot',
    category: SECTION_CATEGORIES.CONTENT,
    description: '3-column snapshot cards — fast, modular, built to sell',
    icon: '🔍',
    defaultData: {
      id: '',
      type: 'platform-snapshot',
      order: 0,
      data: {
        eyebrow: 'The platform at a glance',
        title: 'One platform. Every process.',
        titleHighlight: 'Every client.',
        description:
          'IVAFLOW is a fully modular BPMS — built so your team can configure, launch, and hand over complete automation systems without writing a single line of code.',
        cards: [
          {
            iconColor: '#4F7FFF',
            iconBg: 'rgba(79,127,255,0.08)',
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#4F7FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
            title: 'Designed to move fast',
            description:
              "From first session to live system in days. Every module is built to configure quickly so your team focuses on the client's business, not the technology.",
          },
          {
            iconColor: '#7B5CFF',
            iconBg: 'rgba(123,92,255,0.08)',
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#7B5CFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
            title: 'Modular by nature',
            description:
              'Start with one process, scale to the entire organization. Every module works independently or together — add what your clients need, when they need it.',
          },
          {
            iconColor: '#00D4A8',
            iconBg: 'rgba(0,212,168,0.08)',
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#00D4A8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
            title: 'Built to sell',
            description:
              'White-label ready, multi-tenant capable, and flexible enough to fit any vertical. IVAFLOW is the product behind your automation practice — invisible to your clients.',
          },
        ],
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
      },
      style: {
        backgroundColor: 'bg-[#07080A]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'platform-modules-bento',
    name: 'Platform Modules Bento',
    type: 'platform-modules-bento',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Bento-grid of 6 platform modules — 2 large + 4 small cards',
    icon: '🧩',
    defaultData: {
      id: '',
      type: 'platform-modules-bento',
      order: 0,
      data: {
        eyebrow: 'Platform modules',
        title: 'Six powerful modules.',
        titleHighlight: 'Infinite',
        description:
          'Each module solves a real business problem on its own. Together, they give your clients a complete operational platform — and give you more to sell on every project.',
        modules: [
          {
            size: 'large',
            icon: '⚡',
            tag: 'Workflow Orchestrator',
            title: 'Automate any business process — visually',
            description:
              'Map workflows, assign roles, set conditions, and launch automated processes through a drag-and-drop designer. From simple approvals to complex multi-department flows — if your client can describe it, IVAFLOW can run it.',
            linkText: 'Explore Workflows',
            linkHref: '#',
          },
          {
            size: 'large',
            icon: '📝',
            tag: 'Form Builder',
            title: 'Every form your clients will ever need',
            description:
              'Design dynamic, multi-step forms with conditional logic, calculated fields, external data connections, and role-based visibility — all from a visual builder. No technical skills required, no limitations on what you can build.',
            linkText: 'Explore Form Builder',
            linkHref: '#',
          },
          {
            size: 'small',
            icon: '🎉',
            tag: 'App Builder',
            title: 'Custom workspaces for every audience',
            description:
              'Build dedicated environments for internal teams, external partners, or citizens — each with its own layout, forms, and workflows.',
            linkText: 'Explore',
            linkHref: '#',
          },
          {
            size: 'small',
            icon: '📊',
            tag: 'Reports & Analytics',
            title: 'Real-time visibility for every stakeholder',
            description:
              'Live dashboards, KPI tracking, SLA monitoring, and custom reports — built in minutes through a visual designer. No BI specialist needed.',
            linkText: 'Explore',
            linkHref: '#',
          },
          {
            size: 'small',
            icon: '🤖',
            tag: 'AI Agent',
            title: 'Intelligent automation, built in',
            description:
              'Connect workflows to AI models for auto-classification, smart responses, and decision support — configured visually, no setup complexity.',
            linkText: 'Explore',
            linkHref: '#',
          },
          {
            size: 'small',
            icon: '🌐',
            tag: 'External Portal',
            title: 'Give the outside world a front door',
            description:
              'Citizens, customers, and suppliers get their own branded portal to submit requests, track progress, and interact with your processes in real time.',
            linkText: 'Explore',
            linkHref: '#',
          },
        ],
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
      },
      style: {
        backgroundColor: 'bg-[#07080A]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'how-it-works-steps',
    name: 'How It Works Steps',
    type: 'how-it-works-steps',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Alternating left/right steps — text + visual placeholder with image upload support',
    icon: '🪜',
    defaultData: {
      id: '',
      type: 'how-it-works-steps',
      order: 0,
      data: {
        eyebrow: 'Platform in action',
        title:
          "From blank canvas to running system — here's what your team actually does",
        steps: [
          {
            stepNumber: 'Step 01 — Design',
            title: 'Design the process with your client — in the room',
            body: 'Open the visual workflow designer and map the process together. Define every stage, assign roles, and set the logic for every scenario. Clients see their operations taking shape in real time — which builds confidence and accelerates sign-off.',
            chips: [
              'Visual drag & drop',
              'Role assignment',
              'Conditional logic',
              'Parallel flows',
            ],
            visualBadge: 'Workflow designer',
            visualImage: '',
            visualImageAlt: '',
            visualLabel: 'Replace with workflow designer screenshot',
            flip: false,
          },
          {
            stepNumber: 'Step 02 — Build',
            title: 'Build the forms and connect the data',
            body: "Attach the right form to every stage of the process. Fields can pull data from external systems, calculate values automatically, and show or hide based on what the user entered. Everything your client needs — nothing they don't.",
            chips: [
              'Dynamic fields',
              'External data binding',
              'Multi-step forms',
              'File management',
            ],
            visualBadge: 'Form builder',
            visualImage: '',
            visualImageAlt: '',
            visualLabel: 'Replace with form builder screenshot',
            flip: true,
          },
          {
            stepNumber: 'Step 03 — Launch',
            title: 'Go live, monitor, and keep improving',
            body: 'Launch the system and watch live dashboards fill with real operational data. Track SLAs, spot bottlenecks, and make changes — all while the system keeps running. Every update takes effect immediately, with zero downtime.',
            chips: [
              'Live KPI dashboard',
              'SLA monitoring',
              'Bottleneck detection',
              'Instant updates',
            ],
            visualBadge: 'Live dashboard',
            visualImage: '',
            visualImageAlt: '',
            visualLabel: 'Replace with dashboard screenshot',
            flip: false,
          },
        ],
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
      },
      style: {
        backgroundColor: 'bg-[#07080A]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'automation-engine',
    name: 'Automation Engine',
    type: 'automation-engine',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Two-column — text + stats + trigger chips left, node-flow diagram right',
    icon: '⚙️',
    defaultData: {
      id: '',
      type: 'automation-engine',
      order: 0,
      data: {
        tag: 'Automation Engine',
        title: 'Complex logic.',
        titleHighlight: 'Zero complexity',
        body: "IVAFLOW's automation engine runs silently in the background — moving data between systems, sending alerts, enforcing deadlines, and triggering actions based on real events. Build flows through a visual node builder. No formulas. No scripts. No developers.",
        stats: [
          { value: '5–8×', label: 'Faster than traditional delivery' },
          { value: '0', label: 'Lines of code required' },
          { value: '∞', label: 'Automation flows, no limits' },
        ],
        triggers: [
          { text: 'Record created' },
          { text: 'Status changed' },
          { text: 'SLA breached' },
          { text: 'Form submitted' },
          { text: 'Scheduled' },
          { text: 'Webhook received' },
          { text: 'AI response' },
          { text: 'External API event' },
        ],
        flowNodes: [
          { label: 'Trigger: SLA breached', variant: 'accent', indent: 0 },
          { label: 'Notify: Line manager', variant: 'purple', indent: 1 },
          { label: 'Escalate: Senior team', variant: 'purple', indent: 1 },
          {
            label: 'Condition: Still unresolved?',
            variant: 'default',
            indent: 2,
          },
          { label: 'Activate: Backup workflow', variant: 'green', indent: 3 },
          { label: 'Log: Compliance record', variant: 'green', indent: 1 },
        ],
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
        accentColor3: '#00D4A8',
      },
      style: {
        backgroundColor: 'bg-[#0E1014]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'industries-grid',
    name: 'Industries Grid',
    type: 'industries-grid',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      '3-column industry cards with emoji, name, description, link + more footer',
    icon: '🏭',
    defaultData: {
      id: '',
      type: 'industries-grid',
      order: 0,
      data: {
        eyebrow: 'Industries',
        title: 'Walk into any sector and',
        titleHighlight: 'deliver',
        description:
          "IVAFLOW's modular architecture adapts to the way any industry operates. One platform covers them all — so your team doesn't need industry-specific software for every client.",
        industries: [
          {
            emoji: '⚡',
            name: 'Oil & Gas',
            description:
              'Production operations, maintenance workflows, HSE compliance, and permit-to-work automation for energy sector clients.',
            linkText: 'See solutions',
            linkHref: '#',
          },
          {
            emoji: '🔗',
            name: 'IoT Integration',
            description:
              'Connect physical devices and sensors directly to automated workflows. Turn real-world events into process triggers and dashboard data.',
            linkText: 'See solutions',
            linkHref: '#',
          },
          {
            emoji: '🏢',
            name: 'Real Estate',
            description:
              'Lease management, property inspection workflows, tenant communication portals, and document management — all in one platform.',
            linkText: 'See solutions',
            linkHref: '#',
          },
          {
            emoji: '🏗️',
            name: 'Construction',
            description:
              'Project management, field reporting, subcontractor coordination, and safety compliance workflows for construction operations.',
            linkText: 'See solutions',
            linkHref: '#',
          },
          {
            emoji: '🏥',
            name: 'Healthcare',
            description:
              'Patient intake, referral management, care coordination, and administrative workflow automation for healthcare providers.',
            linkText: 'See solutions',
            linkHref: '#',
          },
          {
            emoji: '🚛',
            name: 'Fleet Management',
            description:
              'Dispatch management, real-time vehicle tracking, maintenance scheduling, and route optimization for fleet-dependent businesses.',
            linkText: 'See solutions',
            linkHref: '#',
          },
        ],
        moreLabel: 'Also serving:',
        moreIndustries: [
          { name: 'Government', href: '#' },
          { name: 'Banking & Finance', href: '#' },
          { name: 'Telecom', href: '#' },
          { name: 'Education', href: '#' },
          { name: 'Manufacturing', href: '#' },
        ],
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
      },
      style: {
        backgroundColor: 'bg-[#07080A]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'sla-integration-split',
    name: 'SLA & Integration Split',
    type: 'sla-integration-split',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Two-column split — SLA Management card + Integration Hub card',
    icon: '🔀',
    defaultData: {
      id: '',
      type: 'sla-integration-split',
      order: 0,
      data: {
        leftCard: {
          tag: 'SLA Management',
          title: 'No task gets lost.\nNo deadline goes unnoticed.',
          body: 'IVAFLOW tracks every activity against its deadline and acts automatically when something falls behind — alerting the right people, routing to backup teams, and logging every event for compliance and review.',
          features: [
            'Per-task SLA definition with smart deadlines',
            'Multi-level escalation alerts (manager, team, director)',
            'Automatic corrective workflow activation',
            'SLA success rate & failure analytics',
            'Average handling time (AHT) tracking',
          ],
        },
        rightCard: {
          tag: 'Integration Hub',
          title: "Your clients' existing systems\ndon't have to change.",
          body: 'IVAFLOW connects to any external platform through a visual API integration layer. SSO, ERP, CRM, SMS, call centers, IoT sensors — configured without a developer, running without maintenance.',
          features: [
            'Visual API connector — zero code required',
            'SSO & organizational directory sync',
            'SMS, email & fax built into every workflow',
            'Webhook & REST API consumption',
            'AI engine & IoT sensor connectivity',
            'GIS & location data integration',
          ],
        },
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
      },
      style: {
        backgroundColor: 'bg-[#07080A]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'partner-cta-strip',
    name: 'Partner CTA Strip',
    type: 'partner-cta-strip',
    category: SECTION_CATEGORIES.ACTIONS,
    description:
      'Full-width CTA strip — title + subtitle left, two buttons right',
    icon: '📣',
    defaultData: {
      id: '',
      type: 'partner-cta-strip',
      order: 0,
      data: {
        title: 'Ready to see what IVAFLOW\ncan do for your clients?',
        subtitle:
          "Book a platform walkthrough. We'll walk through a real use case in your target industry — no commitment needed.",
        buttons: [
          { text: 'Book a platform demo →', href: '#', variant: 'primary' },
          { text: 'Explore partner programs', href: '#', variant: 'secondary' },
        ],
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
      },
      style: {
        backgroundColor: 'bg-[#07080A]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },
];
