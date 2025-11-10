@echo off
chcp 65001 >nul
echo ================================
echo   Git Push and Deploy to VM
echo ================================
echo.

REM Get commit message
set /p COMMIT_MSG="Commit message: "

REM Get VM details
set /p VM_USER="VM Username: "
set /p VM_IP="VM IP: "

echo.
echo ================================
echo   Step 1: Git Commit
echo ================================
git add .
git commit -m "%COMMIT_MSG%"

if %ERRORLEVEL% NEQ 0 (
    echo No changes to commit or commit failed
    echo.
)

echo.
echo ================================
echo   Step 2: Push to GitHub
echo ================================
git push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Push failed! Check your credentials.
    pause
    exit /b 1
)

echo ✅ Pushed to GitHub

echo.
echo ================================
echo   Step 3: Deploy to VM
echo ================================
ssh %VM_USER%@%VM_IP% "cd ~/apps/english-website && git pull && npm install && npm run build && pm2 restart english-website"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo   ✅ Deployment Successful!
    echo ================================
    echo.
    echo 🌐 Access: http://%VM_IP%
    echo 📝 GitHub: Updated
    echo 🚀 VM: Deployed
    echo.
) else (
    echo.
    echo ================================
    echo   ❌ Deployment Failed!
    echo ================================
    echo.
)

pause
