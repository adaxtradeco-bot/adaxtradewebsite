const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check if tables exist
    console.log('\n📋 Checking tables...');
    
    try {
      const pageCount = await prisma.page.count();
      console.log(`✅ Page table exists - Records: ${pageCount}`);
      
      // Show some sample data
      if (pageCount > 0) {
        const pages = await prisma.page.findMany({
          take: 3,
          select: {
            id: true,
            slug: true,
            title: true,
            isBuilderPage: true
          }
        });
        console.log('📄 Sample pages:', pages);
      }
    } catch (error) {
      console.log('❌ Page table error:', error.message);
    }
    
    try {
      const formCount = await prisma.form.count();
      console.log(`✅ Form table exists - Records: ${formCount}`);
    } catch (error) {
      console.log('❌ Form table error:', error.message);
    }
    
    try {
      const submissionCount = await prisma.formSubmission.count();
      console.log(`✅ FormSubmission table exists - Records: ${submissionCount}`);
    } catch (error) {
      console.log('❌ FormSubmission table error:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('💡 Error details:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkDatabase();