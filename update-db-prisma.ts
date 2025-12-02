/**
 * Update database using Prisma raw query
 * Run: npx tsx update-db-prisma.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding isHomepage column to Page table...');
  
  try {
    await prisma.$executeRaw`ALTER TABLE Page ADD COLUMN isHomepage BOOLEAN NOT NULL DEFAULT 0;`;
    console.log('✅ Column added successfully');
  } catch (error: any) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Column already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
