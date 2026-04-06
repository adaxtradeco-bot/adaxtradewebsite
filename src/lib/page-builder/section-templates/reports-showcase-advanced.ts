/**
 * REPORTS_SHOWCASE_ADVANCED_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const REPORTS_SHOWCASE_ADVANCED_TEMPLATES: SectionTemplate[] = [
  {
    id: 'reports-kanban',
    name: 'Reports — Kanban Board',
    type: 'reports-kanban',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Text + kanban board mock (replaceable with real screenshot)',
    icon: '▦',
    defaultData: {
      id: '',
      type: 'reports-kanban',
      order: 0,
      data: {
        eyebrow: 'Kanban boards',
        title: 'Workflow visibility —',
        titleGradient: 'at a glance',
        description:
          'Drag and drop work items between stages. Track SLAs and priorities visually, without opening every record.',
        columns: [
          {
            title: 'To Do',
            count: 3,
            cards: [
              {
                title: 'Set up data pipeline',
                assignee: 'Ali K.',
                due: 'Due Thu',
                dotColor: '#6366f1',
              },
              {
                title: 'Design report template',
                assignee: 'Sara M.',
                due: 'Due Fri',
                dotColor: '#06b6d4',
              },
              {
                title: 'Review SLA thresholds',
                assignee: 'Nour R.',
                due: 'Due Mon',
                dotColor: '#8b5cf6',
              },
            ],
          },
          {
            title: 'In Progress',
            count: 2,
            cards: [
              {
                title: 'Connect SQL datasource',
                assignee: 'Omar S.',
                due: 'Due Today',
                dotColor: '#f59e0b',
              },
              {
                title: 'Build executive KPI dash',
                assignee: 'Dina H.',
                due: 'Due Fri',
                dotColor: '#10b981',
              },
            ],
          },
          {
            title: 'Done',
            count: 4,
            cards: [
              {
                title: 'User access setup',
                assignee: 'Completed',
                due: '',
                dotColor: '#10b981',
                faded: true,
              },
              {
                title: 'Import historical data',
                assignee: 'Completed',
                due: '',
                dotColor: '#10b981',
                faded: true,
              },
            ],
          },
        ],
        mediaUrl: '',
        mediaObjectFit: 'contain',
        accentColor: '#6366f1',
        accentColor2: '#818cf8',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-[#080810]',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'reports-ai-insights',
    name: 'Reports — AI Insights',
    type: 'reports-ai-insights',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Dark gradient section with 4 numbered AI capability cards',
    icon: '✦',
    defaultData: {
      id: '',
      type: 'reports-ai-insights',
      order: 0,
      data: {
        eyebrow: 'AI-powered insights',
        title: "Your dashboards don't just show data.",
        titleGradient: 'They act on it.',
        subtitle:
          "Connect to Ivaflow's AI engine and turn passive reports into proactive systems.",
        cards: [
          {
            num: '01',
            title: 'Detect bottlenecks',
            description:
              'Automatically identify delays and anomalies in your workflows before they escalate.',
          },
          {
            num: '02',
            title: 'Alert on thresholds',
            description:
              'Set KPI limits. Get notified the moment something crosses a critical boundary.',
          },
          {
            num: '03',
            title: 'Predict trends',
            description:
              'Surface patterns before they become problems with AI-driven forecasting.',
          },
          {
            num: '04',
            title: 'Trigger actions',
            description:
              'Escalate tasks, run scripts, and send alerts — all from inside the dashboard.',
          },
        ],
        accentColor: '#6366f1',
        accentColor2: '#818cf8',
      },
      style: {
        backgroundColor: 'bg-[#1e1b4b]',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'reports-data-sources',
    name: 'Reports — Data Sources',
    type: 'reports-data-sources',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Grid of data connector cards — internal, databases, APIs, files',
    icon: '🔌',
    defaultData: {
      id: '',
      type: 'reports-data-sources',
      order: 0,
      data: {
        eyebrow: 'Data connectivity',
        title: 'Connect',
        titleGradient: 'everything',
        description:
          'No SQL, no API keys in your dashboards. Every connection built through an intuitive visual interface.',
        sources: [
          { icon: '⚙', name: 'Ivaflow Forms', type: 'Internal' },
          { icon: '⚙', name: 'Workflows & SLA', type: 'Internal' },
          { icon: '🗄', name: 'SQL Server', type: 'Database' },
          { icon: '🗄', name: 'PostgreSQL', type: 'Database' },
          { icon: '🗄', name: 'MySQL', type: 'Database' },
          { icon: '🔌', name: 'REST APIs', type: 'Web service' },
          { icon: '📂', name: 'Excel / CSV', type: 'File' },
          { icon: '📋', name: 'Stored Procs', type: 'Custom model' },
        ],
        accentColor: '#6366f1',
        accentColor2: '#818cf8',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-[#080810]',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'reports-scale',
    name: 'Reports — Scale / By the Numbers',
    type: 'reports-scale',
    category: SECTION_CATEGORIES.SOCIAL,
    description: 'Animated counter stats grid with wide integration card',
    icon: '🔢',
    defaultData: {
      id: '',
      type: 'reports-scale',
      order: 0,
      data: {
        eyebrow: 'By the numbers',
        title: 'Built for',
        titleGradient: 'scale',
        stats: [
          {
            icon: '📊',
            value: '10+',
            numericTarget: 10,
            suffix: '+',
            label: 'Chart types',
            description:
              'Bar, line, area, pie, scatter, heatmap, combo, gauge, funnel, and KPI cards.',
            color: '#818cf8',
            iconBg: 'rgba(99,102,241,0.12)',
            iconBorder: 'rgba(99,102,241,0.2)',
            glowColor: 'rgba(99,102,241,0.25)',
          },
          {
            icon: '🔌',
            value: '8+',
            numericTarget: 8,
            suffix: '+',
            label: 'Data connectors',
            description:
              'Connect to internal Ivaflow data, SQL databases, REST APIs, Excel, and more.',
            color: '#06b6d4',
            iconBg: 'rgba(6,182,212,0.12)',
            iconBorder: 'rgba(6,182,212,0.2)',
            glowColor: 'rgba(6,182,212,0.2)',
          },
          {
            icon: '⚡',
            value: 'Real-time',
            label: 'Live data refresh',
            description:
              'Dashboards update instantly when forms are submitted or workflows progress.',
            color: '#a78bfa',
            iconBg: 'rgba(139,92,246,0.12)',
            iconBorder: 'rgba(139,92,246,0.2)',
            glowColor: 'rgba(139,92,246,0.2)',
          },
          {
            icon: '✓',
            value: '0',
            numericTarget: 0,
            suffix: '',
            label: 'Lines of code required',
            description:
              'Every dashboard, chart, and automation built entirely through a visual interface.',
            color: '#10b981',
            iconBg: 'rgba(16,185,129,0.12)',
            iconBorder: 'rgba(16,185,129,0.2)',
            glowColor: 'rgba(16,185,129,0.18)',
          },
        ],
        wideTitle: 'Connects to your entire stack',
        wideDescription:
          'Every module in Ivaflow feeds your dashboards automatically — no manual syncing, no data silos.',
        wideBadges: [
          { text: 'Forms & Apps', colorClass: 'indigo' },
          { text: 'Workflow engine', colorClass: 'cyan' },
          { text: 'SLA tracking', colorClass: 'violet' },
          { text: 'Script Manager', colorClass: 'green' },
          { text: 'AI insights', colorClass: 'indigo' },
          { text: 'Communication records', colorClass: 'cyan' },
          { text: 'Customer portals', colorClass: 'violet' },
          { text: 'Embedded views', colorClass: 'green' },
        ],
        accentColor: '#6366f1',
        accentColor2: '#818cf8',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-[#080810]',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'reports-integration',
    name: 'Reports — Integration Chips',
    type: 'reports-integration',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Centered section with integration chip row',
    icon: '🔗',
    defaultData: {
      id: '',
      type: 'reports-integration',
      order: 0,
      data: {
        eyebrow: 'Seamless integration',
        title: 'Works with',
        titleGradient: 'everything in Ivaflow',
        description:
          'Dashboards refresh instantly across every module — no manual syncing, no data silos.',
        chips: [
          { icon: '⚡', text: 'Forms & Apps' },
          { icon: '⚙', text: 'Workflow engine' },
          { icon: '📋', text: 'SLA tracking' },
          { icon: '🤖', text: 'Script Manager' },
          { icon: '💬', text: 'Communication records' },
          { icon: '✦', text: 'AI insights' },
          { icon: '👥', text: 'Customer portals' },
          { icon: '🔗', text: 'Embedded views' },
        ],
        accentColor: '#6366f1',
        accentColor2: '#818cf8',
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-[#0e0e1a]',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },

  {
    id: 'reports-roles',
    name: 'Reports — Who Uses This',
    type: 'reports-roles',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Role cards with colored top border — 5 user personas',
    icon: '👥',
    defaultData: {
      id: '',
      type: 'reports-roles',
      order: 0,
      data: {
        eyebrow: 'Who uses this',
        title: 'Built for',
        titleGradient: 'the entire organization',
        description:
          'One platform — every team, every role, every level of the business.',
        roles: [
          {
            title: 'Operations managers',
            description:
              'Track processes, identify delays, and optimize workflows in real-time.',
            accentColor: '#6366f1',
          },
          {
            title: 'Team leads',
            description:
              'Monitor workload, performance, and SLA compliance at a glance.',
            accentColor: '#06b6d4',
          },
          {
            title: 'Executives',
            description:
              'High-level KPIs and business metrics for fast, informed decisions.',
            accentColor: '#8b5cf6',
          },
          {
            title: 'IT & automation teams',
            description:
              'Debug workflows, track scripts, and monitor system health.',
            accentColor: '#10b981',
          },
          {
            title: 'External partners',
            description:
              'Share read-only dashboards without exposing sensitive data.',
            accentColor: '#f59e0b',
          },
        ],
        accentColor: '#6366f1',
        accentColor2: '#818cf8',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-[#080810]',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
];
