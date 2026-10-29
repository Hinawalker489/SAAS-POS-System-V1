#!/bin/bash

# POS SaaS Setup Script for Linux/Mac
echo "=== POS SaaS Setup ==="
echo ""

# Check if Node.js is installed
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js $NODE_VERSION found"
else
    echo "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is accessible
echo ""
echo "Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    if PGPASSWORD=postgres psql -U postgres -h localhost -c "SELECT version();" &> /dev/null; then
        echo "✓ PostgreSQL connection successful"
    else
        echo "⚠ PostgreSQL connection failed. Make sure PostgreSQL is running."
        echo "  You may need to update DATABASE_URL in .env file"
    fi
else
    echo "⚠ PostgreSQL not found. Make sure PostgreSQL is installed and running."
    echo "  You may need to update DATABASE_URL in .env file"
fi

# Generate Prisma Client
echo ""
echo "Generating Prisma Client..."
npm run db:generate
if [ $? -eq 0 ]; then
    echo "✓ Prisma Client generated"
else
    echo "✗ Failed to generate Prisma Client"
    exit 1
fi

# Run migrations
echo ""
echo "Running database migrations..."
npm run db:push
if [ $? -eq 0 ]; then
    echo "✓ Database migrations completed"
else
    echo "✗ Database migration failed. Check your DATABASE_URL in .env"
    exit 1
fi

# Seed database
echo ""
echo "Seeding database..."
npm run db:seed
if [ $? -eq 0 ]; then
    echo "✓ Database seeded successfully"
else
    echo "⚠ Database seeding failed (this is optional)"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Make sure your DATABASE_URL in .env is correct"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Default login credentials (after seeding):"
echo "  Email: admin@demo.com"
echo "  Password: demo123"
echo ""

