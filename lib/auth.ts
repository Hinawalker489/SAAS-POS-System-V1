import { cookies } from 'next/headers'
import { db } from './db'
import bcrypt from 'bcryptjs'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  businessId: string
  roleId: string
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) return null

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessId: true,
        roleId: true,
      },
    })

    return user
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

