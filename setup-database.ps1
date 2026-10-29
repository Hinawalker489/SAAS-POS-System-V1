# PowerShell script to help set up the database
Write-Host "POS SaaS Database Setup" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_saas?schema=public"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-$(Get-Random)"
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host ".env file created. Please update DATABASE_URL with your PostgreSQL credentials." -ForegroundColor Yellow
}

Write-Host "Current .env contents:" -ForegroundColor Cyan
Get-Content .env
Write-Host ""

# Check if DATABASE_URL is set
$envContent = Get-Content .env
$hasDbUrl = $envContent | Select-String "DATABASE_URL"

if ($hasDbUrl -and $hasDbUrl.Line -match "user:password") {
    Write-Host "WARNING: DATABASE_URL still has default values!" -ForegroundColor Red
    Write-Host "Please update .env with your actual PostgreSQL credentials:" -ForegroundColor Yellow
    Write-Host "  DATABASE_URL=`"postgresql://USERNAME:PASSWORD@localhost:5432/pos_saas?schema=public`"" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Have you updated the .env file? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please update .env and run this script again." -ForegroundColor Red
        exit
    }
}

Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npm run db:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to generate Prisma Client" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Pushing schema to database..." -ForegroundColor Cyan
Write-Host "Make sure PostgreSQL is running and the database exists!" -ForegroundColor Yellow
npm run db:push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database schema pushed successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Seeding database..." -ForegroundColor Cyan
    npm run db:seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now start the development server with:" -ForegroundColor Cyan
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Default login:" -ForegroundColor Cyan
        Write-Host "  Email: admin@demo.com" -ForegroundColor White
        Write-Host "  Password: demo123" -ForegroundColor White
    } else {
        Write-Host "Failed to seed database" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "Failed to push schema. Common issues:" -ForegroundColor Red
    Write-Host "  1. PostgreSQL is not running" -ForegroundColor Yellow
    Write-Host "  2. Database 'pos_saas' does not exist" -ForegroundColor Yellow
    Write-Host "  3. Wrong credentials in DATABASE_URL" -ForegroundColor Yellow
    Write-Host "  4. PostgreSQL is not installed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See SETUP.md for detailed instructions." -ForegroundColor Cyan
}

