const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateWorkflowPage() {
  try {
    const builderData = {
      sections: [
        {
          id: 'hero-1',
          type: 'workflow-hero',
          order: 0,
          data: {
            badge: 'Live orchestration for modern teams',
            title: 'Orchestrate Processes. Reduce Errors.',
            titleHighlight: 'Move Faster.',
            description: 'Model, automate, and optimize end-to-end workflows without code. Align teams, systems, and data to deliver compliant, consistent, and scalable outcomes.',
            primaryButton: { text: 'Explore Features', href: '#features' },
            secondaryButton: { text: 'See Business Impact', href: '#impact' },
            footerText: 'Secure • Extensible • Real-time visibility',
            cards: [
              { icon: '⚙️', title: 'Visual Builder', description: 'Drag & drop stages, forms, and rules.' },
              { icon: '🔗', title: 'Integrations', description: 'Connect CRM, ERP, data, and email.' },
              { icon: '✅', title: 'Approvals', description: 'Parallel & sequential with audit trails.' },
              { icon: '📊', title: 'Reporting', description: 'Real-time visibility and KPIs.' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950',
            textColor: 'text-slate-900 dark:text-white',
            padding: 'py-20 lg:py-32'
          }
        },
        {
          id: 'simple-cards-1',
          type: 'simple-cards',
          order: 1,
          data: {
            title: 'Why Intelligent Orchestration?',
            description: 'Centralization, compliance, collaboration, and automation — all in one place to run processes at scale.',
            cards: [
              { title: 'Centralization & Visibility', description: 'Unify requests and track real-time status across all work streams.' },
              { title: 'Process Compliance', description: 'Map processes and ensure execution standards are followed every time.' },
              { title: 'Automation & Collaboration', description: 'Replace manual steps with rules, and keep teams aligned.' },
              { title: 'Reports & Mapping', description: 'Analyze performance and visualize flows to remove bottlenecks.' }
            ],
            columns: 4
          },
          style: { backgroundColor: 'bg-slate-50 dark:bg-slate-900', textColor: 'text-slate-900 dark:text-white', padding: 'py-16' }
        },
        {
          id: 'two-column-1',
          type: 'two-column-media',
          order: 2,
          data: {
            title: 'No-Code Workflow Builder',
            description: 'Design multi‑stage workflows with drag‑and‑drop, connect apps in minutes, and adapt logic without deploying code.',
            features: [
              { text: 'Drag‑and‑drop stages & forms' },
              { text: 'Conditional logic & branching' },
              { text: 'Parallel tasks & dynamic roles' },
              { text: 'Manual, time‑based, or event triggers' }
            ],
            mediaIcon: '🔄',
            mediaText: 'Workflow Builder Screenshot',
            mediaPosition: 'right',
            badge: 'Build once, reuse across departments',
            pattern: true
          },
          style: { backgroundColor: 'bg-gradient-to-br from-cyan-50/80 via-white to-slate-50/50 dark:bg-gradient-to-b dark:from-cyan-500/5 dark:to-transparent', textColor: 'text-slate-900 dark:text-white', padding: 'py-16' }
        },
        {
          id: 'feature-cards-1',
          type: 'feature-cards',
          order: 3,
          data: {
            cards: [
              { icon: 'Settings', title: 'Process Design', description: 'Define processes in a web UI, organize with folders, and control access.', details: ['Web-based designer', 'Folder organization', 'Access control'] },
              { icon: 'Layers', title: 'Unlimited Stages', description: 'Initial, standard, and final stages with templates, guidance, and flexible returns.', details: ['Stage templates', 'Flexible routing', 'Return handling'] },
              { icon: 'Zap', title: 'Smart Conditions', description: 'Rules on form data, time, ownership, or status to drive dynamic flows.', details: ['Data-driven rules', 'Time conditions', 'Dynamic routing'] },
              { icon: 'Link', title: 'Integrated Services', description: 'Email & SMS, data transfer between forms, and external event triggers.', details: ['Email/SMS', 'Data transfer', 'Event triggers'] },
              { icon: 'Users', title: 'Dynamic Assignments', description: 'Allocate by org roles, previous stages, or form data; parallel tasks & referrals.', details: ['Role-based', 'Parallel tasks', 'Smart allocation'] },
              { icon: 'FileText', title: 'Forms & Data', description: 'Custom forms per stage or transitions; granular access for sensitive fields.', details: ['Custom forms', 'Field security', 'Data validation'] }
            ]
          },
          style: { backgroundColor: 'bg-slate-50 dark:bg-slate-900', textColor: 'text-slate-900 dark:text-white', padding: 'py-16' }
        },
        {
          id: 'simple-cards-2',
          type: 'simple-cards',
          order: 4,
          data: {
            title: 'Benefits by Stakeholder',
            description: 'Tailored value for leaders, experts, frontline teams, and customers.',
            cards: [
              { title: 'Executives', description: 'Real‑time visibility, risk reduction, and cost control with KPI dashboards.' },
              { title: 'Process Owners', description: 'Design without code, iterate safely, and enforce standards at scale.' },
              { title: 'Team Members', description: 'Less busywork, clear steps, and faster handoffs across teams.' },
              { title: 'Customers', description: 'Consistent, on‑time outcomes and better service experiences.' }
            ],
            columns: 4
          },
          style: { backgroundColor: 'bg-gradient-to-br from-violet-50/80 via-white to-slate-50/50 dark:bg-gradient-to-b dark:from-violet-600/5 dark:to-transparent', textColor: 'text-slate-900 dark:text-white', padding: 'py-16' }
        },
        {
          id: 'metrics-1',
          type: 'metrics',
          order: 5,
          data: {
            title: 'Proven Business Impact',
            description: 'Cut manual effort, minimize errors, and accelerate productivity across the org.',
            metrics: [
              { value: '40%+', label: 'Cycle time reduction' },
              { value: '99.9%', label: 'Process accuracy' },
              { value: '5×', label: 'Faster integrations' },
              { value: '24/7', label: 'Operational visibility' }
            ]
          },
          style: { backgroundColor: 'bg-slate-50 dark:bg-slate-900', textColor: 'text-slate-900 dark:text-white', padding: 'py-16' }
        },
        {
          id: 'cta-1',
          type: 'cta',
          order: 6,
          data: {
            title: 'Ready to Transform Your Workflows?',
            description: 'Start orchestrating processes with confidence. No credit card required.',
            buttons: [
              { text: 'Start Free Trial →', href: '/signup', variant: 'primary', size: 'lg' },
              { text: 'Talk to Sales', href: '/contact-sales', variant: 'secondary', size: 'lg' }
            ]
          },
          style: { backgroundColor: 'bg-gradient-to-r from-indigo-600 to-cyan-500', textColor: 'text-white', padding: 'py-20', alignment: 'center' }
        }
      ]
    };

    await prisma.page.update({
      where: { slug: '/en/workflow-builder' },
      data: { builderData: JSON.stringify(builderData) }
    });

    console.log('✅ Workflow page updated with all 7 sections');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWorkflowPage();
