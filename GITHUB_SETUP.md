# راهنمای آپلود به GitHub

## مرحله 1: ساخت Repository در GitHub

1. برو به https://github.com
2. کلیک روی **New repository**
3. تنظیمات:
   - **Repository name**: `english-website`
   - **Description**: `Modern English learning platform with Next.js 14`
   - **Visibility**: Private (یا Public)
   - **DON'T** initialize with README (چون پروژه آماده است)
4. کلیک **Create repository**

---

## مرحله 2: آپلود پروژه از ویندوز

### باز کردن Terminal در پوشه پروژه:
```bash
cd "d:\my Develop Projects\English Website"
```

### دستورات Git:

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit: English learning platform with Next.js 14"

# 4. Add remote (جایگزین کن با آدرس repo خودت)
git remote add origin https://github.com/YOUR_USERNAME/english-website.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

---

## مرحله 3: تنظیم Git Credentials (اگر لازم بود)

### روش 1: با GitHub CLI (توصیه میشه)
```bash
# نصب GitHub CLI
winget install --id GitHub.cli

# لاگین
gh auth login
```

### روش 2: با Personal Access Token
1. برو به GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. انتخاب scope: `repo`
4. کپی token

استفاده:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/english-website.git
```

---

## مرحله 4: بررسی آپلود

```bash
# بررسی remote
git remote -v

# بررسی status
git status

# بررسی آخرین commit
git log --oneline
```

---

## دستورات یکجا (کپی-پیست)

```bash
cd "d:\my Develop Projects\English Website"
git init
git add .
git commit -m "Initial commit: English learning platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/english-website.git
git push -u origin main
```

---

## بعد از آپلود: دیپلوی روی VM

### 1. روی VM:
```bash
cd ~/apps
git clone https://github.com/YOUR_USERNAME/english-website.git
cd english-website
npm install
npm run build
pm2 start npm --name "english-website" -- start
pm2 save
```

### 2. آپدیت بعدی (از ویندوز):
```bash
# کامیت تغییرات
git add .
git commit -m "Update: description of changes"
git push

# دیپلوی روی VM
ssh user@VM_IP "cd ~/apps/english-website && git pull && npm install && npm run build && pm2 restart english-website"
```

---

## اسکریپت آپدیت کامل

ساخت فایل `update-and-deploy.bat`:

```batch
@echo off
echo ================================
echo   Git Push and Deploy
echo ================================
echo.

set /p COMMIT_MSG="Enter commit message: "
set /p VM_IP="Enter VM IP: "
set /p VM_USER="Enter VM Username: "

echo.
echo [1/3] Committing changes...
git add .
git commit -m "%COMMIT_MSG%"

echo.
echo [2/3] Pushing to GitHub...
git push

if %ERRORLEVEL% NEQ 0 (
    echo Push failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying to VM...
ssh %VM_USER%@%VM_IP% "cd ~/apps/english-website && git pull && npm install && npm run build && pm2 restart english-website"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo   Success!
    echo ================================
    echo.
    echo GitHub: Updated
    echo VM: http://%VM_IP%
    echo.
) else (
    echo.
    echo Deployment failed!
    echo.
)

pause
```

---

## نکات مهم

### فایلهایی که نباید آپلود بشن:
- ✅ `.gitignore` ساخته شده
- ❌ `node_modules/` (خیلی بزرگه)
- ❌ `.next/` (build output)
- ❌ `.env.local` (حاوی secret)
- ❌ `prisma/dev.db` (دیتابیس محلی)

### فایلهایی که باید آپلود بشن:
- ✅ `src/` (کد منبع)
- ✅ `public/` (فایلهای استاتیک)
- ✅ `prisma/schema.prisma` (schema دیتابیس)
- ✅ `package.json` (dependencies)
- ✅ تمام فایلهای config

---

## حل مشکلات رایج

### خطا: remote origin already exists
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/english-website.git
```

### خطا: failed to push
```bash
git pull origin main --rebase
git push origin main
```

### فراموشی commit
```bash
git add .
git commit -m "Your message"
git push
```

### بررسی سایز پروژه
```bash
git count-objects -vH
```

---

## Workflow کامل

```
[ویندوز] تغییرات کد
    ↓
[ویندوز] git add . && git commit && git push
    ↓
[GitHub] Repository آپدیت میشه
    ↓
[VM] git pull && npm install && npm run build
    ↓
[VM] pm2 restart
    ↓
[مرورگر] http://VM_IP
```

---

## چکلیست

- [ ] `.gitignore` ساخته شده
- [ ] Repository در GitHub ساخته شده
- [ ] `git init` اجرا شده
- [ ] `git add .` اجرا شده
- [ ] `git commit` اجرا شده
- [ ] `git remote add origin` اجرا شده
- [ ] `git push` موفق بوده
- [ ] در GitHub فایلها رو میبینی
- [ ] روی VM کلون شده
- [ ] PM2 در حال اجرا

تمام! 🚀
