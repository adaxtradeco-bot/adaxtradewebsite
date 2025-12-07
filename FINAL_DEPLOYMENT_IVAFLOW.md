# 🚀 Deployment نهایی - IVAFlow.com

## 📋 اطلاعات پروژه

```
Domain:  https://ivaflow.com
GitHub:  https://github.com/omidhb/english-website
SSH:     ssh -p 65002 u333279351@82.198.227.28
User:    u333279351
IP:      82.198.227.28
Port:    65002
```

---

## ⚡ مراحل Deployment

### 1️⃣ Push به GitHub (لوکال - ویندوز)

```bash
cd "d:\my Develop Projects\English Website"

# اگر git init نکردید:
git init

# اضافه کردن .gitignore
echo node_modules/ > .gitignore
echo .next/ >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo prisma/dev.db >> .gitignore

# Commit
git add .
git commit -m "Ready for production - IVAFlow"

# اضافه کردن remote
git remote add origin https://github.com/omidhb/english-website.git

# Push
git push -u origin main
```

---

### 2️⃣ اتصال به سرور و Clone

```bash
# اتصال SSH
ssh -p 65002 u333279351@82.198.227.28

# ایجاد پوشه
cd ~
mkdir -p apps/english-website
cd apps/english-website

# Clone از GitHub
git clone https://github.com/omidhb/english-website.git .
```

---

### 3️⃣ تنظیم Environment

```bash
cd ~/apps/english-website

# ایجاد .env
cat > .env << 'EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="IVAFlow2024SecureProductionKey!@#$%"
ADMIN_EMAIL="administrator@ivaflow.com"
ADMIN_PASSWORD="IVAFlow@2024#SecureAdmin!Prod"

# Next.js
NEXTAUTH_SECRET="IVAFlow2024NextAuthSecretKey!@#$%^&*()"
NEXTAUTH_URL="https://ivaflow.com"
NODE_ENV="production"
EOF
```

---

### 4️⃣ نصب Dependencies

```bash
cd ~/apps/english-website

# نصب packages
npm install --production

# Generate Prisma Client
npx prisma generate
```

---

### 5️⃣ آپلود دیتابیس (Terminal جدید در ویندوز)

```bash
scp -P 65002 "d:\my Develop Projects\English Website\prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/
```

**یا استفاده از script:**
```bash
upload-database.bat
```

---

### 6️⃣ Build

```bash
cd ~/apps/english-website

# Build برای production
npm run build
```

**اگر خطای memory داد:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

### 7️⃣ راهاندازی با PM2

```bash
# نصب PM2 (اگر نصب نیست)
npm install -g pm2

# شروع application
cd ~/apps/english-website
pm2 start npm --name "ivaflow" -- start

# ذخیره تنظیمات
pm2 save

# راهاندازی خودکار در بوت
pm2 startup
```

---

### 8️⃣ تست

```bash
# بررسی وضعیت
pm2 status

# دیدن لاگها
pm2 logs ivaflow

# بررسی پورت
netstat -tulpn | grep 3000
```

**تست در مرورگر:**
```
https://ivaflow.com
https://ivaflow.com/admin/login
```

**اطلاعات ورود:**
```
Email:    administrator@ivaflow.com
Password: IVAFlow@2024#SecureAdmin!Prod
```

---

## 🔄 آپدیت بعدی

### وقتی کد تغییر کرد:

**لوکال:**
```bash
cd "d:\my Develop Projects\English Website"
git add .
git commit -m "Update description"
git push origin main
```

**سرور:**
```bash
ssh -p 65002 u333279351@82.198.227.28
cd ~/apps/english-website
pm2 stop ivaflow
git pull origin main
npm install --production
npm run build
pm2 restart ivaflow
```

### وقتی دیتابیس تغییر کرد:

**لوکال:**
```bash
scp -P 65002 "d:\my Develop Projects\English Website\prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/
```

**سرور:**
```bash
pm2 restart ivaflow
```

---

## 📊 دستورات مفید

### SSH:
```bash
# اتصال
ssh -p 65002 u333279351@82.198.227.28

# خروج
exit
```

### PM2:
```bash
pm2 list                    # لیست apps
pm2 logs ivaflow           # لاگها
pm2 restart ivaflow        # ریستارت
pm2 stop ivaflow           # توقف
pm2 delete ivaflow         # حذف
pm2 monit                  # مانیتورینگ
```

### Git:
```bash
git status                 # وضعیت
git pull                   # دریافت تغییرات
git log --oneline -5       # آخرین 5 commit
```

### بررسی سیستم:
```bash
df -h                      # فضای دیسک
free -m                    # حافظه
top                        # CPU و RAM
node -v                    # نسخه Node.js
npm -v                     # نسخه npm
```

---

## 🐛 حل مشکلات

### مشکل 1: Build failed
```bash
cd ~/apps/english-website
rm -rf .next node_modules
npm install
npm run build
```

### مشکل 2: Port already in use
```bash
pm2 delete all
pm2 start npm --name "ivaflow" -- start
```

### مشکل 3: Database not found
```bash
ls -la ~/apps/english-website/prisma/dev.db
# اگر نیست، دوباره آپلود کنید
```

### مشکل 4: Permission denied
```bash
chmod 755 ~/apps/english-website
chmod 644 ~/apps/english-website/prisma/dev.db
```

---

## 📝 چکلیست نهایی

### قبل از Deployment:
- [ ] کد در GitHub push شد
- [ ] دیتابیس 22 صفحه دارد
- [ ] `.gitignore` تنظیم شد

### در سرور:
- [ ] SSH متصل شد
- [ ] Git clone انجام شد
- [ ] `.env` با domain صحیح ساخته شد
- [ ] `npm install` موفق بود
- [ ] `npx prisma generate` اجرا شد
- [ ] دیتابیس آپلود شد
- [ ] `npm run build` موفق بود
- [ ] PM2 شروع شد

### تست نهایی:
- [ ] `pm2 status` سبز است
- [ ] https://ivaflow.com باز میشود
- [ ] Admin login کار میکند
- [ ] صفحات نمایش داده میشوند

---

## 🎉 تمام!

سایت IVAFlow.com زنده است! 🚀

**URLs:**
- Website: https://ivaflow.com
- Admin: https://ivaflow.com/admin/login

**Credentials:**
- Email: administrator@ivaflow.com
- Password: IVAFlow@2024#SecureAdmin!Prod

**Database:**
- 22 صفحه آماده
- Admin user فعال
- همه sections موجود