# 🔧 تنظیمات Environment

## 📋 فایلهای Environment

### `.env` (Local Development)
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="administrator@ivaflow.com"
ADMIN_PASSWORD="IVAFlow@2024#SecureAdmin!Prod"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### `.env.local` (Local Development - Priority)
- اگر این فایل وجود داشته باشد، `.env` را override میکند
- برای تنظیمات شخصی محلی استفاده کنید
- در `.gitignore` موجود است

### `.env.production` (Production/Hostinger)
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-please"
ADMIN_EMAIL="administrator@ivaflow.com"
ADMIN_PASSWORD="IVAFlow@2024#SecureAdmin!Prod"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-in-production"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

---

## 🔑 متغیرهای مهم

| متغیر | توضیح | مثال |
|------|-------|------|
| `DATABASE_URL` | مسیر دیتابیس SQLite | `file:./prisma/dev.db` |
| `JWT_SECRET` | کلید رمزنگاری JWT | 32+ کاراکتر تصادفی |
| `NEXTAUTH_SECRET` | کلید NextAuth | 32+ کاراکتر تصادفی |
| `NEXTAUTH_URL` | آدرس سایت | `http://localhost:3000` |
| `NODE_ENV` | محیط اجرا | `development` یا `production` |

---

## ✅ راهنمای تنظیم

### برای Local Development:
1. فایل `.env` یا `.env.local` استفاده کنید
2. `DATABASE_URL` را به `file:./prisma/dev.db` تنظیم کنید
3. `NODE_ENV` را `development` کنید

### برای Production (Hostinger):
1. فایل `.env.production` استفاده کنید
2. `DATABASE_URL` را به `file:./prisma/dev.db` تنظیم کنید
3. `NEXTAUTH_URL` را به دامنه اصلی تغییر دهید
4. `NODE_ENV` را `production` کنید
5. کلیدهای امنیتی را تغییر دهید

---

## 🚀 شروع کار

### Local Development:
```bash
npm install
npm run dev
```

### Production Build:
```bash
npm run build
npm start
```

---

## ⚠️ نکات مهم

1. **فایل `.env` را commit نکنید** - در `.gitignore` موجود است
2. **کلیدهای امنیتی را تغییر دهید** - قبل از production
3. **DATABASE_URL را درست تنظیم کنید** - مسیر دیتابیس باید صحیح باشد
4. **NEXTAUTH_URL را تغییر دهید** - برای production

---

## 🔄 اگر مشکل دیتابیس داشتید

### مشکل: "Unable to open the database file"
**حل:**
```bash
# مطمئن شوید مسیر درست است
DATABASE_URL="file:./prisma/dev.db"

# یا اگر در پوشه دیگری هستید:
DATABASE_URL="file:./prisma/dev.db"

# سپس دوباره سعی کنید:
npm run dev
```

### مشکل: Prisma Client خطا میدهد
**حل:**
```bash
npx prisma generate
npm run dev
```

### مشکل: دیتابیس خالی است
**حل:**
```bash
npm run db:seed
```