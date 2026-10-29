import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  // Get dashboard stats
  let salesStats, purchaseStats, expenseStats, lowStockCount
  
  try {
    [salesStats, purchaseStats, expenseStats, lowStockCount] = await Promise.all([
    db.sale.aggregate({
      where: { businessId: user.businessId },
      _sum: { grandTotal: true },
      _count: true,
    }),
    db.purchase.aggregate({
      where: { businessId: user.businessId },
      _sum: { grandTotal: true },
      _count: true,
    }),
    db.expense.aggregate({
      where: { businessId: user.businessId },
      _sum: { amount: true },
      _count: true,
    }),
    db.product.findMany({
      where: {
        businessId: user.businessId,
        isActive: true,
      },
      select: {
        stock: true,
        minStock: true,
      },
    }).then(products => 
      products.filter(p => Number(p.stock) <= Number(p.minStock)).length
    ),
    ])
  } catch (error) {
    console.error('Dashboard error:', error)
    // Return default values on error
    salesStats = { _sum: { grandTotal: null }, _count: 0 }
    purchaseStats = { _sum: { grandTotal: null }, _count: 0 }
    expenseStats = { _sum: { amount: null }, _count: 0 }
    lowStockCount = 0
  }

  const stats = [
    {
      title: 'Total Sales',
      value: formatCurrency(Number(salesStats._sum.grandTotal || 0)),
      description: `${salesStats._count} transactions`,
    },
    {
      title: 'Total Purchases',
      value: formatCurrency(Number(purchaseStats._sum.grandTotal || 0)),
      description: `${purchaseStats._count} transactions`,
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(Number(expenseStats._sum.amount || 0)),
      description: `${expenseStats._count} expenses`,
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount.toString(),
      description: 'Items need restocking',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.firstName}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

