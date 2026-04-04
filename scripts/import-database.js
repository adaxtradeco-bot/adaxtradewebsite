const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importData() {
  try {
    console.log('🔄 Starting database import...\n')

    // Read backup file
    const backupPath = path.join(process.cwd(), 'database-backup.json')
    
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found! Run export-database.js first.')
    }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

    console.log('📊 Import Statistics:')
    console.log(`   Users: ${data.users?.length || 0}`)
    console.log(`   Pages: ${data.pages?.length || 0}`)
    console.log(`   Translations: ${data.translations?.length || 0}`)
    console.log(`   Media: ${data.media?.length || 0}`)
    console.log(`   Section Templates: ${data.sectionTemplates?.length || 0}`)
    console.log(`   Menus: ${data.menus?.length || 0}`)
    console.log()

    // Import Users
    if (data.users?.length > 0) {
      console.log('👤 Importing users...')
      for (const user of data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        })
      }
      console.log(`   ✅ ${data.users.length} users imported`)
    }

    // Import Pages
    if (data.pages?.length > 0) {
      console.log('📄 Importing pages...')
      for (const page of data.pages) {
        await prisma.page.upsert({
          where: { id: page.id },
          update: page,
          create: page,
        })
      }
      console.log(`   ✅ ${data.pages.length} pages imported`)
    }

    // Import Translations
    if (data.translations?.length > 0) {
      console.log('🌐 Importing translations...')
      for (const translation of data.translations) {
        await prisma.translation.upsert({
          where: { 
            key_language_namespace: {
              key: translation.key,
              language: translation.language,
              namespace: translation.namespace || '',
            }
          },
          update: translation,
          create: translation,
        })
      }
      console.log(`   ✅ ${data.translations.length} translations imported`)
    }

    // Import Media
    if (data.media?.length > 0) {
      console.log('🖼️  Importing media...')
      for (const media of data.media) {
        await prisma.media.upsert({
          where: { id: media.id },
          update: media,
          create: media,
        })
      }
      console.log(`   ✅ ${data.media.length} media files imported`)
    }

    // Import Section Templates
    if (data.sectionTemplates?.length > 0) {
      console.log('📐 Importing section templates...')
      for (const template of data.sectionTemplates) {
        await prisma.sectionTemplate.upsert({
          where: { id: template.id },
          update: template,
          create: template,
        })
      }
      console.log(`   ✅ ${data.sectionTemplates.length} templates imported`)
    }

    // Import Menus
    if (data.menus?.length > 0) {
      console.log('🍔 Importing menus...')
      for (const menu of data.menus) {
        await prisma.menu.upsert({
          where: { id: menu.id },
          update: menu,
          create: menu,
        })
      }
      console.log(`   ✅ ${data.menus.length} menus imported`)
    }

    console.log('\n✅ All data imported successfully!')

  } catch (error) {
    console.error('\n❌ Import failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importData()
