// app/api/debug-order/route.ts - Debug endpoint to check order status
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
    const email = searchParams.get('email') || session.email

    console.log(`[Debug Order] Checking orders for email: ${email}`)

    // Get user by email
    const userResult = await DatabaseService.query(
      'SELECT id, email, name FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    )

    if (userResult.length === 0) {
      return NextResponse.json({
        error: 'User not found',
        email
      })
    }

    const user = userResult[0]
    console.log(`[Debug Order] Found user: ${user.id}, ${user.email}`)

    // Get all orders for this user
    // Try to get paid_at column, but handle if it doesn't exist
    let ordersResult
    try {
      // Try with paid_at (snake_case)
      ordersResult = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at,
          o.updated_at,
          o.paid_at
        FROM orders o
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10`,
        [user.id]
      )
    } catch (error) {
      // If paid_at doesn't exist, try without it
      console.log('[Debug Order] paid_at column not found, trying without it')
      ordersResult = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at,
          o.updated_at
        FROM orders o
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10`,
        [user.id]
      )
    }

    console.log(`[Debug Order] Found ${ordersResult.length} orders`)

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order: any) => {
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

        return {
          ...order,
          items: itemsResult,
          itemsCount: itemsResult.length
        }
      })
    )

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      orders: ordersWithItems,
      totalOrders: ordersWithItems.length,
      paidOrders: ordersWithItems.filter((o: any) => 
        o.status?.toLowerCase() === 'paid' || o.status === 'PAID'
      ).length
    })

  } catch (error) {
    console.error('[Debug Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch order data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

