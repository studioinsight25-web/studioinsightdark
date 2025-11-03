// Debug endpoint to check user orders and their status
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get all orders for this user
    let dbOrders
    try {
      dbOrders = await DatabaseService.query(
        `SELECT 
          o.id,
          o.user_id,
          o.status,
          o.total_amount,
          o.payment_id,
          o.created_at,
          o.updated_at
        FROM orders o
        WHERE o.user_id = $1::uuid
        ORDER BY o.created_at DESC`,
        [session.userId]
      )
    } catch (uuidError) {
      try {
        dbOrders = await DatabaseService.query(
          `SELECT 
            o.id,
            o.user_id,
            o.status,
            o.total_amount,
            o.payment_id,
            o.created_at,
            o.updated_at
          FROM orders o
          WHERE o.user_id::text = $1
          ORDER BY o.created_at DESC`,
          [session.userId]
        )
      } catch (textError) {
        return NextResponse.json({ error: 'Database query failed', details: String(textError) }, { status: 500 })
      }
    }

    // Get order items for each order
    const ordersWithDetails = await Promise.all(dbOrders.map(async (order: any) => {
      let orderItems
      try {
        orderItems = await DatabaseService.query(
          `SELECT 
            oi.id,
            oi.order_id,
            oi.product_id,
            oi.product_name,
            oi.quantity,
            oi.price
          FROM order_items oi
          WHERE oi.order_id = $1::uuid`,
          [order.id]
        )
      } catch (error) {
        try {
          orderItems = await DatabaseService.query(
            `SELECT 
              oi.id,
              oi.order_id,
              oi.product_id,
              oi.product_name,
              oi.quantity,
              oi.price
            FROM order_items oi
            WHERE oi.order_id::text = $1`,
            [order.id]
          )
        } catch (fallbackError) {
          orderItems = []
        }
      }

      const statusRaw = order.status || ''
      const status = typeof statusRaw === 'string' ? statusRaw.trim().toUpperCase() : String(statusRaw).trim().toUpperCase()
      const hasPaymentId = order.payment_id && String(order.payment_id).trim() !== ''
      
      const isStatusPaid = status === 'PAID'
      const isConfirmedPayment = status !== 'PENDING' && status !== 'FAILED' && status !== 'REFUNDED' && hasPaymentId
      const wouldBeAccepted = isStatusPaid || isConfirmedPayment

      return {
        orderId: order.id,
        status: order.status,
        statusRaw: statusRaw,
        statusNormalized: status,
        paymentId: order.payment_id || null,
        hasPaymentId,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        isStatusPaid,
        isConfirmedPayment,
        wouldBeAccepted,
        items: orderItems.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price
        }))
      }
    }))

    return NextResponse.json({
      userId: session.userId,
      totalOrders: ordersWithDetails.length,
      orders: ordersWithDetails,
      summary: {
        total: ordersWithDetails.length,
        wouldBeAccepted: ordersWithDetails.filter(o => o.wouldBeAccepted).length,
        withStatusPaid: ordersWithDetails.filter(o => o.isStatusPaid).length,
        withConfirmedPayment: ordersWithDetails.filter(o => o.isConfirmedPayment).length,
        pending: ordersWithDetails.filter(o => o.statusNormalized === 'PENDING').length
      }
    })
  } catch (error) {
    console.error('Debug purchases error:', error)
    return NextResponse.json(
      { error: 'Failed to debug purchases', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

