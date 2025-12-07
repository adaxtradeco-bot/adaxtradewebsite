# 🔧 راهاندازی Node.js در Hostinger

## ⚠️ مشکل: npm command not found

این یعنی Node.js در سرور شما فعال نیست. باید از cPanel تنظیم کنید.

---

## 📋 مرحله 1: فعال کردن Node.js از cPanel

### 1. ورود به cPanel:
```
https://hpanel.hostinger.com
```

### 2. پیدا کردن "Node.js":
- در cPanel به دنبال "Node.js" یا "Node.js Selector" بگردید
- یا در بخش "Software" پیدا کنید

### 3. ایجاد Node.js Application:
```
Application Root:     /home/u333279351/apps/english-website
Application URL:      ivaflow.com
Application Startup:  server.js
Node.js Version:      18.x یا بالاتر
```

### 4. کلیک روی "Create"

---

## 📋 مرحله 2: راه حل جایگزین - استفاده از nvm

اگر Node.js Selector نداشتید، از nvm استفاده کنید:

```bash
# نصب nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# بارگذاری nvm
source ~/.bashrc

# نصب Node.js
nvm install 18
nvm use 18

# بررسی
node -v
npm -v
```

---

## 📋 مرحله 3: ادامه Deployment

بعد از فعال شدن Node.js:

```bash
cd ~/apps/english-website

# نصب dependencies
npm install --production

# Generate Prisma
npx prisma generate

# Build
npm run build
```

---

## 📋 مرحله 4: راهاندازی

### روش 1: استفاده از cPanel Node.js App
- در cPanel روی "Start" کلیک کنید

### روش 2: استفاده از PM2
```bash
# نصب PM2
npm install -g pm2

# شروع
pm2 start npm --name "ivaflow" -- start
pm2 save
```

---

## 🔍 بررسی وضعیت

```bash
# بررسی Node.js
which node
node -v

# بررسی npm
which npm
npm -v

# بررسی مسیر
echo $PATH
```

---

## 📞 تماس با پشتیبانی Hostinger

اگر Node.js فعال نمیشود:

1. به پشتیبانی Hostinger پیام دهید
2. بگویید: "I need Node.js enabled for my hosting account"
3. آدرس دهید: u333279351@82.198.227.28

---

## ⚡ راه حل سریع - Build در لوکال

اگر Node.js در سرور مشکل دارد، در لوکال build کنید:

### در ویندوز:
```bash
cd "d:\my Develop Projects\English Website"

# Build
npm run build

# آپلود .next folder
scp -P 65002 -r .next u333279351@82.198.227.28:~/apps/english-website/

# آپلود node_modules (فقط production)
npm install --production
scp -P 65002 -r node_modules u333279351@82.198.227.28:~/apps/english-website/
```

### در سرور:
```bash
cd ~/apps/english-website

# فقط شروع کنید
node server.js
```

---

## 📝 چکلیست

- [ ] cPanel باز شد
- [ ] Node.js Selector پیدا شد
- [ ] Application ساخته شد
- [ ] Node.js version 18+ انتخاب شد
- [ ] `node -v` کار میکند
- [ ] `npm -v` کار میکند

---

## 🎯 مرحله بعدی

بعد از فعال شدن Node.js، به `FINAL_DEPLOYMENT_IVAFLOW.md` برگردید و از مرحله 4 ادامه دهید.