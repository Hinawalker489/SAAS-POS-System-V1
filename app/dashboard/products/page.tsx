import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ProductsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const products = await db.product.findMany({
    where: { businessId: user.businessId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.category?.name || 'No category'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock:</span>
                  <span className={Number(product.stock) <= Number(product.minStock) ? 'text-destructive font-semibold' : 'font-semibold'}>
                    {product.stock.toString()} {product.unit}
                  </span>
                </div>
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SKU:</span>
                    <span className="text-sm">{product.sku}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Link href="/dashboard/products/new">
              <Button>Add Your First Product</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

