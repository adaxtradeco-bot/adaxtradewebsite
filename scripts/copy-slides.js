const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function copySlides() {
  try {
    // Find NWMFlow - Complete Hero page
    const testHero = await prisma.page.findFirst({
      where: { 
        title: 'NWMFlow - Complete Hero'
      },
    });
    
    if (!testHero) {
      console.log('❌ test-hero page not found');
      console.log('\nAvailable pages:');
      const pages = await prisma.page.findMany({
        select: { id: true, title: true, slug: true },
      });
      pages.forEach(p => console.log(`  - ${p.title} (${p.slug})`));
      return;
    }
    
    console.log('✓ Found test-hero:', testHero.title);
    
    // Find New Home - NWM Style page
    const newHome = await prisma.page.findFirst({
      where: { 
        title: { contains: 'New Home' }
      },
    });
    
    if (!newHome) {
      console.log('❌ New Home - NWM Style page not found');
      return;
    }
    
    console.log('✓ Found New Home:', newHome.title);
    
    // Parse builderData
    const testHeroData = testHero.builderData ? JSON.parse(testHero.builderData) : null;
    const newHomeData = newHome.builderData ? JSON.parse(newHome.builderData) : null;
    
    if (!testHeroData || !testHeroData.sections) {
      console.log('❌ test-hero has no sections');
      return;
    }
    
    // Find hero slider section
    const heroSlider = testHeroData.sections.find(s => s.type === 'hero-slider' || s.type === 'hero-slider-nwm');
    
    if (!heroSlider || !heroSlider.data?.slides) {
      console.log('❌ No hero slider found in test-hero');
      console.log('Available sections:', testHeroData.sections.map(s => s.type));
      return;
    }
    
    console.log(`✓ Found ${heroSlider.data.slides.length} slides in test-hero`);
    
    // Update New Home page
    let newHomeSections = newHomeData?.sections || [];
    
    // Find existing hero slider or add new one
    const heroIndex = newHomeSections.findIndex(s => s.type === 'hero-slider-nwm' || s.type === 'hero-slider');
    
    if (heroIndex >= 0) {
      newHomeSections[heroIndex].data.slides = heroSlider.data.slides;
      console.log('✓ Updated existing hero slider');
    } else {
      newHomeSections.unshift({
        id: `hero-slider-${Date.now()}`,
        type: 'hero-slider-nwm',
        order: 0,
        data: {
          slides: heroSlider.data.slides
        }
      });
      console.log('✓ Added new hero slider');
    }
    
    // Update orders
    newHomeSections = newHomeSections.map((s, i) => ({ ...s, order: i }));
    
    // Save to database
    await prisma.page.update({
      where: { id: newHome.id },
      data: {
        builderData: JSON.stringify({ sections: newHomeSections }),
      },
    });
    
    console.log(`\n✅ Successfully copied ${heroSlider.data.slides.length} slides to New Home page`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

copySlides();
