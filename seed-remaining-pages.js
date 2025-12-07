const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRemainingPages() {
  console.log('🌱 Adding remaining pages...\n');

  const pages = [
    {
      title: 'Form Builder',
      slug: 'form-builder',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
    {
      title: 'App Builder Dynamic',
      slug: 'app-builder-dynamic',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
    {
      title: 'Workflow Orchestrator Dynamic',
      slug: 'workflow-orchestrator-dynamic',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
    {
      title: 'Form Builder Dynamic',
      slug: 'form-builder-dynamic',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
    {
      title: 'Contact',
      slug: 'contact',
      language: 'en',
      status: 'published',
      isBuilderPage: false,
      sections: JSON.stringify([]),
    },
    {
      title: 'Contact Sales',
      slug: 'contact-sales',
      language: 'en',
      status: 'published',
      isBuilderPage: false,
      sections: JSON.stringify([]),
    },
    {
      title: 'Showcase',
      slug: 'showcase',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
    {
      title: 'Healthcare Solutions',
      slug: 'industries-healthcare',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
    {
      title: 'Construction Solutions',
      slug: 'industries-construction',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
    {
      title: 'IoT Integration',
      slug: 'industries-iot-integration',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [] }),
    },
  ];

  for (const pageData of pages) {
    try {
      const existing = await prisma.page.findFirst({
        where: { slug: pageData.slug }
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${pageData.title} (already exists)`);
      } else {
        await prisma.page.create({ data: pageData });
        console.log(`✅ Created: ${pageData.title}`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${pageData.title}:`, error.message);
    }
  }

  const count = await prisma.page.count();
  console.log(`\n📊 Total pages: ${count}`);
  
  await prisma.$disconnect();
}

seedRemainingPages();