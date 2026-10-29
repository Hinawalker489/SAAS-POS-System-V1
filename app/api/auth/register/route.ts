import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, businessName } = await request.json()

    if (!firstName || !lastName || !email || !password || !businessName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create business
    const businessSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const business = await db.business.create({
      data: {
        name: businessName,
        slug: businessSlug,
      },
    })

    // Create default roles if they don't exist
    let adminRole = await db.role.findFirst({
      where: {
        businessId: business.id,
        name: 'Admin',
      },
    })

    if (!adminRole) {
      adminRole = await db.role.create({
        data: {
          name: 'Admin',
          description: 'Full system access',
          businessId: business.id,
          isSystem: true,
        },
      })

      // Create permissions for admin role
      await db.permission.createMany({
        data: [
          { action: 'read', resource: '*', roleId: adminRole.id },
          { action: 'write', resource: '*', roleId: adminRole.id },
          { action: 'delete', resource: '*', roleId: adminRole.id },
        ],
      })
    }

    // Create user
    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        businessId: business.id,
        roleId: adminRole.id,
      },
    })

    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessId: user.businessId,
        roleId: user.roleId,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

