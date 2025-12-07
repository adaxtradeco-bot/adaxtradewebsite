# ✅ چکلیست Deploy به Vercel

## قبل از شروع

- [ ] Node.js نصب شده (v18+)
- [ ] Git نصب شده
- [ ] حساب GitHub دارم
- [ ] پروژه build میشه: `npm run build`

---

## مرحله 1: GitHub

- [ ] Repository در GitHub ساختم
- [ ] کد رو push کردم:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/USERNAME/REPO.git
  git push -u origin main
  ```

---

## مرحله 2: Vercel

- [ ] رفتم به https://vercel.com
- [ ] با GitHub وارد شدم
- [ ] "Add New Project" کلیک کردم
- [ ] Repository رو import کردم
- [ ] تنظیمات:
  - [ ] Framework: Next.js ✅
  - [ ] Root Directory: `./` ✅
  - [ ] Build Command: `npm run build` ✅
  - [ ] Output Directory: `.next` ✅

---

## مرحله 3: Environment Variables (اگر داری)

- [ ] فایل `.env.local` رو باز کردم
- [ ] هر متغیر رو در Vercel اضافه کردم:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXTAUTH_URL`
  - [ ] سایر متغیرها...

---

## مرحله 4: Deploy

- [ ] "Deploy" کلیک کردم
- [ ] منتظر موندم (1-3 دقیقه)
- [ ] ✅ Deploy موفق بود
- [ ] سایت باز میشه: `https://PROJECT.vercel.app`

---

## مرحله 5: دامنه سفارشی (اختیاری)

- [ ] در Vercel: Settings → Domains
- [ ] دامنه اضافه کردم: `ivaflow.com`
- [ ] DNS تنظیم کردم:
  - [ ] A Record: `@` → `76.76.21.21`
  - [ ] CNAME: `www` → `cname.vercel-dns.com`
- [ ] منتظر DNS propagation (10-30 دقیقه)
- [ ] ✅ دامنه کار میکنه

---

## مرحله 6: تست

- [ ] صفحه اصلی باز میشه
- [ ] تمام لینکها کار میکنن
- [ ] تصاویر لود میشن
- [ ] فرمها کار میکنن
- [ ] SSL فعاله (قفل سبز)

---

## آپدیت بعدی

برای آپدیت سایت:

```bash
# روش 1: دستی
git add .
git commit -m "توضیح تغییرات"
git push

# روش 2: با اسکریپت
deploy.bat
```

---

## 🎉 تمام!

سایت من: https://________.vercel.app
دامنه: https://ivaflow.com (بعد از تنظیم DNS)

---

## 🆘 مشکل داری؟

1. Build خطا میده → `npm run build` محلی تست کن
2. 404 میده → بررسی کن `src/app/page.tsx` وجود داره
3. دامنه کار نمیکنه → صبر کن 30 دقیقه برای DNS
4. Environment variables → Settings → Environment Variables → Redeploy

---

**تاریخ Deploy:** ___________
**لینک Vercel:** ___________
**وضعیت:** ⬜ در حال انجام | ⬜ تمام شد ✅
