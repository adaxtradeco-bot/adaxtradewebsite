# بررسی اسلایدها

## ✅ دیتابیس چک شد
```
📄 Page: NWMFlow - Complete Hero
🔗 Slug: nwmflow
📦 Sections: 1
   Slides: 4
   1. Citizen Requests
   2. HR & People Ops
   3. Customer Service
   4. Enterprise Automation
```

## 🔍 صفحات برای تست:

### 1. صفحه Test (مستقیم از کد)
**URL:** http://localhost:3000/test-hero

این صفحه مستقیماً 4 اسلاید را از کد نمایش میدهد (بدون دیتابیس)

### 2. صفحه NWMFlow (از دیتابیس)
**URL:** http://localhost:3000/en/nwmflow

این صفحه از دیتابیس لود میشود

## 🔧 اگر فقط 2 اسلاید میبینید:

### راهحل 1: Clear Cache
```bash
# Stop dev server (Ctrl+C)
# Delete .next folder
rmdir /s /q .next
# Start again
npm run dev
```

### راهحل 2: Hard Refresh
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`

### راهحل 3: Check Console
1. باز کردن Developer Tools (F12)
2. رفتن به Console tab
3. چک کردن errors

### راهحل 4: Re-seed Database
```bash
npx tsx scripts/seed-nwm-hero-page.ts
```

## 📊 تعداد اسلایدها:

در کد HeroSliderNWMSection:
```tsx
slides.length // باید 4 باشد
```

Navigation tabs زیر slider:
```tsx
{slides.map((s, idx) => ...)} // باید 4 دکمه باشد
```

## ✅ چک لیست:

- [ ] صفحه /test-hero را باز کنید
- [ ] آیا 4 دکمه navigation میبینید؟
- [ ] آیا counter میگوید "Slide X / 4"؟
- [ ] آیا زیر slider 4 badge هست؟
- [ ] Clear cache کردید؟
- [ ] Dev server را restart کردید؟

اگر در /test-hero هم 4 اسلاید نمیبینید، مشکل از کامپوننت است.
اگر در /test-hero میبینید ولی در /en/nwmflow نه، مشکل از page renderer است.
