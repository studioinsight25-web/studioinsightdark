// app/api/admin/fix-order/route.ts - Admin endpoint to manually fix/create orders
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'
import { OrderService } from '@/lib/orders'
import { DatabaseProductService } from '@/lib/products-database'

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if admin (basic check)
    const userResult = await DatabaseService.query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    )

    if (userResult.length === 0 || userResult[0].role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, productIds, status = 'PAID', paymentId } = body

    if (!userId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'userId and productIds array are required' },
        { status: 400 }
      )
    }

    // Get products
    const products = await Promise.all(
      productIds.map(async (productId: string) => {
        const product = await DatabaseProductService.getProduct(productId)
        if (!product) {
          throw new Error(`Product ${productId} not found`)
        }
        return product
      })
    )

    // Create order
    const order = await OrderService.createOrder(userId, products)

    // Update order status to PAID
    if (status === 'PAID' || status === 'paid') {
      await OrderService.updateOrderStatus(order.id, 'paid', paymentId || undefined)
    }

    // Get full order details
    const fullOrder = await OrderService.getOrder(order.id)

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: fullOrder
    })

  } catch (error) {
    console.error('[Fix Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

