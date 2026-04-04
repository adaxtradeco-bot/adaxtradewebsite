# 🌍 Multilingual System - Complete Documentation

## نمای کلی

سیستم چندزبانگی با رویکرد **Hybrid Smart** پیادهسازی شده:
- ✅ صفحات جداگانه برای هر زبان
- ✅ گروهبندی صفحات مرتبط با PageGroup
- ✅ Dictionary برای متنهای مشترک
- ✅ بدون تغییر در 79 سکشن موجود

---

## 🏗️ معماری

```
Multilingual System
├── Database Layer
│   ├── PageGroup (گروهبندی صفحات)
│   └── Page (با فیلدهای چندزبانگی)
│
├── Dictionary Layer
│   ├── src/locales/en/sections.json
│   └── src/locales/ar/sections.json
│
├── API Layer
│   ├── /api/admin/pages/grouped
│   ├── /api/admin/pages/[id]/add-translation
│   ├── /api/admin/pages/[id]/sync-structure
│   └── /api/admin/page-groups
│
└── UI Layer
    ├── Admin Components (PageListGrouped, AddTranslationModal, ...)
    └── Frontend Components (LanguageSwitcher)
```

---

## 📊 Database Schema

### PageGroup Model
```prisma
model PageGroup {
  id              String   @id @default(cuid())
  name            String   // نام گروه (مثلاً "Home Page")
  slug            String   @unique // slug مشترک (مثلاً "home")
  defaultLanguage String   @default("en")
  pages           Page[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Page Model (فیلدهای جدید)
```prisma
model Page {
  // ... فیلدهای قبلی
  
  pageGroupId   String?   // لینک به PageGroup
  isDefaultLang Boolean   @default(false) // آیا زبان پیشفرض است؟
  lastSyncedAt  DateTime? // آخرین همگامسازی
  
  pageGroup     PageGroup? @relation(...)
}
```

---

## 🎯 ویژگیها

### 1. گروهبندی صفحات

صفحات با زبانهای مختلف در یک گروه قرار میگیرند:

```
📁 Home Page
   ├─ 🇺🇸 EN  /en/home  (Default)
   └─ 🇸🇦 AR  /ar/home

📁 About Us
   ├─ 🇺🇸 EN  /en/about  (Default)
   ├─ 🇸🇦 AR  /ar/about
   └─ 🇫🇷 FR  /fr/about
```

### 2. Dictionary System

متنهای مشترک در فایلهای JSON:

```json
// src/locales/en/sections.json
{
  "common": {
    "cta": {
      "getStarted": "Get Started",
      "learnMore": "Learn More"
    }
  }
}
```

استفاده در سکشنها:
```json
{
  "primaryButton": {
    "text": "@common.cta.getStarted",
    "href": "/signup"
  }
}
```

### 3. Sync Structure

همگامسازی ساختار بین زبانها:
- کپی section types و order
- حفظ محتوای موجود
- بهروزرسانی style settings

---

## 🚀 استفاده

### برای ادمین

#### ایجاد صفحه جدید
1. Admin → Pages → Create New Page
2. انتخاب زبان و نام صفحه
3. ذخیره → یک PageGroup جدید ایجاد میشود

#### اضافه کردن ترجمه
1. در لیست صفحات، روی "Add Translation" کلیک کنید
2. زبان جدید را انتخاب کنید
3. گزینههای Copy را تنظیم کنید
4. Create Translation

#### همگامسازی ساختار
1. به صفحه مقصد بروید
2. روی "Sync Structure" کلیک کنید
3. تایید کنید

### برای توسعهدهنده

#### استفاده از Dictionary در سکشنها

```typescript
// در builderData
{
  "sections": [
    {
      "type": "hero",
      "data": {
        "title": "Custom Title",  // متن مستقیم
        "cta": "@common.cta.getStarted"  // از dictionary
      }
    }
  ]
}
```

#### Resolve کردن Dictionary Keys

```typescript
import { resolveFieldValue } from '@/lib/i18n/dictionary-resolver';

const text = await resolveFieldValue("@common.cta.getStarted", "en");
// Result: "Get Started"
```

#### استفاده از Hook

```typescript
import { useResolvedField } from '@/hooks/useSectionTranslation';

function MyComponent({ data }) {
  const title = useResolvedField(data.title);
  return <h1>{title}</h1>;
}
```

---

## 📁 فایلهای کلیدی

### Database & Migrations
```
prisma/
├── schema.prisma (بهروزرسانی شده)
└── migrations/
    └── 20240120_add_page_grouping/
        └── migration.sql
```

### Core Utilities
```
src/lib/i18n/
├── dictionary-resolver.ts (resolve کردن @keys)
├── translations.ts (سیستم ترجمه)
└── config.ts (تنظیمات زبانها)
```

### Dictionary Files
```
src/locales/
├── en/
│   └── sections.json
└── ar/
    └── sections.json
```

### API Routes
```
src/app/api/admin/
├── pages/
│   ├── grouped/route.ts
│   └── [id]/
│       ├── add-translation/route.ts
│       └── sync-structure/route.ts
└── page-groups/route.ts
```

### Admin Components
```
src/components/admin/
├── PageListGrouped.tsx
├── PageListFlat.tsx
├── ViewModeToggle.tsx
├── AddTranslationModal.tsx
├── LanguageSwitcher.tsx
├── SyncStructureButton.tsx
└── CreatePageModal.tsx
```

### Scripts
```
scripts/
├── migrate-pages-to-groups.ts (TypeScript)
├── migrate-pages-to-groups.js (CommonJS for Vercel)
└── postbuild.js (Vercel post-build)
```

---

## 🔧 تنظیمات

### package.json Scripts

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postbuild": "node scripts/migrate-pages-to-groups.js || true",
    "db:migrate": "prisma migrate deploy"
  }
}
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# یا Prisma Accelerate
DATABASE_URL=prisma+postgres://...

# Authentication
JWT_SECRET=your-secret
ADMIN_PASSWORD=your-password
```

---

## 🧪 Testing

### تست محلی

```bash
# 1. Build
npm run build

# 2. اجرای migration (اگر DB در دسترس بود)
npm run db:migrate

# 3. اجرای data migration
node scripts/migrate-pages-to-groups.js

# 4. شروع سرور
npm start
```

### تست در Vercel

```bash
# Deploy
vercel --prod

# بررسی logs
vercel logs [deployment-url]
```

---

## 📊 API Endpoints

### GET /api/admin/pages/grouped
دریافت صفحات گروهبندی شده

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [...],
    "ungroupedPages": [...],
    "stats": {
      "totalGroups": 5,
      "totalPages": 12,
      "languages": ["en", "ar"]
    }
  }
}
```

### POST /api/admin/pages/[id]/add-translation
اضافه کردن ترجمه جدید

**Request:**
```json
{
  "language": "ar",
  "slug": "/ar/about",
  "copyStructure": true,
  "copyStyles": true
}
```

### POST /api/admin/pages/[id]/sync-structure
همگامسازی ساختار

**Request:**
```json
{
  "targetPageId": "page-id",
  "syncContent": false
}
```

---

## 🎨 UI Components

### PageListGrouped
نمایش صفحات به صورت گروهبندی شده

```tsx
<PageListGrouped 
  onAddTranslation={(pageId) => {
    // Handle add translation
  }}
/>
```

### AddTranslationModal
Modal اضافه کردن ترجمه

```tsx
<AddTranslationModal
  isOpen={true}
  sourcePageId="page-id"
  existingLanguages={["en"]}
  onClose={() => {}}
  onSuccess={() => {}}
/>
```

### LanguageSwitcher
تغییر بین زبانها در editor

```tsx
<LanguageSwitcher
  currentPageId="page-id"
  currentLanguage="en"
  pageGroupId="group-id"
  onAddTranslation={() => {}}
/>
```

---

## 🐛 عیبیابی

### مشکل: صفحات گروهبندی نشدهاند

**راهحل:**
```bash
node scripts/migrate-pages-to-groups.js
```

### مشکل: Dictionary keys resolve نمیشوند

**بررسی:**
1. فایل `src/locales/[lang]/sections.json` وجود دارد؟
2. کلید با `@` شروع میشود؟
3. مسیر کلید صحیح است؟

### مشکل: Migration در Vercel اجرا نشد

**بررسی:**
1. Vercel logs را چک کنید
2. DATABASE_URL صحیح است؟
3. `postbuild` script اجرا شده؟

---

## 📈 Performance

### Optimizations
- ✅ Dictionary caching در memory
- ✅ Lazy loading برای translations
- ✅ Database indexes برای queries
- ✅ Static generation برای صفحات

### Metrics
- Build time: ~2-3 دقیقه
- Migration time: ~10-30 ثانیه (بسته به تعداد صفحات)
- Page load: <1 ثانیه

---

## 🔐 Security

### Best Practices
- ✅ Authentication برای admin routes
- ✅ Input validation با Zod
- ✅ SQL injection prevention با Prisma
- ✅ XSS protection

---

## 🚀 Roadmap

### Phase 1 (Completed) ✅
- Database schema
- Core utilities
- API routes
- Admin UI
- Build & deployment

### Phase 2 (Future)
- [ ] Frontend language switcher
- [ ] Auto-translation suggestions
- [ ] Bulk operations
- [ ] Translation progress indicator

### Phase 3 (Future)
- [ ] More languages support
- [ ] Translation memory
- [ ] Workflow automation
- [ ] Analytics

---

## 📚 مراجع

- [Vercel Deployment Guide](./vercel-deployment.md)
- [Implementation Plan](./multilingual-implementation-plan.md)
- [Page Builder Reference](./page-builder.md)

---

## 🤝 مشارکت

برای اضافه کردن زبان جدید:

1. به `src/lib/i18n/config.ts` اضافه کنید:
```typescript
export const languages = {
  // ...
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    flag: '🇫🇷'
  }
};
```

2. فایل dictionary بسازید:
```bash
cp src/locales/en/sections.json src/locales/fr/sections.json
```

3. ترجمهها را بهروزرسانی کنید

---

**آماده استفاده! 🎉**
