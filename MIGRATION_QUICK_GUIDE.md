# 🚀 راهنمای سریع انتقال به Vercel

## گام به گام (15 دقیقه)

---

## 📋 مرحله 1: Export دیتای فعلی (2 دقیقه)

```bash
cd "d:\my Develop Projects\English Website"

# Export دیتا از SQLite
node scripts/export-database.js
```

✅ فایل `database-backup.json` ساخته میشه

---

## 📋 مرحله 2: ساخت دیتابیس PostgreSQL (3 دقیقه)

### گزینه A: Vercel Postgres (راحتتر)

1. برو به: https://vercel.com/dashboard
2. **Storage** → **Create Database** → **Postgres**
3. نام: `ivaflow-db`
4. Region: `Washington, D.C. (iad1)`
5. **Create**

### گزینه B: Supabase (قدرتمندتر)

1. برو به: https://supabase.com
2. **New Project**
3. نام: `ivaflow`
4. Password: یک پسورد قوی
5. Region: انتخاب کن
6. **Create**
7. Settings → Database → کپی کن: `Connection string`

---

## 📋 مرحله 3: آپدیت Prisma Schema (1 دقیقه)

باز کن: `prisma/schema.prisma`

### اگر Vercel Postgres:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

### اگر Supabase:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📋 مرحله 4: تست محلی (2 دقیقه)

### اگر Vercel Postgres:
```bash
# دریافت connection string از Vercel Dashboard
# .env.quickstart → کپی کن

# ساخت .env.production
echo POSTGRES_PRISMA_URL="postgresql://..." > .env.production
echo POSTGRES_URL_NON_POOLING="postgresql://..." >> .env.production
```

### اگر Supabase:
```bash
# ساخت .env.production
echo DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" > .env.production
```

### Push Schema:
```bash
# Load production env
set -a && source .env.production && set +a

# یا در Windows:
# کپی محتوای .env.production به .env.local موقتاً

npx prisma generate
npx prisma db push
```

---

## 📋 مرحله 5: Import دیتا (2 دقیقه)

```bash
# با production database
node scripts/import-database.js
```

✅ همه دیتا منتقل شد!

---

## 📋 مرحله 6: Push به GitHub (2 دقیقه)

```bash
git add .
git commit -m "Migrate to PostgreSQL for Vercel"
git push
```

---

## 📋 مرحله 7: Deploy به Vercel (3 دقیقه)

### اگر اولین بار:
1. https://vercel.com/new
2. Import repository
3. **Deploy**

### اگر Vercel Postgres استفاده کردی:
✅ Environment variables خودکار اضافه شده!

### اگر Supabase استفاده کردی:
1. Vercel Dashboard → پروژه → **Settings**
2. **Environment Variables**
3. اضافه کن:
   ```
   Key: DATABASE_URL
   Value: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. **Save**
5. **Redeploy**

---

## ✅ تمام!

سایت آماده است:
```
https://your-project.vercel.app
```

---

## 🔍 بررسی

- [ ] سایت باز میشه
- [ ] صفحات نمایش داده میشن
- [ ] Admin panel کار میکنه
- [ ] دیتاها موجوده

---

## 🆘 مشکل داری؟

### Build خطا میده:
```bash
# تست محلی
npm run build
```

### دیتا نمایش داده نمیشه:
```bash
# بررسی connection
node scripts/import-database.js
```

### Environment variables:
```
Vercel Dashboard → Settings → Environment Variables
بررسی کن DATABASE_URL یا POSTGRES_PRISMA_URL وجود داره
```

---

## 📝 نکات مهم

1. **فایل backup رو نگه دار**: `database-backup.json`
2. **Environment variables رو یادداشت کن**
3. **پسوردها رو امن نگه دار**
4. **تست کامل بعد از deploy**

---

## 🔄 آپدیت بعدی

```bash
# تغییرات رو commit کن
git add .
git commit -m "Update content"
git push

# Vercel خودکار deploy میکنه
```

---

**موفق باشی! 🎉**
