# 🦶 Footer Multilingual Setup Guide

## نمای کلی

Footer حالا از Menu System استفاده میکنه و به صورت خودکار چندزبانه است.

---

## 🚀 راهاندازی Footer چندزبانه

### مرحله 1: ایجاد Footer Menu برای انگلیسی

1. به **Admin → Menus** بروید
2. روی **Create New Menu** کلیک کنید
3. تنظیمات:
   ```
   Name: Footer Menu (EN)
   Location: footer
   Language: en
   Status: active
   ```

4. ساختار پیشنهادی:

```json
[
  {
    "label": "English Website",
    "type": "company-info",
    "tagline": "Your tagline here",
    "description": "Empowering learners worldwide to master English with confidence and fluency."
  },
  {
    "label": "Product",
    "children": [
      { "label": "Features", "url": "/en/features" },
      { "label": "Pricing", "url": "/en/pricing" },
      { "label": "Security", "url": "/en/security" }
    ]
  },
  {
    "label": "Company",
    "children": [
      { "label": "About", "url": "/en/about" },
      { "label": "Careers", "url": "/en/careers" },
      { "label": "Contact", "url": "/en/contact" }
    ]
  },
  {
    "label": "Resources",
    "children": [
      { "label": "Documentation", "url": "/en/docs" },
      { "label": "Support", "url": "/en/support" },
      { "label": "Community", "url": "/en/community" }
    ]
  },
  {
    "type": "contact-info",
    "phone": "+1 234 567 8900",
    "email": "info@example.com",
    "address": "123 Main St, City, Country"
  },
  {
    "type": "social-links",
    "links": [
      { "platform": "twitter", "url": "https://twitter.com/yourcompany" },
      { "platform": "linkedin", "url": "https://linkedin.com/company/yourcompany" },
      { "platform": "github", "url": "https://github.com/yourcompany" }
    ]
  },
  {
    "type": "copyright",
    "text": "© {year} English Website. All rights reserved."
  }
]
```

---

### مرحله 2: ایجاد Footer Menu برای عربی

1. روی **Create New Menu** کلیک کنید
2. تنظیمات:
   ```
   Name: Footer Menu (AR)
   Location: footer
   Language: ar
   Status: active
   ```

3. ساختار پیشنهادی:

```json
[
  {
    "label": "موقع الإنجليزية",
    "type": "company-info",
    "tagline": "شعارك هنا",
    "description": "تمكين المتعلمين في جميع أنحاء العالم من إتقان اللغة الإنجليزية بثقة وطلاقة."
  },
  {
    "label": "المنتج",
    "children": [
      { "label": "الميزات", "url": "/ar/features" },
      { "label": "الأسعار", "url": "/ar/pricing" },
      { "label": "الأمان", "url": "/ar/security" }
    ]
  },
  {
    "label": "الشركة",
    "children": [
      { "label": "من نحن", "url": "/ar/about" },
      { "label": "الوظائف", "url": "/ar/careers" },
      { "label": "اتصل بنا", "url": "/ar/contact" }
    ]
  },
  {
    "label": "الموارد",
    "children": [
      { "label": "التوثيق", "url": "/ar/docs" },
      { "label": "الدعم", "url": "/ar/support" },
      { "label": "المجتمع", "url": "/ar/community" }
    ]
  },
  {
    "type": "contact-info",
    "phone": "+1 234 567 8900",
    "email": "info@example.com",
    "address": "123 Main St, City, Country"
  },
  {
    "type": "social-links",
    "links": [
      { "platform": "twitter", "url": "https://twitter.com/yourcompany" },
      { "platform": "linkedin", "url": "https://linkedin.com/company/yourcompany" },
      { "platform": "github", "url": "https://github.com/yourcompany" }
    ]
  },
  {
    "type": "copyright",
    "text": "© {year} جميع الحقوق محفوظة."
  }
]
```

---

## 📝 انواع آیتمهای Footer

### 1. Company Info
```json
{
  "label": "Company Name",
  "type": "company-info",
  "tagline": "Optional tagline",
  "description": "Company description"
}
```

### 2. Link Column
```json
{
  "label": "Column Title",
  "children": [
    { "label": "Link 1", "url": "/path" },
    { "label": "Link 2", "url": "/path" }
  ]
}
```

### 3. Contact Info
```json
{
  "type": "contact-info",
  "phone": "+1 234 567 8900",
  "email": "info@example.com",
  "address": "Full address"
}
```

### 4. Social Links
```json
{
  "type": "social-links",
  "links": [
    { "platform": "twitter", "url": "https://..." },
    { "platform": "linkedin", "url": "https://..." },
    { "platform": "facebook", "url": "https://..." },
    { "platform": "instagram", "url": "https://..." },
    { "platform": "youtube", "url": "https://..." },
    { "platform": "github", "url": "https://..." }
  ]
}
```

### 5. Copyright
```json
{
  "type": "copyright",
  "text": "© {year} Your Company. All rights reserved."
}
```

**نکته:** `{year}` به صورت خودکار با سال جاری جایگزین میشود.

---

## 🎨 Fallback Footer

اگر Footer Menu وجود نداشته باشد، Footer به صورت خودکار از یک template پیشفرض استفاده میکنه:

- **انگلیسی:** Footer با لینکهای استاندارد
- **عربی:** Footer با متنهای عربی

---

## ✅ تست

بعد از ایجاد Footer Menus:

1. به صفحه اصلی بروید: `/en`
2. Footer انگلیسی را ببینید
3. زبان را به عربی تغییر دهید: `/ar`
4. Footer عربی را ببینید

---

## 🔄 بهروزرسانی Footer

برای تغییر Footer:

1. Admin → Menus
2. Footer Menu مورد نظر را انتخاب کنید
3. Edit کنید
4. Save
5. تغییرات به صورت خودکار در سایت اعمال میشود

---

## 💡 نکات

- Footer از همان Menu System استفاده میکنه که Navbar
- هر زبان Footer مستقل خودش را دارد
- میتوانید ساختار متفاوتی برای هر زبان داشته باشید
- Social links در همه زبانها یکسان هستند (معمولاً)

---

## 🆘 عیبیابی

### Footer نمایش داده نمیشود
- بررسی کنید Menu با `location=footer` و `language=en/ar` وجود دارد
- Status باید `active` باشد

### Footer به زبان اشتباه نمایش داده میشود
- URL را بررسی کنید (`/en/...` یا `/ar/...`)
- Cache browser را پاک کنید

### لینکها کار نمیکنند
- مطمئن شوید URL با `/` شروع میشود
- برای لینکهای خارجی از `http://` یا `https://` استفاده کنید

---

**Footer شما آماده است! 🎉**
