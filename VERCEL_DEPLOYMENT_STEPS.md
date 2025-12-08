# 🚀 Vercel Deployment Steps

## تغییرات این نسخه:

### ✅ قابلیتهای جدید:
1. **منوی داینامیک کامل**
   - منوها از دیتابیس لود میشن
   - قابلیت ویرایش در پنل ادمین
   - پشتیبانی از چند زبان (EN/AR)

2. **Menu Builder پیشرفته**
   - جابجایی منوها با دکمه های ▲▼
   - جابجایی columns با دکمه های ◀▶
   - جابجایی dropdown items
   - حذف و اضافه آسان
   - انتخاب صفحه از لیست
   - لینک دستی

3. **Snapshot Cards قابل ویرایش**
   - در سکشن HeroSliderNWM
   - قابل تنظیم در JSON Editor
   - هر slide میتونه snapshot card مخصوص خودش داشته باشه

### 📦 فایلهای تغییر یافته:
- `prisma/schema.prisma` - بازگشت به PostgreSQL
- `src/app/admin/menus/edit/[id]/page.tsx` - Menu Builder کامل
- `src/components/ModernNavbar.tsx` - منوی داینامیک
- `src/components/builder-sections/HeroSliderNWMSection.tsx` - Snapshot cards
- `src/lib/menu-adapter.ts` - Adapter ساده شده
- `src/lib/page-builder/section-registry-nwm.ts` - Default data بهبود یافته

---

## 🔧 مراحل Deploy:

### مرحله 1: Vercel Dashboard
1. برو به https://vercel.com/dashboard
2. پروژه رو انتخاب کن
3. منتظر بمون تا auto-deploy تموم بشه

### مرحله 2: بررسی Build
- Build باید موفق باشه
- اگر خطا داد، لاگ رو چک کن

### مرحله 3: Import دیتابیس (فقط منوها)

**روش 1: از طریق Vercel CLI**
```bash
# نصب Vercel CLI (اگر نداری)
npm i -g vercel

# لاگین
vercel login

# لینک پروژه
vercel link

# اجرای اسکریپت import
vercel env pull .env.local
npx tsx scripts/import-to-vercel.ts
```

**روش 2: دستی از Prisma Studio**
1. برو به Vercel Dashboard
2. Settings → Environment Variables
3. کپی کردن `POSTGRES_PRISMA_URL`
4. در لوکال:
```bash
# تنظیم متغیر محیطی
set DATABASE_URL=<POSTGRES_PRISMA_URL>

# اجرای Prisma Studio
npx prisma studio

# باز کردن جدول Menu
# حذف رکوردهای قدیمی
# کپی کردن از database-export-vercel.json
```

### مرحله 4: Seed منوها (ساده ترین روش)

اگر میخوای از اول شروع کنی:

```bash
# در Vercel Dashboard → Settings → Functions
# اضافه کردن Environment Variable:
DATABASE_URL=<POSTGRES_PRISMA_URL>

# بعد در terminal لوکال:
vercel env pull
npx tsx scripts/seed-header-menu.ts
```

---

## ✅ بررسی نهایی:

بعد از deploy، این موارد رو چک کن:

### 1. منوی Header
- [ ] منوها نمایش داده میشن
- [ ] Dropdown ها کار میکنن
- [ ] لینک ها درست هستن
- [ ] Pricing نمایش داده میشه

### 2. پنل ادمین
- [ ] `/admin/menus` باز میشه
- [ ] لیست منوها نمایش داده میشه
- [ ] Edit Menu کار میکنه
- [ ] جابجایی کار میکنه
- [ ] Save موفق میشه

### 3. Page Builder
- [ ] HeroSliderNWM سکشن کار میکنه
- [ ] JSON Editor snapshot card رو نشون میده
- [ ] تغییرات اعمال میشن

---

## 🐛 عیب یابی:

### مشکل: منوها نمایش داده نمیشن
```bash
# چک کردن دیتابیس
npx prisma studio
# بررسی جدول Menu
```

### مشکل: Build خطا میده
```bash
# لوکال build بگیر
npm run build
# خطاها رو برطرف کن
```

### مشکل: دیتابیس خالیه
```bash
# Seed دوباره
npx tsx scripts/seed-header-menu.ts
```

---

## 📞 لینک های مهم:

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/omidhb/english-website
- **Admin Panel**: https://your-domain.vercel.app/admin
- **Menu Builder**: https://your-domain.vercel.app/admin/menus

---

## 🎉 موفق باشی!

همه چیز آماده است. فقط منتظر بمون تا Vercel deploy رو تموم کنه!
