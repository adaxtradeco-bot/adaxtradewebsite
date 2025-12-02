const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHomepage() {
  try {
    const homepage = await prisma.page.findFirst({
      where: { isHomepage: true },
    });

    console.log('Homepage:', homepage);

    const allPages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isHomepage: true,
        status: true,
      },
    });

    console.log('\nAll pages:');
    allPages.forEach(page => {
      console.log(`- ${page.title} (${page.slug}) - Homepage: ${page.isHomepage}, Status: ${page.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHomepage();
