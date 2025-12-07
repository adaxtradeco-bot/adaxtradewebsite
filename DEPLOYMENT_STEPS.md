# ⚡ مراحل Deployment - خلاصه

## 🎯 مرحله 1: Push به GitHub

```bash
cd "d:\my Develop Projects\English Website"
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/omidhb/english-website.git
git push -u origin main
```

---

## 🎯 مرحله 2: Clone در سرور

```bash
# اتصال
ssh -p 65002 u333279351@82.198.227.28

# Clone
cd ~
mkdir -p apps/english-website
cd apps/english-website
git clone https://github.com/omidhb/english-website.git .
```

---

## 🎯 مرحله 3: تنظیم Environment

```bash
cat > .env << 'EOF'
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-please"
ADMIN_EMAIL="administrator@ivaflow.com"
ADMIN_PASSWORD="IVAFlow@2024#SecureAdmin!Prod"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-in-production"
NEXTAUTH_URL="https://ivaflow.com"
NODE_ENV="production"
EOF
```

---

## 🎯 مرحله 4: نصب و Build

```bash
npm install --production
npx prisma generate
npm run build
```

---

## 🎯 مرحله 5: آپلود دیتابیس

### در ویندوز (Terminal جدید):
```bash
scp -P 65002 "d:\my Develop Projects\English Website\prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/
```

### یا استفاده از script:
```bash
upload-database.bat
```

---

## 🎯 مرحله 6: راهاندازی

```bash
# در سرور
pm2 start npm --name "english-website" -- start
pm2 save
```

---

## ✅ تست

```bash
pm2 status
pm2 logs english-website
```

**مرورگر:** https://ivaflow.com

---

## 🔄 آپدیت بعدی

### کد تغییر کرد:
```bash
# لوکال
git add .
git commit -m "Update"
git push

# سرور
ssh -p 65002 u333279351@82.198.227.28
cd ~/apps/english-website
pm2 stop english-website
git pull
npm install --production
npm run build
pm2 restart english-website
```

### دیتابیس تغییر کرد:
```bash
# لوکال
upload-database.bat

# سرور
pm2 restart english-website
```

---

## 📞 دستورات سریع

```bash
# اتصال SSH
ssh -p 65002 u333279351@82.198.227.28

# آپلود دیتابیس
scp -P 65002 "prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/

# ریستارت
pm2 restart english-website

# لاگها
pm2 logs english-website
```