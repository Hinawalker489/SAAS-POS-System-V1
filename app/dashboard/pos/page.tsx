"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
}

export default function POSPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= Number(product.stock)) {
        toast({
          title: "Error",
          description: "Insufficient stock",
          variant: "destructive",
        })
        return
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      if (Number(product.stock) <= 0) {
        toast({
          title: "Error",
          description: "Product out of stock",
          variant: "destructive",
        })
        return
      }
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          stock: Number(product.stock),
        },
      ])
    }
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            if (newQuantity > item.stock) {
              toast({
                title: "Error",
                description: "Insufficient stock",
                variant: "destructive",
              })
              return item
            }
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          subtotal,
          tax,
          grandTotal: total,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to create sale")
      }

      toast({
        title: "Success",
        description: "Sale completed successfully",
      })

      setCart([])
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Select products to add to cart</p>
        </div>

        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts
            .filter((p) => p.isActive)
            .map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(product.price))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stock: {product.stock.toString()} {product.unit}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
            </CardTitle>
            <CardDescription>{cart.length} items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Cart is empty
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? "Processing..." : "Checkout"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

