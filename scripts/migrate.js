#!/usr/bin/env node

/**
 * Build-time database migration.
 *
 * Applies pending Prisma migrations with `prisma migrate deploy`, which only
 * ever runs the reviewed SQL in prisma/migrations. If that fails, the build
 * fails: the previous deployment keeps serving and nothing is changed behind
 * your back. This script never runs `prisma db push --accept-data-loss`.
 *
 * Environment switches:
 *   SKIP_DB_MIGRATE=1  Skip the migration step (e.g. a build with no database access).
 *   ALLOW_DB_PUSH=1    If migrate deploy fails, fall back to a plain `prisma db push`.
 *                      Prisma itself refuses that push when it would lose data.
 *                      Meant for databases that were never baselined with migrations.
 */

const { execSync } = require('child_process');

const run = (command) => execSync(command, { stdio: 'inherit' });

console.log('📦 Generating Prisma Client...');
run('npx prisma generate');

if (process.env.SKIP_DB_MIGRATE === '1') {
  console.log('⏭️  SKIP_DB_MIGRATE=1 — skipping database migrations.');
  process.exit(0);
}

console.log('🗄️  Applying database migrations (prisma migrate deploy)...');
try {
  run('npx prisma migrate deploy');
  console.log('✅ Migrations applied.');
} catch (migrateError) {
  if (process.env.ALLOW_DB_PUSH !== '1') {
    console.error('❌ prisma migrate deploy failed. The build is stopped so the schema is not changed unsafely.');
    console.error('   Fix the migration, or set ALLOW_DB_PUSH=1 for a non-destructive `prisma db push`,');
    console.error('   or SKIP_DB_MIGRATE=1 to build without touching the database.');
    process.exit(1);
  }

  console.warn('⚠️  migrate deploy failed; ALLOW_DB_PUSH=1 is set, trying a non-destructive db push...');
  try {
    run('npx prisma db push --skip-generate');
    console.log('✅ Schema pushed without data loss.');
  } catch (pushError) {
    console.error('❌ prisma db push failed (it is refused when it would lose data). Build stopped.');
    process.exit(1);
  }
}
