# Quick Start Guide

## ✅ Completed Steps

1. ✅ Project structure created
2. ✅ Dependencies installed
3. ✅ Prisma Client generated
4. ✅ .env file created

## 🔧 Next Steps (You Need to Do)

### Step 1: Install PostgreSQL (if not installed)

**Option A: Download & Install**
- Download: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember your `postgres` user password

**Option B: Use Docker (Recommended)**
```powershell
docker run --name pos-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pos_saas -p 5432:5432 -d postgres:15
```

### Step 2: Create Database

Open PowerShell and run:
```powershell
# If using default PostgreSQL installation
psql -U postgres
CREATE DATABASE pos_saas;
\q
```

Or if you used Docker, the database is already created.

### Step 3: Update .env File

Edit `.env` and update the DATABASE_URL if your PostgreSQL password is different:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pos_saas?schema=public"
```

If using default Docker setup, the current .env should work.

### Step 4: Run Database Setup

Run the automated setup script:
```powershell
.\setup-database.ps1
```

Or manually:
```powershell
npm run db:push
npm run db:seed
```

### Step 5: Start Development Server

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

## 🔑 Default Login

After seeding:
- **Email**: admin@demo.com
- **Password**: demo123

## 🐛 Troubleshooting

### "Database connection failed"
- Make sure PostgreSQL is running
- Check if database `pos_saas` exists
- Verify DATABASE_URL in .env

### "Port 3000 already in use"
```powershell
$env:PORT=3001; npm run dev
```

### "Prisma errors"
```powershell
npm run db:generate
npm run db:push
```

## 📚 Full Documentation

See `SETUP.md` for detailed instructions.

