# POS SaaS Setup Script for Windows PowerShell
Write-Host "=== POS SaaS Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is accessible
Write-Host ""
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"
try {
    $pgTest = psql -U postgres -h localhost -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL connection successful" -ForegroundColor Green
    } else {
        Write-Host "⚠ PostgreSQL connection failed. Make sure PostgreSQL is running." -ForegroundColor Yellow
        Write-Host "  You may need to update DATABASE_URL in .env file" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ PostgreSQL not found in PATH. Make sure PostgreSQL is installed and running." -ForegroundColor Yellow
    Write-Host "  You may need to update DATABASE_URL in .env file" -ForegroundColor Yellow
}

# Generate Prisma Client
Write-Host ""
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run db:push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "✗ Database migration failed. Check your DATABASE_URL in .env" -ForegroundColor Red
    exit 1
}

# Seed database
Write-Host ""
Write-Host "Seeding database..." -ForegroundColor Yellow
npm run db:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Database seeding failed (this is optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure your DATABASE_URL in .env is correct" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Default login credentials (after seeding):" -ForegroundColor Yellow
Write-Host "  Email: admin@demo.com" -ForegroundColor White
Write-Host "  Password: demo123" -ForegroundColor White
Write-Host ""

