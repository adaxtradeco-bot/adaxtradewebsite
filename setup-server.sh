#!/bin/bash

# Initial Server Setup Script
# Run this ONCE on the server for first-time setup

set -e

echo "🔧 Initial Server Setup for English Website"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR=~/apps/english-website

echo -e "${YELLOW}1️⃣  Creating .env file...${NC}"
cat > $APP_DIR/.env << 'EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://192.18.1.26:3000"
NODE_ENV="production"
EOF

echo -e "${GREEN}✅ .env file created${NC}"

echo -e "${YELLOW}2️⃣  Checking database file...${NC}"
if [ -f "$APP_DIR/prisma/dev.db" ]; then
    echo -e "${GREEN}✅ Database file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Database file NOT found!${NC}"
    echo -e "${YELLOW}   Please copy dev.db from local machine:${NC}"
    echo -e "${YELLOW}   scp \"d:\\my Develop Projects\\English Website\\prisma\\dev.db\" czarevitch@192.18.1.26:~/apps/english-website/prisma/${NC}"
fi

echo -e "${YELLOW}3️⃣  Installing dependencies...${NC}"
cd $APP_DIR
npm install

echo -e "${YELLOW}4️⃣  Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}5️⃣  Building application...${NC}"
npm run build

echo -e "${YELLOW}6️⃣  Setting up PM2...${NC}"
pm2 delete english-website || true
pm2 start npm --name "english-website" -- start
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${GREEN}🌐 Application: http://192.18.1.26:3000${NC}"
echo -e "${GREEN}🔐 Admin: http://192.18.1.26:3000/admin/login${NC}"
echo -e "${GREEN}   Email: admin@example.com${NC}"
echo -e "${GREEN}   Password: admin123${NC}"
echo ""
echo -e "${YELLOW}📊 Check status: pm2 status${NC}"
echo -e "${YELLOW}📝 View logs: pm2 logs english-website${NC}"
