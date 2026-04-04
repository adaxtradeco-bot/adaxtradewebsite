const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportData() {
  try {
    console.log('🔄 Starting database export...\n')

    const data = {
      users: await prisma.user.findMany(),
      pages: await prisma.page.findMany(),
      translations: await prisma.translation.findMany(),
      media: await prisma.media.findMany(),
      sectionTemplates: await prisma.sectionTemplate.findMany(),
      menus: await prisma.menu.findMany(),
    }

    // Statistics
    console.log('📊 Export Statistics:')
    console.log(`   Users: ${data.users.length}`)
    console.log(`   Pages: ${data.pages.length}`)
    console.log(`   Translations: ${data.translations.length}`)
    console.log(`   Media: ${data.media.length}`)
    console.log(`   Section Templates: ${data.sectionTemplates.length}`)
    console.log(`   Menus: ${data.menus.length}`)
    console.log()

    // Save to file
    const backupPath = path.join(process.cwd(), 'database-backup.json')
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))

    console.log(`✅ Data exported successfully!`)
    console.log(`📁 File: ${backupPath}`)
    console.log(`📦 Size: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`)

  } catch (error) {
    console.error('❌ Export failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
