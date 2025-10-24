# Clienter Quick Start Script
# This script helps you set up the project quickly

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Clienter - Freelancer Management" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✓ Environment file (.env.local) already exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Environment file (.env.local) not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating .env.local from template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✓ Created .env.local file" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠ IMPORTANT: You need to update .env.local with your Supabase credentials!" -ForegroundColor Red
        Write-Host "   1. Go to https://supabase.com" -ForegroundColor White
        Write-Host "   2. Create a new project" -ForegroundColor White
        Write-Host "   3. Copy your Project URL and API Key" -ForegroundColor White
        Write-Host "   4. Update .env.local with these values" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Set up your Supabase project (see SETUP.md)" -ForegroundColor White
Write-Host "  2. Update .env.local with your credentials" -ForegroundColor White
Write-Host "  3. Run 'npm run dev' to start the app" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "  - SETUP.md for step-by-step setup" -ForegroundColor White
Write-Host "  - README.md for full documentation" -ForegroundColor White
Write-Host ""
Write-Host "Ready to start? Run:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
