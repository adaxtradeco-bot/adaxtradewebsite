import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importToVercel() {
  try {
    console.log('📦 Reading database export...');
    const data = JSON.parse(fs.readFileSync('database-export-vercel.json', 'utf-8'));

    console.log('🗑️  Clearing existing data...');
    await prisma.menu.deleteMany();
    
    console.log('📋 Importing menus...');
    for (const menu of data.menus) {
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
    console.log(`✅ Imported ${data.menus.length} menus`);

    console.log('📄 Checking pages...');
    const existingPages = await prisma.page.findMany();
    console.log(`ℹ️  Found ${existingPages.length} existing pages`);

    console.log('✅ Import completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Menus: ${data.menus.length}`);
    console.log(`   Pages: ${existingPages.length} (kept existing)`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importToVercel();
