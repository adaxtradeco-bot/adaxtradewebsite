# راهنمای کامل انتقال به سرور

## مرحله 1: آماده‌سازی لوکال

### 1.1 بررسی فایل‌های ضروری
```bash
# در ویندوز لوکال
cd "d:\my Develop Projects\English Website"

# چک کردن وضعیت git
git status

# Commit تغییرات (اگر وجود دارد)
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 فایل‌های مورد نیاز برای سرور
- ✅ کد منبع (از GitHub)
- ✅ فایل دیتابیس: `prisma/dev.db`
- ✅ فایل `.env` (باید دستی ساخته شود)

---

## مرحله 2: انتقال به سرور

### 2.1 اتصال به سرور
```bash
ssh czarevitch@192.18.1.26
```

### 2.2 نصب وابستگی‌های سیستم (اگر نصب نشده)
```bash
# بررسی Node.js
node -v  # باید 18+ باشد

# بررسی npm
npm -v

# بررسی PM2
pm2 -v

# اگر PM2 نصب نیست:
npm install -g pm2
```

### 2.3 Clone کردن پروژه (اولین بار)
```bash
cd ~/apps
git clone https://github.com/omidhb/english-website.git
cd english-website
```

### 2.4 یا Pull کردن تغییرات (بار‌های بعدی)
```bash
cd ~/apps/english-website
git pull origin main
```

---

## مرحله 3: تنظیمات محیط سرور

### 3.1 ساخت فایل .env
```bash
cd ~/apps/english-website

cat > .env << 'EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://192.18.1.26:3000"
NODE_ENV="production"
EOF
```

### 3.2 انتقال فایل دیتابیس از لوکال

**روش 1: استفاده از scp (از ویندوز)**
```bash
# در PowerShell یا CMD ویندوز
scp "d:\my Develop Projects\English Website\prisma\dev.db" czarevitch@192.18.1.26:~/apps/english-website/prisma/
```

**روش 2: استفاده از WinSCP یا FileZilla**
- فایل `prisma/dev.db` را از لوکال کپی کن
- به مسیر `~/apps/english-website/prisma/` در سرور منتقل کن

---

## مرحله 4: نصب و Build

### 4.1 نصب Dependencies
```bash
cd ~/apps/english-website
npm install
```

### 4.2 Generate Prisma Client
```bash
npx prisma generate
```

### 4.3 Build پروژه
```bash
npm run build
```

**نکته مهم:** اگر خطای build گرفتی، لاگ را بررسی کن:
```bash
npm run build 2>&1 | tee build.log
```

---

## مرحله 5: راه‌اندازی با PM2

### 5.1 پاک کردن PM2 قبلی (اگر وجود دارد)
```bash
# لیست processes
pm2 list

# حذف همه
pm2 delete all

# یا حذف فقط english-website
pm2 delete english-website
```

### 5.2 شروع سرویس
```bash
cd ~/apps/english-website
pm2 start npm --name "english-website" -- start
```

### 5.3 ذخیره تنظیمات PM2
```bash
pm2 save
pm2 startup
```

### 5.4 بررسی وضعیت
```bash
# چک کردن status
pm2 status

# دیدن لاگ‌ها
pm2 logs english-website

# دیدن لاگ‌های خطا
pm2 logs english-website --err

# مانیتورینگ
pm2 monit
```

---

## مرحله 6: تست و بررسی

### 6.1 چک کردن پورت
```bash
# بررسی پورت 3000
netstat -tulpn | grep 3000

# یا
lsof -i :3000
```

### 6.2 تست در مرورگر
```
http://192.18.1.26:3000
```

### 6.3 تست لاگین ادمین
```
http://192.18.1.26:3000/admin/login

Email: admin@example.com
Password: admin123
```

---

## مرحله 7: عیب‌یابی مشکلات رایج

### خطا: ENOENT prerender-manifest.json
**علت:** Build نشده یا ناقص است
**راه‌حل:**
```bash
cd ~/apps/english-website
rm -rf .next
npm run build
pm2 restart english-website
```

### خطا: EADDRINUSE port 3000
**علت:** پورت اشغال است
**راه‌حل:**
```bash
# پیدا کردن process
lsof -i :3000

# Kill کردن
kill -9 <PID>

# یا
pm2 delete all
pm2 start npm --name "english-website" -- start
```

### خطا: Invalid credentials
**علت:** فایل `.env` وجود ندارد یا JWT_SECRET اشتباه است
**راه‌حل:**
```bash
# بررسی .env
cat ~/apps/english-website/.env

# اگر وجود ندارد، دوباره بساز (مرحله 3.1)
```

### خطا: Database not found
**علت:** فایل `prisma/dev.db` وجود ندارد
**راه‌حل:**
```bash
# بررسی فایل
ls -la ~/apps/english-website/prisma/dev.db

# اگر وجود ندارد، از لوکال کپی کن (مرحله 3.2)
```

---

## مرحله 8: به‌روزرسانی (بار‌های بعدی)

### 8.1 Pull تغییرات جدید
```bash
cd ~/apps/english-website
pm2 stop english-website
git pull origin main
npm install
npm run build
pm2 restart english-website
```

### 8.2 به‌روزرسانی دیتابیس
```bash
# از لوکال (ویندوز)
scp "d:\my Develop Projects\English Website\prisma\dev.db" czarevitch@192.18.1.26:~/apps/english-website/prisma/

# در سرور
cd ~/apps/english-website
pm2 restart english-website
```

---

## دستورات مفید PM2

```bash
# شروع
pm2 start english-website

# توقف
pm2 stop english-website

# ریستارت
pm2 restart english-website

# حذف
pm2 delete english-website

# لاگ‌ها
pm2 logs english-website
pm2 logs english-website --lines 100

# مانیتورینگ
pm2 monit

# اطلاعات کامل
pm2 show english-website

# ذخیره تنظیمات
pm2 save

# بارگذاری خودکار در بوت
pm2 startup
```

---

## چک‌لیست نهایی

- [ ] کد از GitHub pull شده
- [ ] فایل `.env` ساخته شده با تنظیمات صحیح
- [ ] فایل `prisma/dev.db` از لوکال کپی شده
- [ ] `npm install` اجرا شده
- [ ] `npx prisma generate` اجرا شده
- [ ] `npm run build` موفق بوده
- [ ] فقط یک instance از PM2 در حال اجرا است
- [ ] سایت روی `http://192.18.1.26:3000` در دسترس است
- [ ] لاگین ادمین کار می‌کند
- [ ] `pm2 save` اجرا شده

---

## نکات امنیتی

1. **تغییر JWT_SECRET در production:**
```bash
# تولید secret جدید
openssl rand -base64 32
```

2. **تغییر پسورد ادمین:**
```bash
cd ~/apps/english-website
npm run db:seed-admin
# سپس در کد seed-admin.ts پسورد را تغییر بده
```

3. **استفاده از HTTPS:**
- برای production از Nginx با SSL استفاده کن
- Let's Encrypt برای گواهی رایگان

---

## پشتیبانی و لاگ‌ها

### مکان لاگ‌های PM2
```bash
~/.pm2/logs/
```

### مشاهده لاگ‌های زنده
```bash
pm2 logs english-website --lines 100 --raw
```

### خروجی لاگ به فایل
```bash
pm2 logs english-website > ~/deployment.log 2>&1
```
