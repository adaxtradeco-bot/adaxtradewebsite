import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating new-home page with NWM-style sections...');

  await prisma.page.deleteMany({
    where: { slug: '/en/new-home' }
  });

  const builderData = {
    sections: [
      {
        id: 'hero-slider-1',
        type: 'hero-slider-nwm',
        order: 0,
        data: {
          slides: [
            {
              id: 0,
              label: 'Citizen Requests',
              title: 'Modern public services without the legacy mess.',
              desc: 'Design and launch end-to-end citizen request systems in days.',
              badge: 'Government',
              mediaType: 'image',
              mediaSrc: '/placeholder-hero.jpg',
            },
            {
              id: 1,
              label: 'HR Operations',
              title: 'HR operations that feel consumer-grade.',
              desc: 'From onboarding to performance reviews - unify your HR services.',
              badge: 'HR Services',
              mediaType: 'image',
              mediaSrc: '/placeholder-hero.jpg',
            },
          ],
          autoPlayInterval: 7000,
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-0',
        },
      },
      {
        id: 'why-1',
        type: 'why-nwm',
        order: 1,
        data: {
          eyebrow: 'Why IvaFlow',
          title: 'What makes IvaFlow different?',
          description: 'A truly no-code operating system for serious organizations.',
          cards: [
            {
              title: 'True no-code end-to-end',
              description: 'Design forms workflows dashboards through a visual designer.',
              features: [
                'Drag-and-drop forms',
                'Instant deployment',
                'Business team owned',
              ],
            },
            {
              title: 'Unified platform',
              description: 'CRM communication GIS automation all in the core.',
              features: [
                'One data model',
                'Native omni-channel',
                'Location-aware workflows',
              ],
            },
            {
              title: 'Enterprise-grade',
              description: 'Built for regulated environments.',
              features: [
                'Multi-layer RBAC',
                'Farm architecture',
                'Integration hub',
              ],
            },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
      {
        id: 'stakeholders-1',
        type: 'stakeholders-nwm',
        order: 2,
        data: {
          eyebrow: 'Value for every stakeholder',
          title: 'Solve the problems of key stakeholders.',
          description: 'IvaFlow turns process chaos into guided experience.',
          mediaPlaceholder: 'Drop stakeholder demo video here',
          cards: [
            {
              title: 'Executives',
              description: 'See live performance and SLAs in one place.',
              pills: ['Real-time dashboards', 'SLA compliance'],
            },
            {
              title: 'Business owners',
              description: 'Iterate on processes without developers.',
              pills: ['Visual modeling', 'Instant publishing'],
            },
            {
              title: 'IT teams',
              description: 'Keep control of identity and data.',
              pills: ['API builder', 'Secure by design'],
            },
            {
              title: 'Partners',
              description: 'Package knowledge into templates.',
              pills: ['Template marketplace', 'Co-selling'],
            },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
      {
        id: 'ecosystem-1',
        type: 'ecosystem-nwm',
        order: 3,
        data: {
          eyebrow: 'Complete automation ecosystem',
          title: 'One unified OS for all operational needs.',
          description: 'Explore by feature industry or use case.',
          columns: [
            {
              title: 'By core feature',
              items: [
                'No-code Form Builder',
                'Workflow Engine',
                'Automation Manager',
                'Dashboard Builder',
                'Portal Architecture',
                'Contact Server',
                'Integration Hub',
              ],
            },
            {
              title: 'By industry',
              items: [
                'Government',
                'Telco',
                'Logistics',
                'Banking',
                'Healthcare',
                'Retail',
              ],
            },
            {
              title: 'By use case',
              items: [
                'Ticketing',
                'HR Services',
                'Citizen Requests',
                'Document Management',
                'Field Operations',
                'IoT Operations',
              ],
            },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
      {
        id: 'infographic-1',
        type: 'infographic-nwm',
        order: 4,
        data: {
          eyebrow: 'Architecture snapshot',
          title: 'How IvaFlow becomes your operating system.',
          description: 'A layered multi-tenant architecture.',
          coreLabel: 'IvaFlow Core',
          coreSubLabel: 'Forms Workflows Data Automation',
          farmLabel: 'Farm Multi-org Layer',
          portalLabel: 'Portals Workspaces',
          orgNodes: [
            { title: 'Org A', description: 'Multiple portals.', position: 'top-left' },
            { title: 'Org B', description: 'Custom workflows.', position: 'top-right' },
            { title: 'Org C', description: 'Local integrations.', position: 'bottom-left' },
            { title: 'Org D', description: 'Industry templates.', position: 'bottom-right' },
          ],
          notesTitle: 'Use this block for a diagram.',
          notesDescription: 'Replace with your own diagram.',
          notesList: [
            'One deploy many organizations.',
            'Dedicated portals per org.',
            'Single no-code core.',
            'Perfect for governments.',
          ],
          imagePlaceholder: 'Drop architecture diagram here',
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
      {
        id: 'video-1',
        type: 'video-preview-nwm',
        order: 5,
        data: {
          eyebrow: 'Platform preview',
          title: 'See the platform in action.',
          description: 'Modern UI designed for speed.',
          videoPlaceholder: 'Embed product tour video here',
          videoNotes: [
            'Highlight form builder and workflows.',
            'Keep it under 90 seconds.',
            'Mute autoplay for better UX.',
          ],
          modules: [
            { emoji: '📝', title: 'Form Builder', description: 'Multi-step forms.' },
            { emoji: '⚡', title: 'Workflows', description: 'Visual flows.' },
            { emoji: '📊', title: 'Dashboards', description: 'Live KPIs.' },
            { emoji: '📡', title: 'IoT Fleet', description: 'Location aware.' },
          ],
          ctaText: 'Watch full product tour',
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
      {
        id: 'partners-1',
        type: 'partners-nwm',
        order: 6,
        data: {
          eyebrow: 'Partner program',
          title: 'Build solutions. Grow with IvaFlow.',
          description: 'Package your expertise and scale.',
          cards: [
            {
              title: 'Implementation support',
              description: 'Take ownership of rollout and onboarding.',
              features: [
                'Enterprise platform',
                'Training tracks',
                'Co-marketing',
              ],
            },
            {
              title: 'Solution selling',
              description: 'Bundle with your consulting services.',
              features: [
                'Industry blueprints',
                'Vertical solutions',
                'Attractive margins',
              ],
            },
            {
              title: 'Template creators',
              description: 'Turn know-how into reusable apps.',
              features: [
                'Template marketplace',
                'Revenue share',
                'Technical support',
              ],
            },
          ],
          ctaButtons: {
            primary: { text: 'Become a partner', href: '#apply' },
            secondary: { text: 'Download brief', href: '#download' },
          },
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
      {
        id: 'features-1',
        type: 'features-grid-nwm',
        order: 7,
        data: {
          eyebrow: 'Core capabilities',
          title: 'Everything you need for digital operations.',
          description: 'From intake to decision to final outcome.',
          features: [
            {
              title: 'No-code form builder',
              description: 'Multi-step conditional forms with validation.',
            },
            {
              title: 'Workflow engine',
              description: 'Route tasks and monitor SLA compliance.',
            },
            {
              title: 'Automation triggers',
              description: 'Sequential and parallel automations.',
            },
            {
              title: 'Dashboards analytics',
              description: 'Real-time dashboards with drill-down.',
            },
            {
              title: 'Security governance',
              description: 'Multi-layer access control and audit logs.',
            },
            {
              title: 'Integration hub',
              description: 'Visual API and Webhook builder.',
            },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
      {
        id: 'cta-1',
        type: 'final-cta-nwm',
        order: 8,
        data: {
          eyebrow: 'Ready to see it live?',
          title: 'Build your first live system on IvaFlow.',
          description: 'Bring a real process and we will help you launch it.',
          primaryButton: {
            text: 'Book a live build session',
            href: '/contact',
          },
          secondaryButton: {
            text: 'Explore solution blueprints',
            href: '#solutions',
          },
        },
        style: {
          backgroundColor: 'bg-slate-950',
          textColor: 'text-white',
          padding: 'py-20',
        },
      },
    ],
  };

  const page = await prisma.page.create({
    data: {
      slug: '/en/new-home',
      title: 'New Home - NWM Style',
      metaTitle: 'IvaFlow - Unified Automation OS',
      metaDescription: 'Modern no-code platform for enterprise automation',
      status: 'published',
      language: 'en',
      isBuilderPage: true,
      builderData: JSON.stringify(builderData),
      builderVersion: '2.0',
    },
  });

  console.log('Page created:', page.slug);
  console.log('Total sections:', builderData.sections.length);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
