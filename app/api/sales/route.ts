import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateInvoiceNo } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, subtotal, tax, grandTotal } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Validate stock availability
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      if (Number(product.stock) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Create sale
    const invoiceNo = generateInvoiceNo('SALE')
    const sale = await db.sale.create({
      data: {
        invoiceNo,
        businessId: user.businessId,
        userId: user.id,
        subtotal: subtotal,
        tax: tax,
        grandTotal: grandTotal,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
    })

    // Update stock and create stock movements
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      await db.stockMovement.create({
        data: {
          productId: item.productId,
          businessId: user.businessId,
          type: 'out',
          quantity: item.quantity,
          reference: sale.id,
          reason: 'Sale',
        },
      })
    }

    return NextResponse.json({ success: true, sale })
  } catch (error: any) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

