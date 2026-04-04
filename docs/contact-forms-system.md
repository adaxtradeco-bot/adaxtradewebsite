# Contact Forms System — Analysis & Implementation Plan

## Overview

یک سیستم فرم تماس سبک و هدفمند برای وبسایت — **نه یک فرم‌ساز عمومی**.  
هدف: پشتیبانی از ۳ نوع فرم مشخص با ارسال ایمیل (SMTP)، Webhook، reCAPTCHA، و چندزبانه.

---

## Scope — چه چیزی می‌سازیم

### فرم‌های پشتیبانی‌شده

| نوع فرم | Slug | کاربرد |
|---------|------|--------|
| Contact Us | `contact` | ارتباط با ما — عمومی |
| Request Demo | `demo` | درخواست دمو از محصول |
| Careers / Job Apply | `careers` | درخواست استخدام |

### چه چیزی **نمی‌سازیم**
- فرم‌ساز drag-and-drop
- فیلدهای داینامیک قابل تعریف توسط کاربر
- منطق شرطی (conditional logic)
- پرداخت یا فرم‌های چندمرحله‌ای پیچیده

---

## Architecture

```
Contact Forms System
├── Database (Prisma)
│   ├── ContactForm          ← تعریف فرم‌ها (نوع، تنظیمات، ترجمه‌ها)
│   └── ContactSubmission    ← ثبت پاسخ‌های دریافتی
│
├── API Routes
│   ├── POST /api/forms/[type]/submit   ← دریافت و پردازش فرم
│   └── GET  /api/admin/forms/submissions ← مشاهده پاسخ‌ها در ادمین
│
├── Services
│   ├── smtp.service.ts      ← ارسال ایمیل با Nodemailer
│   ├── webhook.service.ts   ← ارسال به Webhook URL
│   └── recaptcha.service.ts ← اعتبارسنجی Google reCAPTCHA v3
│
├── Components
│   ├── ContactFormSection.tsx   ← Section برای Page Builder
│   ├── forms/ContactForm.tsx    ← فرم ارتباط با ما
│   ├── forms/DemoRequestForm.tsx ← فرم درخواست دمو
│   └── forms/CareersForm.tsx    ← فرم استخدام
│
└── Admin UI
    └── FormSubmissionsPanel.tsx ← مشاهده و مدیریت پاسخ‌ها
```

---

## Database Schema

### مدل `ContactForm`
```prisma
model ContactForm {
  id              String   @id @default(cuid())
  type            String   @unique  // "contact" | "demo" | "careers"
  isActive        Boolean  @default(true)
  
  // Notification settings
  notifyEmail     String?  // آدرس ایمیل دریافت‌کننده
  smtpEnabled     Boolean  @default(false)
  webhookEnabled  Boolean  @default(false)
  webhookUrl      String?
  
  // reCAPTCHA
  recaptchaEnabled Boolean @default(true)
  
  // i18n — عنوان و توضیح به ازای هر زبان (JSON)
  // { "en": { "title": "...", "description": "..." }, "ar": { ... } }
  labels          Json     @default("{}")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  submissions     ContactSubmission[]
}
```

### مدل `ContactSubmission`
```prisma
model ContactSubmission {
  id        String   @id @default(cuid())
  formType  String   // "contact" | "demo" | "careers"
  lang      String   @default("en")  // زبان فرم هنگام ارسال
  data      Json     // داده‌های فرم (sanitize شده)
  status    String   @default("new")  // "new" | "read" | "archived"
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  
  form      ContactForm @relation(fields: [formType], references: [type])
}
```

---

## فیلدهای هر فرم

### Contact Us
```typescript
{
  name: string        // required
  email: string       // required, email format
  company?: string    // optional
  phone?: string      // optional
  subject: string     // required
  message: string     // required, min 20 chars
  recaptchaToken: string
}
```

### Request Demo
```typescript
{
  name: string        // required
  email: string       // required
  company: string     // required
  jobTitle?: string   // optional
  phone?: string      // optional
  industry: string    // required — dropdown
  teamSize: string    // required — dropdown
  message?: string    // optional
  recaptchaToken: string
}
```

### Careers / Job Apply
```typescript
{
  name: string        // required
  email: string       // required
  phone?: string      // optional
  position: string    // required — عنوان موقعیت
  linkedinUrl?: string // optional
  portfolioUrl?: string // optional
  coverLetter: string // required, min 50 chars
  resumeUrl?: string  // optional — لینک به CV (نه آپلود فایل در فاز اول)
  recaptchaToken: string
}
```

---

## Services

### SMTP Service (`smtp.service.ts`)
- استفاده از **Nodemailer**
- تنظیمات از Environment Variables
- Template ساده HTML برای ایمیل اعلان
- ارسال به `notifyEmail` تعریف‌شده در `ContactForm`
- پشتیبانی از ایمیل تأیید به کاربر (اختیاری)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
SMTP_FROM="IVAFlow <noreply@ivaflow.com>"
```

### Webhook Service (`webhook.service.ts`)
- ارسال `POST` به `webhookUrl` با payload JSON
- Payload شامل: `formType`, `lang`, `data`, `submittedAt`
- Retry یک‌بار در صورت خطا
- Timeout: 5 ثانیه
- مناسب برای اتصال به Zapier، Make، Slack، CRM

### reCAPTCHA Service (`recaptcha.service.ts`)
- استفاده از **Google reCAPTCHA v3** (بدون checkbox — invisible)
- اعتبارسنجی token در سمت سرور
- حداقل score: `0.5` (قابل تنظیم)
- در صورت fail شدن، فرم رد می‌شود

```env
RECAPTCHA_SECRET_KEY=your-secret-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
```

---

## API Route — Submit Form

### `POST /api/forms/[type]/submit`

**Flow:**
1. دریافت داده‌های فرم
2. اعتبارسنجی `type` (باید یکی از ۳ نوع مجاز باشد)
3. بررسی فعال بودن فرم در DB
4. اعتبارسنجی reCAPTCHA token (اگر فعال باشد)
5. اعتبارسنجی داده‌ها با Zod schema
6. Sanitize کردن ورودی‌ها (XSS prevention)
7. ذخیره در DB
8. ارسال ایمیل (اگر SMTP فعال باشد) — async، بدون block کردن response
9. ارسال Webhook (اگر فعال باشد) — async
10. بازگشت response موفق

**Response:**
```json
{ "success": true, "message": "Your message has been received." }
```

**Error Response:**
```json
{ "success": false, "error": "validation_failed", "details": [...] }
```

---

## i18n — چندزبانه

### رویکرد
- فیلدهای label، placeholder، و پیام‌های خطا در فایل‌های ترجمه
- مسیر: `src/locales/[lang]/forms.json`
- زبان‌های پشتیبانی‌شده: `en`, `ar` (و هر زبان آینده)

### ساختار فایل ترجمه
```json
// src/locales/en/forms.json
{
  "contact": {
    "title": "Contact Us",
    "description": "We'd love to hear from you.",
    "fields": {
      "name": "Full Name",
      "email": "Email Address",
      "subject": "Subject",
      "message": "Message"
    },
    "submit": "Send Message",
    "success": "Thank you! We'll get back to you soon.",
    "errors": {
      "required": "This field is required",
      "email": "Please enter a valid email"
    }
  },
  "demo": { ... },
  "careers": { ... }
}
```

---

## Page Builder Integration

### Section Type: `contact-form`

فرم به عنوان یک **Section** در Page Builder قابل استفاده است:

```typescript
// در section-registry.ts اضافه می‌شود
{
  type: 'contact-form',
  label: 'Contact Form',
  category: 'Actions',
  defaultData: {
    formType: 'contact',  // "contact" | "demo" | "careers"
    title: 'Get in Touch',
    subtitle: 'Fill out the form below and we\'ll get back to you.',
    showTitle: true,
    layout: 'centered',   // "centered" | "split"
    accentColor: '#6366f1'
  }
}
```

این یعنی هر صفحه‌ای در سایت می‌تواند یک فرم تماس داشته باشد بدون نیاز به صفحه جداگانه.

---

## Admin Panel

### صفحه مدیریت پاسخ‌ها
- مسیر: `/admin/forms`
- نمایش لیست submissions با فیلتر بر اساس نوع فرم
- تغییر وضعیت: `new` → `read` → `archived`
- مشاهده جزئیات هر submission
- Export به CSV

### صفحه تنظیمات فرم‌ها
- مسیر: `/admin/forms/settings`
- فعال/غیرفعال کردن هر فرم
- تنظیم `notifyEmail`
- فعال/غیرفعال کردن SMTP و Webhook
- وارد کردن `webhookUrl`
- تست ارسال ایمیل

---

## Security

| لایه | روش |
|------|-----|
| reCAPTCHA v3 | جلوگیری از bot |
| Rate Limiting | حداکثر ۵ درخواست در ۱۰ دقیقه از یک IP |
| Zod Validation | اعتبارسنجی تمام فیلدها |
| Input Sanitization | حذف HTML tags از ورودی‌ها |
| CSRF | استفاده از Next.js built-in protection |
| IP Logging | ذخیره IP برای بررسی سوءاستفاده |

---

## Dependencies جدید

| Package | نسخه | کاربرد |
|---------|------|--------|
| `nodemailer` | ^6.9 | ارسال ایمیل SMTP |
| `@types/nodemailer` | ^6.4 | TypeScript types |
| `react-google-recaptcha-v3` | ^1.10 | reCAPTCHA v3 در client |

> **توجه:** هیچ dependency سنگینی اضافه نمی‌شود. سیستم با حداقل وابستگی طراحی شده.

---

## مراحل پیاده‌سازی

### فاز ۱ — زیرساخت (اولویت بالا)
- [ ] 1.1 اضافه کردن مدل‌های Prisma (`ContactForm`, `ContactSubmission`)
- [ ] 1.2 Migration و seed اولیه برای ۳ نوع فرم
- [ ] 1.3 ساخت `recaptcha.service.ts`
- [ ] 1.4 ساخت `smtp.service.ts` با Nodemailer
- [ ] 1.5 ساخت `webhook.service.ts`

### فاز ۲ — API (اولویت بالا)
- [ ] 2.1 ساخت Zod schemas برای هر ۳ فرم
- [ ] 2.2 ساخت `POST /api/forms/[type]/submit`
- [ ] 2.3 ساخت `GET /api/admin/forms/submissions`
- [ ] 2.4 ساخت `GET/PUT /api/admin/forms/settings`

### فاز ۳ — Components (اولویت متوسط)
- [ ] 3.1 ساخت `ContactForm.tsx`
- [ ] 3.2 ساخت `DemoRequestForm.tsx`
- [ ] 3.3 ساخت `CareersForm.tsx`
- [ ] 3.4 ساخت `ContactFormSection.tsx` برای Page Builder

### فاز ۴ — i18n (اولویت متوسط)
- [ ] 4.1 ساخت `src/locales/en/forms.json`
- [ ] 4.2 ساخت `src/locales/ar/forms.json`
- [ ] 4.3 اتصال به سیستم ترجمه موجود

### فاز ۵ — Admin UI (اولویت پایین)
- [ ] 5.1 ساخت `FormSubmissionsPanel.tsx`
- [ ] 5.2 ساخت صفحه `/admin/forms`
- [ ] 5.3 ساخت صفحه `/admin/forms/settings`

### فاز ۶ — Page Builder Integration (اولویت پایین)
- [ ] 6.1 اضافه کردن `contact-form` به `section-registry.ts`
- [ ] 6.2 اضافه کردن case به `section-renderer.tsx`

---

## فایل‌های جدید (خلاصه)

```
src/
├── app/api/forms/[type]/submit/route.ts
├── app/api/admin/forms/
│   ├── submissions/route.ts
│   └── settings/route.ts
├── components/
│   ├── builder-sections/ContactFormSection.tsx
│   └── forms/
│       ├── ContactForm.tsx
│       ├── DemoRequestForm.tsx
│       └── CareersForm.tsx
├── lib/
│   └── forms/
│       ├── smtp.service.ts
│       ├── webhook.service.ts
│       ├── recaptcha.service.ts
│       └── form-schemas.ts
└── locales/
    ├── en/forms.json
    └── ar/forms.json
```

**فایل‌های تغییر می‌کنند:**
- `prisma/schema.prisma` — اضافه کردن ۲ مدل
- `src/lib/page-builder/section-registry.ts` — اضافه کردن section type
- `src/lib/page-builder/section-renderer.tsx` — اضافه کردن case
- `.env.example` — اضافه کردن متغیرهای جدید

---

## نکات مهم

1. **فایل آپلود در فاز اول نیست** — فرم استخدام فقط لینک CV می‌گیرد
2. **Email template ساده** — HTML ساده، بدون framework ایمیل
3. **reCAPTCHA v3 invisible** — بدون checkbox، UX بهتر
4. **Webhook payload استاندارد** — سازگار با Zapier/Make/n8n
5. **Rate limiting** — با middleware ساده، بدون نیاز به Redis در فاز اول
6. **Admin auth** — از سیستم JWT موجود استفاده می‌شود

