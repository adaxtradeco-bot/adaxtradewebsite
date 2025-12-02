const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findFirst({
    where: { slug: 'nwmflow' }
  });

  console.log('📄 Raw sections from DB:');
  console.log(page.sections);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const sections = JSON.parse(page.sections);
  console.log('📦 Parsed sections:', sections.length);
  
  const heroSection = sections[0];
  console.log('\n🎯 Hero Section:');
  console.log('Type:', heroSection.type);
  console.log('Data keys:', Object.keys(heroSection.data));
  
  if (heroSection.data.slides) {
    console.log('\n✅ Slides array length:', heroSection.data.slides.length);
    console.log('\n📋 All slides:');
    heroSection.data.slides.forEach((slide, i) => {
      console.log(`${i + 1}. ${slide.label} (id: ${slide.id}, type: ${slide.mediaType})`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
