# 🔄 Sync Database to Vercel

## استفاده خیلی ساده:

```bash
node sync-to-vercel.js
```

همین! 🎉

---

## چه کاری انجام میده؟

این اسکریپت به صورت خودکار:

1. ✅ دیتابیس لوکال (SQLite) رو export میکنه
2. ✅ به دیتابیس Vercel (PostgreSQL) متصل میشه
3. ✅ تمام داده ها رو sync میکنه:
   - منوها (Menus)
   - صفحات (Pages)
   - کاربران (Users)
   - ترجمه ها (Translations)
   - فایل های مدیا (Media)

---

## پیش نیازها:

### 1. فایل `.env.production` باید وجود داشته باشه:

```env
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
```

### 2. دیتابیس لوکال باید وجود داشته باشه:
- مسیر: `./prisma/dev.db`

---

## نحوه استفاده:

### روش 1: مستقیم
```bash
node sync-to-vercel.js
```

### روش 2: با npm script (اگر اضافه کردی)
```bash
npm run sync
```

---

## خروجی:

```
========================================
   🔄 Sync Database to Vercel
========================================

📦 Step 1: Exporting local database...
✅ Exported:
   • 2 menus
   • 22 pages
   • 1 users
   • 0 translations
   • 0 media files

🚀 Step 2: Importing to Vercel...
✓ Connected to Vercel database

📋 Importing 2 menus...
✅ Menus imported

📄 Importing 22 pages...
✅ Pages imported

👤 Importing 1 users...
✅ Users imported

========================================
   ✅ Sync Complete!
========================================

📊 Summary:
   • 2 menus synced
   • 22 pages synced
   • 1 users synced
   • 0 translations synced
   • 0 media files synced

🎉 Your Vercel database is now up to date!
```

---

## عیب یابی:

### خطا: "POSTGRES_PRISMA_URL not found"
**راه حل:**
1. مطمئن شو فایل `.env.production` وجود داره
2. چک کن که `POSTGRES_PRISMA_URL` داخلش هست
3. یا به صورت دستی تنظیم کن:
   ```bash
   set POSTGRES_PRISMA_URL=postgres://...
   node sync-to-vercel.js
   ```

### خطا: "Cannot find module '@prisma/client'"
**راه حل:**
```bash
npm install
npx prisma generate
```

### خطا: "Local database not found"
**راه حل:**
مطمئن شو دیتابیس لوکال وجود داره:
```bash
dir prisma\dev.db
```

---

## چه زمانی استفاده کنم؟

این اسکریپت رو هر وقت که:
- ✅ منوها رو در لوکال تغییر دادی
- ✅ صفحات جدید ساختی یا ویرایش کردی
- ✅ محتوای سایت رو آپدیت کردی
- ✅ میخوای تغییرات لوکال رو به production بفرستی

اجرا کن!

---

## نکات مهم:

⚠️ **این اسکریپت داده های موجود در Vercel رو بروزرسانی میکنه (upsert)**
- اگر رکورد وجود داشته باشه → آپدیت میشه
- اگر رکورد وجود نداشته باشه → ساخته میشه

✅ **امن است** - داده های موجود حذف نمیشن، فقط بروزرسانی میشن

💾 **Backup خودکار** - هر بار یک فایل `database-sync.json` میسازه

---

## فایل های مرتبط:

- `sync-to-vercel.js` - اسکریپت اصلی
- `.env.production` - تنظیمات Vercel
- `database-sync.json` - آخرین export (backup)

---

## 🎯 خلاصه:

```bash
# فقط این یک دستور:
node sync-to-vercel.js

# و تمام!
```

**همین!** 🚀
