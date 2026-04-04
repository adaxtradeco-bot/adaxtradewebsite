const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateSlides() {
  try {
    // Find NWMFlow page
    const nwmPage = await prisma.page.findFirst({
      where: { title: 'NWMFlow - Complete Hero' },
    });
    
    if (!nwmPage) {
      console.log('❌ NWMFlow page not found');
      return;
    }
    
    console.log('✓ Found NWMFlow page');
    
    // Parse its data
    let nwmData = null;
    if (nwmPage.sections) {
      nwmData = JSON.parse(nwmPage.sections);
    } else if (nwmPage.builderData) {
      const parsed = JSON.parse(nwmPage.builderData);
      nwmData = parsed.sections || parsed;
    }
    
    if (!nwmData || !Array.isArray(nwmData)) {
      console.log('❌ No valid data in NWMFlow page');
      console.log('sections:', !!nwmPage.sections);
      console.log('builderData:', !!nwmPage.builderData);
      return;
    }
    
    // Find hero slider
    const heroSlider = nwmData.find(s => 
      s.type === 'hero-slider-nwm' || 
      s.type === 'hero-slider' || 
      s.type === 'HeroSliderNWMSection'
    );
    
    if (!heroSlider || !heroSlider.data?.slides) {
      console.log('❌ No hero slider found');
      console.log('Available sections:', nwmData.map(s => s.type));
      return;
    }
    
    console.log(`✓ Found ${heroSlider.data.slides.length} slides`);
    
    // Find New Home page
    const newHome = await prisma.page.findFirst({
      where: { title: { contains: 'New Home' } },
    });
    
    if (!newHome) {
      console.log('❌ New Home page not found');
      return;
    }
    
    console.log('✓ Found New Home page');
    
    // Parse New Home data
    let newHomeData = null;
    if (newHome.builderData) {
      const parsed = JSON.parse(newHome.builderData);
      newHomeData = parsed.sections || parsed;
    }
    
    if (!Array.isArray(newHomeData)) {
      newHomeData = [];
    }
    
    // Update or add hero slider
    const heroIndex = newHomeData.findIndex(s => s.type === 'hero-slider-nwm' || s.type === 'hero-slider');
    
    if (heroIndex >= 0) {
      newHomeData[heroIndex].data.slides = heroSlider.data.slides;
      console.log('✓ Updated existing hero slider');
    } else {
      newHomeData.unshift({
        id: `hero-slider-${Date.now()}`,
        type: 'hero-slider-nwm',
        order: 0,
        data: { slides: heroSlider.data.slides }
      });
      console.log('✓ Added new hero slider');
    }
    
    // Update orders
    newHomeData = newHomeData.map((s, i) => ({ ...s, order: i }));
    
    // Save New Home
    await prisma.page.update({
      where: { id: newHome.id },
      data: {
        builderData: JSON.stringify({ sections: newHomeData }),
      },
    });
    
    console.log(`✅ Copied ${heroSlider.data.slides.length} slides to New Home`);
    
    // Delete NWMFlow page
    await prisma.page.delete({
      where: { id: nwmPage.id },
    });
    
    console.log('✅ Deleted NWMFlow - Complete Hero page');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSlides();
