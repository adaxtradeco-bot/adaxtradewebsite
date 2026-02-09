# ProductHeroSection - Unified Hero Component

## Overview
سکشن **ProductHeroSection** یک کامپوننت یکپارچه است که جایگزین سه سکشن قبلی شده:
- `workflow-hero`
- `form-builder-hero`  
- `app-builder-hero`

## ویژگیها

### 1. انواع محتوای سمت راست
- **Cards**: نمایش کارتهای ویژگی (مانند workflow-hero)
- **Image**: نمایش تصویر با تنظیمات کامل
- **Video**: نمایش ویدیو با کنترلهای پخش
- **Placeholder**: نمایش placeholder با آیکون و متن

### 2. تنظیمات تصویر/ویدیو
- `mediaFit`: نحوه fit شدن محتوا (`cover`, `contain`, `fill`, `none`, `scale-down`)
- `mediaAspectRatio`: نسبت ابعاد (مثلاً `4/3`, `16/9`, `1/1`)
- `mediaUrl`: آدرس فایل
- `mediaAlt`: متن جایگزین برای تصویر

### 3. تمهای رنگی
- **8 تم از پیش تعریف شده**: Indigo & Cyan, Violet & Cyan, Fuchsia & Violet, و...
- `themeId`: انتخاب تم از لیست
- `customBackground`: gradient پس‌زمینه سفارشی
- `customTitleGradientFrom`: رنگ شروع gradient عنوان
- `customTitleGradientTo`: رنگ پایان gradient عنوان

### 4. Font Awesome Icons
- پشتیبانی کامل از Font Awesome Pro
- `iconConfig`: تنظیمات آیکون (name, type, size, color)
- قابل استفاده در: cards, features, placeholder
- انتخاب از 10000+ آیکون

### 5. سفارشیسازی
- رنگهای gradient قابل تنظیم
- badge و footer text اختیاری
- دکمههای اصلی و ثانویه
- لیست badges در پایین

## ساختار داده

\`\`\`typescript
{
  id: 'hero-1',
  type: 'product-hero',
  order: 0,
  data: {
    // محتوای اصلی
    badge: 'Live orchestration for modern teams',
    title: 'Orchestrate Processes. Reduce Errors.',
    titleHighlight: 'Move Faster.',
    description: 'Model, automate, and optimize...',
    
    // دکمهها
    primaryButton: { text: 'Explore Features', href: '#features' },
    secondaryButton: { text: 'See Business Impact', href: '#impact' },
    
    // اختیاری
    footerText: 'Secure • Extensible • Real-time visibility',
    badges: ['No-Code', 'AI-Assisted', 'Enterprise'],
    
    // تم رنگی
    themeId: 'indigo-cyan', // یا 'violet-cyan', 'fuchsia-violet', ...
    customBackground: '', // برای gradient سفارشی
    customTitleGradientFrom: '', // رنگ شروع gradient عنوان
    customTitleGradientTo: '', // رنگ پایان gradient عنوان
    
    // نوع محتوای سمت راست
    rightContentType: 'cards', // یا 'image' یا 'video' یا 'placeholder'
    
    // برای حالت cards
    cards: [
      { 
        icon: '⚙️', // emoji یا null
        iconConfig: { // Font Awesome icon
          name: 'cog',
          type: 'solid',
          size: 'lg',
          color: '#3B82F6'
        },
        title: 'Visual Builder', 
        description: 'Drag & drop...' 
      }
    ],
    
    // برای حالت image/video
    mediaUrl: '/assets/product-demo.mp4',
    mediaAlt: 'Product showcase',
    mediaFit: 'cover',
    mediaAspectRatio: '16/9',
    
    // برای حالت placeholder
    placeholderIcon: '🎨', // emoji یا null
    placeholderIconConfig: { // Font Awesome icon
      name: 'palette',
      type: 'solid',
      size: '4xl',
      color: '#6366F1'
    },
    placeholderText: 'Product Preview',
    
    // ویژگیهای پایین (اختیاری)
    features: [
      { 
        icon: '🧩',
        iconConfig: { name: 'puzzle-piece', type: 'solid', size: 'lg', color: '#10B981' },
        label: 'Drag & Drop' 
      }
    ]
  },
  style: {
    backgroundColor: 'bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50',
    textColor: 'text-slate-900 dark:text-white',
    padding: 'py-20 lg:py-32'
  }
}
\`\`\`

## مثالها

### مثال 1: با کارتها (مانند workflow-hero)
\`\`\`javascript
{
  type: 'product-hero',
  data: {
    title: 'Orchestrate Processes',
    titleHighlight: 'Move Faster',
    rightContentType: 'cards',
    cards: [
      { icon: '⚙️', title: 'Visual Builder', description: 'Drag & drop stages' },
      { icon: '🔗', title: 'Integrations', description: 'Connect systems' }
    ]
  }
}
\`\`\`

### مثال 2: با تصویر
\`\`\`javascript
{
  type: 'product-hero',
  data: {
    title: 'Design Forms',
    titleHighlight: 'Run Your Processes',
    rightContentType: 'image',
    mediaUrl: '/assets/form-builder-screenshot.png',
    mediaFit: 'contain',
    mediaAspectRatio: '4/3',
    features: [
      { icon: '🧩', label: 'Drag & Drop' },
      { icon: '✅', label: 'Validations' }
    ]
  }
}
\`\`\`

### مثال 3: با ویدیو
\`\`\`javascript
{
  type: 'product-hero',
  data: {
    title: 'Custom Apps',
    titleHighlight: 'Zero Heavy Code',
    rightContentType: 'video',
    mediaUrl: '/assets/product-demo.mp4',
    mediaFit: 'cover',
    mediaAspectRatio: '16/9'
  }
}
\`\`\`

### مثال 4: با placeholder
\`\`\`javascript
{
  type: 'product-hero',
  data: {
    title: 'Build Applications',
    titleHighlight: 'Visually',
    rightContentType: 'placeholder',
    placeholderIcon: '🏗️',
    placeholderText: 'Drag-and-drop canvas',
    features: [
      { icon: '🧩', label: 'Components' },
      { icon: '🔗', label: 'Integrations' },
      { icon: '🛡️', label: 'Security' }
    ]
  }
}
\`\`\`

## Migration

برای تبدیل صفحات موجود، اسکریپت migration را اجرا کنید:

\`\`\`bash
node scripts/migrate-hero-sections.js
\`\`\`

این اسکریپت به صورت خودکار:
1. تمام صفحات را اسکن میکند
2. سکشنهای `workflow-hero`, `form-builder-hero`, `app-builder-hero` را پیدا میکند
3. آنها را به `product-hero` تبدیل میکند
4. تنظیمات مناسب را بر اساس نوع قبلی اعمال میکند

## نکات مهم

1. **Backward Compatibility**: سکشنهای قدیمی همچنان کار میکنند تا migration انجام شود
2. **Media Optimization**: از Next.js Image component برای بهینهسازی تصاویر استفاده میشود
3. **Responsive**: تمام حالتها به صورت کامل responsive هستند
4. **Dark Mode**: پشتیبانی کامل از dark mode
5. **Accessibility**: تمام المانها accessible هستند

## فایلهای مرتبط

- Component: `src/components/builder-sections/ProductHeroSection.tsx`
- Registry: `src/lib/page-builder/section-registry.ts`
- Renderer: `src/lib/page-builder/section-renderer.tsx`
- Migration: `scripts/migrate-hero-sections.js`

## تغییرات در Registry

سکشن جدید با ID `product-hero` در registry ثبت شده و سکشنهای زیر حذف شدهاند:
- ❌ `workflow-hero`
- ❌ `form-builder-hero`
- ✅ `product-hero` (جدید)

توجه: `app-builder-hero` در registry نبود، فقط در کامپوننتها بود.
