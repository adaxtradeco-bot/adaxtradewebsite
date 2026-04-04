/**
 * Add isHomepage field to existing pages
 * Run: npx tsx scripts/add-homepage-field.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding isHomepage field to database...');

  try {
    // This will be handled by Prisma migration
    // Just ensure no page is marked as homepage initially
    await prisma.page.updateMany({
      data: { isHomepage: false },
    });

    console.log('✅ Database updated successfully');
    console.log('You can now set a page as homepage from the admin panel');
  } catch (error) {
    console.error('❌ Error updating database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
