# چکلیست آماده‌سازی برای Deployment

## ✅ وضعیت فعلی پروژه

### فایلهای اصلی:
- [x] `package.json` - آماده
- [x] `next.config.js` - آماده  
- [x] `server.js` - ساخته شد
- [x] `.env.production` - ساخته شد
- [x] `prisma/schema.prisma` - آماده
- [x] `prisma/dev.db` - موجود

### Build و Test:
- [x] `npm run build` - موفق ✅
- [x] Prisma Client - تولید شد ✅
- [x] TypeScript - کامپایل شد ✅

## 🚀 آماده برای Deployment

### مراحل باقیمانده:

1. **تنظیم کلیدهای امنیتی:**
   ```bash
   # تولید JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # تولید NEXTAUTH_SECRET  
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **آپلود به هاستینگر:**
   - فایلهای پروژه (بدون `node_modules` و `.next`)
   - فایل `prisma/dev.db`
   - فایل `.env.production` (با کلیدهای جدید)

3. **در cPanel هاستینگر:**
   ```bash
   npm install --production
   npx prisma generate
   npm run build
   ```

4. **تنظیم Node.js App:**
   - Application Root: public_html
   - Startup File: server.js
   - Node.js Version: 18.x+

## 📋 فایلهای مورد نیاز برای آپلود:

### ضروری:
- `src/` - کل پوشه
- `prisma/` - شامل schema.prisma و dev.db
- `public/` - تصاویر و فایلهای استاتیک
- `package.json`
- `package-lock.json`
- `next.config.js`
- `server.js`
- `tailwind.config.js`
- `tsconfig.json`
- `postcss.config.js`
- `.env.production`

### اختیاری:
- `README.md`
- `deploy-to-hostinger.md`
- `DEPLOYMENT_CHECKLIST.md`

### نباید آپلود شود:
- `node_modules/`
- `.next/`
- `.git/`
- `scripts/`
- فایلهای `.env` محلی

## ⚠️ نکات مهم:

1. **امنیت:**
   - کلیدهای JWT_SECRET و NEXTAUTH_SECRET را تغییر دهید
   - پسورد ادمین را تغییر دهید
   - NEXTAUTH_URL را به دامنه اصلی تغییر دهید

2. **دیتابیس:**
   - فایل `prisma/dev.db` حتماً آپلود شود
   - مسیر DATABASE_URL در .env.production درست باشد

3. **Performance:**
   - تصاویر در `public/assets/` موجود باشند
   - فقط dependencies ضروری نصب شوند

## 🔧 عیبیابی:

### اگر سایت باز نشد:
1. لاگهای Node.js App را بررسی کنید
2. مسیر فایلها را چک کنید  
3. مجوزات فایلها را بررسی کنید (755 برای پوشه‌ها، 644 برای فایلها)

### اگر ادمین پنل کار نکرد:
1. فایل دیتابیس آپلود شده؟
2. کلیدهای .env.production درست هستند؟
3. Prisma client تولید شده؟

## 📞 پشتیبانی:

اگر مشکلی پیش آمد:
1. لاگهای خطا را بررسی کنید
2. راهنمای `deploy-to-hostinger.md` را مطالعه کنید
3. با پشتیبانی هاستینگر تماس بگیرید

---

## ✅ وضعیت: آماده برای Deployment!

همه چیز آماده است. فقط کلیدهای امنیتی را تولید کنید و فایلها را آپلود کنید.