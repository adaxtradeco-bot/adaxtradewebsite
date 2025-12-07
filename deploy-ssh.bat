@echo off
echo.
echo ========================================
echo   SSH Deployment to Hostinger
echo ========================================
echo.

set /p SERVER="Enter server address (e.g., user@domain.com): "
set /p REMOTE_PATH="Enter remote path (e.g., /home/user/apps/english-website): "

echo.
echo Uploading files to %SERVER%:%REMOTE_PATH%
echo.

REM Create remote directory
ssh %SERVER% "mkdir -p %REMOTE_PATH%"

REM Upload essential files
echo [1/10] Uploading src...
scp -r src %SERVER%:%REMOTE_PATH%/

echo [2/10] Uploading prisma...
scp -r prisma %SERVER%:%REMOTE_PATH%/

echo [3/10] Uploading public...
scp -r public %SERVER%:%REMOTE_PATH%/

echo [4/10] Uploading package files...
scp package.json %SERVER%:%REMOTE_PATH%/
scp package-lock.json %SERVER%:%REMOTE_PATH%/

echo [5/10] Uploading config files...
scp next.config.js %SERVER%:%REMOTE_PATH%/
scp server.js %SERVER%:%REMOTE_PATH%/
scp tailwind.config.js %SERVER%:%REMOTE_PATH%/
scp tsconfig.json %SERVER%:%REMOTE_PATH%/
scp postcss.config.js %SERVER%:%REMOTE_PATH%/

echo [6/10] Uploading .env.production...
scp .env.production %SERVER%:%REMOTE_PATH%/.env

echo.
echo ========================================
echo   Files uploaded successfully!
echo ========================================
echo.
echo Next steps on server:
echo   1. ssh %SERVER%
echo   2. cd %REMOTE_PATH%
echo   3. npm install --production
echo   4. npx prisma generate
echo   5. npm run build
echo   6. pm2 start npm --name "english-website" -- start
echo.
pause