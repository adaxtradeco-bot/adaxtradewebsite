# راهنمای نصب روی VM محلی

## مرحله 1: ساخت VM

### مشخصات پیشنهادی:
- OS: Ubuntu 22.04 LTS
- RAM: 2GB
- CPU: 2 Core
- Storage: 20GB
- Network: Bridge Mode (برای دسترسی از شبکه محلی)

---

## مرحله 2: نصب نیازمندیها روی VM

### 1. آپدیت سیستم
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. نصب Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # باید 18+ باشه
```

### 3. نصب Git
```bash
sudo apt install git -y
```

### 4. نصب PM2
```bash
sudo npm install -g pm2
```

---

## مرحله 3: انتقال پروژه به VM

### روش 1: از طریق Git (توصیه میشه)
```bash
cd ~
git clone <repository-url> english-website
cd english-website
```

### روش 2: کپی مستقیم با SCP
```bash
# از ویندوز خودت
scp -r "d:\my Develop Projects\English Website" user@VM_IP:~/english-website
```

### روش 3: استفاده از Shared Folder
اگر VM در VMware/VirtualBox هست، shared folder تنظیم کن.

---

## مرحله 4: نصب و بیلد پروژه

```bash
cd ~/english-website

# نصب dependencies
npm install

# تنظیم environment
cp .env.example .env.local
nano .env.local
```

محتوای `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="test-secret-key-for-development-only"
NEXTAUTH_URL="http://VM_IP:3000"
NODE_ENV=production
```

```bash
# Generate Prisma Client
npx prisma generate

# Migrate دیتابیس
npx prisma migrate deploy

# بیلد پروژه
npm run build
```

---

## مرحله 5: راهاندازی با PM2

```bash
# استارت
pm2 start npm --name "english-website" -- start

# ذخیره برای راهاندازی خودکار
pm2 save
pm2 startup

# بررسی وضعیت
pm2 status
pm2 logs english-website
```

---

## مرحله 6: دسترسی از طریق IP

### پیدا کردن IP سرور:
```bash
ip addr show
# یا
hostname -I
```

### دسترسی از مرورگر:
```
http://VM_IP:3000
```

مثال:
```
http://192.168.1.100:3000
```

---

## مرحله 7: باز کردن پورت (اگر فایروال فعال باشه)

```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

---

## دستورات مفید

### مشاهده لاگها
```bash
pm2 logs english-website
pm2 logs english-website --lines 100
```

### ریستارت
```bash
pm2 restart english-website
```

### استاپ
```bash
pm2 stop english-website
```

### حذف از PM2
```bash
pm2 delete english-website
```

### آپدیت کد
```bash
cd ~/english-website
git pull
npm install
npm run build
pm2 restart english-website
```

### بررسی منابع
```bash
pm2 monit
htop
```

---

## تست سریع بدون PM2

اگر فقط میخوای تست کنی:

```bash
cd ~/english-website
npm run build
npm start
```

برای دسترسی از شبکه محلی:
```bash
npm start -- -H 0.0.0.0 -p 3000
```

---

## حل مشکلات رایج

### پورت 3000 در حال استفاده است
```bash
# پیدا کردن پروسس
sudo lsof -i :3000

# کشتن پروسس
sudo kill -9 <PID>
```

### خطای Permission
```bash
sudo chown -R $USER:$USER ~/english-website
```

### خطای دیتابیس
```bash
cd ~/english-website
rm -rf prisma/dev.db
npx prisma migrate reset --force
npx prisma migrate deploy
```

### خطای Build
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## دسترسی از ویندوز خودت

### 1. پیدا کردن IP سرور
روی VM:
```bash
hostname -I
```

### 2. باز کردن در مرورگر
```
http://192.168.1.X:3000
```

### 3. اضافه کردن به hosts (اختیاری)
روی ویندوز، فایل `C:\Windows\System32\drivers\etc\hosts` رو ویرایش کن:
```
192.168.1.X    english.local
```

بعد میتونی با `http://english.local:3000` دسترسی داشته باشی.

---

## نصب Nginx (اختیاری - برای پورت 80)

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

فعالسازی:
```bash
sudo ln -s /etc/nginx/sites-available/english-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

حالا میتونی با `http://VM_IP` (بدون پورت) دسترسی داشته باشی.

---

## چکلیست نهایی

- [ ] VM با Ubuntu 22.04 ساخته شده
- [ ] Node.js 18+ نصب شده
- [ ] پروژه کپی شده
- [ ] `npm install` و `npm run build` موفق
- [ ] `.env.local` تنظیم شده
- [ ] PM2 راهاندازی شده
- [ ] پورت 3000 باز است
- [ ] از IP دسترسی داری

---

## دستور یکجا (کپی-پیست)

```bash
# نصب همه چیز
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs git
sudo npm install -g pm2

# کلون پروژه (جایگزین کن با آدرس repo خودت)
cd ~
git clone <your-repo-url> english-website
cd english-website

# نصب و بیلد
npm install
cp .env.example .env.local
nano .env.local  # ویرایش کن
npx prisma generate
npx prisma migrate deploy
npm run build

# راهاندازی
pm2 start npm --name "english-website" -- start
pm2 save
pm2 startup

# نمایش IP
echo "دسترسی از: http://$(hostname -I | awk '{print $1}'):3000"
```

بعد از اجرا، IP رو کپی کن و در مرورگر باز کن!
