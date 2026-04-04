const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSlug() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: '/en/workflow-builder' }
    });

    if (page) {
      await prisma.page.update({
        where: { id: page.id },
        data: { slug: '/en/workflow-orchestrator' }
      });
      console.log('✅ Slug updated from /en/workflow-builder to /en/workflow-orchestrator');
    } else {
      console.log('❌ Page not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateSlug();
