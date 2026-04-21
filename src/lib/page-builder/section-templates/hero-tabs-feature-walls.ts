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

  {
    id: 'wall-of-fields',
    name: 'Wall of Fields',
    type: 'wall-of-fields',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Compact 30-field grid (6x5) - smaller version of wall-of-features',
    icon: '📦',
    defaultData: {
      id: '',
      type: 'wall-of-fields',
      order: 0,
      data: {
        title: 'Complete Feature Set',
        subtitle: 'Everything you need in one place',
        fields: [],
      },
      style: {
        backgroundColor: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
        alignment: 'center',
      },
    },
    configSchema: {},
  },

  {
    id: 'flow-builder',
    name: 'Flow Builder',
    type: 'flow-builder',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Dynamic tabbed process designer with auto-rotation, media support, and customizable animations',
    icon: '🔄',
    defaultData: {
      id: '',
      type: 'flow-builder',
      order: 0,
      data: {
        eyebrow: {
          icon: '●',
          text: 'Visual Process Designer',
        },
        title: 'Design workflows exactly',
        titleHighlight: 'as they execute.',
        description: 'Drag stages onto the canvas, connect them with transitions, define rules on each edge, and deploy from a web-based designer. The engine then executes the model deterministically — no glue code, no manual routing.',
        tabs: [
          {
            id: 'tab-1',
            number: '01',
            label: 'Stage Types',
            tag: 'Stage Library',
            title: 'Every process needs the right stage type',
            description: 'Initial stages capture requests. Standard stages route work through teams. Decision stages evaluate conditions. Parallel stages split execution. Final stages close and archive records.',
            exampleText: 'An HR onboarding flow uses 1 initial stage, 6 standard stages (approvals, IT provisioning, payroll, training), and 1 final stage that closes and archives the record.',
            contentType: 'steps',
            items: [
              { id: '1', number: '1', label: 'Initial stage — capture submission', badge: { text: 'Entry', color: '#2E7D32' } },
              { id: '2', number: '2', label: 'Standard stage — validate, assign, act', badge: { text: 'Process', color: '#1565C0' } },
              { id: '3', number: '3', label: 'Decision stage — evaluate conditions', badge: { text: 'Conditional', color: '#E65100' } },
              { id: '4', number: '4', label: 'Parallel stage — concurrent branches', badge: { text: 'Parallel', color: '#6A1B9A' } },
              { id: '5', number: '5', label: 'Final stage — close, notify, archive', badge: { text: 'Complete', color: '#1B5E20' } },
            ],
          },
          {
            id: 'tab-2',
            number: '02',
            label: 'Conditions',
            tag: 'Conditional Branching',
            title: 'Every transition can carry execution logic',
            description: 'Each connection between stages carries optional conditions. Use AND/OR groups to evaluate form fields, document state, ownership, time elapsed, org attributes, or external API results.',
            exampleText: 'After manager review — IF approved → finance stage. IF rejected → return with comments. IF no response in 48 hours → auto-escalate to department head.',
            contentType: 'features',
            items: [
              { id: '1', icon: '📝', label: 'Form field value — Equals, contains, greater than, less than, empty, regex' },
              { id: '2', icon: '📄', label: 'Document status — In stage, approved, rejected, overdue' },
              { id: '3', icon: '👤', label: 'Owner identity — Assigned role, user, department, previous executor' },
              { id: '4', icon: '⏱️', label: 'Time elapsed — Since start, since stage entry, exact date, working hours only' },
              { id: '5', icon: '🏢', label: 'Org structure — Requester department, manager, org level' },
              { id: '6', icon: '🔌', label: 'External data — API response value, webhook payload, lookup result' },
            ],
          },
        ],
        autoRotate: true,
        rotationInterval: 4000,
        pauseOnHover: true,
        showProgressBar: true,
        showDots: true,
        footerCTA: {
          text: 'View all process templates →',
        },
        animations: {
          enabled: true,
          tabTransition: 'fade',
          duration: 350,
          stagger: 0.05,
        },
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-24',
      },
    },
    configSchema: {},
  },

  {
    id: 'automation-events',
    name: 'Automation Events',
    type: 'automation-events',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Interactive event-driven automation showcase with left sidebar selector and dynamic content panels',
    icon: '⚡',
    defaultData: {
      id: '',
      type: 'automation-events',
      order: 0,
      data: {
        eyebrow: {
          text: 'Events, Actions & Automation',
        },
        title: 'Define what the process does',
        titleHighlight: 'automatically.',
        headerRight: {
          description: 'Every significant runtime event can trigger one or more actions — stage entry, exit, condition match, timeout, inbound communication, or escalation threshold. No custom code.',
          stats: [
            { value: '6+', label: 'action types' },
            { value: '0', label: 'lines of code' },
            { value: '∞', label: 'trigger depth' },
          ],
        },
        events: [
          {
            id: 'notifications',
            icon: '📣',
            name: 'Notifications',
            subtitle: 'Email · SMS · Fax · Internal',
            color: '#4F7FFF',
            tag: 'Notification Actions',
            title: 'Notify the right people at the right moment',
            description: 'Send email, SMS, fax, or internal notifications when a stage is entered, approved, rejected, completed, or overdue. Use template variables to personalize messages with live form data.',
            flowType: 'timeline',
            flowSteps: [
              { id: '1', label: 'Trigger', text: 'Stage is <strong>entered, approved, rejected,</strong> or <strong>overdue</strong>' },
              { id: '2', label: 'Channel', text: '<strong>Email</strong> · <strong>SMS</strong> · <strong>Fax</strong> · Internal notification' },
              { id: '3', label: 'Content', text: 'Template with live <strong>form field variables</strong> — name, amount, status, reason' },
              { id: '4', label: 'Recipients', text: 'Submitter · Assignee · Manager · Any role or specific user' },
            ],
            exampleLabel: 'eg.',
            exampleText: 'Leave request rejected → submitter receives <strong>SMS with rejection reason</strong> within 30 seconds. No manual follow-up. No forgotten notification.',
          },
          {
            id: 'process-chaining',
            icon: '🔗',
            name: 'Process Chaining',
            subtitle: 'Parent → child workflows',
            color: '#7B5CFF',
            tag: 'Process Chaining',
            title: 'One workflow completion can start another automatically',
            description: 'When a stage completes or a final outcome is reached, trigger a downstream process and pass form data between parent and child. Clean separation of business domains.',
            flowType: 'timeline',
            flowSteps: [
              { id: '1', label: 'Trigger point', text: 'Stage completion or <strong>final stage</strong> reached in parent process' },
              { id: '2', label: 'Data mapping', text: 'Form fields from parent <strong>mapped to child process input</strong> — no re-entry' },
              { id: '3', label: 'Child instance', text: 'Independent tracked instance created — <strong>linked to parent for audit</strong>' },
              { id: '4', label: 'Chain depth', text: 'Multi-level chains supported — <strong>A → B → C</strong> → unlimited depth' },
            ],
            exampleLabel: 'eg.',
            exampleText: 'Sales process closes → <strong>onboarding starts</strong> → on completion, <strong>billing setup starts.</strong> Three separate processes. Zero manual handoffs.',
          },
          {
            id: 'scheduled-tasks',
            icon: '⏱',
            name: 'Scheduled Tasks',
            subtitle: 'Daily · Weekly · Monthly',
            color: '#00D084',
            tag: 'Scheduled Automation',
            title: 'Processes that start themselves — on a schedule',
            description: 'Create recurring workflows for weekly reviews, monthly compliance checks, or routine reminders. Managed entirely inside the platform — no cron jobs, no external scripts, no developer.',
            flowType: 'timeline',
            flowSteps: [
              { id: '1', label: 'Frequency', text: '<strong>Daily · Weekly · Monthly</strong> · Custom interval · Calendar-aware' },
              { id: '2', label: 'Calendar logic', text: 'Skip <strong>weekends and public holidays</strong> — count only working days' },
              { id: '3', label: 'Auto-assignment', text: 'Tasks assigned to roles automatically <strong>at start time</strong>' },
              { id: '4', label: 'No dev required', text: 'Schedule configured visually inside the platform — <strong>no external scheduler</strong>' },
            ],
            exampleLabel: 'eg.',
            exampleText: 'Every <strong>Monday at 8am</strong>, a weekly team checklist starts. Tasks assigned to each lead. Uncompleted items <strong>escalate to manager by Wednesday noon.</strong>',
          },
          {
            id: 'api-webhooks',
            icon: '🔌',
            name: 'API & Webhooks',
            subtitle: 'Push · Pull · Bi-directional',
            color: '#FFB340',
            tag: 'External System Actions',
            title: 'Push and pull data across any connected system',
            description: 'Fire REST calls or webhooks on stage events, send filtered payloads, and write API responses back into workflow fields. True bi-directional orchestration — not one-way export.',
            flowType: 'timeline',
            flowSteps: [
              { id: '1', label: 'Method', text: '<strong>REST POST · GET · PUT · PATCH</strong> to any HTTPS endpoint' },
              { id: '2', label: 'Payload', text: 'Send <strong>filtered fields</strong> — not the full document — to external systems' },
              { id: '3', label: 'Response mapping', text: 'Write <strong>API response values back</strong> into workflow form fields' },
              { id: '4', label: 'Auth & retry', text: 'Bearer · API key · Basic auth — <strong>configurable retry policy</strong> on failure' },
            ],
            exampleLabel: 'eg.',
            exampleText: 'IT request approved → <strong>API provisions AD account</strong> → response confirms provisioning → form field "Account Status" <strong>auto-updates to Active.</strong>',
          },
          {
            id: 'sla-escalation',
            icon: '⚡',
            name: 'SLA & Escalation',
            subtitle: 'Multi-level · Auto-escalate',
            color: '#FF3B6B',
            tag: 'SLA & Escalation Engine',
            title: 'Missed deadlines escalate automatically',
            description: 'Define SLA timers on any stage and configure multi-level escalation chains. The engine reassigns, notifies managers, increases priority, or logs compliance events — without manual intervention.',
            flowType: 'timeline',
            flowSteps: [
              { id: '1', label: 'Level 0 — Reminder', text: 'Notify current assignee <strong>before deadline</strong> — configurable threshold' },
              { id: '2', label: 'Level 1 — Reassign', text: 'Move task to <strong>backup assignee</strong> or team lead automatically' },
              { id: '3', label: 'Level 2 — Escalate', text: 'Notify manager + <strong>change task priority</strong> to critical' },
              { id: '4', label: 'Level 3 — Compliance', text: 'Log <strong>SLA breach for audit</strong> + trigger corrective workflow automatically' },
            ],
            exampleLabel: 'eg.',
            exampleText: 'IT ticket: reminder at <strong>4h</strong> → escalate to lead at <strong>8h</strong> → reach manager at <strong>24h</strong> → SLA breach logged for compliance report.',
          },
        ],
        autoRotate: true,
        rotationInterval: 5000,
        pauseOnHover: true,
        showNavigation: true,
        footerCTA: {
          text: 'See automation in action →',
        },
      },
      style: {
        backgroundColor: 'bg-[#08090D]',
        textColor: 'text-white',
        padding: 'py-24',
      },
    },
    configSchema: {},
  },
];
