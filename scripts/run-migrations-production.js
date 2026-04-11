#!/usr/bin/env node

/**
 * Run Prisma Migrations on Production Database
 * This script should be run manually on production to apply pending migrations
 */

const { execSync } = require('child_process');

console.log('🔄 Running production migrations...');
console.log('📍 Database:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');

try {
  // Run migrations
  console.log('🗄️  Applying migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('✅ Migrations completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
