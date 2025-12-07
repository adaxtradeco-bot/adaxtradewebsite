# 🚀 راهنمای سریع Deploy به Vercel

## 3 مرحله ساده:

### 1️⃣ آپلود به GitHub (5 دقیقه)

```bash
cd "d:\my Develop Projects\English Website"

git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/english-website.git
git push -u origin main
```

**نکته:** `YOUR_USERNAME` رو عوض کن!

---

### 2️⃣ Deploy در Vercel (2 دقیقه)

1. برو به: https://vercel.com/signup
2. با GitHub وارد شو
3. کلیک: **"Add New..."** → **"Project"**
4. Repository رو انتخاب کن
5. کلیک: **"Deploy"**

✅ تمام! سایت آماده است.

---

### 3️⃣ دامنه سفارشی (اختیاری - 10 دقیقه)

**در Vercel:**
1. Settings → Domains
2. اضافه کن: `ivaflow.com`

**در پنل دامنه:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

صبر کن 10-30 دقیقه → ✅ آماده!

---

## 🔄 آپدیت بعدی

```bash
git add .
git commit -m "توضیح تغییرات"
git push
```

Vercel خودکار deploy میکنه! 🎉

---

## 📱 لینکهای مهم

- Dashboard: https://vercel.com/dashboard
- راهنمای کامل: `VERCEL_DEPLOYMENT.md`
- چکلیست: `VERCEL_CHECKLIST.md`

---

## 🆘 مشکل داری؟

**Build خطا میده:**
```bash
npm run build
```
اگر محلی کار کرد، مشکل از environment variables هست.

**404 میده:**
بررسی کن `src/app/page.tsx` وجود داره.

**دامنه کار نمیکنه:**
صبر کن 30 دقیقه برای DNS propagation.

---

**موفق باشی! 🚀**
