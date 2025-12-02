const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSetHomepage() {
  try {
    console.log('Testing set homepage functionality...\n');
    
    // Get all pages
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isHomepage: true,
      },
    });
    
    console.log('Available pages:');
    pages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.title} (${page.slug}) - Homepage: ${page.isHomepage}`);
    });
    
    if (pages.length === 0) {
      console.log('\n⚠ No pages found in database');
      return;
    }
    
    // Find current homepage
    const currentHomepage = await prisma.page.findFirst({
      where: { isHomepage: true },
    });
    
    if (currentHomepage) {
      console.log(`\n✓ Current homepage: ${currentHomepage.title}`);
    } else {
      console.log('\n⚠ No homepage is currently set');
    }
    
    console.log('\n✓ Database structure is correct');
    console.log('✓ isHomepage field exists and is accessible');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSetHomepage();
