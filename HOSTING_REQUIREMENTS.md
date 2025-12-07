# Hosting Requirements for Next.js Application

## 📋 Project Overview

**Project Name:** IvaFlow English Learning Platform  
**Technology:** Next.js 14 (React Framework)  
**Type:** Full-Stack Web Application with SSR (Server-Side Rendering)  
**Domain:** ivaflow.com

---

## 🔧 Technical Requirements

### 1. **Node.js Environment**
- **Node.js Version:** 18.x or higher (LTS recommended)
- **npm Version:** 9.x or higher
- **Required:** Full Node.js runtime support (not static hosting)

### 2. **Server Specifications**
- **RAM:** Minimum 1GB (2GB recommended)
- **Storage:** Minimum 2GB free space
- **CPU:** Shared hosting acceptable, VPS preferred
- **Operating System:** Linux (Ubuntu/CentOS) or compatible

### 3. **Port & Network**
- **Port Access:** Port 3000 or custom port configuration
- **Reverse Proxy:** Nginx or Apache with proxy support
- **SSL/TLS:** HTTPS certificate required
- **WebSocket:** Support required for real-time features

### 4. **Database (if applicable)**
- **PostgreSQL:** Version 14+ OR
- **MySQL:** Version 8+ OR
- **MongoDB:** Version 5+
- **Connection:** Remote database connection support

### 5. **Environment Variables**
- Support for `.env` files or environment variable configuration
- Secure storage for sensitive credentials

---

## 🚀 Deployment Process

### What We Need from Hosting Provider:

#### Option A: cPanel with Node.js Selector (Preferred)
```
✅ cPanel access
✅ Node.js Selector/Manager tool
✅ Ability to create Node.js applications
✅ SSH access (optional but recommended)
```

#### Option B: SSH/Terminal Access
```
✅ Full SSH access
✅ Ability to install packages via npm
✅ Permission to run Node.js processes
✅ PM2 or similar process manager support
```

#### Option C: Managed Node.js Hosting
```
✅ Pre-configured Node.js environment
✅ Git deployment support
✅ Automatic builds and restarts
✅ Environment variable management
```

---

## 📦 Application Structure

```
english-website/
├── .next/              # Built application (generated)
├── public/             # Static assets
├── src/                # Source code
├── node_modules/       # Dependencies (10,000+ files)
├── package.json        # Dependencies list
├── next.config.js      # Next.js configuration
└── server.js           # Custom server (if needed)
```

**Total Size:** ~300-500MB (with node_modules)

---

## 🔄 Build & Start Commands

### Build Process:
```bash
npm install --production
npm run build
```

### Start Application:
```bash
npm start
# OR
node server.js
# OR
pm2 start npm --name "ivaflow" -- start
```

---

## 🌐 Domain Configuration

### DNS Settings:
```
Type: A Record
Host: @ (or www)
Points to: [Server IP]
TTL: 3600
```

### Reverse Proxy (Nginx Example):
```nginx
server {
    listen 80;
    server_name ivaflow.com www.ivaflow.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚡ Performance Requirements

- **Response Time:** < 2 seconds for initial load
- **Uptime:** 99.9% availability
- **Bandwidth:** Unlimited or minimum 100GB/month
- **Concurrent Users:** Support for 100+ simultaneous connections

---

## 🔒 Security Requirements

- SSL/TLS certificate (Let's Encrypt acceptable)
- Firewall configuration
- DDoS protection (recommended)
- Regular backups (daily recommended)
- Secure file permissions

---

## 📊 Monitoring & Logs

- Access to application logs
- Error logging capability
- Performance monitoring (optional)
- Uptime monitoring

---

## 🆘 Support Requirements

We need hosting provider support for:
- Initial Node.js setup and configuration
- Environment troubleshooting
- Server restart procedures
- Backup and restore procedures
- SSL certificate installation

---

## ✅ Pre-Deployment Checklist

Please confirm your hosting supports:

- [ ] Node.js 18+ runtime
- [ ] npm package manager
- [ ] Long-running Node.js processes
- [ ] Custom port configuration or reverse proxy
- [ ] Environment variables
- [ ] SSL certificate
- [ ] SSH or cPanel access
- [ ] Minimum 1GB RAM
- [ ] Minimum 2GB storage

---

## 📞 Questions to Ask Hosting Provider

1. **"Do you support Node.js applications?"**
   - If yes, which versions?

2. **"Can I run a Next.js application on your servers?"**
   - Next.js requires persistent Node.js process

3. **"Do you provide cPanel with Node.js Selector?"**
   - Makes deployment much easier

4. **"Is SSH access available?"**
   - Required for manual deployment

5. **"Do you support reverse proxy configuration?"**
   - Needed to route domain to Node.js app

6. **"What process manager do you recommend?"**
   - PM2, Forever, or built-in solution?

7. **"Do you provide automatic SSL certificates?"**
   - Let's Encrypt integration?

8. **"What's the maximum memory limit for Node.js apps?"**
   - Should be at least 1GB

---

## 🎯 Recommended Hosting Providers

### Fully Compatible:
- ✅ Vercel (Next.js native, easiest)
- ✅ Netlify
- ✅ Railway
- ✅ Render
- ✅ DigitalOcean App Platform
- ✅ AWS Amplify
- ✅ Heroku

### With Configuration:
- ⚙️ Hostinger (with Node.js Selector)
- ⚙️ cPanel hosting (with Node.js support)
- ⚙️ VPS (DigitalOcean, Linode, Vultr)

### Not Compatible:
- ❌ Traditional PHP-only hosting
- ❌ Static file hosting only
- ❌ Shared hosting without Node.js

---

## 📧 Email Template for Hosting Support

```
Subject: Node.js Hosting Requirements for Next.js Application

Hello,

I need to deploy a Next.js 14 application on your hosting service.

Technical Requirements:
- Node.js version 18 or higher
- npm package manager
- Ability to run persistent Node.js processes
- Reverse proxy or custom port configuration
- SSL certificate support
- Minimum 1GB RAM, 2GB storage

Questions:
1. Do you support Node.js applications?
2. Is there a Node.js Selector in cPanel?
3. Can I access SSH for deployment?
4. Do you provide process management (PM2)?

Please confirm if your hosting plan supports these requirements.

Thank you!
```

---

## 🔗 Additional Resources

- Next.js Deployment Docs: https://nextjs.org/docs/deployment
- Node.js Official: https://nodejs.org
- PM2 Process Manager: https://pm2.keymetrics.io

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Contact:** [Your Email/Support]
