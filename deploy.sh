#!/bin/bash

# Deployment Script for English Website
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR=~/apps/english-website
APP_NAME="english-website"
SERVER_IP="192.18.1.26"

echo -e "${YELLOW}📂 Navigating to app directory...${NC}"
cd $APP_DIR

echo -e "${YELLOW}🛑 Stopping PM2 processes...${NC}"
pm2 stop $APP_NAME || true

echo -e "${YELLOW}📥 Pulling latest code from GitHub...${NC}"
git pull origin main

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

echo -e "${YELLOW}🧹 Cleaning up old PM2 instances...${NC}"
pm2 delete $APP_NAME || true

echo -e "${YELLOW}▶️  Starting application with PM2...${NC}"
pm2 start npm --name "$APP_NAME" -- start

echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}🌐 Application is running at: http://${SERVER_IP}:3000${NC}"
echo -e "${GREEN}🔐 Admin panel: http://${SERVER_IP}:3000/admin/login${NC}"
echo ""
echo -e "${YELLOW}📊 Check status with: pm2 status${NC}"
echo -e "${YELLOW}📝 View logs with: pm2 logs ${APP_NAME}${NC}"
