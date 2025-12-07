const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdmin() {
  console.log('🔐 Updating admin credentials...\n');
  
  const adminEmail = 'administrator@ivaflow.com';
  const adminPassword = 'IVAFlow@2024#SecureAdmin!Prod';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { 
        password: hashedPassword,
        name: 'IVAFlow Administrator'
      },
      create: {
        email: adminEmail,
        name: 'IVAFlow Administrator',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('✅ Admin user updated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();