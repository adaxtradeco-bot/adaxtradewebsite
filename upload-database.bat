@echo off
echo.
echo ========================================
echo   Upload Database to Hostinger
echo ========================================
echo.

echo Uploading database to server...
scp -P 65002 "prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Database uploaded successfully!
    echo ========================================
    echo.
    echo Next: Restart the application on server
    echo   ssh -p 65002 u333279351@82.198.227.28
    echo   pm2 restart english-website
    echo.
) else (
    echo.
    echo ========================================
    echo   Upload failed!
    echo ========================================
    echo.
)

pause