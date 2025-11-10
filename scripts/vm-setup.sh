#!/bin/bash

# English Website - VM Setup Script for ESXi
# Run this on your Ubuntu VM

set -e

echo "================================"
echo "  English Website VM Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Update system
echo -e "${BLUE}[1/8] Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js
echo -e "${BLUE}[2/8] Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
echo -e "${BLUE}[3/8] Installing Git...${NC}"
sudo apt install -y git

# Install PM2
echo -e "${BLUE}[4/8] Installing PM2...${NC}"
sudo npm install -g pm2

# Install Nginx
echo -e "${BLUE}[5/8] Installing Nginx...${NC}"
sudo apt install -y nginx

# Setup project directory
echo -e "${BLUE}[6/8] Setting up project...${NC}"
mkdir -p ~/apps
cd ~/apps

# Ask for Git repo
read -p "Enter Git repository URL (or press Enter to skip): " REPO_URL

if [ ! -z "$REPO_URL" ]; then
    git clone "$REPO_URL" english-website
    cd english-website
else
    echo "Skipping Git clone. Please upload files manually."
    mkdir -p english-website
    cd english-website
fi

# Create environment file
echo -e "${BLUE}[7/8] Creating environment file...${NC}"
VM_IP=$(hostname -I | awk '{print $1}')
SECRET=$(openssl rand -base64 32)

cat > .env.production << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_URL="http://$VM_IP:3000"
NODE_ENV=production
EOF

echo "Environment file created!"

# Setup Nginx
echo -e "${BLUE}[8/8] Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/english-website > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/english-website /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Create update script
cat > ~/update-website.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating English Website..."
cd ~/apps/english-website
git pull
npm install
npm run build
pm2 restart english-website
echo "✅ Update complete!"
pm2 logs english-website --lines 20
EOF

chmod +x ~/update-website.sh

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Upload your project files (if not cloned from Git)"
echo "2. Run: cd ~/apps/english-website"
echo "3. Run: npm install"
echo "4. Run: npm run build"
echo "5. Run: pm2 start npm --name 'english-website' -- start"
echo "6. Run: pm2 save && pm2 startup"
echo ""
echo "Access your website at: http://$VM_IP"
echo ""
echo "To update later, run: ~/update-website.sh"
echo ""
