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
    placeholder: 'Upload your media here',
  },
  workflow: {
    title: 'Automated Workflow',
    steps: [
      { num: '1', label: 'Trigger Event', badge: 'Auto', type: 'auto' },
      { num: '2', label: 'AI Classification', badge: 'AI', type: 'ai' },
      { num: '3', label: 'Route Decision', badge: 'Conditional', type: 'conditional' },
      { num: '4', label: 'Notify Team', badge: 'Action', type: 'action' },
    ],
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
};

export const INFOGRAPHIC_TYPE_OPTIONS = [
  { value: '', label: 'None' },
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
  { value: 'media', label: 'Media Placeholder' },
];
