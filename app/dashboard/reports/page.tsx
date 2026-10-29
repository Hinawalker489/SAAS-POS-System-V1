import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ReportsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Sales Report
  const sales = await db.sale.findMany({
    where: {
      businessId: user.businessId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.grandTotal), 0)
  const salesCount = sales.length

  // Purchases Report
  const purchases = await db.purchase.findMany({
    where: {
      businessId: user.businessId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const totalPurchases = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.grandTotal),
    0
  )

  // Expenses Report
  const expenses = await db.expense.findMany({
    where: {
      businessId: user.businessId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  // Stock Report
  const products = await db.product.findMany({
    where: {
      businessId: user.businessId,
      isActive: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      stock: 'asc',
    },
  })

  const lowStockProducts = products.filter(
    (p) => Number(p.stock) <= Number(p.minStock)
  )

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.stock) * Number(p.costPrice || p.price),
    0
  )

  // Top selling products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
  
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const existing = productSales.get(item.productId) || {
        name: item.product.name,
        quantity: 0,
        revenue: 0,
      }
      productSales.set(item.productId, {
        name: item.product.name,
        quantity: existing.quantity + Number(item.quantity),
        revenue: existing.revenue + Number(item.total),
      })
    })
  })

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const profit = totalSales - totalPurchases - totalExpenses

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Monthly overview for {formatDate(startOfMonth)} - {formatDate(endOfMonth)}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>{salesCount} transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Purchases</CardTitle>
            <CardDescription>{purchases.length} orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalPurchases)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>{expenses.length} expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
            <CardDescription>Sales - Purchases - Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                profit >= 0 ? 'text-green-600' : 'text-destructive'
              }`}
            >
              {formatCurrency(profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Report */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Current stock status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-destructive">
                {lowStockProducts.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantity} units sold
                      </p>
                    </div>
                    <p className="font-bold">{formatCurrency(product.revenue)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sales data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Low Stock Alert</CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category?.name || 'No category'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">
                      {product.stock.toString()} {product.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min: {product.minStock.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

