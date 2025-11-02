// app/api/admin/recreate-order/route.ts - Recreate order from Mollie payment ID
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'
import { OrderService } from '@/lib/orders'
import { MollieService } from '@/lib/mollie'
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
    const { orderId, userId, productIds } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }

    // Try to get payment info from Mollie if paymentId is provided
    let molliePayment = null
    if (body.paymentId) {
      try {
        const paymentStatus = await MollieService.getPaymentStatus(body.paymentId)
        if (paymentStatus.success && paymentStatus.paid) {
          molliePayment = paymentStatus
        }
      } catch (error) {
        console.log('[Recreate Order] Could not fetch Mollie payment:', error)
      }
    }

    // Get user ID - use provided userId or find from email
    let targetUserId = userId
    if (!targetUserId && body.email) {
      const userResult = await DatabaseService.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [body.email]
      )
      if (userResult.length > 0) {
        targetUserId = userResult[0].id
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      )
    }

    // Check if order already exists
    const existingOrder = await DatabaseService.query(
      'SELECT id, status, user_id FROM orders WHERE id = $1',
      [orderId]
    )

    if (existingOrder.length > 0) {
      const existing = existingOrder[0]
      // Update order if needed
      if (existing.user_id !== targetUserId) {
        await DatabaseService.query(
          'UPDATE orders SET user_id = $1 WHERE id = $2',
          [targetUserId, orderId]
        )
        console.log(`[Recreate Order] Updated user_id for order ${orderId}`)
      }
      if (existing.status?.toLowerCase() !== 'paid') {
        await OrderService.updateOrderStatus(orderId, 'paid', body.paymentId)
        console.log(`[Recreate Order] Updated status to PAID for order ${orderId}`)
      }
      
      const fullOrder = await OrderService.getOrder(orderId)
      return NextResponse.json({
        success: true,
        message: 'Order already exists, updated if needed',
        order: fullOrder
      })
    }

    // Get products - use provided productIds or try to get from Mollie metadata
    let products = []
    
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      // Get products by IDs
      products = await Promise.all(
        productIds.map(async (productId: string) => {
          const product = await DatabaseProductService.getProduct(productId)
          if (!product) {
            throw new Error(`Product ${productId} not found`)
          }
          return product
        })
      )
    } else if (paymentMetadata?.products && Array.isArray(paymentMetadata.products)) {
      // Try to get from Mollie payment metadata
      const productIdsFromMollie = paymentMetadata.products
      console.log('[Recreate Order] Found products in Mollie metadata:', productIdsFromMollie)
      products = await Promise.all(
        productIdsFromMollie.map(async (productId: string) => {
          try {
            const product = await DatabaseProductService.getProduct(productId)
            return product
          } catch (error) {
            console.error(`[Recreate Order] Product ${productId} not found:`, error)
            return null
          }
        })
      )
      products = products.filter(p => p !== null)
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found. Please provide productIds or ensure Mollie payment has metadata.products' },
        { status: 400 }
      )
    }

    // Calculate total from products
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0)

    // Create order manually with specific order ID
    // Use the provided orderId (UUID format from Mollie)
    try {
      // Try to insert with the specific order ID
      await DatabaseService.query(
        `INSERT INTO orders (id, user_id, status, total_amount, payment_id, created_at, updated_at) 
         VALUES ($1::uuid, $2, $3, $4, $5, NOW(), NOW())`,
        [orderId, targetUserId, 'PAID', totalAmount, body.paymentId || null]
      )
      console.log(`[Recreate Order] Created order ${orderId} with user ${targetUserId}`)
    } catch (error) {
      // If order ID already exists or UUID format error, try without casting
      try {
        await DatabaseService.query(
          `INSERT INTO orders (id, user_id, status, total_amount, payment_id, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [orderId, targetUserId, 'PAID', totalAmount, body.paymentId || null]
        )
        console.log(`[Recreate Order] Created order ${orderId} (without UUID cast)`)
      } catch (secondError) {
        console.error('[Recreate Order] Failed to insert order:', secondError)
        throw new Error(`Failed to create order: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`)
      }
    }
    
    // Create order items
    for (const product of products) {
      const itemId = `order-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      try {
        await DatabaseService.query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [itemId, orderId, product.id, 1, product.price]
        )
        console.log(`[Recreate Order] Added item ${product.id} to order ${orderId}`)
      } catch (error) {
        console.error(`[Recreate Order] Failed to insert order item for product ${product.id}:`, error)
        // Continue with other products even if one fails
      }
    }

    // Get full order details
    const fullOrder = await OrderService.getOrder(orderId)

    if (!fullOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order created but could not retrieve details',
        orderId
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Order recreated successfully with original ID',
      order: fullOrder
    })

  } catch (error) {
    console.error('[Recreate Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to recreate order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

