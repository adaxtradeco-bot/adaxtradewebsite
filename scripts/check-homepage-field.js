const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHomepageField() {
  try {
    console.log('Checking if isHomepage field exists...');
    
    // Try to query with isHomepage field
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isHomepage: true,
      },
      take: 1,
    });
    
    console.log('✓ isHomepage field exists!');
    console.log('Sample page:', pages[0]);
    
    // Check if any page is set as homepage
    const homepage = await prisma.page.findFirst({
      where: { isHomepage: true },
    });
    
    if (homepage) {
      console.log('✓ Homepage is set:', homepage.title);
    } else {
      console.log('⚠ No homepage is currently set');
    }
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.log('\nPlease run: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

checkHomepageField();
