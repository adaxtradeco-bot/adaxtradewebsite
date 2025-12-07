# 🚀 Deploy به Vercel - راهنمای کامل

## چرا Vercel؟
- ✅ ساخته شده توسط سازندگان Next.js
- ✅ رایگان برای پروژههای شخصی
- ✅ SSL خودکار
- ✅ CDN جهانی
- ✅ Deploy خودکار با Git
- ✅ بدون نیاز به تنظیمات پیچیده

---

## 📋 مرحله 1: آماده‌سازی پروژه

### 1.1 بررسی فایلها
```bash
cd "d:\my Develop Projects\English Website"

# بررسی package.json
type package.json
```

مطمئن شو این اسکریپتها وجود دارن:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 1.2 تست Build محلی
```bash
npm run build
```

اگر خطا داد، اول باید درستش کنی.

---

## 📋 مرحله 2: آپلود به GitHub

### 2.1 ساخت Repository در GitHub
1. برو به https://github.com
2. کلیک روی **"New repository"**
3. نام: `english-website` یا `ivaflow`
4. Private یا Public انتخاب کن
5. **"Create repository"** کلیک کن

### 2.2 آپلود کد
```bash
cd "d:\my Develop Projects\English Website"

# اگر git نداری، اول init کن
git init

# اضافه کردن همه فایلها
git add .

# Commit
git commit -m "Initial commit for Vercel deployment"

# اضافه کردن GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/english-website.git

# Push
git branch -M main
git push -u origin main
```

**نکته:** `YOUR_USERNAME` رو با یوزرنیم GitHub خودت عوض کن.

---

## 📋 مرحله 3: Deploy به Vercel

### روش 1: از طریق وبسایت (راحتتر)

#### 3.1 ثبت‌نام/ورود
1. برو به https://vercel.com
2. کلیک روی **"Sign Up"** یا **"Log In"**
3. با GitHub وارد شو

#### 3.2 Import پروژه
1. کلیک روی **"Add New..."** → **"Project"**
2. **"Import Git Repository"** انتخاب کن
3. Repository خودت رو پیدا کن و **"Import"** کلیک کن

#### 3.3 تنظیمات Deploy
```
Project Name: ivaflow (یا هر اسمی که میخوای)
Framework Preset: Next.js (خودکار تشخیص میده)
Root Directory: ./
Build Command: npm run build (خودکار)
Output Directory: .next (خودکار)
Install Command: npm install (خودکار)
```

#### 3.4 Environment Variables (اگر داری)
اگر فایل `.env` داری:
1. کلیک روی **"Environment Variables"**
2. هر متغیر رو اضافه کن:
   ```
   Key: DATABASE_URL
   Value: postgresql://...
   ```

#### 3.5 Deploy
1. کلیک روی **"Deploy"**
2. صبر کن تا build بشه (1-3 دقیقه)
3. ✅ آماده!

---

### روش 2: از طریق CLI (پیشرفته)

```bash
# نصب Vercel CLI
npm i -g vercel

# ورود
vercel login

# Deploy
vercel

# یا مستقیم production
vercel --prod
```

---

## 📋 مرحله 4: اتصال دامنه سفارشی (ivaflow.com)

### 4.1 اضافه کردن دامنه در Vercel
1. در داشبورد Vercel، روی پروژه کلیک کن
2. برو به **"Settings"** → **"Domains"**
3. دامنه رو اضافه کن: `ivaflow.com`
4. کلیک روی **"Add"**

### 4.2 تنظیم DNS
Vercel بهت یکی از این گزینهها رو میده:

#### گزینه A: Nameservers (راحتتر)
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
این رو در پنل دامنه خودت تنظیم کن.

#### گزینه B: A Record
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 4.3 صبر کن
- DNS propagation: 5 دقیقه تا 48 ساعت
- معمولاً 10-30 دقیقه طول میکشه

---

## 📋 مرحله 5: تنظیمات بعد از Deploy

### 5.1 SSL خودکار
✅ Vercel خودکار SSL فعال میکنه - کاری نداری!

### 5.2 بررسی سایت
```
https://your-project.vercel.app
https://ivaflow.com (بعد از تنظیم DNS)
```

### 5.3 مشاهده Logs
1. در داشبورد Vercel
2. برو به **"Deployments"**
3. روی آخرین deployment کلیک کن
4. **"View Function Logs"**

---

## 🔄 آپدیت کردن سایت

### خیلی ساده:
```bash
# تغییرات رو commit کن
git add .
git commit -m "Update homepage"
git push

# Vercel خودکار deploy میکنه! 🎉
```

---

## ⚙️ تنظیمات پیشرفته

### vercel.json (اختیاری)
اگر نیاز به تنظیمات خاص داری:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.ivaflow.com"
  }
}
```

---

## 🐛 عیب‌یابی

### خطای Build
```bash
# تست محلی
npm run build

# اگر موفق شد، مشکل از environment variables هست
```

### خطای 404
- بررسی کن `src/app/page.tsx` وجود داره
- مطمئن شو Next.js 14 App Router استفاده میکنی

### خطای Environment Variables
1. برو به Settings → Environment Variables
2. همه متغیرهای `.env` رو اضافه کن
3. Redeploy کن

### سایت باز نمیشه
```bash
# بررسی DNS
nslookup ivaflow.com

# باید به IP Vercel اشاره کنه
```

---

## 💰 هزینه‌ها

### پلن رایگان (Hobby):
- ✅ Bandwidth نامحدود
- ✅ 100 GB-Hours محاسبات
- ✅ SSL رایگان
- ✅ Deploy نامحدود
- ✅ کافی برای اکثر پروژهها

### پلن Pro ($20/ماه):
- بیشتر برای تیمها و پروژههای بزرگ

---

## 📊 مانیتورینگ

### Analytics
1. در داشبورد Vercel
2. برو به **"Analytics"**
3. مشاهده:
   - تعداد بازدید
   - Performance
   - Core Web Vitals

### Speed Insights
- خودکار فعاله
- نمایش سرعت واقعی سایت

---

## 🎯 چکلیست نهایی

- [ ] پروژه روی GitHub آپلود شد
- [ ] Vercel account ساخته شد
- [ ] پروژه import شد
- [ ] Build موفق بود
- [ ] سایت باز میشه (vercel.app)
- [ ] دامنه اضافه شد (اختیاری)
- [ ] DNS تنظیم شد (اختیاری)
- [ ] SSL فعاله (خودکار)
- [ ] Environment variables تنظیم شدن (در صورت نیاز)

---

## 🔗 لینکهای مفید

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Domain Setup: https://vercel.com/docs/concepts/projects/domains

---

## 💡 نکات مهم

1. **رایگان هست** - نگران هزینه نباش
2. **خیلی سریعه** - CDN جهانی
3. **خودکاره** - هر push، deploy میشه
4. **SSL رایگان** - نگران HTTPS نباش
5. **Preview URLs** - هر branch یک URL جداگانه

---

## 🆘 کمک بیشتر

اگر مشکلی داشتی:
1. Vercel Support: https://vercel.com/support
2. Next.js Discord: https://nextjs.org/discord
3. GitHub Issues: مشکل رو توضیح بده

---

**موفق باشی! 🚀**

بعد از deploy، لینک سایتت رو بهم بده تا چک کنم!
