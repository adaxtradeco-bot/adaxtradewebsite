# دستورات سریع سرور

## 🔥 نصب کامل از صفر (پاک کردن همه چیز)

```bash
# 1. کپی فایل دیتابیس از ویندوز
scp "d:\my Develop Projects\English Website\prisma\dev.db" czarevitch@192.18.1.26:~/

# 2. اتصال به سرور
ssh czarevitch@192.18.1.26

# 3. اجرای نصب کامل
cd ~/apps/english-website
chmod +x fresh-install.sh
./fresh-install.sh

# 4. اگر دیتابیس کپی نشده بود، بعد از اجرای اسکریپت:
scp "d:\my Develop Projects\English Website\prisma\dev.db" czarevitch@192.18.1.26:~/apps/english-website/prisma/
pm2 restart english-website
```

**نکته:** این اسکریپت همه چیز را پاک میکند و از نو نصب میکند!

---

## Setup اولیه (فقط یکبار)

```bash
# 1. اتصال به سرور
ssh czarevitch@192.18.1.26

# 2. رفتن به پوشه پروژه
cd ~/apps/english-website

# 3. اجرای setup
chmod +x setup-server.sh
./setup-server.sh
```

**نکته:** قبل از اجرای setup، فایل دیتابیس را از ویندوز کپی کن:
```bash
# در PowerShell ویندوز
scp "d:\my Develop Projects\English Website\prisma\dev.db" czarevitch@192.18.1.26:~/apps/english-website/prisma/
```

---

## بهروزرسانی (هر بار که تغییر دادی)

```bash
# 1. اتصال به سرور
ssh czarevitch@192.18.1.26

# 2. رفتن به پوشه
cd ~/apps/english-website

# 3. اجرای deploy
chmod +x deploy.sh
./deploy.sh
```

---

## دستورات دستی (اگر اسکریپت کار نکرد)

### Pull و Build
```bash
cd ~/apps/english-website
pm2 stop english-website
git pull origin main
npm install
npx prisma generate
npm run build
pm2 delete english-website
pm2 start npm --name "english-website" -- start
pm2 save
```

### فقط Restart
```bash
pm2 restart english-website
```

### دیدن لاگها
```bash
pm2 logs english-website
pm2 logs english-website --lines 100
```

### چک کردن وضعیت
```bash
pm2 status
pm2 monit
```

### پاک کردن کامل و شروع از نو
```bash
cd ~/apps/english-website
pm2 delete all
rm -rf .next node_modules
npm install
npm run build
pm2 start npm --name "english-website" -- start
pm2 save
```

---

## بهروزرسانی دیتابیس

### از ویندوز
```bash
# در PowerShell
scp "d:\my Develop Projects\English Website\prisma\dev.db" czarevitch@192.18.1.26:~/apps/english-website/prisma/
```

### در سرور
```bash
cd ~/apps/english-website
pm2 restart english-website
```

---

## عیبیابی

### سایت بالا نمیاد
```bash
# چک کردن لاگ
pm2 logs english-website --err

# چک کردن پورت
netstat -tulpn | grep 3000

# Kill کردن پورت
lsof -i :3000
kill -9 <PID>

# شروع مجدد
pm2 delete all
cd ~/apps/english-website
pm2 start npm --name "english-website" -- start
```

### خطای Build
```bash
cd ~/apps/english-website
rm -rf .next
npm run build
```

### خطای Login
```bash
# چک کردن .env
cat ~/apps/english-website/.env

# اگر وجود ندارد، بساز:
cat > ~/apps/english-website/.env << 'EOF'
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://192.18.1.26:3000"
NODE_ENV="production"
EOF

pm2 restart english-website
```

---

## لینکهای مهم

- 🌐 سایت: http://192.18.1.26:3000
- 🔐 ادمین: http://192.18.1.26:3000/admin/login
- 📊 GitHub: https://github.com/omidhb/english-website

---

## اطلاعات لاگین ادمین

```
Email: admin@example.com
Password: admin123
```
