require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPreviewFieldsToHeroSlider() {
  try {
    console.log('🔍 Looking for homepage with HeroSliderNWMSection...');
    
    // Find homepage
    const homepage = await prisma.page.findFirst({
      where: { isHomepage: true }
    });
    
    if (!homepage) {
      console.log('❌ No homepage found');
      return;
    }
    
    console.log('✅ Found homepage:', homepage.title);
    
    if (!homepage.builderData) {
      console.log('❌ No builderData found');
      return;
    }
    
    const builderData = JSON.parse(homepage.builderData);
    let updated = false;
    
    // Check structure - could be {sections: [...]} or [...]
    const sections = builderData.sections || builderData;
    
    if (!Array.isArray(sections)) {
      console.log('❌ No sections array found');
      return;
    }
    
    console.log(`📋 Found ${sections.length} sections`);
    
    // Find HeroSliderNWMSection
    sections.forEach((section, index) => {
      if (section.type === 'hero-slider-nwm' || section.type === 'HeroSliderNWMSection') {
        console.log(`🎯 Found HeroSliderNWMSection at index ${index}`);
        
        // Add preview to defaultSnapshotCard if missing
        if (section.data.defaultSnapshotCard && !section.data.defaultSnapshotCard.preview) {
          section.data.defaultSnapshotCard.preview = '/api/media/default-preview.png';
          console.log('✅ Added preview to defaultSnapshotCard');
          updated = true;
        }
        
        // Add preview to all slides
        if (section.data.slides && Array.isArray(section.data.slides)) {
          section.data.slides.forEach((slide, slideIndex) => {
            if (slide.snapshotCard && !slide.snapshotCard.preview) {
              slide.snapshotCard.preview = `/api/media/slide-${slideIndex}-preview.png`;
              console.log(`✅ Added preview to slide ${slideIndex}`);
              updated = true;
            }
            
            // Add CTA if missing
            if (!slide.cta) {
              slide.cta = {
                primaryButton: {
                  text: 'Start with a live demo',
                  link: '/demo'
                },
                secondaryButton: {
                  text: 'Become a partner',
                  link: '/partnership'
                }
              };
              console.log(`✅ Added CTA to slide ${slideIndex}`);
              updated = true;
            }
          });
        }
      }
    });
    
    if (updated) {
      // Update the page - preserve original structure
      const finalData = builderData.sections ? { sections } : sections;
      
      await prisma.page.update({
        where: { id: homepage.id },
        data: {
          builderData: JSON.stringify(finalData, null, 2)
        }
      });
      
      console.log('🎉 Successfully updated homepage with preview fields!');
      console.log('📝 Updated sections:');
      
      sections.forEach((section, index) => {
        if (section.type === 'hero-slider-nwm' || section.type === 'HeroSliderNWMSection') {
          console.log(`   - HeroSliderNWMSection (${section.data.slides?.length || 0} slides)`);
          if (section.data.defaultSnapshotCard?.preview) {
            console.log(`     ✅ defaultSnapshotCard.preview: ${section.data.defaultSnapshotCard.preview}`);
          }
          section.data.slides?.forEach((slide, slideIndex) => {
            if (slide.snapshotCard?.preview) {
              console.log(`     ✅ slides[${slideIndex}].snapshotCard.preview: ${slide.snapshotCard.preview}`);
            }
          });
        }
      });
    } else {
      console.log('ℹ️ No updates needed - preview fields already exist');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPreviewFieldsToHeroSlider();