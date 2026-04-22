/**
 * Infographic Default Data
 * Author: Amazon Q
 * Created: 2024-01-20
 * Purpose: Default data for each infographic type used in PropertyPanels
 */

export const INFOGRAPHIC_DEFAULT_DATA: Record<string, any> = {
  audit: {
    trail: [
      { action: 'Document submitted', time: '09:00', type: 'success' },
      { action: 'AI validation passed', time: '09:01', type: 'ai' },
      { action: 'Manager review pending', time: '09:05', type: 'warning' },
      { action: 'Approved & archived', time: '09:30', type: 'success' },
    ],
  },
  roles: {
    roles: [
      { name: 'Admin', access: 'Full access', level: 'admin' },
      { name: 'Manager', access: 'Edit & approve', level: 'manager' },
      { name: 'Viewer', access: 'Read only', level: 'viewer' },
    ],
  },
  exception: {
    title: 'SLA Breach Detected',
    description: 'Response time exceeded 4h threshold',
    badge: 'Auto-escalated',
  },
  'exception-alert': {
    status: 'SLA Breach Detected',
    detail: 'Response time exceeded threshold',
    statusColor: 'red',
    badge: 'Auto-escalated',
    badgeColor: 'amber',
  },
  'role-levels': {
    roles: [
      { role: 'Admin', description: 'Full system access', color: 'indigo' },
      { role: 'Manager', description: 'Approve & configure', color: 'cyan' },
      { role: 'Operator', description: 'Execute tasks', color: 'green' },
      { role: 'Viewer', description: 'Read-only access', color: 'amber' },
    ],
  },
  stats: {
    metrics: [
      { label: 'Processed', value: '1,240', trend: 'up', change: '+12%' },
      { label: 'Pending', value: '38', trend: 'down', change: '-5%' },
      { label: 'Avg Time', value: '2.4h', trend: 'neutral', change: '0%' },
      { label: 'SLA Met', value: '97%', trend: 'up', change: '+2%' },
    ],
  },
  flow: {
    nodes: [
      { label: 'Request Submitted', type: 'start' },
      { label: 'Auto Validation', type: 'process' },
      { label: 'Manager Approval', type: 'decision' },
      { label: 'Completed', type: 'end' },
    ],
  },
  timeline: {
    steps: [
      { title: 'Initiated', description: 'Request created', time: '09:00', status: 'completed' },
      { title: 'Processing', description: 'Under review', time: '09:15', status: 'active' },
      { title: 'Approval', description: 'Awaiting sign-off', time: '10:00', status: 'pending' },
    ],
  },
  kpi: {
    kpis: [
      { value: '98%', label: 'Uptime', color: 'green' },
      { value: '1.2s', label: 'Avg Response', color: 'cyan' },
      { value: '4.8★', label: 'Satisfaction', color: 'amber' },
      { value: '340', label: 'Daily Tasks', color: 'indigo' },
    ],
  },
  performance: {
    performers: [
      { name: 'Team A', score: 94 },
      { name: 'Team B', score: 78 },
      { name: 'Team C', score: 85 },
    ],
  },
  'performance-bars': {
    performers: [
      { name: 'Team A', score: 94, color: 'green' },
      { name: 'Team B', score: 78, color: 'cyan' },
      { name: 'Team C', score: 85, color: 'indigo' },
    ],
  },
  prediction: {
    predictions: [
      { label: 'On-time delivery', badge: '96% likely', status: 'ok' },
      { label: 'Budget overrun', badge: 'Low risk', status: 'ok' },
      { label: 'Resource shortage', badge: 'Monitor', status: 'warn' },
    ],
  },
  'status-list': {
    items: [
      { label: 'API Gateway', status: 'Operational', color: 'green' },
      { label: 'Database', status: 'Operational', color: 'green' },
      { label: 'Queue Service', status: 'Degraded', color: 'amber' },
      { label: 'Auth Service', status: 'Outage', color: 'red' },
    ],
  },
  media: {
    type: 'image',
    src: '',
    alt: '',
    maxWidth: null,
    maxHeight: null,
    objectFit: 'cover'
  },

  sla: {
    title: 'SLA Compliance',
    bars: [
      { label: 'Response', value: 98 },
      { label: 'Resolution', value: 87 },
      { label: 'Escalation', value: 72 },
    ],
  },
  'sla-bars': {
    title: 'SLA Compliance',
    bars: [
      { label: 'Response', value: 98, status: 'green' },
      { label: 'Resolution', value: 87, status: 'green' },
      { label: 'Escalation', value: 72, status: 'amber' },
    ],
  },
  org: {
    root: 'CEO',
    children: ['Operations', 'Finance', 'Engineering', 'Sales'],
  },
  form: {
    title: 'Form Components',
    fields: [
      { label: 'Text Input', type: 'basic' },
      { label: 'Dropdown', type: 'selection' },
      { label: 'File Upload', type: 'media' },
      { label: 'Conditional Logic ✓', type: 'advanced' }
    ],
  },
  ai: {
    title: 'AI Processing',
    actions: [
      { action: 'Review Form', status: 'auto', type: 'validation' },
      { action: 'Flag Issues', status: 'alert', type: 'detection' },
      { action: 'Auto-populate', status: 'processing', type: 'automation' },
      { action: 'Process ✓', status: 'complete', type: 'finalization' }
    ],
  },
  analytics: {
    title: 'Dashboard Widgets',
    widgets: [
      { name: 'Charts', type: 'visualization', status: 'active' },
      { name: 'KPIs', type: 'metrics', status: 'live' },
      { name: 'Tables', type: 'data', status: 'filtered' },
      { name: 'Export', type: 'output', status: 'ready' }
    ],
  },
  portal: {
    title: 'Access Control',
    features: [
      { feature: 'Scoped Access', level: 'security', status: 'enabled' },
      { feature: 'White-label', level: 'branding', status: 'customizable' },
      { feature: 'Data Isolation', level: 'privacy', status: 'enforced' }
    ],
  },
  workflow: {
    title: 'Automated Workflow',
    steps: [
      { num: '1', label: 'Submit', badge: 'Auto', type: 'auto' },
      { num: '2', label: 'Review', badge: 'Manual', type: 'manual' },
      { num: '3', label: 'Approve', badge: 'Decision', type: 'decision' },
      { num: '4', label: 'Complete ✓', badge: 'Done', type: 'complete' },
    ],
  },
  'event-flow': {
    color: '#4F7FFF',
    steps: [
      { id: '1', label: 'TRIGGER', text: 'Stage is <strong>entered, approved, rejected,</strong> or <strong>overdue</strong>' },
      { id: '2', label: 'ACTION', text: '<strong>Email</strong> · <strong>SMS</strong> · <strong>Fax</strong> · Internal notification' },
      { id: '3', label: 'CONTENT', text: 'Template with live <strong>form field variables</strong> — name, amount, status' },
      { id: '4', label: 'RECIPIENTS', text: 'Submitter · Assignee · Manager · Any role or specific user' },
    ],
  },
};

/**
 * Returns a compact JSON structure preview for a given infographic type.
 * Used in PropertyPanels to guide content editors.
 */
export function getInfographicStructurePreview(type: string): string {
  const d = INFOGRAPHIC_DEFAULT_DATA[type];
  if (!d) return '';
  return JSON.stringify(d, null, 2);
}

export const INFOGRAPHIC_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'media', label: '🎬 Media (Image/Video)' },
  { value: 'audit', label: 'Audit Trail' },
  { value: 'stats', label: 'Stats Grid' },
  { value: 'flow', label: 'Flow Chart' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'roles', label: 'Roles' },
  { value: 'exception', label: 'Exception Alert' },
  { value: 'exception-alert', label: 'Exception Alert (detailed)' },
  { value: 'role-levels', label: 'Role Levels' },
  { value: 'kpi', label: 'KPI Grid' },
  { value: 'performance', label: 'Performance Bars' },
  { value: 'performance-bars', label: 'Performance Bars (custom color)' },
  { value: 'prediction', label: 'Prediction List' },
  { value: 'status-list', label: 'Status List' },
  { value: 'workflow', label: 'Workflow Steps' },
  { value: 'sla', label: 'SLA Bars' },
  { value: 'sla-bars', label: 'SLA Bars (custom color)' },
  { value: 'org', label: 'Org Chart' },
  { value: 'form', label: '📝 Form Fields' },
  { value: 'ai', label: '🤖 AI Actions' },
  { value: 'analytics', label: '📊 Analytics Widgets' },
  { value: 'portal', label: '🔒 Portal Features' },
  { value: 'event-flow', label: 'Event Flow (Timeline with dots)' },
];
