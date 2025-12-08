import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importFullDatabase() {
  try {
    console.log('📦 Reading full database export...');
    const data = JSON.parse(fs.readFileSync('database-full-export.json', 'utf-8'));

    console.log('📊 Export contains:');
    console.log(`   Menus: ${data.menus?.length || 0}`);
    console.log(`   Pages: ${data.pages?.length || 0}`);
    console.log(`   Users: ${data.users?.length || 0}`);
    console.log(`   Export Date: ${data.exportDate}`);

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await prisma.menu.deleteMany();
    await prisma.page.deleteMany();
    console.log('✅ Cleared menus and pages');

    // Import Menus
    console.log('\n📋 Importing menus...');
    for (const menu of data.menus || []) {
      await prisma.menu.create({
        data: {
          name: menu.name,
          location: menu.location,
          language: menu.language,
          items: menu.items,
          status: menu.status,
        },
      });
    }
    console.log(`✅ Imported ${data.menus?.length || 0} menus`);

    // Import Pages
    console.log('\n📄 Importing pages...');
    for (const page of data.pages || []) {
      await prisma.page.create({
        data: {
          title: page.title,
          slug: page.slug,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          status: page.status,
          language: page.language,
          sections: page.sections,
          builderData: page.builderData,
          isBuilderPage: page.isBuilderPage,
          builderVersion: page.builderVersion,
          isHomepage: page.isHomepage,
        },
      });
    }
    console.log(`✅ Imported ${data.pages?.length || 0} pages`);

    console.log('\n✅ Import completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`   ✓ Menus: ${data.menus?.length || 0}`);
    console.log(`   ✓ Pages: ${data.pages?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importFullDatabase();
