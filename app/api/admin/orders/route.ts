import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET(request: NextRequest) {
  try {
    // Use snake_case column names to match database schema (orders table uses snake_case)
    const orders = await DatabaseService.query(
      `SELECT 
        o.id, o.user_id, o.status, o.total_amount, o.payment_id, o.created_at, o.updated_at,
        u.id as "user_id_result", u.email as "user_email", u.name as "user_name"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC`
    )

    console.log(`[Admin Orders] Found ${orders.length} orders in database`)

    // Get order items for each order using snake_case
    const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
      let items
      try {
        // Try snake_case first (order_items table)
        items = await DatabaseService.query(
          `SELECT 
            oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
            p.id as "product_id_result", p.name as "product_name", p.type as "product_type"
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1`,
          [order.id]
        )
      } catch (snakeError) {
        // Fallback to camelCase
        console.warn(`[Admin Orders] Snake_case query failed for order ${order.id}, trying camelCase:`, snakeError)
        items = await DatabaseService.query(
          `SELECT 
            oi.id, oi."orderId", oi."productId", oi.quantity, oi.price,
            p.id as "product_id", p.name as "product_name", p.type as "product_type"
          FROM "orderItems" oi
          LEFT JOIN products p ON oi."productId" = p.id
          WHERE oi."orderId" = $1`,
          [order.id]
        )
      }

      return {
        id: order.id,
        userId: order.user_id,
        status: order.status,
        totalAmount: parseFloat(order.total_amount || '0'),
        paymentId: order.payment_id || null,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        user: {
          id: order.user_id_result || order.user_id,
          email: order.user_email || '',
          name: order.user_name || ''
        },
        items: items.map((item: any) => ({
          id: item.id,
          orderId: item.order_id || item.orderId,
          productId: item.product_id || item.productId,
          quantity: parseInt(item.quantity || '0', 10),
          price: parseFloat(item.price || '0'),
          product: {
            id: item.product_id_result || item.product_id,
            name: item.product_name || 'Onbekend product',
            type: item.product_type || 'unknown'
          }
        }))
      }
    }))

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}