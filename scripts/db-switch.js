/**
 * Database Switch Script
 * Usage:
 *   node scripts/db-switch.js sqlite      → local development
 *   node scripts/db-switch.js postgres    → Vercel / production
 */

const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const sqliteSchema = path.join(__dirname, '../prisma/schema.sqlite.prisma');
const postgresSchema = path.join(__dirname, '../prisma/schema.postgresql.prisma');
const envPath = path.join(__dirname, '../.env');

if (!['sqlite', 'postgres'].includes(mode)) {
  console.error('❌  Usage: node scripts/db-switch.js [sqlite|postgres]');
  process.exit(1);
}

// --- backup current schema as sqlite if not exists ---
if (!fs.existsSync(sqliteSchema)) {
  fs.copyFileSync(schemaPath, sqliteSchema);
}

// --- copy target schema ---
const source = mode === 'sqlite' ? sqliteSchema : postgresSchema;
fs.copyFileSync(source, schemaPath);

// --- update .env DATABASE_URL ---
let env = fs.readFileSync(envPath, 'utf8');

if (mode === 'sqlite') {
  env = env
    .replace(/^DATABASE_URL=.*/m, 'DATABASE_URL="file:./prisma/dev.db"')
    .replace(/^# DATABASE_URL="postgres/m, '# DATABASE_URL="postgres');
} else {
  // uncomment postgres URL
  env = env.replace(
    /^# DATABASE_URL="(postgres[^"]+)"/m,
    'DATABASE_URL="$1"'
  );
  // comment out sqlite URL
  env = env.replace(
    /^DATABASE_URL="file:.*"/m,
    '# DATABASE_URL="file:./prisma/dev.db"'
  );
}

fs.writeFileSync(envPath, env);

console.log(`✅  Switched to ${mode === 'sqlite' ? 'SQLite (local)' : 'PostgreSQL (Vercel)'}`);
console.log('👉  Run: npx prisma generate');
if (mode === 'postgres') {
  console.log('👉  Run: npx prisma db push   (first time only)');
}
