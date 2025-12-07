@echo off
REM Fix Prisma Lock Issue

echo.
echo 🔧 Fixing Prisma lock issue...
echo.

REM Kill Node processes
echo Killing Node processes...
taskkill /IM node.exe /F 2>nul

REM Wait
timeout /t 2 /nobreak

REM Remove Prisma cache
echo Removing Prisma cache...
rmdir /s /q "node_modules\.prisma" 2>nul

REM Clear npm cache
echo Clearing npm cache...
call npm cache clean --force

REM Reinstall
echo Reinstalling dependencies...
call npm install

REM Generate Prisma
echo Generating Prisma client...
call npx prisma generate

echo.
echo ✅ Done! Try running: npm run dev
echo.