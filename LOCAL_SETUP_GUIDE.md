# 🚀 راهنمای تنظیم Local Development

## ✅ مشکل حل شد!

تنظیمات environment برای local و production جدا شدند.

---

## 📁 فایلهای Environment

### Local Development:
- **`.env`** - تنظیمات پیشفرض
- **`.env.local`** - تنظیمات شخصی (priority بالاتر)

### Production:
- **`.env.production`** - تنظیمات production

---

## 🔧 اگر مشکل Prisma داشتید

### راه حل سریع:

**Windows (Batch):**
```bash
fix-prisma.bat
```

**Windows (PowerShell):**
```bash
powershell -ExecutionPolicy Bypass -File fix-prisma.ps1
```

**Manual:**
```bash
# 1. بستن تمام Node processes
taskkill /IM node.exe /F

# 2. حذف Prisma cache
rmdir /s /q node_modules\.prisma

# 3. نصب دوباره
npm install

# 4. Generate Prisma
npx prisma generate

# 5. شروع
npm run dev
```

---

## 📋 مراحل شروع

### 1️⃣ نصب Dependencies:
```bash
npm install
```

### 2️⃣ Generate Prisma Client:
```bash
npx prisma generate
```

### 3️⃣ Seed Database:
```bash
npm run db:seed
```

### 4️⃣ شروع Development Server:
```bash
npm run dev
```

### 5️⃣ باز کردن در مرورگر:
```
http://localhost:3000
```

---

## 🔐 ورود به Admin Panel

```
URL:      http://localhost:3000/admin/login
Email:    administrator@ivaflow.com
Password: IVAFlow@2024#SecureAdmin!Prod
```

---

## 📊 Database

### مسیر دیتابیس:
```
prisma/dev.db
```

### دستورات مفید:

```bash
# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset

# Push schema
npx prisma db push
```

---

## 🛠️ دستورات مفید

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Lint
npm run lint

# Format
npm run format

# Test
npm run test
```

---

## ⚠️ نکات مهم

1. **DATABASE_URL باید `file:./prisma/dev.db` باشد**
2. **NODE_ENV باید `development` باشد**
3. **فایل `.env` را commit نکنید**
4. **اگر مشکل داشتید، `fix-prisma.bat` را اجرا کنید**

---

## 🐛 عیبیابی

### مشکل: "Unable to open the database file"
```bash
# مطمئن شوید DATABASE_URL درست است
# سپس دوباره سعی کنید
npm run dev
```

### مشکل: "Prisma Client not generated"
```bash
npx prisma generate
```

### مشکل: "Port 3000 already in use"
```bash
# پیدا کردن process
netstat -ano | findstr :3000

# Kill کردن
taskkill /PID <PID> /F
```

### مشکل: "Database is empty"
```bash
npm run db:seed
```

---

## ✨ تغییرات انجام شده

- ✅ `.env` برای local development
- ✅ `.env.local` برای تنظیمات شخصی
- ✅ `.env.production` برای production
- ✅ `fix-prisma.bat` برای حل مشکلات
- ✅ `fix-prisma.ps1` برای PowerShell
- ✅ `ENV_SETUP.md` برای راهنمای کامل

---

## 🎉 شما آماده هستید!

```bash
npm install
npm run db:seed
npm run dev
```

سایت شما روی `http://localhost:3000` باز میشود! 🚀