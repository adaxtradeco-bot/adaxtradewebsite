# راهنمای آپلود به هاستینگر

## مرحله 1: آماده‌سازی فایل‌ها

### فایل‌های مورد نیاز:
- کل پوشه پروژه (بدون `node_modules` و `.next`)
- فایل دیتابیس: `prisma/dev.db`
- فایل `.env.production` (باید تنظیم شود)

## مرحله 2: تنظیمات هاستینگر

### 1. ورود به cPanel هاستینگر
- به cPanel خود وارد شوید
- بخش File Manager را باز کنید

### 2. آپلود فایل‌ها
```
public_html/
├── src/
├── prisma/
├── package.json
├── next.config.js
├── .env.production
└── سایر فایل‌های پروژه
```

### 3. تنظیم Node.js در cPanel
- بخش "Node.js App" را پیدا کنید
- Create Application کلیک کنید
- تنظیمات:
  - Node.js Version: 18.x یا بالاتر
  - Application Mode: Production
  - Application Root: public_html
  - Application URL: دامنه شما
  - Application Startup File: server.js

## مرحله 3: تنظیم فایل‌های ضروری

### 1. ایجاد server.js
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### 2. تنظیم .env.production
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="تولید-کلید-امن-32-کاراکتری"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="پسورد-قوی"

# Next.js
NEXTAUTH_SECRET="تولید-کلید-امن-32-کاراکتری"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### 3. تنظیم package.json
اضافه کردن script:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

## مرحله 4: نصب Dependencies

### در Terminal cPanel:
```bash
cd public_html
npm install --production
npx prisma generate
npm run build
```

## مرحله 5: راه‌اندازی

### شروع Application:
- در بخش Node.js App روی "Start" کلیک کنید
- اگر خطا داد، لاگ‌ها را بررسی کنید

## مرحله 6: تست

### بررسی سایت:
- https://yourdomain.com
- https://yourdomain.com/admin/login

## عیب‌یابی مشکلات رایج

### خطا: Module not found
```bash
npm install
```

### خطا: Database not accessible
- مسیر DATABASE_URL را بررسی کنید
- فایل dev.db را آپلود کرده‌اید؟

### خطا: Build failed
```bash
npm run build
```

### خطا: Permission denied
- مجوزات فایل‌ها را 755 کنید
- مجوزات پوشه‌ها را 644 کنید

## نکات مهم

1. **امنیت:**
   - JWT_SECRET و NEXTAUTH_SECRET را تغییر دهید
   - پسورد ادمین را تغییر دهید

2. **Performance:**
   - فقط فایل‌های ضروری آپلود کنید
   - از CDN برای تصاویر استفاده کنید

3. **Backup:**
   - قبل از آپلود، backup بگیرید
   - فایل دیتابیس را منظم backup کنید

## دستورات مفید

### تولید کلید امن:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### بررسی لاگ‌ها:
- در cPanel > Node.js App > View Logs

### ریستارت Application:
- در cPanel > Node.js App > Restart

## پشتیبانی

اگر مشکلی داشتید:
1. لاگ‌های Node.js را بررسی کنید
2. Error logs cPanel را چک کنید
3. با پشتیبانی هاستینگر تماس بگیرید