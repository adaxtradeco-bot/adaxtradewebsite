#!/usr/bin/env node
/**
 * 🚀 Sync Local Database to Vercel
 * 
 * این اسکریپت:
 * 1. دیتابیس لوکال رو export میکنه
 * 2. به Vercel متصل میشه
 * 3. دیتابیس Vercel رو بروزرسانی میکنه
 * 
 * استفاده:
 *   node sync-to-vercel.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// رنگ ها برای console
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function exportLocalDatabase() {
  log('\n📦 Step 1: Reading local export file...', 'cyan');
  
  try {
    // استفاده از فایل export موجود
    let data;
    if (fs.existsSync('database-full-export.json')) {
      data = JSON.parse(fs.readFileSync('database-full-export.json', 'utf8'));
      log('✓ Using database-full-export.json', 'green');
    } else if (fs.existsSync('database-backup.json')) {
      data = JSON.parse(fs.readFileSync('database-backup.json', 'utf8'));
      log('✓ Using database-backup.json', 'green');
    } else {
      throw new Error('No export file found! Please run: npx tsx -e "...export script..."');
    }

    log(`✅ Found:`, 'green');
    log(`   • ${data.menus?.length || 0} menus`);
    log(`   • ${data.pages?.length || 0} pages`);
    log(`   • ${data.users?.length || 0} users`);
    log(`   • ${data.translations?.length || 0} translations`);
    log(`   • ${data.media?.length || 0} media files`);

    return data;
  } catch (error) {
    log(`❌ Export failed: ${error.message}`, 'red');
    throw error;
  }
}

async function importToVercel(data) {
  log('\n🚀 Step 2: Importing to Vercel...', 'cyan');

  // خواندن connection string از .env.production
  let vercelUrl = process.env.POSTGRES_PRISMA_URL;
  
  if (!vercelUrl && fs.existsSync('.env.production')) {
    const envContent = fs.readFileSync('.env.production', 'utf8');
    const match = envContent.match(/POSTGRES_PRISMA_URL="?([^"\n]+)"?/);
    if (match) {
      vercelUrl = match[1];
    }
  }

  if (!vercelUrl) {
    log('❌ POSTGRES_PRISMA_URL not found!', 'red');
    log('Please set it in .env.production or environment variable', 'yellow');
    throw new Error('Missing POSTGRES_PRISMA_URL');
  }

  log('✓ Connected to Vercel database', 'green');

  const vercelPrisma = new PrismaClient({
    datasources: {
      db: {
        url: vercelUrl
      }
    }
  });

  try {
    // Import Menus
    if (data.menus?.length > 0) {
      log(`\n📋 Importing ${data.menus.length} menus...`, 'blue');
      for (const menu of data.menus) {
        await vercelPrisma.menu.upsert({
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
      log(`✅ Menus imported`, 'green');
    }

    // Import Pages
    if (data.pages?.length > 0) {
      log(`\n📄 Importing ${data.pages.length} pages...`, 'blue');
      for (const page of data.pages) {
        await vercelPrisma.page.upsert({
          where: { id: page.id },
          update: page,
          create: page,
        });
      }
      log(`✅ Pages imported`, 'green');
    }

    // Import Users
    if (data.users?.length > 0) {
      log(`\n👤 Importing ${data.users.length} users...`, 'blue');
      for (const user of data.users) {
        await vercelPrisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
      }
      log(`✅ Users imported`, 'green');
    }

    // Import Translations
    if (data.translations?.length > 0) {
      log(`\n🌐 Importing ${data.translations.length} translations...`, 'blue');
      for (const translation of data.translations) {
        await vercelPrisma.translation.upsert({
          where: {
            key_language_namespace: {
              key: translation.key,
              language: translation.language,
              namespace: translation.namespace || '',
            }
          },
          update: translation,
          create: translation,
        });
      }
      log(`✅ Translations imported`, 'green');
    }

    // Import Media
    if (data.media?.length > 0) {
      log(`\n🖼️  Importing ${data.media.length} media files...`, 'blue');
      for (const media of data.media) {
        await vercelPrisma.media.upsert({
          where: { id: media.id },
          update: media,
          create: media,
        });
      }
      log(`✅ Media imported`, 'green');
    }

    await vercelPrisma.$disconnect();
  } catch (error) {
    log(`❌ Import failed: ${error.message}`, 'red');
    await vercelPrisma.$disconnect();
    throw error;
  }
}

async function main() {
  log('\n========================================', 'cyan');
  log('   🔄 Sync Database to Vercel', 'cyan');
  log('========================================', 'cyan');

  try {
    // Export from local
    const data = await exportLocalDatabase();

    // Import to Vercel
    await importToVercel(data);

    log('\n========================================', 'cyan');
    log('   ✅ Sync Complete!', 'green');
    log('========================================', 'cyan');
    log('\n📊 Summary:', 'yellow');
    log(`   • ${data.menus?.length || 0} menus synced`);
    log(`   • ${data.pages?.length || 0} pages synced`);
    log(`   • ${data.users?.length || 0} users synced`);
    log(`   • ${data.translations?.length || 0} translations synced`);
    log(`   • ${data.media?.length || 0} media files synced`);
    log('\n🎉 Your Vercel database is now up to date!', 'green');
    log('\n');

  } catch (error) {
    log('\n========================================', 'red');
    log('   ❌ Sync Failed', 'red');
    log('========================================', 'red');
    log(`\nError: ${error.message}`, 'red');
    log('\n💡 Troubleshooting:', 'yellow');
    log('   1. Make sure .env.production exists');
    log('   2. Check POSTGRES_PRISMA_URL is correct');
    log('   3. Verify local database exists at ./prisma/dev.db');
    log('\n');
    process.exit(1);
  }
}

main();
