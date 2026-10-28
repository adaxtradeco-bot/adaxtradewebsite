/**
 * Hand-curated spec of every infographic type the InfographicRenderer can draw.
 * Source of truth for the fields: src/components/infographic-types/*.tsx (the
 * components receive `data: any`, so the shapes cannot be derived from types).
 *
 * The generator cross-checks this file against the renderer's `switch` and
 * INFOGRAPHIC_DEFAULT_DATA and fails on drift, so a newly added infographic
 * type cannot be silently missing from the reference.
 */
import { Node, arr, en, ignored, num, obj, str, strictEn, union } from './model';

export interface InfographicSpec {
  group: string;
  component: string;
  description: string;
  data: Node;
  notes?: string[];
}

const textOrObj = (o: Node) => arr(union(str, o));

export const INFOGRAPHIC_SPEC: Record<string, InfographicSpec> = {
  // ---------------- Governance ----------------
  audit: {
    group: 'Governance',
    component: 'AuditType (GovernanceTypes.tsx)',
    description: 'Vertical audit trail: coloured dot + action text + right-aligned time.',
    data: obj(
      {
        trail: arr(
          obj({ action: str, time: str, type: en('success', 'ai', 'warning', 'error') }, ['action'])
        ),
      },
      ['trail']
    ),
    notes: ['`type` only sets the dot colour; any other value uses the primary colour.'],
  },
  roles: {
    group: 'Governance',
    component: 'RolesType (GovernanceTypes.tsx)',
    description: 'Stacked pills: bold role name followed by its access text.',
    data: obj(
      {
        roles: arr(obj({ name: str, access: str, level: ignored(str, 'kept in default data but never rendered') }, ['name'])),
      },
      ['roles']
    ),
  },
  exception: {
    group: 'Governance',
    component: 'ExceptionType (GovernanceTypes.tsx)',
    description: 'Red alert strip: ⚠ icon, title, description and a badge pill on the right.',
    data: obj({ title: str, description: str, badge: str }, ['title']),
  },
  'exception-alert': {
    group: 'Governance',
    component: 'ExceptionAlertType (GovernanceTypes.tsx)',
    description: 'Same alert strip with colour switches (inline-styled).',
    data: obj(
      {
        status: str,
        detail: str,
        statusColor: en('red', 'amber'),
        badge: str,
        badgeColor: en('amber', 'green'),
      },
      ['status']
    ),
    notes: [
      '`statusColor: "red"` = danger colour, anything else = warning colour.',
      '`badgeColor: "amber"` = warning, `"green"` = success, anything else = accent.',
    ],
  },
  'role-levels': {
    group: 'Governance',
    component: 'RoleLevelsType (GovernanceTypes.tsx)',
    description: 'List of role name + description; each row coloured from the theme palette by position.',
    data: obj(
      {
        roles: arr(obj({ role: str, description: str, color: ignored(str, 'colour comes from the theme palette by index') }, ['role'])),
      },
      ['roles']
    ),
  },

  // ---------------- Analytics ----------------
  stats: {
    group: 'Analytics',
    component: 'StatsType (AnalyticsTypes.tsx)',
    description: 'Grid of metric tiles: label, big value, trend arrow (↑ ↓ →) and change text.',
    data: obj(
      {
        metrics: arr(obj({ label: str, value: str, trend: en('up', 'down', 'neutral'), change: str }, ['label', 'value'])),
      },
      ['metrics']
    ),
    notes: ['`value` and `change` are strings ("1,240", "+12%").'],
  },
  kpi: {
    group: 'Analytics',
    component: 'KpiType (AnalyticsTypes.tsx)',
    description: 'Row of large coloured numbers with a small label underneath.',
    data: obj(
      { kpis: arr(obj({ value: str, label: str, color: en('indigo', 'green', 'amber', 'cyan') }, ['value', 'label'])) },
      ['kpis']
    ),
    notes: ['`color` mapping: indigo→primary, green→success, amber→warning, anything else→accent.'],
  },
  performance: {
    group: 'Analytics',
    component: 'PerformanceType (AnalyticsTypes.tsx)',
    description: 'Horizontal progress bars by name with the numeric score; bar colour depends on the score (≥90 / ≥70 / below).',
    data: obj({ performers: arr(obj({ name: str, score: num }, ['name', 'score'])) }, ['performers']),
    notes: ['`score` is a NUMBER 0–100.'],
  },
  'performance-bars': {
    group: 'Analytics',
    component: 'PerformanceBarsType (AnalyticsTypes.tsx)',
    description: 'Bar variant of `performance` with its own bar styling.',
    data: obj(
      { performers: arr(obj({ name: str, score: num, color: ignored(str, 'not read; colour comes from the theme') }, ['name', 'score'])) },
      ['performers']
    ),
    notes: ['`score` is a NUMBER 0–100.'],
  },
  prediction: {
    group: 'Analytics',
    component: 'PredictionType (AnalyticsTypes.tsx)',
    description: 'Rows with a label and a status badge; row tint follows `status`.',
    data: obj(
      { predictions: arr(obj({ label: str, badge: str, status: en('ok', 'warn') }, ['label'])) },
      ['predictions']
    ),
    notes: ['`status: "ok"` = green, `"warn"` = amber, anything else = red.'],
  },
  timeline: {
    group: 'Analytics',
    component: 'TimelineType (AnalyticsTypes.tsx)',
    description: 'Vertical step timeline with a status dot (active steps pulse), title, optional description and time.',
    data: obj(
      { steps: arr(obj({ title: str, description: str, time: str, status: en('completed', 'active', 'pending') }, ['title'])) },
      ['steps']
    ),
  },

  // ---------------- Flow ----------------
  flow: {
    group: 'Flow',
    component: 'FlowType (FlowTypes.tsx)',
    description: 'Sequence of label chips joined by arrows; colours cycle from the theme.',
    data: obj({ nodes: arr(obj({ label: str, type: ignored(str, 'not read by `flow` (used by `flowchart`)') }, ['label'])) }, ['nodes']),
  },
  flowchart: {
    group: 'Flow',
    component: 'FlowchartType (FlowTypes.tsx)',
    description: 'Flowchart nodes with shape by `type`: start/end pills, process boxes, decision diamonds.',
    data: obj(
      { nodes: arr(obj({ label: str, type: en('start', 'process', 'decision', 'end') }, ['label'])) },
      ['nodes']
    ),
  },
  'event-flow': {
    group: 'Flow',
    component: 'EventFlowType (FlowTypes.tsx)',
    description: 'Connected stage cards: small uppercase label + rich text body. Used for trigger → action → content style stories.',
    data: obj(
      { color: str, steps: arr(obj({ id: str, label: str, text: str }, ['label', 'text'])) },
      ['steps']
    ),
    notes: [
      '`text` is rendered as HTML (dangerouslySetInnerHTML) — `<strong>…</strong>` works.',
      '`color` is a hex accent for the labels (default: theme primary).',
    ],
  },

  // ---------------- Workflow ----------------
  workflow: {
    group: 'Workflow',
    component: 'WorkflowType (WorkflowTypes.tsx)',
    description: 'Titled list of numbered steps; each step has a label and a type badge.',
    data: obj(
      {
        title: str,
        steps: arr(obj({ num: str, label: str, badge: str, type: en('auto', 'ai', 'conditional', 'manual', 'decision', 'complete') }, ['label'])),
      },
      ['steps']
    ),
    notes: ['`type` colours the badge: auto→success, ai→primary, conditional→warning, anything else→accent. `num` is a string.'],
  },
  sla: {
    group: 'Workflow',
    component: 'SlaType (WorkflowTypes.tsx)',
    description: 'Titled percentage bars; bar colour depends on value (≥90 / ≥70 / below).',
    data: obj({ title: str, bars: arr(obj({ label: str, value: num }, ['label', 'value'])) }, ['bars']),
    notes: ['`value` is a NUMBER 0–100 (rendered as `${value}%`).'],
  },
  'sla-bars': {
    group: 'Workflow',
    component: 'SlaBarsType (WorkflowTypes.tsx)',
    description: 'Titled percentage bars coloured by an explicit `status`.',
    data: obj(
      { title: str, bars: arr(obj({ label: str, value: num, status: en('green', 'amber', 'red') }, ['label', 'value'])) },
      ['bars']
    ),
    notes: ['`status: "green"` = success, `"amber"` = warning, anything else = danger. `value` is a NUMBER 0–100.'],
  },
  'status-list': {
    group: 'Workflow',
    component: 'StatusListType (WorkflowTypes.tsx)',
    description: 'Rows with a label and a coloured status pill (service-status style).',
    data: obj(
      { items: arr(obj({ label: str, status: str, color: en('green', 'amber', 'red') }, ['label'])) },
      ['items']
    ),
    notes: ['`color: "red"` = danger, `"amber"` = warning, anything else = success.'],
  },

  // ---------------- Metro grid ----------------
  form: {
    group: 'Metro grid',
    component: 'FormType (MetroGridTypes.tsx)',
    description: 'Optional title + chips for form fields; a field may be a plain string or {label, type}.',
    data: obj({ title: str, fields: textOrObj(obj({ label: str, type: str }, ['label'])) }, ['fields']),
    notes: ['`type` is shown as a small tag (e.g. basic / selection / media / advanced).'],
  },
  ai: {
    group: 'Metro grid',
    component: 'AiType (MetroGridTypes.tsx)',
    description: 'Optional title + chips for AI actions; an action may be a plain string or {action, status}.',
    data: obj({ title: str, actions: textOrObj(obj({ action: str, status: str, type: str }, ['action'])) }, ['actions']),
    notes: ['`status` is shown as a small tag; `type` is not rendered.'],
  },
  analytics: {
    group: 'Metro grid',
    component: 'AnalyticsType (MetroGridTypes.tsx)',
    description: 'Optional title + widget tiles; a widget may be a plain string or {name, status}.',
    data: obj({ title: str, widgets: textOrObj(obj({ name: str, status: str, type: str }, ['name'])) }, ['widgets']),
    notes: ['`status` is shown under the name; `type` is not rendered.'],
  },
  portal: {
    group: 'Metro grid',
    component: 'PortalType (MetroGridTypes.tsx)',
    description: 'Optional title + feature rows; a feature may be a plain string or {feature, level, status}.',
    data: obj({ title: str, features: textOrObj(obj({ feature: str, level: str, status: str }, ['feature'])) }, ['features']),
    notes: ['`level` is shown as a tag.'],
  },
  org: {
    group: 'Metro grid',
    component: 'OrgType (MetroGridTypes.tsx)',
    description: 'Mini org chart: one root box and a row of child boxes (plain strings).',
    data: obj({ root: str, children: arr(str) }, ['root', 'children']),
  },

  // ---------------- Media ----------------
  media: {
    group: 'Media',
    component: 'MediaType (MediaType.tsx)',
    description: 'Shows an image or video instead of a drawn infographic. Renders a placeholder when `src` is empty.',
    data: obj(
      {
        src: str,
        type: strictEn('image', 'video'),
        alt: str,
        maxWidth: num,
        maxHeight: num,
        objectFit: en('cover', 'contain', 'fill', 'none', 'scale-down'),
      },
      ['src']
    ),
    notes: [
      'Video is detected when `type` is "video" OR `src` ends in .mp4/.webm/.mov.',
      '`maxWidth` / `maxHeight` are pixel numbers (or null).',
    ],
  },
};
