import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const headerMenuItems = [
    {
      id: 'product',
      label: 'Product',
      icon: '🚀',
      displayType: 'mega-menu', // mega-menu, dropdown, columns, grid, list
      backgroundColor: 'bg-white dark:bg-neutral-900',
      dropdown: {
        columns: [
          {
            title: 'Core Features',
            icon: '⭐',
            items: [
              { title: 'Form Builder', description: 'Create dynamic forms with drag & drop', href: '/en/form-builder', icon: '📝', badge: 'New' },
              { title: 'App Builder', description: 'Build custom applications visually', href: '/en/app-builder', icon: '🔧' },
              { title: 'App Builder (Dynamic)', description: 'New dynamic version with builder sections', href: '/en/app-builder-dynamic', icon: '🎉' },
              { title: 'Workflow Orchestrator', description: 'Automate business processes', href: '/en/workflow-orchestrator', icon: '⚡' }
            ]
          },
          {
            title: 'Enterprise',
            icon: '🏢',
            items: [
              { title: 'Fleet Management', description: 'Manage your fleet operations', href: '/en/fleet-management', icon: '🚛' },
              { title: 'Business Automation', description: 'Automate your business workflows', href: '/en/business-automation', icon: '🏢' }
            ]
          }
        ]
      }
    },
    {
      id: 'industries',
      label: 'Industries',
      href: '/en/industries',
      icon: '🏭',
      displayType: 'mega-menu',
      backgroundColor: 'bg-white dark:bg-neutral-900',
      dropdown: {
        columns: [
          {
            title: 'Sectors',
            icon: '⚡',
            items: [
              { title: 'Oil & Gas', description: 'Solutions for energy sector', href: '/en/industries/oilgas', icon: '⚡' },
              { title: 'IoT Integration', description: 'Connect and automate IoT devices', href: '/en/industries/iot-integration', icon: '🔗' },
              { title: 'Real Estate', description: 'Property management solutions', href: '/en/industries/real-estate', icon: '🏢' }
            ]
          },
          {
            title: 'More Industries',
            icon: '🏭',
            items: [
              { title: 'Construction', description: 'Project management for construction', href: '/en/industries/construction', icon: '🏗️' },
              { title: 'Healthcare', description: 'Healthcare workflow automation', href: '/en/industries/healthcare', icon: '🏥' }
            ]
          }
        ]
      }
    },
    {
      id: 'partnership',
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
      name: 'Main Navigation (EN)',
      location: 'header',
      language: 'en',
      items: JSON.stringify(headerMenuItems),
      status: 'active'
    }
  });

  // Create Arabic menu (same structure with AR paths)
  const arMenuItems = headerMenuItems.map(item => ({
    ...item,
    href: item.href?.replace('/en/', '/ar/'),
    dropdown: item.dropdown ? {
      columns: item.dropdown.columns.map(col => ({
        ...col,
        items: col.items.map(it => ({
          ...it,
          href: it.href.replace('/en/', '/ar/')
        }))
      }))
    } : undefined
  }));

  await prisma.menu.upsert({
    where: {
      location_language: {
        location: 'header',
        language: 'ar'
      }
    },
    update: {
      items: JSON.stringify(arMenuItems),
      status: 'active'
    },
    create: {
      name: 'Main Navigation (AR)',
      location: 'header',
      language: 'ar',
      items: JSON.stringify(arMenuItems),
      status: 'active'
    }
  });

  console.log('✅ Header menus seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
