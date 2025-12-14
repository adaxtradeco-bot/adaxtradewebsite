// Direct import to Vercel PostgreSQL
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Force PostgreSQL connection
process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL || 'postgres://a67872c36d94eaf8b0e1c1fb82d1effc1ab5f0a07674313b1f3d216150365c90:sk_B3x2Y8ZmrvcWSllCvS-yo@db.prisma.io:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function importNow() {
  try {
    console.log('📦 Reading database-full-export.json...');
    const data = JSON.parse(fs.readFileSync('database-full-export.json', 'utf8'));

    console.log('📊 Found:');
    console.log(`   Menus: ${data.menus?.length || 0}`);
    console.log(`   Pages: ${data.pages?.length || 0}`);
    console.log(`   Users: ${data.users?.length || 0}`);
    console.log('');

    // Import Menus
    if (data.menus?.length > 0) {
      console.log('📋 Importing menus...');
      for (const menu of data.menus) {
        await prisma.menu.upsert({
          where: { id: menu.id },
          update: {
            name: menu.name,
            location: menu.location,
            language: menu.language,
            items: menu.items,
            status: menu.status,
          },
          create: menu,
        });
      }
      console.log(`✅ Imported ${data.menus.length} menus`);
    }

    // Import Pages
    if (data.pages?.length > 0) {
      console.log('📄 Importing pages...');
      for (const page of data.pages) {
        await prisma.page.upsert({
          where: { id: page.id },
          update: page,
          create: page,
        });
      }
      console.log(`✅ Imported ${data.pages.length} pages`);
    }

    // Import Users
    if (data.users?.length > 0) {
      console.log('👤 Importing users...');
      for (const user of data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
      }
      console.log(`✅ Imported ${data.users.length} users`);
    }

    console.log('');
    console.log('✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

importNow();
