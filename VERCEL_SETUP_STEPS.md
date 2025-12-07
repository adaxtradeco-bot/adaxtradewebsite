# 🚀 راهنمای Deploy به Vercel - گام به گام

## ✅ کد به GitHub push شد!

حالا مراحل زیر رو دنبال کن:

---

## 📋 مرحله 1: ورود به Vercel (2 دقیقه)

1. برو به: **https://vercel.com/signup**
2. کلیک روی **"Continue with GitHub"**
3. اجازه دسترسی بده
4. ✅ وارد Dashboard شدی

---

## 📋 مرحله 2: Import پروژه (1 دقیقه)

1. در Dashboard، کلیک روی **"Add New..."**
2. انتخاب کن: **"Project"**
3. پیدا کن: **"english-website"** (یا نام repository)
4. کلیک روی **"Import"**

---

## 📋 مرحله 3: تنظیمات پروژه (1 دقیقه)

در صفحه Configure Project:

```
Project Name: ivaflow (یا هر اسمی که میخوای)
Framework Preset: Next.js ✅ (خودکار تشخیص میده)
Root Directory: ./ ✅
Build Command: npm run build ✅ (خودکار)
Output Directory: .next ✅ (خودکار)
Install Command: npm install ✅ (خودکار)
```

**هیچ چیز رو تغییر نده!** همه چیز خودکار تنظیم شده.

**فعلاً Deploy نکن!** اول باید دیتابیس بسازیم.

---

## 📋 مرحله 4: ساخت Vercel Postgres (3 دقیقه)

### 4.1 رفتن به Storage
1. در منوی بالا، کلیک روی **"Storage"**
2. کلیک روی **"Create Database"**
3. انتخاب کن: **"Postgres"**

### 4.2 تنظیمات دیتابیس
```
Database Name: ivaflow-db
Region: Washington, D.C., USA (iad1)
```

### 4.3 ساخت
1. کلیک روی **"Create"**
2. صبر کن 10-20 ثانیه
3. ✅ دیتابیس آماده شد!

---

## 📋 مرحله 5: اتصال دیتابیس به پروژه (1 دقیقه)

### 5.1 در صفحه دیتابیس
1. کلیک روی **"Connect Project"**
2. پیدا کن: **"ivaflow"** (یا نام پروژه)
3. انتخاب کن

### 5.2 انتخاب Environments
```
✅ Production
✅ Preview
✅ Development
```
همه رو تیک بزن!

### 5.3 اتصال
1. کلیک روی **"Connect"**
2. ✅ Environment variables خودکار اضافه شد!

---

## 📋 مرحله 6: اضافه کردن Environment Variables (2 دقیقه)

### 6.1 رفتن به Settings
1. برگرد به پروژه (Projects → ivaflow)
2. برو به **"Settings"**
3. کلیک روی **"Environment Variables"**

### 6.2 اضافه کردن متغیرها
یکی یکی اضافه کن:

#### JWT_SECRET
```
Key: JWT_SECRET
Value: your-super-secret-jwt-key-change-in-production-2024
Environment: Production, Preview, Development (همه)
```

#### NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: your-nextauth-secret-key-2024-secure
Environment: Production, Preview, Development (همه)
```

#### NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://ivaflow.vercel.app
Environment: Production, Preview, Development (همه)
```
**نکته:** بعداً که دامنه اضافه کردی، این رو به `https://ivaflow.com` تغییر بده.

#### NODE_ENV
```
Key: NODE_ENV
Value: production
Environment: Production فقط
```

#### ADMIN_EMAIL
```
Key: ADMIN_EMAIL
Value: administrator@ivaflow.com
Environment: Production, Preview, Development (همه)
```

#### ADMIN_PASSWORD
```
Key: ADMIN_PASSWORD
Value: IVAFlow@2024#SecureAdmin!Prod
Environment: Production, Preview, Development (همه)
```

### 6.3 ذخیره
کلیک روی **"Save"** بعد از هر متغیر.

---

## 📋 مرحله 7: Deploy! (2 دقیقه)

### 7.1 شروع Deploy
1. برگرد به **"Deployments"**
2. کلیک روی **"Deploy"** (یا "Redeploy")
3. صبر کن 1-2 دقیقه

### 7.2 مشاهده Progress
```
⏳ Building...
⏳ Running: npm install
⏳ Running: prisma generate
⏳ Running: next build
⏳ Deploying...
✅ Deployment Ready!
```

### 7.3 باز کردن سایت
1. کلیک روی **"Visit"**
2. یا برو به: `https://ivaflow.vercel.app`

---

## 📋 مرحله 8: Import دیتا (3 دقیقه)

### 8.1 دریافت Connection String
1. برو به **Storage** → **ivaflow-db**
2. برو به تب **".env.local"**
3. کپی کن: `POSTGRES_PRISMA_URL` و `POSTGRES_URL_NON_POOLING`

### 8.2 ساخت فایل محلی
در ویندوز، ساخت فایل `.env.production`:

```bash
cd "d:\my Develop Projects\English Website"
notepad .env.production
```

محتوا:
```
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
```

### 8.3 Push Schema
```bash
# Load environment
set POSTGRES_PRISMA_URL=postgresql://...
set POSTGRES_URL_NON_POOLING=postgresql://...

# Push schema
npx prisma db push
```

### 8.4 Import دیتا
```bash
node scripts/import-database.js
```

✅ دیتا منتقل شد!

---

## 📋 مرحله 9: تست سایت (2 دقیقه)

### بررسی کن:
- [ ] صفحه اصلی باز میشه
- [ ] صفحات دیگه کار میکنن
- [ ] Admin panel: `/admin/login`
- [ ] ورود با:
  ```
  Email: administrator@ivaflow.com
  Password: IVAFlow@2024#SecureAdmin!Prod
  ```
- [ ] صفحات ساخته شده نمایش داده میشن

---

## 📋 مرحله 10: اتصال دامنه (اختیاری - 5 دقیقه)

### 10.1 اضافه کردن دامنه
1. در پروژه، برو به **"Settings"** → **"Domains"**
2. اضافه کن: `ivaflow.com`
3. کلیک روی **"Add"**

### 10.2 تنظیم DNS
Vercel بهت میگه چیکار کنی. معمولاً:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 10.3 آپدیت NEXTAUTH_URL
1. برو به **Settings** → **Environment Variables**
2. پیدا کن: `NEXTAUTH_URL`
3. تغییر بده به: `https://ivaflow.com`
4. **Save**
5. **Redeploy**

### 10.4 صبر کن
DNS propagation: 10-30 دقیقه

---

## ✅ تمام!

سایت آماده است:
- 🌐 Vercel URL: `https://ivaflow.vercel.app`
- 🌐 دامنه سفارشی: `https://ivaflow.com` (بعد از تنظیم DNS)
- 🔐 Admin: `https://ivaflow.com/admin/login`

---

## 🔄 آپدیت بعدی

برای آپدیت سایت:

```bash
cd "d:\my Develop Projects\English Website"

# تغییرات رو commit کن
git add .
git commit -m "Update content"
git push

# Vercel خودکار deploy میکنه! 🎉
```

---

## 🆘 مشکلات رایج

### Build خطا میده
1. برو به **Deployments** → آخرین deployment
2. کلیک روی **"View Function Logs"**
3. خطا رو بخون و برطرف کن

### دیتا نمایش داده نمیشه
```bash
# دوباره import کن
node scripts/import-database.js
```

### Admin login کار نمیکنه
بررسی کن Environment Variables درست تنظیم شدن:
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

---

## 📞 کمک بیشتر

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- یا بهم بگو تا کمکت کنم! 🚀

---

**موفق باشی! 🎉**
