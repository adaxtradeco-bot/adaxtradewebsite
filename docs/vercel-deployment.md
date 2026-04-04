# 🚀 Vercel Deployment Guide - Multilingual System

## پیش‌نیازها

قبل از deploy، مطمئن شوید:
- ✅ Repository در GitHub push شده
- ✅ Vercel account دارید
- ✅ PostgreSQL database آماده است (Vercel Postgres یا Neon)

---

## مراحل Deploy

### 1️⃣ اتصال به Vercel

```bash
# نصب Vercel CLI (اختیاری)
npm i -g vercel

# لاگین
vercel login
```

یا از Vercel Dashboard:
- به https://vercel.com بروید
- روی "Add New Project" کلیک کنید
- Repository خود را انتخاب کنید

---

### 2️⃣ تنظیم Environment Variables

در Vercel Dashboard → Settings → Environment Variables:

#### Required Variables:

```env
# Database (از Vercel Postgres یا Neon)
DATABASE_URL=postgresql://user:password@host:5432/database

# یا اگر از Prisma Accelerate استفاده می‌کنید:
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_PASSWORD=your-secure-admin-password

# Optional
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

---

### 3️⃣ Build Settings

Vercel به صورت خودکار تشخیص می‌دهد، اما اگر نیاز بود:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

---

### 4️⃣ Deploy

```bash
# از CLI
vercel --prod

# یا از Dashboard
# فقط روی "Deploy" کلیک کنید
```

---

## 🔄 فرآیند Build در Vercel

وقتی deploy می‌کنید، این مراحل اجرا می‌شود:

```
1. npm install
   └─ postinstall: prisma generate

2. npm run build
   ├─ prisma generate (دوباره)
   ├─ prisma migrate deploy (اجرای migrations)
   └─ next build

3. npm run postbuild
   └─ node scripts/migrate-pages-to-groups.js
      (تبدیل صفحات موجود به گروه‌ها)
```

---

## ✅ بررسی موفقیت Deploy

بعد از deploy:

1. **بررسی Logs:**
   - Vercel Dashboard → Deployments → [آخرین deploy] → View Function Logs
   - باید پیام‌های زیر را ببینید:
     ```
     ✅ Prisma migrations completed
     ✅ Data migration completed
     ```

2. **تست Admin Panel:**
   - به `https://your-domain.vercel.app/admin/login` بروید
   - با ADMIN_PASSWORD لاگین کنید
   - به `/admin/pages` بروید
   - باید صفحات گروه‌بندی شده را ببینید

3. **تست API:**
   ```bash
   curl https://your-domain.vercel.app/api/admin/pages/grouped
   ```

---

## 🐛 عیب‌یابی

### مشکل: Migration اجرا نشد

**علت:** Database URL اشتباه یا دسترسی نیست

**راه‌حل:**
```bash
# بررسی connection
vercel env pull .env.local
npx prisma migrate deploy
```

### مشکل: Build failed

**علت:** Environment variables تنظیم نشده

**راه‌حل:**
- به Vercel Dashboard → Settings → Environment Variables بروید
- تمام متغیرهای لازم را اضافه کنید
- Redeploy کنید

### مشکل: صفحات گروه‌بندی نشده‌اند

**علت:** postbuild script اجرا نشده

**راه‌حل:**
```bash
# اجرای دستی migration
vercel env pull .env.local
node scripts/migrate-pages-to-groups.js
```

---

## 🔄 Redeploy بعد از تغییرات

```bash
# Push به GitHub
git add .
git commit -m "feat: add multilingual system"
git push origin main

# Vercel به صورت خودکار redeploy می‌کند
```

---

## 📊 بررسی Database

```bash
# دانلود env variables
vercel env pull .env.local

# باز کردن Prisma Studio
npx prisma studio
```

---

## 🎯 Checklist نهایی

قبل از deploy:
- [ ] تمام تغییرات commit شده
- [ ] Environment variables در Vercel تنظیم شده
- [ ] Database آماده است
- [ ] Build محلی موفق است (`npm run build`)

بعد از deploy:
- [ ] Logs بررسی شده (بدون error)
- [ ] Admin panel کار می‌کند
- [ ] صفحات گروه‌بندی شده‌اند
- [ ] API endpoints پاسخ می‌دهند

---

## 📝 نکات مهم

1. **اولین Deploy:**
   - Migration ممکن است چند دقیقه طول بکشد
   - اگر صفحه‌ای وجود نداشت، migration خطا نمی‌دهد

2. **Deploys بعدی:**
   - فقط migrations جدید اجرا می‌شوند
   - Data migration فقط صفحات بدون گروه را پردازش می‌کند

3. **Rollback:**
   - اگر مشکلی پیش آمد، از Vercel Dashboard می‌توانید به deploy قبلی برگردید

---

## 🆘 پشتیبانی

اگر مشکلی پیش آمد:
1. Vercel Logs را بررسی کنید
2. Database connection را تست کنید
3. Environment variables را چک کنید

---

**آماده Deploy! 🚀**
