@echo off
echo ========================================
echo    IVAFlow.com - Quick Deployment
echo ========================================
echo.

echo [1/6] Building project locally...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo [2/6] Committing to Git...
git add .
git commit -m "Production deployment - %date% %time%"
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Git push failed!
    pause
    exit /b 1
)

echo [3/6] Uploading database...
scp -P 65002 "prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/
if %errorlevel% neq 0 (
    echo ERROR: Database upload failed!
    pause
    exit /b 1
)

echo [4/6] Deploying to server...
ssh -p 65002 u333279351@82.198.227.28 "cd ~/apps/english-website && git pull origin main && npm install --production && npm run build"
if %errorlevel% neq 0 (
    echo ERROR: Server deployment failed!
    pause
    exit /b 1
)

echo [5/6] Restarting PM2...
ssh -p 65002 u333279351@82.198.227.28 "pm2 restart ivaflow"
if %errorlevel% neq 0 (
    echo ERROR: PM2 restart failed!
    pause
    exit /b 1
)

echo [6/6] Testing deployment...
ssh -p 65002 u333279351@82.198.227.28 "pm2 status"

echo.
echo ========================================
echo    Deployment Complete! 
echo    Website: https://ivaflow.com
echo    Admin: https://ivaflow.com/admin/login
echo ========================================
echo.
pause