const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addWorkflowPage() {
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
            primaryButton: {
              text: 'Explore Features',
              href: '#features'
            },
            secondaryButton: {
              text: 'See Business Impact',
              href: '#impact'
            },
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
          id: 'metrics-1',
          type: 'metrics',
          order: 1,
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
          style: {
            backgroundColor: 'bg-slate-50 dark:bg-slate-900',
            textColor: 'text-slate-900 dark:text-white',
            padding: 'py-16'
          }
        }
      ]
    };

    const page = await prisma.page.upsert({
      where: {
        slug: '/en/workflow-builder'
      },
      update: {
        title: 'Workflow Orchestrator',
        metaDescription: 'Orchestrate processes, reduce errors, and move faster',
        isBuilderPage: true,
        builderData: JSON.stringify(builderData),
        status: 'published'
      },
      create: {
        slug: '/en/workflow-builder',
        title: 'Workflow Orchestrator',
        metaDescription: 'Orchestrate processes, reduce errors, and move faster',
        isBuilderPage: true,
        builderData: JSON.stringify(builderData),
        status: 'published'
      }
    });

    console.log('✅ Workflow page added successfully:', page.slug);
  } catch (error) {
    console.error('❌ Error adding workflow page:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWorkflowPage();
