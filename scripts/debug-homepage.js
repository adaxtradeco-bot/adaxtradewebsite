const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugHomepage() {
  try {
    console.log('=== Homepage Debug Info ===\n');
    
    // Check homepage
    const homepage = await prisma.page.findFirst({
      where: { isHomepage: true },
    });
    
    if (homepage) {
      console.log('✓ Homepage found:');
      console.log('  ID:', homepage.id);
      console.log('  Title:', homepage.title);
      console.log('  Slug:', homepage.slug);
      console.log('  Language:', homepage.language);
      console.log('  Status:', homepage.status);
      console.log('  Has builderData:', !!homepage.builderData);
      
      if (homepage.builderData) {
        const data = JSON.parse(homepage.builderData);
        console.log('  Sections count:', Array.isArray(data) ? data.length : 0);
      }
    } else {
      console.log('✗ No homepage set');
    }
    
    console.log('\n=== Pages with /en or /ar slug ===\n');
    const langPages = await prisma.page.findMany({
      where: {
        OR: [
          { slug: '/en' },
          { slug: '/ar' },
        ],
      },
    });
    
    langPages.forEach(page => {
      console.log(`- ${page.title} (${page.slug})`);
      console.log(`  isHomepage: ${page.isHomepage}`);
      console.log(`  status: ${page.status}`);
      console.log(`  has builderData: ${!!page.builderData}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugHomepage();
