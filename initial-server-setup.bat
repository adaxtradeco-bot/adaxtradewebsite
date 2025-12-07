@echo off
echo ========================================
echo    IVAFlow.com - Initial Server Setup
echo ========================================
echo.

echo [1/8] Connecting to server and creating directories...
ssh -p 65002 u333279351@82.198.227.28 "mkdir -p ~/apps/english-website"

echo [2/8] Cloning repository...
ssh -p 65002 u333279351@82.198.227.28 "cd ~/apps/english-website && git clone https://github.com/omidhb/english-website.git ."

echo [3/8] Creating production environment file...
ssh -p 65002 u333279351@82.198.227.28 "cd ~/apps/english-website && cat > .env << 'EOF'
# Database
DATABASE_URL=\"file:./prisma/dev.db\"

# Authentication
JWT_SECRET=\"IVAFlow2024SecureProductionKey!@#$%%\"
ADMIN_EMAIL=\"administrator@ivaflow.com\"
ADMIN_PASSWORD=\"IVAFlow@2024#SecureAdmin!Prod\"

# Next.js
NEXTAUTH_SECRET=\"IVAFlow2024NextAuthSecretKey!@#$%%^&*()\"
NEXTAUTH_URL=\"https://ivaflow.com\"
NODE_ENV=\"production\"
EOF"

echo [4/8] Installing dependencies...
ssh -p 65002 u333279351@82.198.227.28 "cd ~/apps/english-website && npm install --production"

echo [5/8] Generating Prisma client...
ssh -p 65002 u333279351@82.198.227.28 "cd ~/apps/english-website && npx prisma generate"

echo [6/8] Uploading database...
scp -P 65002 "prisma\dev.db" u333279351@82.198.227.28:~/apps/english-website/prisma/

echo [7/8] Building application...
ssh -p 65002 u333279351@82.198.227.28 "cd ~/apps/english-website && npm run build"

echo [8/8] Starting with PM2...
ssh -p 65002 u333279351@82.198.227.28 "cd ~/apps/english-website && pm2 start npm --name 'ivaflow' -- start && pm2 save"

echo.
echo ========================================
echo    Initial Setup Complete!
echo    Website: https://ivaflow.com
echo    Admin: https://ivaflow.com/admin/login
echo    
echo    Credentials:
echo    Email: administrator@ivaflow.com
echo    Password: IVAFlow@2024#SecureAdmin!Prod
echo ========================================
echo.
pause