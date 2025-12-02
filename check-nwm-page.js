const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findFirst({
    where: { slug: 'nwmflow' }
  });

  if (!page) {
    console.log('❌ Page not found!');
    return;
  }

  console.log('📄 Page:', page.title);
  console.log('🔗 Slug:', page.slug);
  
  const sections = JSON.parse(page.sections);
  console.log('\n📦 Sections:', sections.length);
  
  sections.forEach((section, idx) => {
    console.log(`\n${idx + 1}. ${section.type}`);
    if (section.data?.slides) {
      console.log(`   Slides: ${section.data.slides.length}`);
      section.data.slides.forEach((slide, i) => {
        console.log(`   ${i + 1}. ${slide.label}`);
      });
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
