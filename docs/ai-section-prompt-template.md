# AI Prompt Template — Create New Section

دو راه برای ساخت سکشن هست:

| راه | خروجی هوش مصنوعی | کجا وارد می‌شود |
|---|---|---|
| **Custom HTML** (سریع‌تر، بدون کدنویسی و بدون restart) | یک فایل HTML | Section Library ← Import HTML |
| **کامپوننت React** | فایل TSX و JSON | Section Library ← Create New Section |

---

## پرامپت Custom HTML (برای Import HTML)

جاهای `[...]` رو پر کن و بده به هوش مصنوعی:

```
یک [سکشن / صفحه‌ی کامل] HTML برای وب‌سایت می‌خوام بسازی.

موضوع و دیزاین: [توضیح کامل اینکه چه شکلی باشه و چه محتوایی داشته باشه]
زبان محتوا: [English]

خروجی: فقط یک فایل HTML (حداکثر ۲ مگابایت) شامل HTML، یک <style> و در صورت نیاز <script>.

## محتوا
- همه‌ی متن‌ها، لینک‌ها و تصاویر مستقیم داخل HTML باشن. محتوا رو با JavaScript نساز.
- هر متن قابل ویرایش داخل المان خودش باشه. متن آزاد رو کنار المان‌های بلوکی (div و ...) نذار.
- داخل متن فقط از strong b em i u s br span small mark code sub sup استفاده کن.
  روی این المان‌های داخل متن data-* و id و style نذار (موقع ویرایش حذف می‌شن).
- داخل SVG متن (<text>) نذار. داخل <a> متن رو در <span> نپیچ.

## راهنماهای ویرایش (data-edit)
- اگر حتی یک راهنما بذاری، حالت پیش‌فرض import فقط المان‌های علامت‌خورده رو قابل ویرایش می‌کنه.
  پس هر چیزی که باید قابل ویرایش باشه رو علامت بزن (متن، دکمه، لینک، تصویر).
- data-edit="key"        کلید یکتا؛ فقط حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط
- data-edit-label="..."  اسم فیلد در پنل ویرایش (مثلاً "Hero title")
- data-edit-group="..."  گروه فیلد (مثلاً "Hero")
- data-edit-type="..."   فقط وقتی لازمه: text, textarea, richtext, link, image, bgImage, video, embed, icon
- data-edit-ignore       این المان و داخلش قابل ویرایش نباشه
- data-edit-repeat="key" روی ظرف یک لیست (کارت‌ها، سؤال‌ها، پلن‌ها). همه‌ی آیتم‌ها ساختار،
  کلاس‌ها و data-edit یکسان داشته باشن و فقط محتواشون فرق کنه.
  روی آیتم‌ها onclick نذار. لیست داخل لیست پشتیبانی نمی‌شه.

## CSS
- می‌تونی CSS معمولی یا Tailwind CDN (https://cdn.tailwindcss.com) استفاده کنی.
- اگر Tailwind: در tailwind.config فقط theme.extend با مقادیر ثابت. plugin و @apply ممنوع.
  اسم کلاس‌ها کامل نوشته بشن (نه ساختن اسم کلاس با چسباندن رشته در JavaScript).
- رنگ‌های اصلی رو به صورت CSS variable روی :root تعریف کن تا قابل ویرایش باشن.
- Dark mode با کلاس .dark (نه فقط prefers-color-scheme).
- اسم @keyframes ها یکتا باشه. Responsive باشه.

## JavaScript
- فقط اسکریپت معمولی. type="module"، import، و فریم‌ورک CDN (React, Vue, Alpine, jQuery و ...) ممنوع.
- المان‌ها رو فقط داخل همون سکشن پیدا کن (querySelector روی id و class های همون سکشن).
  برای پیدا کردن محتوا از document.body یا document.documentElement استفاده نکن.
- برای عوض کردن متن از textContent استفاده کن، نه innerHTML.
- متغیر سراسری روی window نساز؛ سکشن ممکنه دوبار در یک صفحه قرار بگیره.
- از <template> همراه با onclick داخلش استفاده نکن.

## فقط برای صفحه‌ی کامل
- هر بخش یک <section> (یا header / footer / nav) جدا و فرزند مستقیم <body> یا یک <main> باشه،
  با id یکتا.
- هر بخشی که اسکریپت لازم داره، <script> جدای خودش رو داشته باشه و فقط با المان‌های همون بخش
  کار کنه. هیچ اسکریپتی بین دو بخش مشترک نباشه.
```

بعد از گرفتن خروجی: در **Section Library** روی **Import HTML** بزن (فقط admin). برای صفحه‌ی کامل
گزینه‌ی **Split into sections** رو انتخاب کن، تقسیم‌بندی و محل هر اسکریپت رو بررسی کن و تأیید کن.

---

## پرامپت کامپوننت React

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
