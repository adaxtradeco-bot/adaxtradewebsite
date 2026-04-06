/**
 * AI_AGENT_PAGE_EXTENDED_TEMPLATES
 * AI Agent page templates for analytics, governance, learning, and scale.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const AI_AGENT_PAGE_EXTENDED_TEMPLATES: SectionTemplate[] = [
  {
    id: 'analytics-bento-grid',
    name: 'Analytics Bento Grid',
    type: 'analytics-bento-grid',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Bento-style grid for analytics features',
    icon: '📊',
    defaultData: {
      id: '',
      type: 'analytics-bento-grid',
      order: 0,
      data: {
        eyebrow: 'Phase 5 of 6',
        title: 'Analyze, Optimize',
        highlightedTitle: '& Evolve',
        lead: 'AI constantly monitors performance, detects friction, and refines your processes.',
        cards: [
          {
            icon: '📈',
            tag: 'Deep Intelligence',
            title: 'Advanced Analytics & Insights',
            description:
              'AI surfaces deep, actionable insights into your operations.',
            example:
              'Example: Underperforming teams are identified, along with the specific steps causing delays.',
            span: 'wide',
            color: 'indigo',
            infographic: {
              type: 'kpi',
              data: {
                kpis: [
                  { value: '94%', label: 'SLA Compliance', color: 'indigo' },
                  { value: '↑ 18%', label: 'Throughput', color: 'green' },
                  { value: '-32%', label: 'Avg Handle Time', color: 'amber' },
                ],
              },
            },
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
    id: 'governance-grid',
    name: 'Governance Grid',
    type: 'governance-grid',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Governance and compliance cards',
    icon: '🛡️',
    defaultData: {
      id: '',
      type: 'governance-grid',
      order: 0,
      data: {
        eyebrow: 'Governance & Security',
        title: 'Govern, Secure',
        highlightedTitle: '& Stay Compliant',
        lead: "AI governance isn't an afterthought - it's built into the architecture.",
        cards: [
          {
            tag: 'Compliance-Ready',
            title: 'Full Audit Trail & Activity Logging',
            description:
              'Every action taken by AI or users inside the system is logged with full context.',
            example:
              'Example: During a compliance audit, every step of a contract approval is available in a detailed log.',
            color: 'green',
            infographic: {
              type: 'audit',
              data: {
                trail: [
                  {
                    action: 'Request submitted by Sara M.',
                    time: '09:14',
                    type: 'success',
                  },
                  {
                    action: 'AI routed to Finance team',
                    time: '09:14',
                    type: 'ai',
                  },
                  {
                    action: 'Manager approved (Ali K.)',
                    time: '11:02',
                    type: 'warning',
                  },
                  {
                    action: 'AI executed auto-notification',
                    time: '11:02',
                    type: 'info',
                  },
                ],
              },
            },
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
    id: 'learning-grid',
    name: 'Learning Grid',
    type: 'learning-grid',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Self-improving AI learning cards',
    icon: '🧠',
    defaultData: {
      id: '',
      type: 'learning-grid',
      order: 0,
      data: {
        eyebrow: 'Self-Improving AI',
        title: 'Deploy, Scale',
        highlightedTitle: '& Continuously Learn',
        lead: "Ivaflow's AI Agent isn't a one-time setup. It learns from every execution.",
        cards: [
          {
            number: '01',
            tag: 'Self-Improving AI',
            title: 'Continuous Learning from Execution',
            description:
              'The more your team works inside Ivaflow, the better the AI becomes.',
            example:
              'Example: After three months, routing accuracy improves as AI learns which agents handle which request types most effectively.',
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
    id: 'industry-badges',
    name: 'Industry Badges',
    type: 'industry-badges',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Industry use case badges',
    icon: '🏭',
    defaultData: {
      id: '',
      type: 'industry-badges',
      order: 0,
      data: {
        eyebrow: 'Use Cases',
        title: 'Built for Real Operations.',
        highlightedTitle: 'Designed for Every Team.',
        subtitle:
          "Whether you're running IT service management, HR operations, finance approvals, or customer support - Ivaflow's AI Agent adapts to your domain.",
        badges: [
          { icon: '💼', label: 'IT & Service Desk', color: '#6366f1' },
          { icon: '👥', label: 'Human Resources', color: '#06b6d4' },
          { icon: '💰', label: 'Finance & Procurement', color: '#10b981' },
          { icon: '📞', label: 'Customer Operations', color: '#f59e0b' },
          { icon: '⚖️', label: 'Compliance & Legal', color: '#8b5cf6' },
          { icon: '🚗', label: 'Field Operations', color: '#ec4899' },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-16',
      },
    },
    configSchema: {},
  },
  {
    id: 'scale-cards',
    name: 'Scale Cards',
    type: 'scale-cards',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Scale metrics with counter animation',
    icon: '📈',
    defaultData: {
      id: '',
      type: 'scale-cards',
      order: 0,
      data: {
        eyebrow: 'AI at Scale',
        title: 'Intelligence that',
        highlightedTitle: 'grows with you',
        cards: [
          {
            icon: '🧠',
            number: 8,
            label: 'AI Capability Pillars',
            description:
              'From discovery to governance - AI covers every phase of your operational lifecycle.',
            color: 'indigo',
            isCounter: true,
            counterTarget: 8,
          },
          {
            icon: '⚡',
            number: 'Real-time',
            label: 'AI Execution Speed',
            description:
              'Every routing decision, escalation, and automated action happens in milliseconds.',
            color: 'cyan',
          },
          {
            icon: '✓',
            number: 0,
            label: 'Lines of Code Required',
            description:
              'Every workflow, rule, dashboard, and integration is built entirely through a visual AI-powered interface.',
            color: 'violet',
            isCounter: true,
            counterTarget: 0,
          },
          {
            icon: '∞',
            number: '∞',
            label: 'Process Complexity Handled',
            description:
              'Simple ticket routing or complex multi-department workflows - Ivaflow AI handles it all.',
            color: 'green',
          },
          {
            icon: '🔗',
            number: '',
            label: 'One AI. Your entire organization.',
            description:
              'Ivaflow AI Agent connects every module, every team, and every process.',
            color: 'indigo',
            span: 'wide',
            badges: [
              'Process Discovery',
              'Auto-Build',
              'Smart Routing',
              'AI Execution',
              'Integrations',
              'Analytics',
              'Governance',
              'Self-Learning',
            ],
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-950',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-24',
      },
    },
    configSchema: {},
  },
];
