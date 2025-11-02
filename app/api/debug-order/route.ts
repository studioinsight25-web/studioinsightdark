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
    const orderId = searchParams.get('orderId')

    // If orderId is provided, check that specific order
    if (orderId) {
      console.log(`[Debug Order] Checking specific order: ${orderId}`)
      
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
        return NextResponse.json({
          error: 'Failed to fetch order',
          details: error instanceof Error ? error.message : 'Unknown error',
          orderId
        }, { status: 500 })
      }

      if (orderResult.length === 0) {
        return NextResponse.json({
          error: 'Order not found in database',
          orderId,
          note: 'This order exists in Mollie but not in our database. The order was likely never created or was deleted.'
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
        isPaid: order.status?.toLowerCase() === 'paid',
        needsFixing: order.status?.toLowerCase() !== 'paid' || order.user_id !== session.userId
      })
    }

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

    console.log(`[Debug Order] Found ${ordersResult.length} orders for user ${user.id}`)

      // Also check if there are orders without user_id (orphaned) or with different user
      // Check for recent orders that might belong to this user
      const allRecentOrders = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at,
          u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.created_at > NOW() - INTERVAL '30 days'
        ORDER BY o.created_at DESC
        LIMIT 50`
      )

      console.log(`[Debug Order] Found ${allRecentOrders.length} recent orders total`)
      
      // Also check for orders with NULL user_id (orphaned orders)
      const orphanedOrders = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at
        FROM orders o
        WHERE o.user_id IS NULL
        ORDER BY o.created_at DESC
        LIMIT 20`
      )
      
      console.log(`[Debug Order] Found ${orphanedOrders.length} orphaned orders (no user_id)`)
      
      // Also check for orders with payment_id but no user_id match
      const ordersWithPayment = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at,
          u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.payment_id IS NOT NULL
        AND o.created_at > NOW() - INTERVAL '7 days'
        ORDER BY o.created_at DESC
        LIMIT 20`
      )
      
      console.log(`[Debug Order] Found ${ordersWithPayment.length} orders with payment_id in last 7 days`)

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
        ).length,
        recentOrdersInSystem: allRecentOrders.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          userEmail: o.user_email,
          status: o.status,
          paymentId: o.payment_id,
          createdAt: o.created_at
        })),
        orphanedOrders: orphanedOrders.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          status: o.status,
          paymentId: o.payment_id,
          createdAt: o.created_at,
          note: 'This order has no user_id - might belong to this user if payment_id matches Mollie payment'
        })),
        recentOrdersWithPayment: ordersWithPayment.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          userEmail: o.user_email,
          status: o.status,
          paymentId: o.payment_id,
          createdAt: o.created_at,
          mightBeThisUser: o.user_email === user.email || o.user_id === user.id
        }))
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

