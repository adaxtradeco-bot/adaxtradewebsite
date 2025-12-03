#!/bin/bash

# Fresh Installation Script - Complete Clean Install
# This will DELETE everything and reinstall from scratch

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⚠️  WARNING: This will DELETE the entire application and reinstall!${NC}"
echo -e "${YELLOW}Press Ctrl+C to cancel, or Enter to continue...${NC}"
read

APP_DIR=~/apps/english-website
BACKUP_DIR=~/apps/english-website-backup-$(date +%Y%m%d-%H%M%S)

echo -e "${YELLOW}1️⃣  Stopping PM2 processes...${NC}"
pm2 delete all || true
pm2 kill || true

echo -e "${YELLOW}2️⃣  Creating backup of database (if exists)...${NC}"
if [ -f "$APP_DIR/prisma/dev.db" ]; then
    mkdir -p $BACKUP_DIR
    cp $APP_DIR/prisma/dev.db $BACKUP_DIR/
    echo -e "${GREEN}✅ Database backed up to: $BACKUP_DIR${NC}"
fi

echo -e "${YELLOW}3️⃣  Removing old installation...${NC}"
rm -rf $APP_DIR
echo -e "${GREEN}✅ Old installation removed${NC}"

echo -e "${YELLOW}4️⃣  Cloning fresh code from GitHub...${NC}"
cd ~/apps
git clone https://github.com/omidhb/english-website.git
cd english-website
echo -e "${GREEN}✅ Code cloned${NC}"

echo -e "${YELLOW}5️⃣  Creating .env file...${NC}"
cat > .env << 'EOF'
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

echo -e "${YELLOW}6️⃣  Checking for database file...${NC}"
if [ -f "$BACKUP_DIR/dev.db" ]; then
    echo -e "${YELLOW}   Restoring database from backup...${NC}"
    cp $BACKUP_DIR/dev.db ./prisma/
    echo -e "${GREEN}✅ Database restored${NC}"
else
    echo -e "${RED}❌ No database file found!${NC}"
    echo -e "${YELLOW}   Please copy database from local machine:${NC}"
    echo -e "${YELLOW}   scp \"d:\\my Develop Projects\\English Website\\prisma\\dev.db\" czarevitch@192.18.1.26:~/apps/english-website/prisma/${NC}"
    echo ""
    echo -e "${YELLOW}Press Enter after copying the database file...${NC}"
    read
fi

echo -e "${YELLOW}7️⃣  Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "${YELLOW}8️⃣  Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"

echo -e "${YELLOW}9️⃣  Building application...${NC}"
npm run build
echo -e "${GREEN}✅ Application built${NC}"

echo -e "${YELLOW}🔟 Starting with PM2...${NC}"
pm2 start npm --name "english-website" -- start
pm2 save
echo -e "${GREEN}✅ Application started${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Fresh installation completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 Application: http://192.18.1.26:3000${NC}"
echo -e "${GREEN}🔐 Admin Panel: http://192.18.1.26:3000/admin/login${NC}"
echo -e "${GREEN}   Email: admin@example.com${NC}"
echo -e "${GREEN}   Password: admin123${NC}"
echo ""
echo -e "${YELLOW}📊 Check status: pm2 status${NC}"
echo -e "${YELLOW}📝 View logs: pm2 logs english-website${NC}"
echo ""
if [ -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}💾 Backup location: $BACKUP_DIR${NC}"
fi
