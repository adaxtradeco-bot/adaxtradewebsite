# Page Builder Sections - Batch 2 Documentation

## Overview
این داکیومنت شامل 5 سکشن جدید برای Page Builder است که با دارک مود کامل و Property Panel قابل تنظیم طراحی شدهاند.

---

## 1. Testimonial Section

### Features
- نمایش نظرات کاربران با امتیاز ستارهای
- پشتیبانی از آواتار و اطلاعات کاربر
- لیاوت Grid با 2 یا 3 ستون
- دارک مود کامل با bg-slate-900

### Props Structure
```typescript
{
  data: {
    title: string;
    subtitle: string;
    testimonials: [
      {
        id: string;
        name: string;
        role: string;
        company: string;
        content: string;
        rating: number;
        avatar: string;
      }
    ]
  },
  style: {
    layout: 'grid' | 'carousel';
    columns: 2 | 3;
    showRating: boolean;
    showAvatar: boolean;
  }
}
```

### Default Data
```json
{
  "type": "testimonial",
  "data": {
    "title": "What Our Students Say",
    "subtitle": "Real feedback from real learners",
    "testimonials": [
      {
        "id": "t1",
        "name": "Sarah Johnson",
        "role": "Marketing Manager",
        "company": "TechCorp",
        "content": "This platform transformed my English skills in just 3 months!",
        "rating": 5,
        "avatar": "/assets/avatar1.jpg"
      }
    ]
  },
  "style": {
    "layout": "grid",
    "columns": 3,
    "showRating": true,
    "showAvatar": true
  }
}
```

### Dark Mode Classes
- Background: `bg-white dark:bg-slate-900`
- Cards: `bg-slate-50 dark:bg-slate-800`
- Borders: `border-slate-200 dark:border-slate-700`
- Shadows: `hover:shadow-xl dark:hover:shadow-slate-700/50`

---

## 2. Feature Grid Section

### Features
- نمایش ویژگیها با آیکونهای رنگی
- سایز آیکون قابل تنظیم (sm, md, lg)
- لیاوت 2، 3 یا 4 ستونی
- حالت با/بدون Background Card

### Props Structure
```typescript
{
  data: {
    title: string;
    subtitle: string;
    features: [
      {
        id: string;
        icon: string;
        title: string;
        description: string;
        color: string;
      }
    ]
  },
  style: {
    columns: 2 | 3 | 4;
    iconSize: 'sm' | 'md' | 'lg';
    showBackground: boolean;
  }
}
```

### Default Data
```json
{
  "type": "feature-grid",
  "data": {
    "title": "Powerful Features",
    "subtitle": "Everything you need to master English",
    "features": [
      {
        "id": "f1",
        "icon": "Zap",
        "title": "Fast Learning",
        "description": "Learn at your own pace with adaptive lessons",
        "color": "#8B5CF6"
      }
    ]
  },
  "style": {
    "columns": 3,
    "iconSize": "md",
    "showBackground": true
  }
}
```

### Dark Mode Classes
- Background: `bg-slate-50 dark:bg-slate-900`
- Cards: `bg-white dark:bg-slate-800`
- Borders: `border-slate-200 dark:border-slate-700`

---

## 3. CTA Section

### Features
- 3 نوع variant: gradient, solid, outlined
- دکمه اصلی و ثانویه
- تراز چپ، وسط، راست
- سایز sm, md, lg

### Props Structure
```typescript
{
  data: {
    title: string;
    description: string;
    primaryButton: {
      text: string;
      link: string;
    };
    secondaryButton?: {
      text: string;
      link: string;
    };
  },
  style: {
    variant: 'gradient' | 'solid' | 'outlined';
    alignment: 'left' | 'center' | 'right';
    size: 'sm' | 'md' | 'lg';
  }
}
```

### Default Data
```json
{
  "type": "cta",
  "data": {
    "title": "Ready to Start Learning?",
    "description": "Join thousands of students improving their English every day",
    "primaryButton": {
      "text": "Get Started Free",
      "link": "/signup"
    },
    "secondaryButton": {
      "text": "View Pricing",
      "link": "/pricing"
    }
  },
  "style": {
    "variant": "gradient",
    "alignment": "center",
    "size": "md"
  }
}
```

### Dark Mode Classes
- Gradient: `bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-700 dark:to-cyan-700`
- Solid: `bg-slate-900 dark:bg-slate-800`
- Outlined: `bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-700`

---

## 4. Team Section

### Features
- نمایش اعضای تیم با تصویر
- لینکهای شبکههای اجتماعی (LinkedIn, Twitter, GitHub, Email)
- نمایش/عدم نمایش Bio
- لیاوت 2، 3 یا 4 ستونی
- دو استایل: minimal و card

### Props Structure
```typescript
{
  data: {
    title: string;
    subtitle: string;
    members: [
      {
        id: string;
        name: string;
        role: string;
        bio: string;
        avatar: string;
        social: {
          linkedin?: string;
          twitter?: string;
          github?: string;
          email?: string;
        };
      }
    ]
  },
  style: {
    columns: 2 | 3 | 4;
    showBio: boolean;
    showSocial: boolean;
    cardStyle: 'minimal' | 'card';
  }
}
```

### Default Data
```json
{
  "type": "team",
  "data": {
    "title": "Meet Our Team",
    "subtitle": "Passionate educators dedicated to your success",
    "members": [
      {
        "id": "m1",
        "name": "Dr. Emily Chen",
        "role": "Lead Instructor",
        "bio": "PhD in Applied Linguistics with 15 years of teaching experience",
        "avatar": "/assets/team1.jpg",
        "social": {
          "linkedin": "https://linkedin.com/in/emilychen",
          "twitter": "https://twitter.com/emilychen",
          "email": "emily@example.com"
        }
      }
    ]
  },
  "style": {
    "columns": 3,
    "showBio": true,
    "showSocial": true,
    "cardStyle": "card"
  }
}
```

### Dark Mode Classes
- Background: `bg-white dark:bg-slate-900`
- Cards: `bg-slate-50 dark:bg-slate-800`
- Borders: `border-slate-200 dark:border-slate-700`
- Social Icons: `bg-slate-200 dark:bg-slate-700 hover:bg-violet-600`

---

## 5. FAQ Section

### Features
- آکاردئون با انیمیشن باز/بسته شدن
- لیاوت تک ستونی یا دو ستونی
- نمایش شماره سوال
- حالت پیشفرض باز یا بسته

### Props Structure
```typescript
{
  data: {
    title: string;
    subtitle: string;
    faqs: [
      {
        id: string;
        question: string;
        answer: string;
      }
    ]
  },
  style: {
    layout: 'single' | 'two-column';
    defaultOpen: boolean;
    showNumbers: boolean;
  }
}
```

### Default Data
```json
{
  "type": "faq",
  "data": {
    "title": "Frequently Asked Questions",
    "subtitle": "Everything you need to know about our platform",
    "faqs": [
      {
        "id": "faq1",
        "question": "How long does it take to see results?",
        "answer": "Most students see noticeable improvement within 4-6 weeks of consistent practice."
      }
    ]
  },
  "style": {
    "layout": "single",
    "defaultOpen": false,
    "showNumbers": true
  }
}
```

### Dark Mode Classes
- Background: `bg-slate-50 dark:bg-slate-900`
- Cards: `bg-white dark:bg-slate-800`
- Borders: `border-slate-200 dark:border-slate-700`
- Hover: `hover:bg-slate-50 dark:hover:bg-slate-700/50`
- Number Badge: `bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400`

---

## استفاده در Database

### روش 1: اجرای اسکریپت آماده

```bash
node scripts/add-new-sections.js
```

این اسکریپت یک صفحه دمو با تمام 5 سکشن جدید میسازد.

### روش 2: اضافه کردن دستی با Prisma

```typescript
await prisma.page.update({
  where: { slug: 'your-page' },
  data: {
    builderData: {
      sections: [
        {
          id: 'section-1',
          type: 'testimonial',
          order: 1,
          data: { /* data object */ },
          style: { /* style object */ }
        }
      ]
    }
  }
});
```

---

## نکات مهم

1. **Dark Mode**: همه سکشنها از `dark:` prefix استفاده میکنند
2. **Responsive**: Grid ها با `md:` و `lg:` breakpoint ها responsive هستند
3. **Transitions**: همه hover effect ها `transition-all` دارند
4. **Icons**: از `lucide-react` استفاده میشود (نصب شده)
5. **Images**: از Next.js `Image` component برای بهینهسازی استفاده شده
6. **Optional Chaining**: همه props با `?.` برای جلوگیری از خطا
7. **Default Values**: همه سکشنها default values دارند

## Property Panel Integration

همه property های style و data در PropertyPanel قابل ویرایش هستند:
- Text fields برای title, subtitle, description
- Number fields برای columns, rating
- Boolean toggles برای showRating, showBio, defaultOpen
- Select dropdowns برای layout, variant, alignment, iconSize
- Array fields برای testimonials, features, members, faqs

## فایلهای ایجاد شده

```
src/components/builder-sections/
├── TestimonialSection.tsx
├── FeatureGridSection.tsx
├── CTASection.tsx
├── TeamSection.tsx
└── FAQSection.tsx

scripts/
└── add-new-sections.js

SECTIONS_BATCH_2_DOCS.md
```

## بیلد موفق ✅

پروژه با موفقیت build شد و تمام سکشنها آماده استفاده هستند.
