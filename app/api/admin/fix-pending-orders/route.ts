// app/api/admin/fix-pending-orders/route.ts - Manually mark pending orders as PAID
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'
import { OrderService } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if admin
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
    const { orderId, email, markAllPendingAsPaid = false } = body

    // If markAllPendingAsPaid is true, mark all pending orders for this email as PAID
    if (markAllPendingAsPaid && email) {
      // Get user
      const userResult = await DatabaseService.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      )

      if (userResult.length === 0) {
        return NextResponse.json(
          { error: `User with email ${email} not found` },
          { status: 404 }
        )
      }

      const userId = userResult[0].id

      // Get all PENDING orders for this user
      let pendingOrders
      try {
        pendingOrders = await DatabaseService.query(
          'SELECT id, status, payment_id FROM orders WHERE user_id = $1::uuid AND status = $2',
          [userId, 'PENDING']
        )
      } catch {
        pendingOrders = await DatabaseService.query(
          'SELECT id, status, payment_id FROM orders WHERE user_id::text = $1 AND status = $2',
          [userId, 'PENDING']
        )
      }

      const fixedOrders = []
      for (const order of pendingOrders) {
        try {
          await OrderService.updateOrderStatus(order.id, 'paid')
          fixedOrders.push({
            id: order.id,
            status: 'PAID',
            previousStatus: order.status
          })
          console.log(`[Fix Pending Orders] ✅ Updated order ${order.id} from PENDING to PAID`)
        } catch (error) {
          console.error(`[Fix Pending Orders] ❌ Failed to update order ${order.id}:`, error)
          fixedOrders.push({
            id: order.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Updated ${fixedOrders.filter(o => !o.error).length} orders to PAID`,
        fixedOrders
      })
    }

    // Otherwise, fix a specific order
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required, or use markAllPendingAsPaid: true with email' },
        { status: 400 }
      )
    }

    await OrderService.updateOrderStatus(orderId, 'paid', body.paymentId)
    
    const updatedOrder = await OrderService.getOrder(orderId)

    return NextResponse.json({
      success: true,
      message: 'Order updated to PAID',
      order: updatedOrder
    })

  } catch (error) {
    console.error('[Fix Pending Orders] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

