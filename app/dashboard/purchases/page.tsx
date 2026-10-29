import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function PurchasesPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const purchases = await db.purchase.findMany({
    where: { businessId: user.businessId },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">Manage your purchase orders</p>
        </div>
        <Link href="/dashboard/purchases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{purchase.invoiceNo}</CardTitle>
                  <CardDescription>
                    {purchase.supplier.name} • {formatDate(purchase.date)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(purchase.grandTotal))}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {purchase.status}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {purchase.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <span>
                      {item.product.name} × {item.quantity.toString()}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(Number(item.total))}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {purchases.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No purchases found</p>
            <Link href="/dashboard/purchases/new">
              <Button>Create Your First Purchase</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

