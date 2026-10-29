# POS SaaS - Point of Sale & Accounting System

A multi-tenant SaaS application for Point of Sale and Accounting built with Next.js 14, PostgreSQL, and Prisma.

## Features

- 🔐 **Authentication & Authorization**
  - User registration and login
  - Role-Based Access Control (RBAC)
  - Multi-tenant architecture

- 📦 **Product & Inventory Management**
  - CRUD operations for products
  - Categories and units
  - Stock tracking
  - Low stock alerts
  - Barcode support

- 🛒 **Point of Sale (POS)**
  - Real-time cart management
  - Discount and tax calculation
  - Automatic stock reduction
  - Multiple payment methods

- 📥 **Purchases**
  - Supplier management
  - Purchase orders
  - Automatic stock increase
  - Purchase invoices

- 💰 **Expenses**
  - Expense categories
  - Daily expense tracking
  - Proof image upload

- 💳 **Payment Accounts**
  - Cash accounts
  - Bank accounts
  - Balance tracking

- 📊 **Reports**
  - Sales reports
  - Purchase reports
  - Expense reports
  - Stock reports
  - Profit/loss analysis

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, ShadCN UI
- **Backend**: Next.js Server Actions, API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom auth with bcrypt
- **Authorization**: RBAC with custom middleware

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pos-saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_saas?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NODE_ENV=development
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

After seeding:
- Email: `admin@demo.com`
- Password: `demo123`

## Project Structure

```
pos-saas/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # ShadCN UI components
│   └── layout/            # Layout components
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication helpers
│   ├── db.ts              # Prisma client
│   └── rbac.ts            # RBAC helpers
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database schema
└── server/                # Server-side code
    └── actions/           # Server actions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## Database Schema

The application uses PostgreSQL with the following main models:
- Business (multi-tenant)
- User
- Role & Permission (RBAC)
- Product & Category
- Contact (Customers/Suppliers)
- Sale & Purchase
- Expense
- PaymentAccount
- StockMovement

## License

MIT
