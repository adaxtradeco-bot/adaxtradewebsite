# ⚡ راه حل سریع - npm command not found

## 🎯 راه حل 1: نصب nvm و Node.js

در سرور اجرا کنید:

```bash
# نصب nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# بارگذاری nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# نصب Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# بررسی
node -v
npm -v
```

بعد ادامه دهید:
```bash
cd ~/apps/english-website
npm install --production
npx prisma generate
npm run build
```

---

## 🎯 راه حل 2: Build در لوکال و آپلود

### در ویندوز:

```bash
cd "d:\my Develop Projects\English Website"

# Build
npm run build

# نصب production dependencies
npm install --production
```

### آپلود فایلها:

```bash
# آپلود .next
scp -P 65002 -r .next u333279351@82.198.227.28:~/apps/english-website/

# آپلود node_modules
scp -P 65002 -r node_modules u333279351@82.198.227.28:~/apps/english-website/
```

### در سرور:

```bash
cd ~/apps/english-website

# اگر node دارید:
node server.js

# اگر node هم ندارید، از cPanel استفاده کنید
```

---

## 🎯 راه حل 3: استفاده از cPanel

1. به cPanel بروید: https://hpanel.hostinger.com
2. "Node.js" را پیدا کنید
3. Application بسازید:
   - Root: `/home/u333279351/apps/english-website`
   - Startup: `server.js`
   - Version: 18.x
4. روی "Start" کلیک کنید

---

## ✅ بعد از حل مشکل

```bash
cd ~/apps/english-website
npm install --production
npx prisma generate
npm run build
node server.js
```

یا با PM2:
```bash
npm install -g pm2
pm2 start npm --name "ivaflow" -- start
pm2 save
```