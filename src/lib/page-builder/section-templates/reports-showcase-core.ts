/**
 * REPORTS_SHOWCASE_CORE_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const REPORTS_SHOWCASE_CORE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'reports-hero',
    name: 'Reports Hero',
    type: 'reports-hero',
    category: SECTION_CATEGORIES.HEADERS,
    description:
      'Full-screen hero for Reports & Analytics page with animated orbs, media frame, and dashboard preview',
    icon: '📊',
    defaultData: {
      id: '',
      type: 'reports-hero',
      order: 0,
      data: {
        badge: 'Reports & Analytics — Ivaflow',
        title: 'Your data tells a story.',
        titleGradient: 'Start reading it.',
        subtitle:
          'Real-time dashboards, automated reports, and AI-powered insights — built visually, with zero code.',
        primaryButtonText: 'Explore demo',
        primaryButtonHref: '#',
        secondaryButtonText: 'Request a demo',
        secondaryButtonHref: '#',
        mediaUrl: '',
        mediaType: 'default',
        mediaObjectFit: 'contain',
        kpis: [
          { value: '94%', label: 'SLA rate', color: '#818cf8' },
          { value: '1.2k', label: 'Tasks done', color: '#06b6d4' },
          { value: '↑18%', label: 'Growth', color: '#10b981' },
          { value: '42', label: 'Alerts', color: '#f59e0b' },
        ],
        accentColor: '#6366f1',
        accentColor2: '#818cf8',
        cyanColor: '#06b6d4',
      },
      style: {
        backgroundColor: 'bg-[#080810]',
        textColor: 'text-white',
        padding: 'py-0',
      },
    },
    configSchema: {},
  },

  {
    id: 'reports-what-you-can-build',
    name: 'Reports — What You Can Build',
    type: 'reports-what-you-can-build',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Feature grid showing 6 report/dashboard capabilities',
    icon: '⚡',
    defaultData: {
      id: '',
      type: 'reports-what-you-can-build',
      order: 0,
      data: {
        eyebrow: 'What you can build',
        title: 'Everything you need to',
        titleGradient: 'visualize your business',
        description:
          'From executive dashboards to operational reports — build any view your team needs in minutes.',
        features: [
          {
            icon: '⚡',
            title: 'Real-time dashboards',
            description:
              'Monitor your entire operation with live data that updates the moment something changes.',
          },
          {
            icon: '📊',
            title: 'Interactive charts',
            description:
              'Bar, line, area, pie, scatter, heatmap and more. Zoom, filter, and explore with a few clicks.',
          },
          {
            icon: '⊞',
            title: 'Custom data tables',
            description:
              'Sortable, filterable tables with inline editing, grouping, and conditional formatting.',
          },
          {
            icon: '▦',
            title: 'Kanban boards',
            description:
              'Visualize tasks as interactive cards. Drag between stages and track progress at a glance.',
          },
          {
            icon: '📄',
            title: 'Automated reports',
            description:
              'Schedule PDF or Excel reports and email them automatically to stakeholders.',
          },
          {
            icon: '✦',
            title: 'Smart filters & AI insights',
            description:
              'Let AI detect patterns, anomalies, and bottlenecks automatically across all your data.',
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

  {
    id: 'reports-chart-builder',
    name: 'Reports — Chart Builder',
    type: 'reports-chart-builder',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Two-column: text + interactive chart mock (replaceable with real screenshot)',
    icon: '📈',
    defaultData: {
      id: '',
      type: 'reports-chart-builder',
      order: 0,
      data: {
        eyebrow: 'Visual chart designer',
        title: 'No coding.',
        titleGradient: 'No limits.',
        description:
          'Drag, drop, configure. Pick your data source, choose your chart type, and go live in minutes.',
        chartTypes: [
          'Bar',
          'Line',
          'Area',
          'Pie',
          'Scatter',
          'Heatmap',
          'Combo',
          'KPI Card',
          'Gauge',
          'Funnel',
        ],
        chartTitle: 'SLA Performance — Q2 2025',
        chartStats: [
          { value: '94.2%', label: 'Avg compliance', color: '#10b981' },
          { value: '1,284', label: 'Total tasks', color: '#818cf8' },
          { value: '42', label: 'Overdue', color: '#f59e0b' },
        ],
        mediaUrl: '',
        mediaObjectFit: 'contain',
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
    id: 'reports-table',
    name: 'Reports — Interactive Table',
    type: 'reports-table',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Text + interactive data table mock (replaceable with real screenshot)',
    icon: '⊞',
    defaultData: {
      id: '',
      type: 'reports-table',
      order: 0,
      data: {
        eyebrow: 'Interactive tables',
        title: 'Rich data —',
        titleGradient: 'instantly actionable',
        description:
          'Sort, filter, group, and edit records inline. Conditional formatting highlights what needs attention.',
        tableTitle: 'Active Workflows',
        rows: [
          {
            process: 'Invoice approval',
            assignee: 'Sara M.',
            dueDate: 'Today',
            sla: '4h left',
            status: 'In progress',
            statusType: 'amber',
          },
          {
            process: 'Customer onboarding',
            assignee: 'Ali K.',
            dueDate: 'Tomorrow',
            sla: 'On track',
            status: 'On track',
            statusType: 'green',
          },
          {
            process: 'Compliance review',
            assignee: 'Nour R.',
            dueDate: 'Yesterday',
            sla: 'Overdue',
            status: 'Overdue',
            statusType: 'red',
          },
          {
            process: 'IT access request',
            assignee: 'Dina H.',
            dueDate: 'In 3 days',
            sla: 'On track',
            status: 'Pending',
            statusType: 'blue',
          },
          {
            process: 'Contract renewal',
            assignee: 'Omar S.',
            dueDate: 'Today',
            sla: '2h left',
            status: 'In progress',
            statusType: 'amber',
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
];
