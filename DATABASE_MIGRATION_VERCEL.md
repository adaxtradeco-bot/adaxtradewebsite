# 🗄️ انتقال دیتابیس و صفحات به Vercel

## مشکل فعلی:
- ✅ دیتابیس: SQLite (فایل محلی `dev.db`)
- ❌ Vercel: فایلهای محلی پشتیبانی نمیشه (serverless)

## راهحل: 3 گزینه

---

## 🎯 گزینه 1: Vercel Postgres (توصیه میشم - رایگان)

### مزایا:
- ✅ رایگان تا 256MB
- ✅ یکپارچه با Vercel
- ✅ خودکار تنظیم میشه
- ✅ Backup خودکار

### مراحل:

#### 1. ساخت دیتابیس در Vercel
```
1. برو به: https://vercel.com/dashboard
2. Storage → Create Database
3. انتخاب: Postgres
4. نام: ivaflow-db
5. Region: Washington, D.C. (iad1)
6. Create
```

#### 2. اتصال به پروژه
```
1. در صفحه دیتابیس: Connect Project
2. پروژه خودت رو انتخاب کن
3. Environment: Production, Preview, Development
4. Connect
```

✅ Environment variables خودکار اضافه میشه!

#### 3. آپدیت Prisma Schema
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // تغییر از sqlite
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

#### 4. Generate و Push
```bash
npx prisma generate
npx prisma db push
```

#### 5. انتقال دیتا (ادامه پایین ⬇️)

---

## 🎯 گزینه 2: Supabase (رایگان - قدرتمند)

### مزایا:
- ✅ رایگان تا 500MB
- ✅ PostgreSQL کامل
- ✅ Dashboard خوب
- ✅ Realtime support

### مراحل:

#### 1. ساخت پروژه
```
1. برو به: https://supabase.com
2. Sign up با GitHub
3. New Project
4. نام: ivaflow
5. Database Password: یک پسورد قوی
6. Region: انتخاب نزدیکترین
7. Create
```

#### 2. دریافت Connection String
```
1. Settings → Database
2. Connection string → URI
3. کپی کن (مثل زیر):
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

#### 3. آپدیت Prisma Schema
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 4. اضافه کردن به Vercel
```
1. Vercel Dashboard → پروژه → Settings
2. Environment Variables
3. اضافه کن:
   Key: DATABASE_URL
   Value: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
4. Save
```

#### 5. Generate و Push
```bash
# محلی
DATABASE_URL="postgresql://..." npx prisma db push

# یا در Vercel بعد از deploy خودکار اجرا میشه
```

---

## 🎯 گزینه 3: Neon (رایگان - سریع)

### مزایا:
- ✅ رایگان تا 3GB
- ✅ Serverless Postgres
- ✅ خیلی سریع
- ✅ Auto-scaling

### مراحل:

#### 1. ساخت پروژه
```
1. برو به: https://neon.tech
2. Sign up
3. Create Project
4. نام: ivaflow
5. Region: انتخاب کن
6. Create
```

#### 2. دریافت Connection String
```
1. Dashboard → Connection Details
2. کپی کن: postgresql://...
```

#### 3. مثل Supabase ادامه بده (بالا ⬆️)

---

## 📦 انتقال دیتای موجود

### مرحله 1: Export از SQLite

```bash
cd "d:\my Develop Projects\English Website"

# نصب ابزار
npm install -g prisma-db-export

# یا دستی با Prisma Studio
npx prisma studio
# بعد دستی کپی کن
```

### مرحله 2: Export به JSON (راحتتر)

ساخت اسکریپت export:

```javascript
// scripts/export-data.js
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function exportData() {
  const data = {
    users: await prisma.user.findMany(),
    pages: await prisma.page.findMany(),
    translations: await prisma.translation.findMany(),
    media: await prisma.media.findMany(),
    sectionTemplates: await prisma.sectionTemplate.findMany(),
    menus: await prisma.menu.findMany(),
  }

  fs.writeFileSync(
    'database-backup.json',
    JSON.stringify(data, null, 2)
  )

  console.log('✅ Data exported to database-backup.json')
  await prisma.$disconnect()
}

exportData()
```

اجرا:
```bash
node scripts/export-data.js
```

### مرحله 3: Import به PostgreSQL

```javascript
// scripts/import-data.js
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function importData() {
  const data = JSON.parse(fs.readFileSync('database-backup.json', 'utf8'))

  // Import Users
  for (const user of data.users) {
    await prisma.user.create({ data: user })
  }

  // Import Pages
  for (const page of data.pages) {
    await prisma.page.create({ data: page })
  }

  // Import Translations
  for (const translation of data.translations) {
    await prisma.translation.create({ data: translation })
  }

  // Import Media
  for (const media of data.media) {
    await prisma.media.create({ data: media })
  }

  // Import Section Templates
  for (const template of data.sectionTemplates) {
    await prisma.sectionTemplate.create({ data: template })
  }

  // Import Menus
  for (const menu of data.menus) {
    await prisma.menu.create({ data: menu })
  }

  console.log('✅ Data imported successfully!')
  await prisma.$disconnect()
}

importData()
```

اجرا (با PostgreSQL URL):
```bash
DATABASE_URL="postgresql://..." node scripts/import-data.js
```

---

## 🖼️ انتقال فایلهای Media

### مشکل:
فایلهای `public/uploads/` در Vercel serverless پاک میشن.

### راهحل: استفاده از Vercel Blob Storage

#### 1. فعالسازی
```
1. Vercel Dashboard → Storage
2. Create → Blob
3. نام: ivaflow-media
4. Create
```

#### 2. نصب پکیج
```bash
npm install @vercel/blob
```

#### 3. آپدیت کد آپلود
```typescript
// src/app/api/upload/route.ts
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  const blob = await put(file.name, file, {
    access: 'public',
  })

  return Response.json({ url: blob.url })
}
```

#### 4. آپلود فایلهای موجود
```javascript
// scripts/upload-media.js
const { put } = require('@vercel/blob')
const fs = require('fs')
const path = require('path')

async function uploadMedia() {
  const uploadsDir = './public/uploads'
  const files = fs.readdirSync(uploadsDir)

  for (const file of files) {
    const filePath = path.join(uploadsDir, file)
    const fileBuffer = fs.readFileSync(filePath)
    
    const blob = await put(file, fileBuffer, {
      access: 'public',
    })

    console.log(`✅ Uploaded: ${file} → ${blob.url}`)
  }
}

uploadMedia()
```

---

## 📋 چکلیست کامل

### قبل از Deploy:

- [ ] انتخاب دیتابیس (Vercel Postgres / Supabase / Neon)
- [ ] ساخت دیتابیس
- [ ] دریافت Connection String
- [ ] آپدیت `prisma/schema.prisma` به PostgreSQL
- [ ] Export دیتای SQLite: `node scripts/export-data.js`
- [ ] تست connection محلی با PostgreSQL

### بعد از Deploy:

- [ ] اضافه کردن DATABASE_URL در Vercel Environment Variables
- [ ] Redeploy پروژه
- [ ] اجرای `prisma db push` (خودکار در build)
- [ ] Import دیتا: `node scripts/import-data.js`
- [ ] آپلود media files (اگر داری)
- [ ] تست سایت

---

## 🚀 دستورات سریع

### تغییر به PostgreSQL:
```bash
# 1. آپدیت schema
# prisma/schema.prisma → provider = "postgresql"

# 2. نصب dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Push schema
DATABASE_URL="postgresql://..." npx prisma db push

# 5. Import data
DATABASE_URL="postgresql://..." node scripts/import-data.js
```

### Environment Variables در Vercel:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://ivaflow.com
NODE_ENV=production
ADMIN_EMAIL=administrator@ivaflow.com
ADMIN_PASSWORD=IVAFlow@2024#SecureAdmin!Prod
```

---

## 💡 توصیه من:

**برای شروع: Vercel Postgres**
- راحتترین
- یکپارچه
- رایگان
- کافی برای شروع

**برای آینده: Supabase**
- قدرتمندتر
- Dashboard بهتر
- امکانات بیشتر
- همچنان رایگان

---

## 🆘 مشکلات رایج

### خطا: "Provider not supported"
```bash
# مطمئن شو schema.prisma رو تغییر دادی
provider = "postgresql"  # نه sqlite
```

### خطا: "Connection refused"
```bash
# بررسی DATABASE_URL
echo $DATABASE_URL
# باید شبیه: postgresql://...
```

### دیتا import نمیشه
```bash
# اول schema رو push کن
npx prisma db push

# بعد import کن
node scripts/import-data.js
```

---

**آماده برای شروع؟ بگو کدوم گزینه رو میخوای تا کمکت کنم! 🚀**
