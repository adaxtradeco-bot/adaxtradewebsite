@echo off
title Sync Database to Vercel
color 0B

echo.
echo ========================================
echo    Sync Database to Vercel
echo ========================================
echo.
echo Starting sync process...
echo.

node sync-to-vercel.js

echo.
echo Press any key to exit...
pause >nul
