# ⚡ راهنمای سریع Deployment

## 🚀 دستورات سریع

### 1️⃣ اتصال SSH
```bash
ssh username@your-server.com
```

### 2️⃣ آپلود فایلها (از ویندوز)
```bash
deploy-ssh.bat
```

### 3️⃣ در سرور
```bash
cd ~/apps/english-website
npm install --production
npx prisma generate
npm run build
pm2 start npm --name "english-website" -- start
pm2 save
```

---

## 📋 چکلیست 5 دقیقهای

```
□ اتصال SSH
□ آپلود فایلها
□ npm install
□ prisma generate
□ npm run build
□ pm2 start
□ تست سایت
```

---

## 🔐 اطلاعات مهم

```
Admin Email:    administrator@ivaflow.com
Admin Password: IVAFlow@2024#SecureAdmin!Prod
Database:       prisma/dev.db (22 pages)
Port:           3000
```

---

## 📦 فایلهای ضروری

```
✅ src/
✅ prisma/ (+ dev.db)
✅ public/
✅ package.json
✅ server.js
✅ .env.production → .env
✅ next.config.js
✅ tailwind.config.js
✅ tsconfig.json
```

---

## ⚡ دستورات یک خطی

### آپلود سریع:
```bash
scp -r src prisma public package*.json server.js *.config.js tsconfig.json .env.production user@server:~/apps/english-website/
```

### نصب و راهاندازی:
```bash
ssh user@server "cd ~/apps/english-website && npm install --production && npx prisma generate && npm run build && pm2 start npm --name english-website -- start"
```

---

## 🔄 آپدیت سریع

```bash
# در سرور
cd ~/apps/english-website
pm2 stop english-website
git pull  # یا آپلود فایلهای جدید
npm install --production
npm run build
pm2 restart english-website
```

---

## 🐛 حل مشکلات سریع

### سایت باز نمیشود:
```bash
pm2 logs english-website
pm2 restart english-website
```

### Build خطا میدهد:
```bash
rm -rf .next node_modules
npm install
npm run build
```

### دیتابیس کار نمیکند:
```bash
ls -la prisma/dev.db
npx prisma generate
```

---

## 📞 پشتیبانی

راهنمای کامل: `HOSTINGER_SSH_DEPLOYMENT.md`