# ProductHeroSection - مثالهای کامل

## تمهای رنگی موجود

```typescript
const themes = [
  'indigo-cyan',      // آبی تیره و فیروزه‌ای
  'violet-cyan',      // بنفش و فیروزه‌ای
  'fuchsia-violet',   // صورتی و بنفش
  'blue-indigo',      // آبی و نیلی
  'emerald-teal',     // سبز زمردی و سبز دریایی
  'orange-red',       // نارنجی و قرمز
  'purple-pink',      // ارغوانی و صورتی
  'slate-gray'        // خاکستری
];
```

## مثال 1: با کارتها و Font Awesome icons

```javascript
{
  type: 'product-hero',
  data: {
    badge: 'AI-Powered Platform',
    title: 'Automate Everything.',
    titleHighlight: 'Scale Faster.',
    description: 'Build, deploy, and manage workflows with our intelligent automation platform.',
    primaryButton: { text: 'Start Free Trial', href: '/signup' },
    secondaryButton: { text: 'Watch Demo', href: '/demo' },
    themeId: 'emerald-teal',
    rightContentType: 'cards',
    cards: [
      {
        icon: null,
        iconConfig: {
          name: 'bolt',
          type: 'solid',
          size: 'xl',
          color: '#10B981'
        },
        title: 'Lightning Fast',
        description: 'Process millions of events per second'
      },
      {
        icon: null,
        iconConfig: {
          name: 'shield-check',
          type: 'solid',
          size: 'xl',
          color: '#14B8A6'
        },
        title: 'Enterprise Security',
        description: 'SOC2 and GDPR compliant'
      },
      {
        icon: null,
        iconConfig: {
          name: 'chart-line',
          type: 'solid',
          size: 'xl',
          color: '#06B6D4'
        },
        title: 'Real-time Analytics',
        description: 'Monitor everything in real-time'
      },
      {
        icon: null,
        iconConfig: {
          name: 'plug',
          type: 'solid',
          size: 'xl',
          color: '#0EA5E9'
        },
        title: 'Easy Integration',
        description: 'Connect with 1000+ apps'
      }
    ]
  }
}
```

## مثال 2: با تصویر و تم سفارشی

```javascript
{
  type: 'product-hero',
  data: {
    title: 'Design Forms that',
    titleHighlight: 'Convert',
    description: 'Create beautiful, responsive forms with our drag-and-drop builder.',
    primaryButton: { text: 'Try Builder', href: '/builder' },
    secondaryButton: { text: 'See Templates', href: '/templates' },
    customBackground: 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950 dark:via-pink-950 dark:to-fuchsia-950',
    customTitleGradientFrom: 'from-rose-500',
    customTitleGradientTo: 'to-fuchsia-500',
    rightContentType: 'image',
    mediaUrl: '/assets/form-builder-demo.png',
    mediaFit: 'contain',
    mediaAspectRatio: '16/9',
    features: [
      {
        icon: null,
        iconConfig: { name: 'wand-magic-sparkles', type: 'solid', size: 'lg', color: '#EC4899' },
        label: 'AI Assistant'
      },
      {
        icon: null,
        iconConfig: { name: 'palette', type: 'solid', size: 'lg', color: '#D946EF' },
        label: 'Custom Themes'
      },
      {
        icon: null,
        iconConfig: { name: 'mobile-screen', type: 'solid', size: 'lg', color: '#C026D3' },
        label: 'Mobile Ready'
      }
    ]
  }
}
```

## مثال 3: با ویدیو

```javascript
{
  type: 'product-hero',
  data: {
    title: 'See It',
    titleHighlight: 'In Action',
    description: 'Watch how easy it is to build complex workflows in minutes.',
    primaryButton: { text: 'Get Started', href: '/start' },
    secondaryButton: { text: 'Documentation', href: '/docs' },
    themeId: 'blue-indigo',
    rightContentType: 'video',
    mediaUrl: '/assets/product-demo.mp4',
    mediaFit: 'cover',
    mediaAspectRatio: '16/9'
  }
}
```

## مثال 4: با placeholder و آیکونهای Font Awesome

```javascript
{
  type: 'product-hero',
  data: {
    badge: 'No-Code Platform',
    title: 'Build Apps',
    titleHighlight: 'Visually',
    description: 'Create powerful applications without writing a single line of code.',
    primaryButton: { text: 'Start Building', href: '/builder' },
    secondaryButton: { text: 'View Examples', href: '/examples' },
    themeId: 'violet-cyan',
    rightContentType: 'placeholder',
    placeholderIcon: null,
    placeholderIconConfig: {
      name: 'cube',
      type: 'solid',
      size: '5xl',
      color: '#8B5CF6'
    },
    placeholderText: 'Visual App Builder',
    features: [
      {
        icon: null,
        iconConfig: { name: 'layer-group', type: 'solid', size: 'lg', color: '#8B5CF6' },
        label: 'Components'
      },
      {
        icon: null,
        iconConfig: { name: 'code-branch', type: 'solid', size: 'lg', color: '#06B6D4' },
        label: 'Workflows'
      },
      {
        icon: null,
        iconConfig: { name: 'database', type: 'solid', size: 'lg', color: '#3B82F6' },
        label: 'Data Models'
      }
    ]
  }
}
```

## مثال 5: ترکیب emoji و Font Awesome

```javascript
{
  type: 'product-hero',
  data: {
    title: 'Flexible',
    titleHighlight: 'Icons',
    themeId: 'orange-red',
    rightContentType: 'cards',
    cards: [
      {
        icon: '🚀', // استفاده از emoji
        iconConfig: null,
        title: 'Quick Start',
        description: 'Get started in minutes'
      },
      {
        icon: null,
        iconConfig: { // استفاده از Font Awesome
          name: 'rocket',
          type: 'solid',
          size: 'xl',
          color: '#F97316'
        },
        title: 'Advanced Features',
        description: 'Unlock powerful capabilities'
      }
    ]
  }
}
```

## نکات مهم

### انتخاب بین emoji و Font Awesome
- اگر `iconConfig` تنظیم شده باشد، از Font Awesome استفاده میشه
- اگر `iconConfig` null باشد، از `icon` (emoji) استفاده میشه
- میتونی در یک سکشن هر دو رو ترکیب کنی

### تنظیمات Font Awesome Icon
```typescript
iconConfig: {
  name: 'bolt',              // نام آیکون (بدون fa-)
  type: 'solid',             // solid, regular, light, thin, duotone, brands
  size: 'xl',                // xs, sm, lg, xl, 2xl, 3xl, 4xl, 5xl
  color: '#10B981'           // هر رنگ hex
}
```

### انتخاب تم
```javascript
// استفاده از تم از پیش تعریف شده
themeId: 'indigo-cyan'

// یا استفاده از رنگهای سفارشی
customBackground: 'bg-gradient-to-br from-...',
customTitleGradientFrom: 'from-...',
customTitleGradientTo: 'to-...'
```

### اولویت رنگها
1. اگر `customBackground` تنظیم شده → از اون استفاده میشه
2. اگر `themeId` تنظیم شده → از تم استفاده میشه
3. در غیر اینصورت → از default استفاده میشه
