# Production Setup Guide

## Server Information
- **IP**: 192.168.1.26
- **User**: czarevitch
- **App Directory**: ~/apps/english-website
- **Database**: SQLite at ~/apps/english-website/prisma/dev.db

## Critical Configuration

### 1. Environment File (.env)
**MUST use absolute path for DATABASE_URL on Linux server:**

```bash
DATABASE_URL="file:/home/czarevitch/apps/english-website/prisma/dev.db"
```

**NOT relative path:**
```bash
# ❌ WRONG - Will fail on production
DATABASE_URL="file:./prisma/dev.db"
```

### 2. Setup Steps
```bash
# On server
cd ~/apps/english-website

# Create .env with absolute path
cat > .env << 'EOF'
DATABASE_URL="file:/home/czarevitch/apps/english-website/prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://192.168.1.26:3000"
NODE_ENV="production"
EOF

# Restart
pm2 restart english-website
```

### 3. Verify Database Connection
```bash
# Check if database file exists
ls -la ~/apps/english-website/prisma/dev.db

# Check logs for Prisma errors
pm2 logs english-website --err
```

### 4. Admin Login
- Email: admin@example.com
- Password: admin123
- URL: http://192.168.1.26:3000/admin/login

## Key Points
- ✅ Always use **absolute path** for DATABASE_URL on Linux
- ✅ Ensure database file exists before starting app
- ✅ Check PM2 logs if Prisma errors occur
- ✅ Use force-dynamic for pages that query database
