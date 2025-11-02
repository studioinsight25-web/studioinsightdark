// app/api/debug-order-by-id/route.ts - Check order by order ID
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId parameter is required' },
        { status: 400 }
      )
    }

    console.log(`[Debug Order By ID] Checking order: ${orderId}`)

    // Get order
    let orderResult
    try {
      orderResult = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at,
          o.updated_at,
          u.email as user_email,
          u.name as user_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = $1`,
        [orderId]
      )
    } catch (error) {
      // Try without paid_at
      orderResult = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at,
          o.updated_at,
          u.email as user_email,
          u.name as user_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = $1`,
        [orderId]
      )
    }

    if (orderResult.length === 0) {
      return NextResponse.json({
        error: 'Order not found',
        orderId
      })
    }

    const order = orderResult[0]

    // Get order items
    const itemsResult = await DatabaseService.query(
      `SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name as product_name,
        p.type as product_type
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [order.id]
    )

    return NextResponse.json({
      order: {
        id: order.id,
        userId: order.user_id,
        userEmail: order.user_email,
        userName: order.user_name,
        status: order.status,
        totalAmount: parseFloat(order.total_amount || '0'),
        paymentId: order.payment_id,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      },
      items: itemsResult.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productType: item.product_type,
        quantity: parseInt(item.quantity || '1', 10),
        price: parseFloat(item.price || '0')
      })),
      itemsCount: itemsResult.length,
      isPaid: order.status?.toLowerCase() === 'paid'
    })

  } catch (error) {
    console.error('[Debug Order By ID] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch order data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

