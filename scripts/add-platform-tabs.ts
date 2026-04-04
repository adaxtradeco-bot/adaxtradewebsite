import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding Platform Tabs section to New Home page...');

  const page = await prisma.page.findFirst({
    where: { slug: '/en' }
  });

  if (!page) {
    console.error('❌ New Home page not found');
    return;
  }

  const builderData = JSON.parse(page.builderData || '{}');
  const sections = builderData.sections || [];

  // Find ecosystem section index to insert after it
  const ecosystemIndex = sections.findIndex((s: any) => s.type === 'ecosystem-nwm');
  const insertIndex = ecosystemIndex >= 0 ? ecosystemIndex + 1 : sections.length;

  // New Platform Tabs section
  const platformTabsSection = {
    id: 'platform-tabs-1',
    type: 'platform-tabs',
    order: insertIndex,
    data: {
      title: 'The Complete Automation Ecosystem',
      subtitle: 'The Platform',
      description: 'One unified OS for all your operational needs.',
      tabs: [
        {
          id: 'core',
          label: 'By Core Feature',
          cards: [
            {
              title: 'Smart Forms',
              description: 'Intelligent data capture with offline support, photo uploads, and real-time validation.',
              image: '/assets/img/2.png',
              link: '/forms',
            },
            {
              title: 'Workflow & Automation',
              description: 'Visually orchestrate complex logic, approvals, and "if-this-then-that" automated rules.',
              image: '/assets/img/5.png',
              link: '/workflow',
            },
            {
              title: 'Analytics',
              description: 'Turn raw data into decisions with real-time, customizable dashboards and reports.',
              image: '/assets/img/Analytics3.png',
              link: '/analytics',
            },
            {
              title: 'No-Code Apps',
              description: 'Build branded, mobile-responsive employee portals instantly without writing code.',
              image: '/assets/img/Nocode4.png',
              link: '/appbuilder',
            },
          ],
        },
        {
          id: 'industry',
          label: 'By Industry',
          cards: [
            {
              title: 'Fleet Management',
              description: 'End-to-end dispatching, tracking, and maintenance.',
              image: '/assets/img/4.png',
              link: '/fleet',
            },
            {
              title: 'Construction',
              description: 'Manage site inspections and safety reporting.',
              image: '/assets/img/1.png',
              link: '/construction',
            },
            {
              title: 'Healthcare',
              description: 'Secure patient intake and compliance.',
              image: '/assets/img/2.png',
              link: '/healthcare',
            },
            {
              title: 'Oil & Gas',
              description: 'Remote asset monitoring and HSE.',
              image: '/assets/img/Remoteasset3.png',
              link: '/oil-gas',
            },
          ],
        },
        {
          id: 'usecase',
          label: 'By Use Case',
          cards: [
            {
              title: 'Approvals',
              description: 'Streamline internal requests and sign-offs.',
              image: '/assets/img/approval5.png',
              link: '#',
            },
            {
              title: 'Onboarding',
              description: 'Automate document collection and training.',
              image: '/assets/img/Onboard2.png',
              link: '#',
            },
            {
              title: 'Incident Mgmt',
              description: 'Report and resolve safety incidents instantly.',
              image: '/assets/img/Incident3.png',
              link: '#',
            },
            {
              title: 'Field Service',
              description: 'Track work orders in field.',
              image: '/assets/img/Field1.png',
              link: '#',
            },
          ],
        },
      ],
    },
    style: {
      backgroundColor: 'bg-slate-950',
      textColor: 'text-white',
      padding: 'py-20',
      alignment: 'center',
    },
  };

  // Insert the new section
  sections.splice(insertIndex, 0, platformTabsSection);

  // Update order for all sections
  sections.forEach((section: any, index: number) => {
    section.order = index;
  });

  builderData.sections = sections;

  await prisma.page.update({
    where: { id: page.id },
    data: {
      builderData: JSON.stringify(builderData),
    },
  });

  console.log('✅ Platform Tabs section added successfully');
  console.log(`   Inserted at position: ${insertIndex}`);
  console.log(`   Total sections: ${sections.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
