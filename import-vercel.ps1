# Import Database to Vercel - PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Import Database to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Load environment variables from .env.production
Write-Host "Step 1: Loading environment variables from .env.production..." -ForegroundColor Yellow

if (Test-Path .env.production) {
    Get-Content .env.production | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2].Trim('"')
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
            Write-Host "  ✓ Loaded: $key" -ForegroundColor Green
        }
    }
    Write-Host ""
} else {
    Write-Host "  ✗ .env.production not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create .env.production with Vercel database credentials" -ForegroundColor Yellow
    exit 1
}

# Step 2: Run import script
Write-Host "Step 2: Running import script..." -ForegroundColor Yellow
Write-Host ""

node scripts/import-database.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Import Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Go to your Vercel site" -ForegroundColor White
Write-Host "  2. Test the menus" -ForegroundColor White
Write-Host "  3. Login to /admin" -ForegroundColor White
Write-Host ""
