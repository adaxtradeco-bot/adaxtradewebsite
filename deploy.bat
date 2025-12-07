@echo off
echo ========================================
echo   Vercel Deployment Script
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing changes...
set /p commit_msg="Enter commit message: "
git commit -m "%commit_msg%"
echo.

echo [4/5] Pushing to GitHub...
git push
echo.

echo [5/5] Done!
echo.
echo ========================================
echo   Vercel will auto-deploy in 1-2 minutes
echo   Check: https://vercel.com/dashboard
echo ========================================
pause
