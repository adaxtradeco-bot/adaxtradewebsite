# 🎯 از اینجا شروع کن!

## ✅ انجام شد:
- ✅ کد به GitHub push شد
- ✅ دیتابیس export شد (22 صفحه، 1 کاربر)
- ✅ Prisma به PostgreSQL تغییر کرد
- ✅ همه چیز آماده deploy

---

## 🚀 حالا چیکار کنی؟

### باز کن: `VERCEL_SETUP_STEPS.md`

این فایل یک راهنمای کامل 10 مرحلهای داره که دقیقاً بهت میگه چیکار کنی.

---

## ⚡ خلاصه سریع:

### 1. ورود به Vercel
https://vercel.com/signup → Continue with GitHub

### 2. Import پروژه
Add New → Project → english-website → Import

### 3. ساخت دیتابیس
Storage → Create Database → Postgres → ivaflow-db

### 4. اتصال دیتابیس
Connect Project → ivaflow → Connect

### 5. Environment Variables
Settings → Environment Variables → اضافه کن:
- JWT_SECRET
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- ADMIN_EMAIL
- ADMIN_PASSWORD

### 6. Deploy
Deployments → Deploy → صبر کن 2 دقیقه

### 7. Import دیتا
```bash
# دریافت connection string از Vercel
# ساخت .env.production
npx prisma db push
node scripts/import-database.js
```

### 8. تست
https://ivaflow.vercel.app

---

## 📁 فایلهای مهم:

- **`VERCEL_SETUP_STEPS.md`** ← شروع از اینجا
- `DATABASE_MIGRATION_VERCEL.md` - جزئیات دیتابیس
- `QUICK_START_VERCEL.md` - راهنمای سریع
- `database-backup.json` - backup دیتا (محلی)

---

## 🆘 مشکل داری؟

بهم بگو تا کمکت کنم!

---

**موفق باشی! 🚀**
