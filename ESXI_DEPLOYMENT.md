# راهنمای دیپلوی روی VMware ESXi

## مرحله 1: ساخت VM در ESXi

### 1. ورود به ESXi Web Interface
```
https://ESXI_IP
```

### 2. ساخت VM جدید
- **Name**: English-Website-VM
- **Guest OS**: Linux → Ubuntu Linux (64-bit)
- **CPU**: 2 vCPU
- **Memory**: 2048 MB
- **Hard Disk**: 20 GB
- **Network**: VM Network (Bridge)

### 3. نصب Ubuntu Server 22.04
- دانلود ISO: https://ubuntu.com/download/server
- آپلود ISO به ESXi Datastore
- Mount ISO و نصب Ubuntu

---

## مرحله 2: تنظیمات اولیه Ubuntu

### 1. SSH را فعال کن (در حین نصب یا بعد)
```bash
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh
sudo systemctl start ssh
```

### 2. پیدا کردن IP
```bash
ip addr show
# یا
hostname -I
```

### 3. اتصال از ویندوز با SSH
```bash
ssh username@VM_IP
```

---

## مرحله 3: نصب نیازمندیها

```bash
# آپدیت سیستم
sudo apt update && sudo apt upgrade -y

# نصب Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# نصب Git
sudo apt install -y git

# نصب PM2
sudo npm install -g pm2

# بررسی نصب
node --version
npm --version
git --version
```

---

## مرحله 4: راهاندازی اولیه پروژه

### روش 1: با Git (توصیه میشه)

```bash
# ساخت دایرکتوری
mkdir -p ~/apps
cd ~/apps

# کلون پروژه
git clone https://github.com/your-username/english-website.git
cd english-website

# نصب dependencies
npm install

# تنظیم environment
nano .env.production
```

محتوای `.env.production`:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://VM_IP:3000"
NODE_ENV=production
```

```bash
# Generate Prisma
npx prisma generate
npx prisma migrate deploy

# بیلد
npm run build

# استارت با PM2
pm2 start npm --name "english-website" -- start
pm2 save
pm2 startup
```

### روش 2: بدون Git (کپی مستقیم)

از ویندوز:
```bash
scp -r "d:\my Develop Projects\English Website" username@VM_IP:~/apps/english-website
```

بعد روی VM:
```bash
cd ~/apps/english-website
npm install
npm run build
pm2 start npm --name "english-website" -- start
```

---

## مرحله 5: دسترسی از شبکه

### دسترسی مستقیم:
```
http://VM_IP:3000
```

### نصب Nginx برای پورت 80:
```bash
sudo apt install nginx -y

sudo nano /etc/nginx/sites-available/english-website
```

محتوا:
```nginx
server {
    listen 80;
    server_name VM_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/english-website /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

حالا: `http://VM_IP`

---

## مرحله 6: آپدیت سریع (CI/CD دستی)

### اسکریپت آپدیت خودکار

روی VM:
```bash
nano ~/update-website.sh
```

محتوا:
```bash
#!/bin/bash

echo "🔄 Starting update..."

cd ~/apps/english-website

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart english-website

echo "✅ Update complete!"
pm2 logs english-website --lines 20
```

```bash
chmod +x ~/update-website.sh
```

### استفاده:
```bash
~/update-website.sh
```

---

## مرحله 7: آپدیت از ویندوز (یک دستور)

### روش 1: با Git (توصیه میشه)

روی ویندوز، ساخت فایل `deploy.bat`:
```batch
@echo off
echo Deploying to ESXi VM...

ssh username@VM_IP "cd ~/apps/english-website && git pull && npm install && npm run build && pm2 restart english-website"

echo Done!
pause
```

اجرا: دابل کلیک روی `deploy.bat`

### روش 2: با SCP (بدون Git)

```batch
@echo off
echo Uploading files...

scp -r "d:\my Develop Projects\English Website\*" username@VM_IP:~/apps/english-website/

echo Building on server...
ssh username@VM_IP "cd ~/apps/english-website && npm install && npm run build && pm2 restart english-website"

echo Done!
pause
```

### روش 3: با rsync (سریعترین)

نصب rsync روی ویندوز:
```bash
# با Git Bash یا WSL
rsync -avz --exclude 'node_modules' --exclude '.next' \
  "/d/my Develop Projects/English Website/" \
  username@VM_IP:~/apps/english-website/

ssh username@VM_IP "cd ~/apps/english-website && npm install && npm run build && pm2 restart english-website"
```

---

## مرحله 8: SSH بدون پسورد (اختیاری)

روی ویندوز:
```bash
# ساخت SSH Key
ssh-keygen -t rsa -b 4096

# کپی به VM
ssh-copy-id username@VM_IP
```

حالا دیگه نیاز به پسورد نیست!

---

## اسکریپت کامل یکجا

### روی VM (اولین بار):

```bash
#!/bin/bash

# نصب همه چیز
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs git nginx
sudo npm install -g pm2

# کلون پروژه
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/your-username/english-website.git
cd english-website

# تنظیم environment
cat > .env.production << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://$(hostname -I | awk '{print $1}'):3000"
NODE_ENV=production
EOF

# نصب و بیلد
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# استارت
pm2 start npm --name "english-website" -- start
pm2 save
pm2 startup

# نصب Nginx
sudo tee /etc/nginx/sites-available/english-website > /dev/null << EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/english-website /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Setup complete!"
echo "🌐 Access: http://$(hostname -I | awk '{print $1}')"
```

---

## دستورات مفید

### مشاهده وضعیت
```bash
pm2 status
pm2 logs english-website
pm2 monit
```

### ریستارت
```bash
pm2 restart english-website
```

### مشاهده لاگ Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### بررسی پورتها
```bash
sudo netstat -tulpn | grep LISTEN
```

### بررسی منابع
```bash
htop
df -h
free -h
```

---

## Snapshot در ESXi (Backup)

### قبل از آپدیت مهم:
1. برو به ESXi Web Interface
2. انتخاب VM
3. Actions → Snapshots → Take Snapshot
4. نام: "Before-Update-2024-01-15"

### برگشت به Snapshot:
1. Actions → Snapshots → Manage Snapshots
2. انتخاب snapshot
3. Restore

---

## مانیتورینگ

### نصب htop
```bash
sudo apt install htop -y
htop
```

### لاگ PM2
```bash
pm2 logs english-website --lines 100
pm2 logs english-website --err
```

### فضای دیسک
```bash
df -h
du -sh ~/apps/english-website
```

---

## حل مشکلات

### پورت مشغول است
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart english-website
```

### خطای دیتابیس
```bash
cd ~/apps/english-website
rm -f prisma/dev.db
npx prisma migrate reset --force
npx prisma migrate deploy
```

### خطای Build
```bash
cd ~/apps/english-website
rm -rf .next node_modules package-lock.json
npm install
npm run build
pm2 restart english-website
```

### Nginx خطا میده
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

---

## چکلیست نهایی

- [ ] VM در ESXi ساخته شده
- [ ] Ubuntu 22.04 نصب شده
- [ ] SSH فعال و از ویندوز متصل میشی
- [ ] Node.js 18+ نصب شده
- [ ] پروژه کلون/کپی شده
- [ ] `.env.production` تنظیم شده
- [ ] `npm run build` موفق
- [ ] PM2 در حال اجرا
- [ ] Nginx نصب و تنظیم شده
- [ ] از IP دسترسی داری
- [ ] اسکریپت آپدیت آماده است

---

## دستور سریع آپدیت (کپی-پیست)

روی ویندوز:
```bash
ssh username@VM_IP "cd ~/apps/english-website && git pull && npm install && npm run build && pm2 restart english-website && pm2 logs english-website --lines 10"
```

یا ساخت فایل `quick-deploy.bat`:
```batch
@echo off
ssh username@VM_IP "cd ~/apps/english-website && git pull && npm install && npm run build && pm2 restart english-website"
echo Deployed! Check: http://VM_IP
pause
```

تمام! 🚀
