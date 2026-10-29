# Complete Setup Guide

## Prerequisites

1. **Node.js 18+** ✅ (You have v24.11.0)
2. **PostgreSQL Database** (Required)

## Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

### Alternative: Use Docker
```bash
docker run --name pos-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pos_saas -p 5432:5432 -d postgres:15
```

## Step 2: Create Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:
```sql
CREATE DATABASE pos_saas;
```

Or using command line:
```bash
psql -U postgres
CREATE DATABASE pos_saas;
\q
```

## Step 3: Update .env File

Edit the `.env` file in the project root with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pos_saas?schema=public"
NEXTAUTH_SECRET="change-this-to-a-random-secret-key-in-production"
NODE_ENV=development
```

Replace:
- `YOUR_PASSWORD` with your PostgreSQL password
- `postgres` with your PostgreSQL username if different

## Step 4: Run Database Setup

```bash
# Generate Prisma Client (already done)
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with demo data
npm run db:seed
```

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:3000

## Default Login Credentials

After seeding:
- **Email**: admin@demo.com
- **Password**: demo123

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env
- Verify database name exists: `psql -U postgres -l`

### Port Already in Use
- Change the port in package.json or use: `PORT=3001 npm run dev`

### Prisma Errors
- Run `npm run db:generate` again
- Check Prisma schema syntax

## Quick Test (SQLite - Optional)

If you want to test without PostgreSQL, you can temporarily use SQLite:

1. Change `prisma/schema.prisma` datasource to:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Run `npm run db:push`
3. Run `npm run db:seed`

Note: SQLite has limitations and is not recommended for production.

