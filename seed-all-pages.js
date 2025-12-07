const { execSync } = require('child_process');

console.log('🌱 Seeding all pages...\n');

const scripts = [
  'scripts/seed-all-exact-pages.ts',
  'scripts/seed-industries-complete.ts',
  'scripts/seed-new-home.ts',
  'scripts/add-workflow-page.js',
  'scripts/seed-real-estate.ts',
  'scripts/seed-oilgas-complete.ts',
  'scripts/seed-partnership-2.ts',
];

let successCount = 0;
let errorCount = 0;

scripts.forEach((script, index) => {
  try {
    console.log(`\n[${index + 1}/${scripts.length}] Running ${script}...`);
    execSync(`npx tsx ${script}`, { stdio: 'inherit' });
    successCount++;
  } catch (error) {
    console.log(`⚠️  Skipped ${script} (may already exist)`);
    errorCount++;
  }
});

console.log(`\n✅ Seeding complete!`);
console.log(`   Success: ${successCount}`);
console.log(`   Skipped: ${errorCount}`);

// Check final count
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.page.count().then(count => {
  console.log(`\n📊 Total pages in database: ${count}`);
  prisma.$disconnect();
});