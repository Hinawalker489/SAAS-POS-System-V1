import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function PaymentsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const accounts = await db.paymentAccount.findMany({
    where: { businessId: user.businessId, isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Accounts</h1>
          <p className="text-muted-foreground">Manage your cash and bank accounts</p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle>{account.name}</CardTitle>
              <CardDescription className="capitalize">{account.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(Number(account.balance))}
                  </span>
                </div>
                {account.accountNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account #:</span>
                    <span className="text-sm">{account.accountNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No payment accounts found</p>
            <Link href="/dashboard/payments/new">
              <Button>Add Your First Account</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

