#!/usr/bin/env node

/**
 * Emergency: Push Schema to Production Database
 * Use this when migrations fail - pushes schema directly
 */

const { execSync } = require('child_process');

console.log('⚠️  EMERGENCY: Pushing schema directly to production...');
console.log('📍 Database:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');

try {
  // Push schema directly
  console.log('🗄️  Pushing schema...');
  execSync('npx prisma db push --skip-generate', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('✅ Schema pushed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Push failed:', error.message);
  process.exit(1);
}
