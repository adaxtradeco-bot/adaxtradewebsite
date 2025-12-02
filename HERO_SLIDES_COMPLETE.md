# ✅ تمام 4 اسلاید Hero اضافه شد

## صفحه ایجاد شد

**URL:** http://localhost:3000/en/nwmflow

**محتوا:** تمام 4 اسلاید Hero از سایت اصلی NWMFlow

---

## اسلایدها:

### 1. Citizen Requests (Video)
- **عنوان:** Modern public services without the legacy mess
- **توضیح:** Design and launch end-to-end citizen request and ticketing systems
- **Badge:** Government / Public Sector
- **نوع:** Video
- **مسیر:** /media/hero-citizen.mp4

### 2. HR & People Ops (Image)
- **عنوان:** HR operations that feel consumer-grade
- **توضیح:** From onboarding to leave management and performance reviews
- **Badge:** HR & Internal Services
- **نوع:** Image
- **مسیر:** /media/hero-hr.jpg

### 3. Customer Service (Video)
- **عنوان:** Omni-channel support, one unified OS
- **توضیح:** Bring web, call center, SMS, WhatsApp and email into a single automation layer
- **Badge:** Customer Experience
- **نوع:** Video
- **مسیر:** /media/hero-support.mp4

### 4. Enterprise Automation (Image)
- **عنوان:** The backbone for complex, mission-critical operations
- **توضیح:** Model processes, orchestrate APIs, track SLAs and monitor everything live
- **Badge:** Enterprise & Operations
- **نوع:** Image
- **مسیر:** /media/hero-enterprise.jpg

---

## ویژگیها:

✅ **Auto-play:** هر 7 ثانیه به اسلاید بعدی میرود
✅ **Navigation:** دکمههای زیر اسلایدر برای انتخاب دستی
✅ **Smooth Transitions:** انیمیشن 700ms با cubic-bezier
✅ **Video Support:** پشتیبانی از video و image
✅ **Responsive:** کاملاً responsive در تمام سایزها
✅ **Theme Support:** هر دو تم light و dark

---

## نحوه استفاده در صفحات دیگر:

### روش 1: از طریق Page Builder
1. برو به Admin Panel → Pages
2. صفحه جدید بساز یا یکی را ویرایش کن
3. سکشن HeroSliderNWMSection را اضافه کن
4. دیتای اسلایدها را از `HERO_SLIDES_DATA.ts` کپی کن

### روش 2: مستقیم در کد
```tsx
import { heroSlidesData } from '@/HERO_SLIDES_DATA';
import HeroSliderNWMSection from '@/components/builder-sections/HeroSliderNWMSection';

<HeroSliderNWMSection 
  slides={heroSlidesData}
  autoPlayInterval={7000}
/>
```

---

## فایلهای مرتبط:

1. **HERO_SLIDES_DATA.ts** - دیتای تمام اسلایدها
2. **HeroSliderNWMSection.tsx** - کامپوننت اسلایدر
3. **scripts/seed-nwm-hero-page.ts** - اسکریپت seed

---

## اجرای مجدد:

اگر خواستید صفحه را دوباره بسازید:

```bash
npx tsx scripts/seed-nwm-hero-page.ts
```

---

## نکات مهم:

⚠️ **فایلهای Media:**
فایلهای video و image در مسیر `/public/media/` قرار ندارند.
برای استفاده واقعی، باید فایلها را در این مسیر قرار دهید:

```
public/
  media/
    hero-citizen.mp4
    hero-citizen-poster.jpg
    hero-hr.jpg
    hero-support.mp4
    hero-support-poster.jpg
    hero-enterprise.jpg
```

یا مسیرها را در `HERO_SLIDES_DATA.ts` تغییر دهید.

---

## ✨ نتیجه:

🎉 تمام 4 اسلاید Hero اکنون در صفحه `/en/nwmflow` قابل مشاهده هستند!

- ✅ Citizen Requests
- ✅ HR & People Ops
- ✅ Customer Service
- ✅ Enterprise Automation
