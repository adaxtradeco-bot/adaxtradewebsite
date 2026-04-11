#!/usr/bin/env node

/**
 * Simple Schema Push Script
 * Pushes schema directly without migration files
 * Use this when migrate deploy fails
 */

const { execSync } = require('child_process');

console.log('🔄 Pushing schema to database...');

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema directly
  console.log('🗄️  Pushing schema...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });

  console.log('✅ Schema pushed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Push failed:', error.message);
  console.error('⚠️  Build will continue anyway');
  process.exit(0);
}
