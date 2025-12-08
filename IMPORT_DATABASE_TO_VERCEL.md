# 📥 Import Database to Vercel

## دیتابیس شامل:
- ✅ **2 منو** (EN + AR) با تمام تنظیمات
- ✅ **22 صفحه** با تمام محتوا و builder data
- ✅ **1 کاربر ادمین**

---

## 🚀 روش 1: Import از طریق Vercel CLI (توصیه میشه)

### مرحله 1: نصب و لاگین
```bash
# نصب Vercel CLI (اگر نداری)
npm i -g vercel

# لاگین
vercel login

# لینک پروژه
cd "d:\my Develop Projects\English Website"
vercel link
```

### مرحله 2: دریافت Environment Variables
```bash
# دریافت متغیرهای محیطی از Vercel
vercel env pull .env.vercel
```

### مرحله 3: تنظیم DATABASE_URL
```bash
# Windows CMD
set DATABASE_URL=<کپی کن از .env.vercel فایل POSTGRES_PRISMA_URL>

# یا PowerShell
$env:DATABASE_URL="<کپی کن از .env.vercel فایل POSTGRES_PRISMA_URL>"
```

### مرحله 4: اجرای Import
```bash
npx tsx import-full-database.ts
```

---

## 🔧 روش 2: Import دستی از Vercel Dashboard

### مرحله 1: دریافت Connection String
1. برو به https://vercel.com/dashboard
2. انتخاب پروژه
3. Storage → Postgres Database
4. کلیک روی "Connect"
5. کپی کردن `POSTGRES_PRISMA_URL`

### مرحله 2: اجرای Import
```bash
# تنظیم DATABASE_URL
set DATABASE_URL=<POSTGRES_PRISMA_URL که کپی کردی>

# اجرای import
npx tsx import-full-database.ts
```

---

## 📋 بررسی Import

بعد از import موفق، این موارد رو چک کن:

### 1. Prisma Studio
```bash
# باز کردن Prisma Studio
set DATABASE_URL=<POSTGRES_PRISMA_URL>
npx prisma studio
```

چک کن:
- [ ] جدول Menu: 2 رکورد (EN + AR)
- [ ] جدول Page: 22 رکورد
- [ ] جدول User: 1 رکورد

### 2. سایت Vercel
برو به سایت و چک کن:
- [ ] منوی header نمایش داده میشه
- [ ] صفحات باز میشن
- [ ] `/admin/menus` کار میکنه
- [ ] `/admin/pages` لیست صفحات رو نشون میده

---

## 🐛 عیب یابی

### خطا: "Environment variable not found"
```bash
# مطمئن شو DATABASE_URL تنظیم شده
echo %DATABASE_URL%

# اگر خالی بود، دوباره تنظیم کن
set DATABASE_URL=postgresql://...
```

### خطا: "Connection refused"
- مطمئن شو از `POSTGRES_PRISMA_URL` استفاده میکنی (نه `POSTGRES_URL_NON_POOLING`)
- چک کن IP شما در Vercel whitelist باشه

### خطا: "Unique constraint failed"
```bash
# پاک کردن دیتابیس و دوباره import
npx prisma db push --force-reset
npx tsx import-full-database.ts
```

---

## 📊 محتوای دیتابیس

### منوها (2):
1. **Main Navigation (EN)** - منوی اصلی انگلیسی
   - Product (با dropdown)
   - Industries (با dropdown)
   - Partnership
   - Pricing

2. **Main Navigation (AR)** - منوی اصلی عربی
   - همان ساختار با لینک های `/ar/`

### صفحات (22):
- Home pages (EN + AR)
- Product pages (App Builder, Workflow, Form Builder)
- Industry pages (Oil & Gas, Real Estate, Healthcare, etc.)
- Partnership pages
- و سایر صفحات...

---

## ✅ بعد از Import موفق

1. **تست منوها**:
   - برو به سایت
   - چک کن منوها نمایش داده میشن
   - hover کن روی Product و Industries

2. **تست پنل ادمین**:
   - برو به `/admin/login`
   - لاگین کن با:
     - Email: `administrator@ivaflow.com`
     - Password: `IVAFlow@2024#SecureAdmin!Prod`
   - برو به `/admin/menus`
   - تست کن Menu Builder

3. **تست صفحات**:
   - برو به `/admin/pages`
   - باز کن یکی از صفحات
   - تست کن Page Builder

---

## 🎉 تمام!

همه چیز آماده است. دیتابیس کامل import شد!
