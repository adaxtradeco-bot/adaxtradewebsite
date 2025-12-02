# Homepage Feature - Troubleshooting Guide

## مشکل: "Failed to update homepage"

### علل احتمالی و راه حل‌ها:

#### 1. دیتابیس sync نشده
**علامت:** خطای Prisma در console
**راه حل:**
```bash
npx prisma db push
npx prisma generate
```

#### 2. فیلد isHomepage در API select نشده
**بررسی:** فایل `/src/app/api/admin/pages/route.ts`
**راه حل:** مطمئن شوید `isHomepage: true` در select query وجود دارد

#### 3. مشکل Authentication
**علامت:** خطای 401 Unauthorized
**راه حل:** 
- از localStorage بررسی کنید که `adminToken` وجود دارد
- دوباره login کنید

#### 4. Transaction conflict
**علامت:** خطای database lock
**راه حل:** کد API با transaction اصلاح شده

### بررسی سلامت سیستم:

```bash
# بررسی فیلد isHomepage
node scripts/check-homepage-field.js

# تست عملکرد
node scripts/test-set-homepage.js
```

### Debug در Browser:

1. باز کردن Developer Tools (F12)
2. رفتن به Console tab
3. کلیک روی "Set Home"
4. بررسی log ها:
   - `Setting homepage for page: [ID]`
   - `Response: {...}`

### API Endpoint:

```
POST /api/admin/pages/[id]/set-homepage
Headers:
  - Authorization: Bearer [token]
  - Content-Type: application/json
```

### تغییرات اعمال شده:

1. ✅ اضافه شدن `isHomepage` به schema
2. ✅ اضافه شدن `isHomepage` به GET API
3. ✅ استفاده از transaction در set-homepage API
4. ✅ بهبود error handling در client
5. ✅ اضافه شدن console logging برای debug

### اگر همچنان مشکل دارید:

1. Dev server را restart کنید
2. Browser cache را پاک کنید
3. دوباره login کنید
4. Console logs را بررسی کنید
