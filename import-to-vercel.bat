@echo off
echo ========================================
echo   Import Database to Vercel
echo ========================================
echo.

echo Step 1: Getting Vercel environment variables...
call vercel env pull .env.vercel

echo.
echo Step 2: Reading POSTGRES_PRISMA_URL from .env.vercel...
for /f "tokens=2 delims==" %%a in ('findstr "POSTGRES_PRISMA_URL" .env.vercel') do set DATABASE_URL=%%a

if "%DATABASE_URL%"=="" (
    echo ERROR: Could not find POSTGRES_PRISMA_URL in .env.vercel
    echo.
    echo Please manually set DATABASE_URL:
    echo   1. Open .env.vercel file
    echo   2. Copy the POSTGRES_PRISMA_URL value
    echo   3. Run: set DATABASE_URL=^<paste value here^>
    echo   4. Run: npx tsx import-full-database.ts
    pause
    exit /b 1
)

echo Found DATABASE_URL!
echo.

echo Step 3: Running import script...
npx tsx import-full-database.ts

echo.
echo ========================================
echo   Import Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Go to your Vercel site
echo   2. Test the menus
echo   3. Login to /admin
echo.
pause
