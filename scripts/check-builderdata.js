const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBuilderData() {
  try {
    const homepage = await prisma.page.findFirst({
      where: { isHomepage: true },
    });
    
    if (!homepage) {
      console.log('No homepage found');
      return;
    }
    
    console.log('Homepage:', homepage.title);
    console.log('Slug:', homepage.slug);
    console.log('\nbuilderData type:', typeof homepage.builderData);
    console.log('builderData length:', homepage.builderData?.length);
    
    if (homepage.builderData) {
      console.log('\nFirst 200 chars of builderData:');
      console.log(homepage.builderData.substring(0, 200));
      
      try {
        const parsed = JSON.parse(homepage.builderData);
        console.log('\n✓ Valid JSON');
        console.log('Type:', Array.isArray(parsed) ? 'Array' : typeof parsed);
        console.log('Length/Keys:', Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length);
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('\nFirst section:');
          console.log(JSON.stringify(parsed[0], null, 2));
        }
      } catch (e) {
        console.log('\n✗ Invalid JSON:', e.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBuilderData();
