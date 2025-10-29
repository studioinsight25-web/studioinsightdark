import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status || !['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    let updateQuery = 'UPDATE orders SET status = $1, "updatedAt" = NOW()'
    const updateParams: any[] = [status]

    // If marking as paid, set paidAt timestamp
    if (status === 'PAID') {
      updateQuery = 'UPDATE orders SET status = $1, "paidAt" = NOW(), "updatedAt" = NOW()'
    }

    updateParams.push(id)

    const result = await DatabaseService.query(
      `${updateQuery} WHERE id = $2 RETURNING id, "userId", status, "totalAmount", "createdAt", "updatedAt", "paidAt"`,
      updateParams
    )

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = result[0]

    // Get user info
    const userResult = await DatabaseService.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [order.userId]
    )

    // Get order items
    const itemsResult = await DatabaseService.query(
      `SELECT 
        oi.id, oi."orderId", oi."productId", oi.quantity, oi.price,
        p.id as "product_id", p.name as "product_name", p.type as "product_type"
      FROM "orderItems" oi
      LEFT JOIN products p ON oi."productId" = p.id
      WHERE oi."orderId" = $1`,
      [order.id]
    )

    const updatedOrder = {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: parseFloat(order.totalAmount || '0'),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      user: userResult.length > 0 ? {
        id: userResult[0].id,
        email: userResult[0].email,
        name: userResult[0].name
      } : null,
      items: itemsResult.map(item => ({
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

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}