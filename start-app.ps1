# Script to start the POS SaaS application
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Starting POS SaaS Application" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Check if Docker is available
Write-Host "Checking Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found" -ForegroundColor Red
    Write-Host "Please install Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Desktop is running
Write-Host "`nChecking if Docker Desktop is running..." -ForegroundColor Cyan
try {
    docker ps > $null 2>&1
    Write-Host "✓ Docker Desktop is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Desktop is not running" -ForegroundColor Red
    Write-Host "`nPlease start Docker Desktop and run this script again." -ForegroundColor Yellow
    Write-Host "Or press any key to try starting it automatically..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Try to start Docker Desktop
    $dockerPath = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Write-Host "Starting Docker Desktop..." -ForegroundColor Cyan
        Start-Process $dockerPath
        Write-Host "Waiting for Docker Desktop to start (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Check again
        $retries = 0
        while ($retries -lt 10) {
            try {
                docker ps > $null 2>&1
                Write-Host "✓ Docker Desktop is now running" -ForegroundColor Green
                break
            } catch {
                $retries++
                Write-Host "Waiting... ($retries/10)" -ForegroundColor Yellow
                Start-Sleep -Seconds 3
            }
        }
        
        if ($retries -eq 10) {
            Write-Host "✗ Docker Desktop did not start in time" -ForegroundColor Red
            Write-Host "Please start it manually and run this script again" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✗ Docker Desktop not found at expected location" -ForegroundColor Red
        Write-Host "Please start Docker Desktop manually" -ForegroundColor Yellow
        exit 1
    }
}

# Check if container exists
Write-Host "`nChecking for existing PostgreSQL container..." -ForegroundColor Cyan
$containerExists = docker ps -a --filter "name=pos-postgres" --format "{{.Names}}" 2>&1

if ($containerExists -eq "pos-postgres") {
    Write-Host "✓ Container exists, checking if running..." -ForegroundColor Green
    $containerRunning = docker ps --filter "name=pos-postgres" --format "{{.Names}}" 2>&1
    
    if ($containerRunning -eq "pos-postgres") {
        Write-Host "✓ Container is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting existing container..." -ForegroundColor Cyan
        docker start pos-postgres
        Start-Sleep -Seconds 5
        Write-Host "✓ Container started" -ForegroundColor Green
    }
} else {
    Write-Host "Creating new PostgreSQL container..." -ForegroundColor Cyan
    docker run --name pos-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pos_saas -p 5432:5432 -d postgres:15
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Container created and started" -ForegroundColor Green
        Write-Host "Waiting for database to be ready (10 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Write-Host "✗ Failed to create container" -ForegroundColor Red
        exit 1
    }
}

# Setup database
Write-Host "`nSetting up database schema..." -ForegroundColor Cyan
npm run db:push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database schema created" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create database schema" -ForegroundColor Red
    Write-Host "Trying again in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    npm run db:push
    if ($LASTEXITCODE -ne 0) {
        exit 1
    }
}

# Seed database
Write-Host "`nSeeding database with demo data..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: Seeding failed (may already be seeded)" -ForegroundColor Yellow
}

# Start dev server
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
Write-Host "Application will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000`n" -ForegroundColor White
Write-Host "Default login credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@demo.com" -ForegroundColor White
Write-Host "  Password: demo123`n" -ForegroundColor White
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev

