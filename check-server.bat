@echo off
echo ========================================
echo    IVAFlow.com - Server Status Check
echo ========================================
echo.

echo [1] Checking PM2 status...
ssh -p 65002 u333279351@82.198.227.28 "pm2 status"
echo.

echo [2] Checking server resources...
ssh -p 65002 u333279351@82.198.227.28 "df -h | head -2 && free -m | head -2"
echo.

echo [3] Checking Node.js version...
ssh -p 65002 u333279351@82.198.227.28 "node -v && npm -v"
echo.

echo [4] Checking application logs (last 10 lines)...
ssh -p 65002 u333279351@82.198.227.28 "pm2 logs ivaflow --lines 10"
echo.

echo [5] Testing website response...
curl -I https://ivaflow.com
echo.

echo ========================================
echo    Status Check Complete!
echo ========================================
pause