import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a sample business
  const business = await prisma.business.upsert({
    where: { slug: 'demo-business' },
    update: {},
    create: {
      name: 'Demo Business',
      slug: 'demo-business',
      email: 'demo@example.com',
    },
  })

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { id: 'admin-role' },
    update: {},
    create: {
      id: 'admin-role',
      name: 'Admin',
      description: 'Full system access',
      businessId: business.id,
      isSystem: true,
    },
  })

  const managerRole = await prisma.role.upsert({
    where: { id: 'manager-role' },
    update: {},
    create: {
      id: 'manager-role',
      name: 'Manager',
      description: 'Management access',
      businessId: business.id,
      isSystem: true,
    },
  })

  const cashierRole = await prisma.role.upsert({
    where: { id: 'cashier-role' },
    update: {},
    create: {
      id: 'cashier-role',
      name: 'Cashier',
      description: 'POS access only',
      businessId: business.id,
      isSystem: true,
    },
  })

  // Create permissions for admin
  await prisma.permission.createMany({
    data: [
      { action: 'read', resource: '*', roleId: adminRole.id },
      { action: 'write', resource: '*', roleId: adminRole.id },
      { action: 'delete', resource: '*', roleId: adminRole.id },
    ],
    skipDuplicates: true,
  })

  // Create permissions for manager
  await prisma.permission.createMany({
    data: [
      { action: 'read', resource: '*', roleId: managerRole.id },
      { action: 'write', resource: 'product', roleId: managerRole.id },
      { action: 'write', resource: 'sale', roleId: managerRole.id },
      { action: 'write', resource: 'purchase', roleId: managerRole.id },
      { action: 'read', resource: 'report', roleId: managerRole.id },
    ],
    skipDuplicates: true,
  })

  // Create permissions for cashier
  await prisma.permission.createMany({
    data: [
      { action: 'read', resource: 'product', roleId: cashierRole.id },
      { action: 'write', resource: 'sale', roleId: cashierRole.id },
    ],
    skipDuplicates: true,
  })

  // Create demo user
  const hashedPassword = await hashPassword('demo123')
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      businessId: business.id,
      roleId: adminRole.id,
    },
  })

  // Create payment accounts
  await prisma.paymentAccount.createMany({
    data: [
      {
        name: 'Cash Register',
        type: 'cash',
        balance: 1000,
        businessId: business.id,
      },
      {
        name: 'Main Bank Account',
        type: 'bank',
        accountNumber: '1234567890',
        balance: 5000,
        businessId: business.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

