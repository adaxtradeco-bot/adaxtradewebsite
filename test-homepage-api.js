const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHomepageAPI() {
  try {
    const page = await prisma.page.findFirst({
      where: { 
        isHomepage: true,
        status: 'published',
      },
    });

    if (!page) {
      console.log('❌ No homepage found');
      return;
    }

    console.log('✅ Homepage found:', page.title);
    console.log('Slug:', page.slug);
    console.log('Status:', page.status);
    console.log('isHomepage:', page.isHomepage);

    // Parse builderData
    let sections = [];
    if (page.builderData) {
      const parsed = JSON.parse(page.builderData);
      sections = parsed.sections || parsed || [];
      console.log('\n✅ Sections found:', sections.length);
      console.log('Section types:', sections.map(s => s.type).join(', '));
    } else {
      console.log('\n❌ No builderData found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testHomepageAPI();
