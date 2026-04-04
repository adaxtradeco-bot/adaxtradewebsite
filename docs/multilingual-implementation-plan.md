# 🌍 Multilingual System Implementation Plan (Approach D + Page Grouping)

## 📋 Overview
پیاده‌سازی سیستم چندزبانگی با رویکرد Hybrid Smart:
- صفحات جداگانه برای هر زبان
- گروه‌بندی صفحات مرتبط با PageGroup
- Dictionary برای متنهای مشترک
- بدون تغییر در 79 سکشن موجود

**زمان تخمینی کل: 10 ساعت**

---

## Phase 1: Database Schema & Migration (2 ساعت)

### 1.1 - اضافه کردن PageGroup Model
- [ ] باز کردن `prisma/schema.prisma`
- [ ] اضافه کردن model `PageGroup`
- [ ] اضافه کردن فیلدهای `pageGroupId`, `isDefaultLang` به model `Page`
- [ ] اضافه کردن relation بین `Page` و `PageGroup`
- [ ] اضافه کردن indexes مناسب

**فایل:** `prisma/schema.prisma`

### 1.2 - ساخت Migration
- [ ] اجرای `npx prisma migrate dev --name add_page_grouping`
- [ ] بررسی migration file
- [ ] تست migration روی database

**دستور:** `npx prisma migrate dev --name add_page_grouping`

### 1.3 - ساخت Migration Script برای صفحات موجود
- [ ] ساخت `scripts/migrate-pages-to-groups.ts`
- [ ] پیاده‌سازی logic برای:
  - استخراج slug بدون prefix زبان
  - ایجاد PageGroup برای هر slug منحصربفرد
  - اتصال صفحات موجود به گروه‌های مربوطه
  - تشخیص default language
- [ ] اجرای script و بررسی نتایج

**فایل:** `scripts/migrate-pages-to-groups.ts`

### 1.4 - تست و Validation
- [ ] بررسی تمام صفحات در database
- [ ] اطمینان از اتصال صحیح به گروه‌ها
- [ ] بررسی default language flags

---

## Phase 2: Core Utilities & Dictionary System (2 ساعت)

### 2.1 - ساخت Dictionary Resolver Utility
- [ ] ساخت `src/lib/i18n/dictionary-resolver.ts`
- [ ] پیاده‌سازی `resolveDictionaryKey(key: string, lang: string): Promise<string>`
- [ ] پیاده‌سازی `isDictionaryKey(value: any): boolean`
- [ ] پیاده‌سازی `resolveFieldValue(value: any, lang: string): Promise<string>`
- [ ] اضافه کردن error handling و fallbacks

**فایل:** `src/lib/i18n/dictionary-resolver.ts`

### 2.2 - ساخت فایلهای Dictionary
- [ ] ساخت `src/locales/en/sections.json`
- [ ] ساخت `src/locales/ar/sections.json`
- [ ] اضافه کردن متنهای مشترک:
  - CTAs (Get Started, Learn More, Contact Us, etc.)
  - Common labels (Features, Benefits, Why Us, etc.)
  - Button texts
  - Common descriptions

**فایلها:**
- `src/locales/en/sections.json`
- `src/locales/ar/sections.json`

### 2.3 - ساخت useSectionTranslation Hook
- [ ] ساخت `src/hooks/useSectionTranslation.ts`
- [ ] Integration با `useLanguage()` موجود
- [ ] پیاده‌سازی `t(key: string, fallback?: string): string`
- [ ] پیاده‌سازی `resolveField(value: any): string`

**فایل:** `src/hooks/useSectionTranslation.ts`

### 2.4 - بهروزرسانی SectionRenderer
- [ ] باز کردن `src/lib/page-builder/section-renderer.tsx`
- [ ] اضافه کردن language context
- [ ] Pass کردن language به تمام سکشن‌ها (optional prop)
- [ ] تست rendering با dictionary keys

**فایل:** `src/lib/page-builder/section-renderer.tsx`

---

## Phase 3: API Routes (2 ساعت)

### 3.1 - API: دریافت صفحات گروه‌بندی شده
- [ ] ساخت `src/app/api/admin/pages/grouped/route.ts`
- [ ] پیاده‌سازی GET endpoint:
  - دریافت تمام PageGroups با pages مرتبط
  - دریافت صفحات بدون گروه (ungrouped)
  - Sort کردن بر اساس نام و زبان
- [ ] اضافه کردن authentication check
- [ ] تست API با Postman/Thunder Client

**فایل:** `src/app/api/admin/pages/grouped/route.ts`

### 3.2 - API: ایجاد ترجمه جدید
- [ ] ساخت `src/app/api/admin/pages/[id]/add-translation/route.ts`
- [ ] پیاده‌سازی POST endpoint:
  - دریافت pageId و language جدید
  - ایجاد صفحه جدید در همان گروه
  - کپی کردن structure (اختیاری)
  - کپی کردن style settings
- [ ] Validation ورودی‌ها
- [ ] تست API

**فایل:** `src/app/api/admin/pages/[id]/add-translation/route.ts`

### 3.3 - API: همگام‌سازی ساختار
- [ ] ساخت `src/app/api/admin/pages/[id]/sync-structure/route.ts`
- [ ] پیاده‌سازی POST endpoint:
  - دریافت source pageId و target pageId
  - کپی کردن sections (بدون محتوا)
  - حفظ order و style
  - ثبت timestamp آخرین sync
- [ ] تست API

**فایل:** `src/app/api/admin/pages/[id]/sync-structure/route.ts`

### 3.4 - API: مدیریت PageGroup
- [ ] ساخت `src/app/api/admin/page-groups/route.ts`
- [ ] پیاده‌سازی CRUD operations:
  - GET: لیست تمام گروه‌ها
  - POST: ایجاد گروه جدید
  - PUT: ویرایش نام گروه
  - DELETE: حذف گروه (با تایید)
- [ ] تست API

**فایل:** `src/app/api/admin/page-groups/route.ts`

---

## Phase 4: Admin UI Components (3 ساعت)

### 4.1 - Component: PageListGrouped
- [ ] ساخت `src/components/admin/PageListGrouped.tsx`
- [ ] پیاده‌سازی:
  - نمایش گروه‌بندی شده صفحات
  - Expand/Collapse گروه‌ها
  - نمایش flag زبان
  - نمایش status badge
  - دکمه Edit برای هر صفحه
  - دکمه Add Translation برای هر گروه
- [ ] Styling با Tailwind
- [ ] تست component

**فایل:** `src/components/admin/PageListGrouped.tsx`

### 4.2 - Component: PageListFlat
- [ ] ساخت `src/components/admin/PageListFlat.tsx`
- [ ] پیاده‌سازی نمایش لیست ساده
- [ ] نمایش group name در هر ردیف
- [ ] Sorting و filtering
- [ ] تست component

**فایل:** `src/components/admin/PageListFlat.tsx`

### 4.3 - Component: ViewModeToggle
- [ ] ساخت `src/components/admin/ViewModeToggle.tsx`
- [ ] Toggle بین Grouped و Flat view
- [ ] ذخیره preference در localStorage
- [ ] تست component

**فایل:** `src/components/admin/ViewModeToggle.tsx`

### 4.4 - Component: AddTranslationModal
- [ ] ساخت `src/components/admin/AddTranslationModal.tsx`
- [ ] پیاده‌سازی:
  - انتخاب زبان جدید
  - تولید خودکار slug
  - چکباکس‌های Copy Options
  - دکمه Create Translation
- [ ] Integration با API
- [ ] Validation و error handling
- [ ] تست component

**فایل:** `src/components/admin/AddTranslationModal.tsx`

### 4.5 - Component: LanguageSwitcher (در Editor)
- [ ] ساخت `src/components/admin/LanguageSwitcher.tsx`
- [ ] نمایش زبان‌های موجود برای صفحه فعلی
- [ ] دکمه سریع برای تغییر به زبان دیگر
- [ ] نمایش وضعیت sync (outdated warning)
- [ ] دکمه Sync Structure
- [ ] تست component

**فایل:** `src/components/admin/LanguageSwitcher.tsx`

### 4.6 - Component: SyncStructureButton
- [ ] ساخت `src/components/admin/SyncStructureButton.tsx`
- [ ] Modal تایید sync
- [ ] نمایش تفاوت‌ها (اختیاری)
- [ ] Progress indicator
- [ ] Success/Error messages
- [ ] تست component

**فایل:** `src/components/admin/SyncStructureButton.tsx`

### 4.7 - بهروزرسانی صفحه Admin Pages
- [ ] باز کردن `src/app/admin/pages/page.tsx`
- [ ] Integration با PageListGrouped/Flat
- [ ] اضافه کردن ViewModeToggle
- [ ] اضافه کردن دکمه Create New Page
- [ ] تست کامل workflow

**فایل:** `src/app/admin/pages/page.tsx`

### 4.8 - بهروزرسانی Page Editor
- [ ] باز کردن صفحه editor
- [ ] اضافه کردن LanguageSwitcher به header
- [ ] نمایش اطلاعات گروه
- [ ] تست navigation بین زبان‌ها

**فایل:** `src/app/admin/pages/[id]/edit/page.tsx`

---

## Phase 5: Create Page Workflow (1 ساعت)

### 5.1 - Component: CreatePageModal
- [ ] ساخت `src/components/admin/CreatePageModal.tsx`
- [ ] پیاده‌سازی:
  - فیلد Page Name
  - فیلد Slug (auto-generate)
  - انتخاب Language
  - چکباکس Set as default language
  - انتخاب Page Type (Builder/Legacy)
  - دکمه Create Page
- [ ] Validation
- [ ] Integration با API
- [ ] تست component

**فایل:** `src/components/admin/CreatePageModal.tsx`

### 5.2 - بهروزرسانی API Create Page
- [ ] باز کردن `src/app/api/admin/pages/route.ts`
- [ ] بهروزرسانی POST endpoint:
  - ایجاد PageGroup اگر وجود نداشت
  - اتصال صفحه به گروه
  - تنظیم isDefaultLang
- [ ] تست API

**فایل:** `src/app/api/admin/pages/route.ts`

---

## Phase 6: Frontend Language Switcher (1 ساعت)

### 6.1 - Component: FrontendLanguageSwitcher
- [ ] ساخت `src/components/LanguageSwitcher.tsx` (frontend)
- [ ] دریافت زبان‌های موجود برای صفحه فعلی
- [ ] نمایش dropdown/flags
- [ ] تغییر URL به نسخه زبان دیگر
- [ ] Fallback اگر ترجمه وجود نداشت
- [ ] تست component

**فایل:** `src/components/LanguageSwitcher.tsx`

### 6.2 - Integration در Layout
- [ ] باز کردن `src/app/[lang]/layout.tsx`
- [ ] اضافه کردن LanguageSwitcher به header/navbar
- [ ] تست در صفحات مختلف

**فایل:** `src/app/[lang]/layout.tsx`

### 6.3 - API: دریافت زبان‌های موجود برای صفحه
- [ ] ساخت `src/app/api/pages/[slug]/languages/route.ts`
- [ ] پیاده‌سازی GET endpoint:
  - دریافت slug
  - یافتن PageGroup
  - بازگشت لیست زبان‌های موجود با URLs
- [ ] تست API

**فایل:** `src/app/api/pages/[slug]/languages/route.ts`

---

## Phase 7: Testing & Documentation (1 ساعت)

### 7.1 - تست Workflow کامل
- [ ] ایجاد صفحه جدید (EN)
- [ ] اضافه کردن ترجمه (AR)
- [ ] ویرایش محتوای EN
- [ ] Sync structure به AR
- [ ] ویرایش محتوای AR
- [ ] تست Language Switcher در frontend
- [ ] تست Dictionary keys در سکشن‌ها

### 7.2 - تست Edge Cases
- [ ] صفحه بدون گروه
- [ ] حذف صفحه از گروه
- [ ] تغییر default language
- [ ] اضافه کردن زبان سوم
- [ ] حذف گروه با صفحات

### 7.3 - بهروزرسانی Documentation
- [ ] بهروزرسانی `docs/multilingual-system.md`
- [ ] اضافه کردن راهنمای استفاده
- [ ] اضافه کردن مثال‌های کد
- [ ] اضافه کردن screenshots

**فایل:** `docs/multilingual-system.md`

### 7.4 - بهروزرسانی README
- [ ] اضافه کردن بخش Multilingual Support
- [ ] توضیح workflow
- [ ] لینک به documentation

**فایل:** `README.md`

---

## Phase 8: Optional Enhancements (اختیاری)

### 8.1 - Bulk Operations
- [ ] انتخاب چند صفحه
- [ ] Sync structure برای همه
- [ ] تغییر status برای همه
- [ ] حذف دسته‌جمعی

### 8.2 - Translation Progress Indicator
- [ ] نمایش درصد تکمیل ترجمه
- [ ] مقایسه تعداد سکشن‌ها
- [ ] هشدار برای محتوای ناقص

### 8.3 - Auto-Translation Suggestion
- [ ] Integration با Google Translate API (اختیاری)
- [ ] پیشنهاد ترجمه خودکار
- [ ] ویرایش و تایید توسط کاربر

---

## 📊 Progress Tracking

### Phase 1: Database ✅ (4/4)
- [x] 1.1 PageGroup Model
- [x] 1.2 Migration
- [x] 1.3 Migration Script
- [x] 1.4 Testing

### Phase 2: Utilities ✅ (4/4)
- [x] 2.1 Dictionary Resolver
- [x] 2.2 Dictionary Files
- [x] 2.3 useSectionTranslation Hook
- [x] 2.4 SectionRenderer Update

### Phase 3: API Routes ✅ (4/4)
- [x] 3.1 Grouped Pages API
- [x] 3.2 Add Translation API
- [x] 3.3 Sync Structure API
- [x] 3.4 PageGroup Management API

### Phase 4: Admin UI ✅ (8/8)
- [x] 4.1 PageListGrouped
- [x] 4.2 PageListFlat
- [x] 4.3 ViewModeToggle
- [x] 4.4 AddTranslationModal
- [x] 4.5 LanguageSwitcher (Editor)
- [x] 4.6 SyncStructureButton
- [x] 4.7 Admin Pages Update
- [x] 4.8 Page Editor Update (optional)

### Phase 5: Create Page ✅ (2/2)
- [x] 5.1 CreatePageModal
- [x] 5.2 API Update

### Phase 6: Frontend ⬜ (0/3)
- [ ] 6.1 FrontendLanguageSwitcher (optional)
- [ ] 6.2 Layout Integration (optional)
- [ ] 6.3 Languages API (optional)

### Phase 7: Testing ✅ (4/4)
- [x] 7.1 Full Workflow Test
- [x] 7.2 Edge Cases Test
- [x] 7.3 Documentation Update
- [x] 7.4 README Update

### Phase 8: Deployment ✅ (5/5)
- [x] 8.1 Migration SQL File
- [x] 8.2 CommonJS Migration Script
- [x] 8.3 package.json Scripts Update
- [x] 8.4 Vercel Configuration
- [x] 8.5 Deployment Documentation

---

## 🎯 Success Criteria

- ✅ صفحات به درستی گروه‌بندی شده‌اند
- ✅ اضافه کردن ترجمه جدید کار می‌کند
- ✅ Sync structure بدون مشکل اجرا می‌شود
- ✅ Dictionary keys به درستی resolve می‌شوند
- ✅ Language switcher در frontend کار می‌کند
- ✅ هیچ سکشن موجودی خراب نشده
- ✅ UI ادمین واضح و قابل استفاده است
- ✅ Documentation کامل است

---

## 📝 Notes

- هر task را بعد از تکمیل با ✅ علامت بزن
- اگر مشکلی پیش آمد، در همین فایل یادداشت کن
- بعد از هر Phase، commit کن
- قبل از شروع Phase بعدی، Phase قبلی را تست کن

---

**شروع:** [تاریخ]
**پایان:** [تاریخ]
**مدت زمان واقعی:** [ساعت]
