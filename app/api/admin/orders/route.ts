import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET(request: NextRequest) {
  try {
    const orders = await DatabaseService.query(
      `SELECT 
        o.id, o."userId", o.status, o."totalAmount", o."createdAt", o."updatedAt", o."paidAt",
        u.id as "user_id", u.email as "user_email", u.name as "user_name"
      FROM orders o
      LEFT JOIN users u ON o."userId" = u.id
      ORDER BY o."createdAt" DESC`
    )

    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await DatabaseService.query(
        `SELECT 
          oi.id, oi."orderId", oi."productId", oi.quantity, oi.price,
          p.id as "product_id", p.name as "product_name", p.type as "product_type"
        FROM "orderItems" oi
        LEFT JOIN products p ON oi."productId" = p.id
        WHERE oi."orderId" = $1`,
        [order.id]
      )

      return {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: parseFloat(order.totalAmount || '0'),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        user: {
          id: order.user_id,
          email: order.user_email,
          name: order.user_name
        },
        items: items.map(item => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: parseInt(item.quantity || '0', 10),
          price: parseFloat(item.price || '0'),
          product: {
            id: item.product_id,
            name: item.product_name,
            type: item.product_type
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