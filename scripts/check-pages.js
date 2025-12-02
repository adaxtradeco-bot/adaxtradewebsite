const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPages() {
  try {
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });
    
    console.log('📄 Available pages:');
    pages.forEach(p => {
      console.log(`  - ${p.title} (${p.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPages();
