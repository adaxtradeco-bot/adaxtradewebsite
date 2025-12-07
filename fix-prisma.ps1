# Fix Prisma Lock Issue
Write-Host "🔧 Fixing Prisma lock issue..." -ForegroundColor Green

# Kill any Node processes
Write-Host "Killing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Remove Prisma cache
Write-Host "Removing Prisma cache..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Reinstall
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "✅ Done! Try running: npm run dev" -ForegroundColor Green