#!/usr/bin/env node

/**
 * Post-build script for Vercel deployment
 * Runs Prisma migrations and data migration
 */

const { execSync } = require('child_process');

console.log('🚀 Starting post-build process...\n');

try {
  // 1. اجرای Prisma migrations
  console.log('📦 Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Prisma migrations completed\n');

  // 2. اجرای data migration (تبدیل صفحات موجود به گروهها)
  console.log('🔄 Running data migration...');
  execSync('node scripts/migrate-pages-to-groups.js', { stdio: 'inherit' });
  console.log('✅ Data migration completed\n');

  console.log('🎉 Post-build process completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Post-build process failed:', error.message);
  // در صورت خطا، build را fail نکن (برای اولین deploy)
  console.log('⚠️  Continuing despite errors (first deploy)');
  process.exit(0);
}
