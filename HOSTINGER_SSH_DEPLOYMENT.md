# 🚀 راهنمای Deployment با SSH به هاستینگر

## 📋 پیش‌نیازها

```
✅ دیتابیس: 22 صفحه آماده
✅ Admin: administrator@ivaflow.com
✅ Build: تست شده و موفق
✅ SSH Access: به هاستینگر
```

---

## 🔑 مرحله 1: اتصال SSH

```bash
ssh username@your-hostinger-domain.com
# یا
ssh username@your-server-ip
```

---

## 📦 مرحله 2: آماده‌سازی سرور

### نصب Node.js (اگر نصب نیست):
```bash
# بررسی نسخه
node -v
npm -v

# اگر نصب نیست، از cPanel Node.js App استفاده کنید
```

### ایجاد پوشه پروژه:
```bash
cd ~
mkdir -p apps/english-website
cd apps/english-website
```

---

## 📤 مرحله 3: آپلود فایلها

### روش 1: استفاده از Git (توصیه میشود)

**در لوکال:**
```bash
cd "d:\my Develop Projects\English Website"

# اگر git init نکردید:
git init
git add .
git commit -m "Ready for deployment"

# Push به GitHub/GitLab
git remote add origin YOUR_REPO_URL
git push -u origin main
```

**در سرور:**
```bash
cd ~/apps/english-website
git clone YOUR_REPO_URL .
```

### روش 2: استفاده از SCP (از ویندوز)

**در PowerShell/CMD:**
```bash
# آپلود فایلها (بدون node_modules و .next)
scp -r "d:\my Develop Projects\English Website\src" username@server:/home/username/apps/english-website/
scp -r "d:\my Develop Projects\English Website\prisma" username@server:/home/username/apps/english-website/
scp -r "d:\my Develop Projects\English Website\public" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\package.json" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\package-lock.json" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\next.config.js" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\server.js" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\tailwind.config.js" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\tsconfig.json" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\postcss.config.js" username@server:/home/username/apps/english-website/
scp "d:\my Develop Projects\English Website\.env.production" username@server:/home/username/apps/english-website/.env
```

### روش 3: استفاده از FileZilla/WinSCP
1. اتصال به سرور با SFTP
2. آپلود پوشه‌های: `src/`, `prisma/`, `public/`
3. آپلود فایلها: `package.json`, `server.js`, `.env.production`, etc.

---

## 🔧 مرحله 4: تنظیم Environment

**در سرور:**
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

**⚠️ مهم:** `NEXTAUTH_URL` را به دامنه واقعی تغییر دهید!

---

## 📥 مرحله 5: نصب Dependencies

```bash
cd ~/apps/english-website

# نصب packages
npm install --production

# Generate Prisma Client
npx prisma generate
```

---

## 🗄️ مرحله 6: آپلود دیتابیس

### از لوکال:
```bash
# در PowerShell/CMD
scp "d:\my Develop Projects\English Website\prisma\dev.db" username@server:/home/username/apps/english-website/prisma/
```

### یا در سرور (اگر دیتابیس خالی است):
```bash
cd ~/apps/english-website
npx prisma db push
# سپس seed کنید اگر لازم است
```

---

## 🏗️ مرحله 7: Build

```bash
cd ~/apps/english-website

# Build برای production
npm run build
```

**اگر خطا داد:**
```bash
# بررسی لاگ
npm run build 2>&1 | tee build.log

# اگر مشکل memory بود:
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 🚀 مرحله 8: راه‌اندازی با PM2

### نصب PM2 (اگر نصب نیست):
```bash
npm install -g pm2
```

### شروع Application:
```bash
cd ~/apps/english-website

# شروع با PM2
pm2 start npm --name "english-website" -- start

# ذخیره تنظیمات
pm2 save

# راه‌اندازی خودکار در بوت
pm2 startup
```

---

## ✅ مرحله 9: تست

### بررسی وضعیت:
```bash
# وضعیت PM2
pm2 status

# لاگها
pm2 logs english-website

# مانیتورینگ
pm2 monit
```

### تست در مرورگر:
```
https://your-domain.com
https://your-domain.com/admin/login
```

---

## 🔄 مرحله 10: تنظیم Nginx (اختیاری)

اگر از Nginx استفاده می‌کنید:

```bash
sudo nano /etc/nginx/sites-available/english-website
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/english-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 مرحله 11: SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 📊 دستورات مفید

### PM2:
```bash
pm2 start english-website      # شروع
pm2 stop english-website       # توقف
pm2 restart english-website    # ریستارت
pm2 delete english-website     # حذف
pm2 logs english-website       # لاگها
pm2 monit                      # مانیتورینگ
```

### بررسی:
```bash
# پورت 3000
netstat -tulpn | grep 3000

# فضای دیسک
df -h

# حافظه
free -m

# CPU
top
```

---

## 🔄 آپدیت (بارهای بعدی)

```bash
cd ~/apps/english-website

# توقف
pm2 stop english-website

# Pull تغییرات (اگر از Git استفاده می‌کنید)
git pull origin main

# یا آپلود فایلهای جدید با SCP

# نصب dependencies جدید
npm install --production

# Build
npm run build

# شروع
pm2 restart english-website
```

---

## 🐛 عیب‌یابی

### خطا: Port already in use
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart english-website
```

### خطا: Database not found
```bash
ls -la ~/apps/english-website/prisma/dev.db
# اگر وجود ندارد، دوباره آپلود کنید
```

### خطا: Build failed
```bash
# بررسی لاگ
cat build.log

# پاک کردن cache
rm -rf .next
npm run build
```

### خطا: Permission denied
```bash
chmod 755 ~/apps/english-website
chmod 644 ~/apps/english-website/prisma/dev.db
```

---

## 📝 چک‌لیست نهایی

- [ ] SSH به سرور متصل شدید
- [ ] Node.js نصب است (18+)
- [ ] فایلها آپلود شدند
- [ ] `.env` تنظیم شد
- [ ] `npm install` اجرا شد
- [ ] `npx prisma generate` اجرا شد
- [ ] دیتابیس آپلود شد
- [ ] `npm run build` موفق بود
- [ ] PM2 راه‌اندازی شد
- [ ] سایت در مرورگر باز می‌شود
- [ ] Admin login کار می‌کند

---

## 🎉 تمام!

سایت شما روی هاستینگر زنده است! 🚀

**URL:** https://your-domain.com
**Admin:** https://your-domain.com/admin/login