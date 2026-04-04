/**
 * List all pages in database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listPages() {
  try {
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        status: true,
        isBuilderPage: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📄 Found ${pages.length} pages:`);
    pages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.title}`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Slug: ${page.slug}`);
      console.log(`   Language: ${page.language}`);
      console.log(`   Status: ${page.status}`);
      console.log(`   Builder Page: ${page.isBuilderPage}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error listing pages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPages();