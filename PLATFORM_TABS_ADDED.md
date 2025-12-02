# Platform Tabs Section - اضافه شده به New Home

## خلاصه
سکشن **Platform Tabs** با موفقیت به صفحه "New Home - NWM Style" اضافه شد.

## ویژگی‌های سکشن

### ساختار کلی
- **عنوان اصلی**: The Complete Automation Ecosystem
- **زیرعنوان**: The Platform
- **توضیحات**: One unified OS for all your operational needs.

### تب‌های موجود

#### 1️⃣ By Core Feature
کارت‌های این تب:
- **Smart Forms**: فرم‌های هوشمند با پشتیبانی آفلاین
- **Workflow & Automation**: اتوماسیون و گردش کار بصری
- **Analytics**: داشبوردهای تحلیلی real-time
- **No-Code Apps**: ساخت اپلیکیشن بدون کد

#### 2️⃣ By Industry
کارت‌های این تب:
- **Fleet Management**: مدیریت ناوگان
- **Construction**: ساخت و ساز
- **Healthcare**: بهداشت و درمان
- **Oil & Gas**: نفت و گاز

#### 3️⃣ By Use Case
کارت‌های این تب:
- **Approvals**: تاییدیه‌ها و درخواست‌ها
- **Onboarding**: آموزش و جمع‌آوری مدارک
- **Incident Mgmt**: مدیریت حوادث
- **Field Service**: خدمات میدانی

## ساختار کارت‌ها

هر کارت شامل:
- ✅ **تصویر** (اختیاری)
- ✅ **عنوان**
- ✅ **توضیحات**
- ✅ **لینک** (با آیکون فلش)

## فایل‌های تغییر یافته

### 1. کامپوننت اصلی
```
src/components/builder-sections/PlatformTabsSection.tsx
```
این کامپوننت قبلاً وجود داشت و نیازی به تغییر نداشت.

### 2. Registry
```
src/lib/page-builder/section-registry-nwm.ts
```
سکشن `platform-tabs` به registry اضافه شد.

### 3. Renderer
```
src/lib/page-builder/section-renderer.tsx
```
کامپوننت قبلاً در renderer ثبت شده بود.

### 4. اسکریپت اضافه‌کننده
```
scripts/add-platform-tabs.ts
```
اسکریپت جدید برای اضافه کردن سکشن به صفحه.

## نحوه استفاده

### اجرای اسکریپت
```bash
npx tsx scripts/add-platform-tabs.ts
```

### مشاهده صفحه
```
http://localhost:3000/en
```

## موقعیت سکشن
سکشن بعد از `ecosystem-nwm` و در موقعیت 4 قرار گرفته است.

## ویژگی‌های طراحی

### حالت روشن (Light Mode)
- پس‌زمینه: `bg-slate-950`
- رنگ متن: `text-white`
- کارت‌ها: پس‌زمینه سفید با border

### حالت تاریک (Dark Mode)
- پس‌زمینه: `dark:bg-slate-950`
- رنگ متن: `dark:text-white`
- کارت‌ها: پس‌زمینه تیره با border

### انیمیشن‌ها
- ✨ Hover effect روی کارت‌ها (translate-y)
- ✨ Shadow effect
- ✨ Border color change
- ✨ Image scale on hover

## سفارشی‌سازی

### اضافه کردن تب جدید
در فایل اسکریپت یا از طریق admin panel:
```typescript
{
  id: 'new-tab',
  label: 'Tab Label',
  cards: [
    {
      title: 'Card Title',
      description: 'Card description',
      image: '/path/to/image.png',
      link: '/link-url',
    }
  ]
}
```

### تغییر تعداد ستون‌ها
در کامپوننت `PlatformTabsSection.tsx`:
```tsx
// فعلی: 4 ستون
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

// برای 3 ستون:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

### کارت بدون عکس
عکس اختیاری است. اگر `image` را حذف کنید، فقط متن نمایش داده می‌شود.

## تست شده
✅ Build موفق  
✅ TypeScript بدون خطا  
✅ Dark/Light mode  
✅ Responsive design  
✅ Hover animations  

## نکات مهم
- 🎨 تمام تصاویر در `/public/assets/img/` قرار دارند
- 🔗 لینک‌ها قابل تغییر هستند
- 📱 کاملاً responsive است
- 🌙 از dark mode پشتیبانی می‌کند
- ⚡ انیمیشن‌های smooth دارد

---
**تاریخ**: ${new Date().toLocaleDateString('fa-IR')}  
**وضعیت**: ✅ تکمیل شده و تست شده
