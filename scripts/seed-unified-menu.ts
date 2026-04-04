import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Unified Tree Structure
  const headerMenuItems = [
    {
      id: 'product',
      type: 'dropdown',
      label: 'Product',
      icon: '🚀',
      displayType: 'mega-menu',
      backgroundColor: 'bg-white dark:bg-neutral-900',
      children: [
        {
          id: 'core-features',
          type: 'category',
          label: 'Core Features',
          icon: '⭐',
          children: [
            {
              id: 'form-builder',
              type: 'page',
              label: 'Form Builder',
              href: '/en/form-builder',
              icon: '📝',
              description: 'Create dynamic forms with drag & drop',
              badge: 'New'
            },
            {
              id: 'app-builder',
              type: 'page',
              label: 'App Builder',
              href: '/en/app-builder',
              icon: '🔧',
              description: 'Build custom applications visually'
            },
            {
              id: 'app-builder-dynamic',
              type: 'page',
              label: 'App Builder (Dynamic)',
              href: '/en/app-builder-dynamic',
              icon: '🎉',
              description: 'New dynamic version with builder sections'
            },
            {
              id: 'workflow-orchestrator',
              type: 'page',
              label: 'Workflow Orchestrator',
              href: '/en/workflow-orchestrator',
              icon: '⚡',
              description: 'Automate business processes'
            }
          ]
        },
        {
          id: 'enterprise',
          type: 'category',
          label: 'Enterprise',
          icon: '🏢',
          children: [
            {
              id: 'fleet-management',
              type: 'page',
              label: 'Fleet Management',
              href: '/en/fleet-management',
              icon: '🚛',
              description: 'Manage your fleet operations'
            },
            {
              id: 'business-automation',
              type: 'page',
              label: 'Business Automation',
              href: '/en/business-automation',
              icon: '🏢',
              description: 'Automate your business workflows'
            }
          ]
        }
      ]
    },
    {
      id: 'industries',
      type: 'dropdown',
      label: 'Industries',
      icon: '🏭',
      displayType: 'mega-menu',
      backgroundColor: 'bg-white dark:bg-neutral-900',
      children: [
        {
          id: 'sectors',
          type: 'category',
          label: 'Sectors',
          icon: '⚡',
          children: [
            {
              id: 'oilgas',
              type: 'page',
              label: 'Oil & Gas',
              href: '/en/industries/oilgas',
              icon: '⚡',
              description: 'Solutions for energy sector'
            },
            {
              id: 'iot',
              type: 'page',
              label: 'IoT Integration',
              href: '/en/industries/iot-integration',
              icon: '🔗',
              description: 'Connect and automate IoT devices'
            },
            {
              id: 'realestate',
              type: 'page',
              label: 'Real Estate',
              href: '/en/industries/real-estate',
              icon: '🏢',
              description: 'Property management solutions'
            }
          ]
        },
        {
          id: 'more-industries',
          type: 'category',
          label: 'More Industries',
          icon: '🏭',
          children: [
            {
              id: 'construction',
              type: 'page',
              label: 'Construction',
              href: '/en/industries/construction',
              icon: '🏗️',
              description: 'Project management for construction'
            },
            {
              id: 'healthcare',
              type: 'page',
              label: 'Healthcare',
              href: '/en/industries/healthcare',
              icon: '🏥',
              description: 'Healthcare workflow automation'
            }
          ]
        }
      ]
    },
    {
      id: 'partnership',
      type: 'link',
      label: 'Partnership',
      href: '/en/partnership',
      icon: '🤝'
    }
  ];

  // Create English menu
  await prisma.menu.upsert({
    where: {
      location_language: {
        location: 'header',
        language: 'en'
      }
    },
    update: {
      items: JSON.stringify(headerMenuItems),
      status: 'active'
    },
    create: {
      name: 'Main Navigation (EN) - Unified',
      location: 'header',
      language: 'en',
      items: JSON.stringify(headerMenuItems),
      status: 'active'
    }
  });

  console.log('✅ Unified menu structure seeded successfully!');
  console.log('📊 Structure:');
  console.log('  - 2 DROPDOWN nodes (Product, Industries)');
  console.log('  - 4 CATEGORY nodes (Core Features, Enterprise, Sectors, More Industries)');
  console.log('  - 9 PAGE nodes (all the actual links)');
  console.log('  - 1 LINK node (Partnership)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
