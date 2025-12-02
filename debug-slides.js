const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking all pages with HeroSliderNWMSection...\n');
  
  const pages = await prisma.page.findMany({
    where: {
      sections: {
        contains: 'HeroSliderNWMSection'
      }
    }
  });

  console.log(`Found ${pages.length} pages\n`);

  pages.forEach(page => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📄 Title: ${page.title}`);
    console.log(`🔗 Slug: ${page.slug}`);
    console.log(`🌐 Language: ${page.language}`);
    console.log(`📍 URL: http://localhost:3000/${page.language}/${page.slug}`);
    
    const sections = JSON.parse(page.sections);
    const heroSection = sections.find(s => s.type === 'HeroSliderNWMSection');
    
    if (heroSection && heroSection.data && heroSection.data.slides) {
      console.log(`\n✅ Slides in database: ${heroSection.data.slides.length}`);
      heroSection.data.slides.forEach((slide, i) => {
        console.log(`   ${i + 1}. ${slide.label} (${slide.mediaType})`);
      });
    }
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
