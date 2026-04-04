const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Migration Script: Convert old hero sections to ProductHeroSection
 * Converts: workflow-hero, form-builder-hero, app-builder-hero -> product-hero
 */

async function migrateHeroSections() {
  try {
    console.log('🔄 Starting hero sections migration...\n');

    // Get all pages
    const pages = await prisma.page.findMany();
    let updatedCount = 0;

    for (const page of pages) {
      if (!page.builderData) continue;

      let builderData;
      try {
        builderData = typeof page.builderData === 'string' 
          ? JSON.parse(page.builderData) 
          : page.builderData;
      } catch (e) {
        console.log(`⚠️  Skipping page ${page.slug} - invalid JSON`);
        continue;
      }

      if (!builderData.sections || !Array.isArray(builderData.sections)) continue;

      let hasChanges = false;
      const updatedSections = builderData.sections.map(section => {
        // Check if this is one of the old hero types
        if (['workflow-hero', 'form-builder-hero', 'app-builder-hero'].includes(section.type)) {
          hasChanges = true;
          console.log(`  📝 Converting ${section.type} in page: ${page.slug}`);

          // Convert to product-hero format
          const newSection = {
            ...section,
            type: 'product-hero',
            data: {
              badge: section.data.badge || '',
              title: section.data.title || '',
              titleHighlight: section.data.titleHighlight || '',
              description: section.data.description || '',
              primaryButton: section.data.primaryButton || { text: 'Get Started', href: '#' },
              secondaryButton: section.data.secondaryButton || { text: 'Learn More', href: '#' },
              footerText: section.data.footerText || '',
              badges: section.data.badges || [],
              
              // Theme - default to indigo-cyan
              themeId: 'indigo-cyan',
              customBackground: '',
              customTitleGradientFrom: '',
              customTitleGradientTo: '',
              
              // Determine right content type
              rightContentType: section.data.cards ? 'cards' : 
                               section.data.mediaType === 'placeholder' ? 'placeholder' :
                               section.data.canvasIcon ? 'placeholder' : 'cards',
              
              // Cards - convert icons to new format
              cards: (section.data.cards || []).map(card => ({
                icon: card.icon,
                iconConfig: null,
                title: card.title,
                description: card.description
              })),
              
              // Media
              mediaUrl: section.data.mediaUrl || '',
              mediaAlt: section.data.mediaAlt || 'Product showcase',
              mediaFit: section.data.mediaFit || 'cover',
              mediaAspectRatio: section.data.mediaAspectRatio || '4/3',
              
              // Placeholder
              placeholderIcon: section.data.canvasIcon || section.data.placeholderIcon || '🎨',
              placeholderIconConfig: null,
              placeholderText: section.data.canvasLabel || section.data.placeholderText || 'Product Preview',
              
              // Features - convert icons to new format
              features: (section.data.features || []).map(feature => ({
                icon: feature.icon,
                iconConfig: null,
                label: feature.label
              }))
            }
          };

          return newSection;
        }
        
        return section;
      });

      if (hasChanges) {
        // Update the page
        await prisma.page.update({
          where: { id: page.id },
          data: {
            builderData: JSON.stringify({
              ...builderData,
              sections: updatedSections
            })
          }
        });
        
        updatedCount++;
        console.log(`  ✅ Updated page: ${page.slug}\n`);
      }
    }

    console.log(`\n✨ Migration completed!`);
    console.log(`📊 Total pages updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateHeroSections()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
