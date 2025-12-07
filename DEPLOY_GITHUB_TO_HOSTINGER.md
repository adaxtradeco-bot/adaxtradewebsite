# 🚀 Deployment از GitHub به Hostinger

## 📋 اطلاعات سرور شما

```
SSH: ssh -p 65002 u333279351@82.198.227.28
User: u333279351
IP: 82.198.227.28
Port: 65002
```

---

## 🎯 مرحله 1: آماده کردن GitHub

### در لوکال (ویندوز):

```bash
cd "d:\my Develop Projects\English Website"

# اگر git init نکردید:
git init

# اضافه کردن .gitignore
echo node_modules/ >> .gitignore
echo .next/ >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo prisma/dev.db >> .gitignore

# Commit همه فایلها
git add .
git commit -m "Ready for production deployment"

# اضافه کردن GitHub remote (URL خودتان را بگذارید)
git remote add origin https://github.com/YOUR_USERNAME/english-website.git

# Push به GitHub
git push -u origin main
```

**⚠️ مهم:** دیتابیس را push نکنید! فقط کد را push کنید.

---

## 🔐 مرحله 2: اتصال به سرور

```bash
ssh -p 65002 u333279351@82.198.227.28
```

---

## 📦 مرحله 3: بررسی Node.js در سرور

```bash
# بررسی نسخه Node.js
node -v
npm -v

# اگر نصب نیست، از cPanel Node.js App استفاده کنید
```

---

## 📁 مرحله 4: ایجاد پوشه و Clone از GitHub

```bash
# رفتن به home directory
cd ~

# ایجاد پوشه
mkdir -p apps/english-website
cd apps/english-website

# Clone از GitHub
git clone https://github.com/YOUR_USERNAME/english-website.git .

# اگر private است:
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/english-website.git .
```

---

## 🔧 مرحله 5: تنظیم Environment

```bash
cd ~/apps/english-website

# ایجاد .env
cat > .env << 'EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production-please"
ADMIN_EMAIL="administrator@ivaflow.com"
ADMIN_PASSWORD="IVAFlow@2024#SecureAdmin!Prod"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret-key-change-in-production"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
EOF
```

**⚠️ تغییر دهید:** `NEXTAUTH_URL` را به دامنه واقعی خود تغییر دهید

---

## 📥 مرحله 6: نصب Dependencies

```bash
cd ~/apps/english-website

# نصب packages
npm install --production

# Generate Prisma Client
npx prisma generate
```

---

## 🗄️ مرحله 7: آپلود دیتابیس از لوکال

### در ویندوز (PowerShell یا CMD جدید):

```bash
scp -P 65002 "d:\my Develop Projects\English Website\prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/
```

**⚠️ دقت:** از `-P` (حرف بزرگ) برای پورت استفاده کنید

---

## 🏗️ مرحله 8: Build در سرور

```bash
cd ~/apps/english-website

# Build
npm run build
```

**اگر خطای memory داد:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 🚀 مرحله 9: راهاندازی با PM2

```bash
# نصب PM2 (اگر نصب نیست)
npm install -g pm2

# شروع application
cd ~/apps/english-website
pm2 start npm --name "english-website" -- start

# ذخیره
pm2 save

# راهاندازی خودکار
pm2 startup
```

---

## ✅ مرحله 10: تست

```bash
# بررسی وضعیت
pm2 status

# دیدن لاگها
pm2 logs english-website

# بررسی پورت
netstat -tulpn | grep 3000
```

### تست در مرورگر:
```
http://82.198.227.28:3000
http://your-domain.com:3000
```

---

## 🔄 آپدیت بعدی (وقتی تغییر دادید)

### 1. در لوکال:
```bash
cd "d:\my Develop Projects\English Website"
git add .
git commit -m "Update description"
git push origin main
```

### 2. در سرور:
```bash
ssh -p 65002 u333279351@82.198.227.28
cd ~/apps/english-website
pm2 stop english-website
git pull origin main
npm install --production
npm run build
pm2 restart english-website
```

### 3. اگر دیتابیس تغییر کرد:
```bash
# در ویندوز
scp -P 65002 "d:\my Develop Projects\English Website\prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/

# در سرور
pm2 restart english-website
```

---

## 📊 دستورات مفید

### SSH:
```bash
# اتصال
ssh -p 65002 u333279351@82.198.227.28

# کپی فایل
scp -P 65002 local-file u333279351@82.198.227.28:~/remote-path/

# کپی پوشه
scp -P 65002 -r local-folder u333279351@82.198.227.28:~/remote-path/
```

### PM2:
```bash
pm2 list                       # لیست apps
pm2 logs english-website       # لاگها
pm2 restart english-website    # ریستارت
pm2 stop english-website       # توقف
pm2 delete english-website     # حذف
pm2 monit                      # مانیتورینگ
```

### Git:
```bash
git status                     # وضعیت
git pull                       # دریافت تغییرات
git log --oneline             # تاریخچه
```

---

## 🐛 حل مشکلات

### مشکل 1: Permission denied (publickey)
```bash
# استفاده از password authentication
ssh -p 65002 -o PreferredAuthentications=password u333279351@82.198.227.28
```

### مشکل 2: Port already in use
```bash
# پیدا کردن process
lsof -i :3000

# Kill کردن
kill -9 <PID>

# یا
pm2 delete all
pm2 start npm --name "english-website" -- start
```

### مشکل 3: Build failed
```bash
# پاک کردن و دوباره
rm -rf .next node_modules
npm install
npm run build
```

### مشکل 4: Database not found
```bash
# بررسی
ls -la ~/apps/english-website/prisma/dev.db

# اگر نیست، دوباره آپلود کنید
```

---

## 📝 چکلیست کامل

### آماده سازی:
- [ ] کد در GitHub push شد
- [ ] دیتابیس محلی آماده است (22 صفحه)
- [ ] `.env.production` تنظیم شد

### در سرور:
- [ ] SSH متصل شد
- [ ] Git clone انجام شد
- [ ] `.env` ساخته شد
- [ ] `npm install` اجرا شد
- [ ] `npx prisma generate` اجرا شد
- [ ] دیتابیس آپلود شد
- [ ] `npm run build` موفق بود
- [ ] PM2 شروع شد

### تست:
- [ ] `pm2 status` سبز است
- [ ] سایت در مرورگر باز میشود
- [ ] Admin login کار میکند

---

## 🎉 تمام!

سایت شما زنده است! 🚀

**Admin:**
- Email: administrator@ivaflow.com
- Password: IVAFlow@2024#SecureAdmin!Prod