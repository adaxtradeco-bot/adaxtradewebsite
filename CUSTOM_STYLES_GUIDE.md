# سیستم CSS سفارشی - راهنمای استفاده

## نحوه کار سیستم

### 1. ساختار ID و کلاسها
هر سکشن دارای موارد زیر است:
- **ID**: `section-{name}` یا `section-{name}-{index}`
- **کلاس اصلی**: `section-{name}`
- **کلاسهای فرعی**: `{name}-{element}`

### 2. استفاده از CustomSectionWrapper

```tsx
import { CustomSectionWrapper } from '@/components/ui/CustomSectionWrapper';

<CustomSectionWrapper 
  sectionName="hero"
  className="your-tailwind-classes"
  adminMode={adminMode}
>
  <div className="hero-content">
    <h1 className="hero-title">عنوان</h1>
    <p className="hero-description">توضیحات</p>
  </div>
</CustomSectionWrapper>
```

### 3. فعالسازی حالت ادمین

```tsx
const [adminMode, setAdminMode] = useState(false);

// در JSX
<CustomStylesManager adminMode={adminMode} />
```

## ویژگیها

### 1. ویرایشگر CSS زنده
- ویرایش CSS برای هر سکشن
- پیشنمایش زنده تغییرات
- نمونههای آماده CSS

### 2. مدیریت استایلها
- فعال/غیرفعال کردن استایلها
- حذف استایلهای سکشن
- CSS سراسری

### 3. Import/Export
- صادرات تنظیمات به JSON
- وارد کردن تنظیمات از JSON
- کپی به کلیپبورد

## نمونه استایلهای CSS

### تغییر پسزمینه
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
```

### انیمیشن سفارشی
```css
animation: fadeInUp 1s ease-out;

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### استایل دکمهها
```css
.hero-primary-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  transform: scale(1.1);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
```

## کلاسهای موجود در HeroSliderNWMSection

### کانتینر اصلی
- `#section-hero-slider-nwm`
- `.hero-slider-container`
- `.hero-slider-track`

### هر اسلاید
- `.hero-slide`
- `.hero-slide-media`
- `.hero-slide-content`
- `.hero-slide-layout`

### محتوای چپ
- `.hero-slide-left`
- `.hero-slide-badge`
- `.hero-slide-text`
- `.hero-slide-category`
- `.hero-slide-title`
- `.hero-slide-description`
- `.hero-slide-stats`

### دکمهها
- `.hero-slide-buttons`
- `.hero-slide-primary-btn`
- `.hero-slide-secondary-btn`

### کارت راست
- `.hero-slide-card`

### ناوبری
- `.hero-slider-navigation`

## نکات مهم

1. **CSS بدون سلکتور**: استایلها مستقیماً به ID سکشن اعمال میشوند
2. **Responsive**: از کلاسهای Tailwind برای responsive استفاده کنید
3. **Dark Mode**: از متغیرهای CSS برای پشتیبانی از حالت تاریک
4. **Performance**: استایلهای غیرفعال اعمال نمیشوند

## مثال کامل

```tsx
// در کامپوننت
<CustomSectionWrapper 
  sectionName="hero"
  className="min-h-screen flex items-center"
>
  <div className="hero-content max-w-4xl mx-auto text-center">
    <h1 className="hero-title text-5xl font-bold mb-6">
      عنوان اصلی
    </h1>
    <p className="hero-description text-xl mb-8">
      توضیحات مفصل
    </p>
    <button className="hero-cta-btn px-8 py-4 rounded-lg">
      دکمه اقدام
    </button>
  </div>
</CustomSectionWrapper>
```

```css
/* CSS سفارشی */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;

.hero-title {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: slideInDown 1s ease-out;
}

.hero-cta-btn {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.hero-cta-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}
```