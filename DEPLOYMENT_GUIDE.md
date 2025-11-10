# راهنمای دیپلوی وبسایت

## روش 1: Vercel (توصیه میشه - رایگان)

### مراحل:

1. **نصب Vercel CLI**
```bash
npm i -g vercel
```

2. **لاگین**
```bash
vercel login
```

3. **دیپلوی**
```bash
vercel --prod
```

### تنظیمات Environment Variables در Vercel:
- `DATABASE_URL` - آدرس دیتابیس
- `NEXTAUTH_SECRET` - کلید رمزنگاری
- `NEXTAUTH_URL` - آدرس سایت

---

## روش 2: VPS با PM2

### نیازمندیها:
- Ubuntu 20.04+
- Node.js 18+
- Nginx
- PM2

### 1. نصب Node.js روی سرور
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. نصب PM2
```bash
sudo npm install -g pm2
```

### 3. نصب Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 4. آپلود پروژه
```bash
# روی سرور
cd /var/www
git clone <repository-url> english-website
cd english-website
npm install
npm run build
```

### 5. تنظیم Environment Variables
```bash
nano .env.production
```

محتوا:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV=production
```

### 6. راه‌اندازی با PM2
```bash
pm2 start npm --name "english-website" -- start
pm2 save
pm2 startup
```

### 7. تنظیم Nginx
```bash
sudo nano /etc/nginx/sites-available/english-website
```

محتوا:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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

فعال‌سازی:
```bash
sudo ln -s /etc/nginx/sites-available/english-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. نصب SSL (رایگان)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## روش 3: Docker

### 1. ساخت Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. ساخت docker-compose.yml
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./prisma/dev.db
      - NEXTAUTH_SECRET=your-secret
      - NODE_ENV=production
    restart: always
```

### 3. اجرا
```bash
docker-compose up -d
```

---

## چک‌لیست قبل از دیپلوی

- [ ] `npm run build` موفق باشه
- [ ] فایل `.env.production` تنظیم شده
- [ ] دیتابیس migrate شده: `npx prisma migrate deploy`
- [ ] تصاویر در `public/assets/` موجود باشند
- [ ] NEXTAUTH_SECRET تولید شده (32+ کاراکتر رندوم)

---

## تولید NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## دستورات مفید

### بررسی لاگ PM2
```bash
pm2 logs english-website
```

### ریستارت
```bash
pm2 restart english-website
```

### آپدیت کد
```bash
cd /var/www/english-website
git pull
npm install
npm run build
pm2 restart english-website
```

### بررسی وضعیت Nginx
```bash
sudo systemctl status nginx
```

---

## توصیه‌ها

1. **Vercel** برای شروع سریع و رایگان
2. **VPS** برای کنترل کامل و دیتابیس محلی
3. **Docker** برای portable deployment

## هزینه‌ها

- **Vercel**: رایگان (محدودیت: 100GB bandwidth/ماه)
- **VPS**: $5-10/ماه (DigitalOcean, Linode, Hetzner)
- **Docker**: بستگی به سرور دارد

## پشتیبانی دیتابیس

### SQLite (فعلی)
- مناسب برای تست و پروژه‌های کوچک
- فایل محلی در `prisma/dev.db`

### PostgreSQL (توصیه برای production)
```bash
# نصب PostgreSQL
sudo apt install postgresql postgresql-contrib

# تغییر DATABASE_URL در .env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Migrate
npx prisma migrate deploy
```

## مانیتورینگ

### نصب monitoring با PM2
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

### بررسی منابع
```bash
pm2 monit
```
