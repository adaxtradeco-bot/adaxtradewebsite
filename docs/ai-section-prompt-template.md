# AI Prompt Template — Create New Section

کپی کن این پرامپت رو، جاهای `[...]` رو پر کن، و بده به هوش مصنوعی:

---

## پرامپت (فارسی)

```
یک سکشن جدید برای یک website builder سازی Next.js / React (TypeScript) می‌خوام بسازی.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## اطلاعات سکشن مورد نظر

- **نام سکشن:** [مثال: Pricing Table]
- **type slug:** [مثال: pricing-table]  (kebab-case، منحصر به فرد)
- **دسته‌بندی:** [یکی از: Headers / Content / Actions / Social Proof / Navigation]
- **توضیح کوتاه:** [مثال: جدول قیمت‌گذاری با ۳ پلن]
- **محتوای مورد نظر:** [توضیح کامل اینکه سکشن چه دیزاینی داشته باشه، چه داده‌هایی نشون بده]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## قوانین و ساختار پروژه (حتماً رعایت کن)

### 1. Props Interface
کامپوننت باید این signature رو داشته باشه:

\`\`\`tsx
interface [ComponentName]Props {
  section: SectionConfig;   // از @/lib/page-builder/section-schemas
  isBuilder?: boolean;
}

export default function [ComponentName]({ section, isBuilder = false }: [ComponentName]Props) {
  const { data, style } = section;
  // data = محتوا (text, buttons, etc.)
  // style = استایل (backgroundColor, textColor, padding, alignment, layout)
}
\`\`\`

### 2. نام کامپوننت
- نام فایل: `[ComponentName].tsx`  (PascalCase + "Section")
- مثال: type=`pricing-table` → فایل: `PricingTableSection.tsx`
- export: `export default function PricingTableSection`

### 3. Tailwind CSS
- همه استایل‌ها با Tailwind CSS
- Dark mode پشتیبانی کن: `dark:bg-... dark:text-...`
- Responsive باشه: `sm:`, `md:`, `lg:` breakpoints
- رنگ‌های اصلی پروژه: violet, cyan, slate

### 4. محتوا از `section.data`
- همه متن‌ها، آرایه‌ها و داده‌ها از `section.data` باید بیاد
- هیچ hardcode ای نکن — همه محتوا باید قابل تغییر باشه
- مثال: `{data.title}` نه `{'عنوان ثابت'}`

### 5. `isBuilder` prop
- وقتی `isBuilder=true` هست، pointer-events یا hover تعاملی می‌تونه غیرفعال باشه
- اینو لازم نیست implement کنی مگه لازم باشه

### 6. ایمپورت‌های مجاز
\`\`\`tsx
import React from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
// آیکون‌ها از lucide-react مجازند
import { ArrowRight, Check, X } from 'lucide-react';
// کامپوننت Button پروژه:
import { Button } from '@/components/ui/Button';
\`\`\`

### 7. ساختار HTML
- wrapper اصلی: `<section className="py-20 ...">` 
- container: `<div className="max-w-7xl mx-auto px-6">`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## خروجی مورد نیاز (دقیقاً ۳ بخش)

### بخش ۱ — کد کامپوننت
فایل کامل TSX آماده برای کپی (با تمام import‌ها)

### بخش ۲ — Default Data (JSON)
فقط آبجکت داده‌های پیش‌فرض (محتوای `section.data`) به صورت JSON خالص:
\`\`\`json
{
  "title": "...",
  "description": "...",
  ...
}
\`\`\`

### بخش ۳ — اطلاعات ثبت (برای wizard)
\`\`\`
نام: [ComponentName]
typeSlug: [type-slug]
دسته: [Category]
توضیح: [description]
آیکون: [emoji]
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## مثال تکمیل‌شده

برای ساخت سکشن "Pricing Table":

```
نام سکشن: Pricing Table
type slug: pricing-table
دسته‌بندی: Actions
توضیح: جدول قیمت‌گذاری با ۳ پلن (Basic, Pro, Enterprise)
محتوای مورد نظر:
  - ۳ کارت قیمت با رنگ‌های متفاوت (Basic: خاکستری, Pro: violet با badge "Popular", Enterprise: تیره)
  - هر کارت: نام پلن، قیمت ماهانه، لیست فیچرها، دکمه CTA
  - toggle سوئیچ برای ماهانه/سالانه (اختیاری)
```

---

## نحوه استفاده از خروجی AI

1. در ادمین برو به **Section Library**
2. کلیک کن روی **Create New Section**
3. **Step 1** — اطلاعات بخش ۳ رو وارد کن (نام، slug، دسته، آیکون)
4. **Step 2** — JSON بخش ۲ رو paste کن
5. **Step 3** — کد بخش ۱ رو paste کن
6. **Step 4** — تأیید و ایجاد
7. سرور رو restart کن: `npm run dev`
