/**
 * AI_AGENT_PAGE_CORE_TEMPLATES
 * AI Agent page templates grouped for the core hero-to-integration flow.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const AI_AGENT_PAGE_CORE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'ai-agent-hero',
    name: 'AI Agent Hero',
    type: 'ai-agent-hero',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'AI Agent hero with particles, orbs, grid background, and stats',
    icon: '🤖',
    defaultData: {
      id: '',
      type: 'ai-agent-hero',
      order: 0,
      data: {
        eyebrow: 'Ivaflow AI Agent - Now Live',
        title: 'Empower Your Workflows',
        highlightedText: 'with Intelligent Automation',
        subtitle:
          "Your organization doesn't need more tools - it needs intelligence built into every step. Ivaflow's AI Agent understands your business, builds your systems, runs your operations, and continuously improves everything - so your team can focus on what truly matters.",
        primaryButtonText: 'Get Started Free',
        primaryButtonIcon:
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>',
        secondaryButtonText: 'Watch a Demo',
        secondaryButtonIcon:
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>',
        stats: [
          { value: '8', label: 'AI Capability Pillars' },
          { value: '0', label: 'Lines of Code Needed' },
          { value: 'Infinity', label: 'Process Complexity' },
          { value: 'Real-time', label: 'AI Execution' },
        ],
        enableParticles: true,
        enableOrbs: true,
        enableGridBackground: true,
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-950',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },
  {
    id: 'trust-badges',
    name: 'Trust Badges',
    type: 'trust-badges',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Trust badges strip with colored badges',
    icon: '✓',
    defaultData: {
      id: '',
      type: 'trust-badges',
      order: 0,
      data: {
        badges: [
          { icon: '✦', text: 'Zero-code setup', color: 'indigo' },
          { icon: '⚡', text: 'Real-time AI execution', color: 'cyan' },
          { icon: '✓', text: 'BPMS-native AI', color: 'green' },
          { icon: '⬡', text: 'Enterprise-grade', color: 'amber' },
          { icon: '⊞', text: 'Fully integrated', color: 'violet' },
          { icon: '↑', text: 'Self-improving', color: 'indigo' },
          { icon: '🔒', text: 'Compliance-ready', color: 'green' },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-8',
      },
    },
    configSchema: {},
  },
  {
    id: 'metro-grid',
    name: 'Metro Grid',
    type: 'metro-grid',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Metro-style grid cards with infographics',
    icon: '⊞',
    defaultData: {
      id: '',
      type: 'metro-grid',
      order: 0,
      data: {
        eyebrow: 'Phase 1 of 6',
        title: 'Discover & Understand',
        highlightedTitle: 'Your Business',
        lead: 'AI starts by deeply analyzing your organization - its workflows, systems, stakeholders, and hidden patterns.',
        cards: [
          {
            number: '01',
            icon: '🔍',
            tag: 'Foundation - Auto-Discovery',
            title: 'Process Discovery & Extraction',
            description:
              'AI analyzes your current tools, systems, and daily operations to uncover how work actually moves across your organization.',
            example:
              'Example: Requests coming through emails, phone calls, or spreadsheets are automatically mapped into a unified, structured workflow.',
            span: 'wide',
            color: 'indigo',
            infographic: {
              type: 'flow',
              data: {
                steps: [
                  'Email',
                  'Spreadsheet',
                  'Phone call',
                  'Unified Workflow ✓',
                ],
              },
            },
          },
          {
            number: '02',
            icon: '🏛',
            tag: 'Org Intelligence',
            title: 'Organizational Structure Mapping',
            description:
              'AI identifies roles, teams, hierarchies, and responsibilities - then aligns every workflow to your real org chart.',
            example:
              'Example: Tasks are automatically assigned based on department, role, or authority level.',
            span: 'normal',
            color: 'cyan',
            infographic: {
              type: 'org',
              data: {
                root: 'CEO',
                children: ['Operations', 'Finance', 'IT'],
              },
            },
          },
          {
            number: '03',
            icon: '⚠',
            tag: 'Pre-Automation Audit',
            title: 'Bottleneck Identification',
            description:
              'AI detects delays, redundancies, and weak points in your current processes before automation even begins.',
            example:
              'Example: It identifies approval steps that consistently slow down operations.',
            span: 'normal',
            color: 'amber',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-950',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'rotating-tabs',
    name: 'Rotating Tabs',
    type: 'rotating-tabs',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Rotating tabs section with auto-rotation',
    icon: '🔄',
    defaultData: {
      id: '',
      type: 'rotating-tabs',
      order: 0,
      data: {
        eyebrow: 'Phase 2 of 6',
        title: 'Design & Build',
        highlightedTitle: 'Everything Automatically',
        lead: 'Once AI understands your business, it automatically designs and builds your entire operational environment.',
        autoRotate: true,
        rotateInterval: 4000,
        tabs: [
          {
            tag: 'Auto-Build - No Code',
            title: 'Autonomous Process Generation',
            description:
              'Complete workflows from your business logic - instantly.',
            content: {
              tag: 'Autonomous Process Generation',
              title: 'Turn insights into working workflows',
              lead: 'AI creates complete workflows including steps, transitions, conditions, and responsibilities based on your business logic.',
              example:
                'Example: A full complaint-handling process is generated from submission to resolution.',
              infographic: {
                type: 'workflow',
                data: {
                  title: 'Generated workflow steps',
                  steps: [
                    {
                      num: '1',
                      label: 'Request submitted via portal',
                      badge: 'Auto',
                      type: 'auto',
                    },
                    {
                      num: '2',
                      label: 'AI triage & priority assignment',
                      badge: 'AI',
                      type: 'ai',
                    },
                    {
                      num: '3',
                      label: 'Route to responsible team',
                      badge: 'AI',
                      type: 'ai',
                    },
                    {
                      num: '4',
                      label: 'Manager approval (if needed)',
                      badge: 'Conditional',
                      type: 'conditional',
                    },
                    {
                      num: '5',
                      label: 'Resolution & auto-notification',
                      badge: 'Auto',
                      type: 'auto',
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      style: {
        backgroundColor:
          'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'ai-copilot-grid',
    name: 'AI Copilot Grid',
    type: 'ai-copilot-grid',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'AI Copilot cards with chat mock interface',
    icon: '🤖',
    defaultData: {
      id: '',
      type: 'ai-copilot-grid',
      order: 0,
      data: {
        eyebrow: 'Phase 3 of 6',
        title: 'Automate, Execute',
        highlightedTitle: '& Collaborate',
        lead: "AI doesn't just design systems - it actively runs them.",
        cards: [
          {
            icon: '🎯',
            tag: 'Smart Assignment',
            title: 'Intelligent Routing & Work Distribution',
            description:
              'AI dynamically assigns and routes work based on workload, role, availability, and priority.',
            example:
              'Example: Incoming tickets are automatically routed to the most available and qualified agent.',
            color: 'indigo',
          },
        ],
        chatMock: {
          title: 'AI Co-pilot in action',
          messages: [
            {
              type: 'ai',
              avatar: 'AI',
              message:
                'I have analyzed this request. It matches the "Critical IT Failure" template. Suggested action: escalate to L2 Support immediately.',
            },
            {
              type: 'user',
              avatar: 'SN',
              message: 'Yes, escalate and notify the manager.',
            },
            {
              type: 'ai',
              avatar: 'AI',
              message:
                'Done. Task escalated to L2 Support. Manager (Ali K.) has been notified via email and SMS.',
            },
          ],
        },
        mediaPlaceholder:
          'Screenshot: AI assistant panel during task execution',
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-950',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'integration-constellation',
    name: 'Integration Constellation',
    type: 'integration-constellation',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'SVG orbit diagram with integration cards',
    icon: '🔗',
    defaultData: {
      id: '',
      type: 'integration-constellation',
      order: 0,
      data: {
        eyebrow: 'Phase 4 of 6',
        title: 'Integrate & Orchestrate',
        highlightedTitle: 'Everything',
        lead: 'AI bridges your internal systems, external tools, and communication channels.',
        centerLabel: 'IVAFLOW',
        innerNodes: [
          { label: 'CRM', angle: 0 },
          { label: 'ERP', angle: 90 },
          { label: 'Email', angle: 180 },
          { label: 'Portal', angle: 270 },
        ],
        outerNodes: [
          { label: 'Chat', angle: 0 },
          { label: 'API', angle: 51 },
          { label: 'DB', angle: 103 },
          { label: 'SMS', angle: 154 },
          { label: 'LDAP', angle: 206 },
          { label: 'BI', angle: 257 },
          { label: 'Files', angle: 308 },
        ],
        cards: [
          {
            icon: '🔗',
            title: 'Seamless System Integrations',
            tag: 'API-Ready - No-Code Connector',
            description:
              'AI integrates with external systems via a visual connector interface.',
            example:
              'Example: Customer data is automatically synced between your CRM and internal systems.',
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
];
