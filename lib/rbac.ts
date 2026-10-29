import { db } from './db'
import { getCurrentUser } from './auth'

export interface Permission {
  action: string
  resource: string
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  })

  if (!user?.role) return []

  return user.role.permissions.map((p) => ({
    action: p.action,
    resource: p.resource,
  }))
}

export async function hasPermission(
  userId: string,
  action: string,
  resource: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.some(
    (p) => p.action === action && p.resource === resource
  )
}

export async function requirePermission(
  userId: string,
  action: string,
  resource: string
): Promise<void> {
  const hasAccess = await hasPermission(userId, action, resource)
  if (!hasAccess) {
    throw new Error(`Permission denied: ${action} on ${resource}`)
  }
}

export async function withBusiness<T>(
  callback: (businessId: string, userId: string) => Promise<T>
): Promise<T> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return callback(user.businessId, user.id)
}

