@echo off
echo ================================
echo   English Website Deployment
echo ================================
echo.

set /p VM_IP="Enter VM IP: "
set /p VM_USER="Enter VM Username: "

echo.
echo Deploying to %VM_USER%@%VM_IP%...
echo.

ssh %VM_USER%@%VM_IP% "cd ~/apps/english-website && git pull && npm install && npm run build && pm2 restart english-website"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo   Deployment Successful!
    echo ================================
    echo.
    echo Access: http://%VM_IP%
    echo.
) else (
    echo.
    echo ================================
    echo   Deployment Failed!
    echo ================================
    echo.
)

pause
