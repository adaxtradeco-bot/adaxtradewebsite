import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addWallOfFeatures() {
  try {
    // Get current homepage
    const homepage = await prisma.page.findFirst({
      where: { isHomepage: true }
    });

    if (!homepage) {
      console.log('❌ No homepage found');
      return;
    }

    console.log(`📄 Found homepage: ${homepage.title}`);

    // Parse current builder data
    const builderData = JSON.parse(homepage.builderData || '{"sections":[]}');
    
    // Wall of Features section data
    const wallOfFeaturesSection = {
      id: 'wall-of-features-1',
      type: 'wall-of-features',
      order: 4, // Add after existing sections
      data: {
        title: 'Everything you need in one platform',
        subtitle: 'Explore dozens of features working together.',
        features: [], // Will use default features from component
        backgroundColor: '#e8e8e8',
        tileBackgroundColor: '#ffffff',
        textColor: '#838383',
      },
      style: {
        backgroundColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        padding: 'py-24',
        alignment: 'center',
      },
    };

    // Add the new section
    builderData.sections.push(wallOfFeaturesSection);

    // Update orders for existing sections after position 4
    builderData.sections.forEach((section: any, index: number) => {
      if (section.id !== 'wall-of-features-1' && section.order >= 4) {
        section.order += 1;
      }
    });

    // Sort sections by order
    builderData.sections.sort((a: any, b: any) => a.order - b.order);

    // Update the homepage
    await prisma.page.update({
      where: { id: homepage.id },
      data: {
        builderData: JSON.stringify(builderData),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Wall of Features section added to homepage successfully!');
    console.log(`📊 Total sections: ${builderData.sections.length}`);
    
  } catch (error) {
    console.error('❌ Error adding Wall of Features section:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWallOfFeatures();