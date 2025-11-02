// app/api/admin/fix-missing-order/route.ts - Helper endpoint to fix missing orders for a user
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'
import { OrderService } from '@/lib/orders'
import { DatabaseProductService } from '@/lib/products-database'
import { MollieService } from '@/lib/mollie'
import { createMollieClient } from '@mollie/api-client'

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
    const { email, paymentId, productIds } = body

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    // Get user by email
    const userResultByEmail = await DatabaseService.query(
      'SELECT id, email, name FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    )

    if (userResultByEmail.length === 0) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      )
    }

    const user = userResultByEmail[0]
    console.log(`[Fix Missing Order] Found user: ${user.id} (${user.email})`)

    // Try to get payment info from Mollie if paymentId is provided
    let paymentMetadata: any = null
    let mollieOrderId: string | null = null
    
    if (paymentId) {
      try {
        const { createMollieClient } = await import('@mollie/api-client')
        const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! })
        const payment = await mollieClient.payments.get(paymentId)
        
        paymentMetadata = payment.metadata || null
        mollieOrderId = paymentMetadata?.orderId || null
        
        console.log(`[Fix Missing Order] Mollie payment found:`, {
          paymentId,
          status: payment.status,
          amount: payment.amount,
          metadata: paymentMetadata
        })

        // Check if payment is actually paid
        if (payment.status !== 'paid') {
          return NextResponse.json(
            { 
              error: `Payment ${paymentId} is not paid (status: ${payment.status})`,
              paymentStatus: payment.status
            },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('[Fix Missing Order] Could not fetch Mollie payment:', error)
        return NextResponse.json(
          { 
            error: `Could not fetch Mollie payment ${paymentId}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 400 }
        )
      }
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
      console.log(`[Fix Missing Order] Found ${products.length} products from provided IDs:`, productIds)
    } else if (paymentMetadata?.products && Array.isArray(paymentMetadata.products)) {
      // Try to get from Mollie payment metadata
      const productIdsFromMollie = paymentMetadata.products
      console.log(`[Fix Missing Order] Found products in Mollie metadata:`, productIdsFromMollie)
      products = await Promise.all(
        productIdsFromMollie.map(async (productId: string) => {
          try {
            const product = await DatabaseProductService.getProduct(productId)
            if (!product) {
              console.error(`[Fix Missing Order] Product ${productId} from Mollie metadata not found`)
              return null
            }
            return product
          } catch (error) {
            console.error(`[Fix Missing Order] Product ${productId} not found:`, error)
            return null
          }
        })
      )
      products = products.filter(p => p !== null)
      console.log(`[Fix Missing Order] Found ${products.length} valid products from Mollie metadata`)
    } else {
      // If no products specified and no metadata, return error
      return NextResponse.json(
        { 
          error: 'No products found. Please provide productIds in the request body or ensure Mollie payment has metadata.products',
          suggestion: 'You can get product IDs from: /api/admin/list-products?type=ebook'
        },
        { status: 400 }
      )
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No valid products found. Check product IDs or Mollie payment metadata.' },
        { status: 400 }
      )
    }

    // Check if order already exists
    let existingOrder = null
    if (mollieOrderId) {
      try {
        existingOrder = await OrderService.getOrder(mollieOrderId)
        if (existingOrder) {
          console.log(`[Fix Missing Order] Order ${mollieOrderId} already exists`)
          // Update order if needed
          if (existingOrder.userId !== user.id) {
            await DatabaseService.query(
              'UPDATE orders SET user_id = $1 WHERE id = $2',
              [user.id, mollieOrderId]
            )
            console.log(`[Fix Missing Order] Updated user_id for order ${mollieOrderId}`)
          }
          if (existingOrder.status.toLowerCase() !== 'paid') {
            await OrderService.updateOrderStatus(mollieOrderId, 'paid', paymentId || undefined)
            console.log(`[Fix Missing Order] Updated status to PAID for order ${mollieOrderId}`)
          }
          
          const fullOrder = await OrderService.getOrder(mollieOrderId)
          return NextResponse.json({
            success: true,
            message: 'Order already exists, updated if needed',
            order: fullOrder
          })
        }
      } catch (error) {
        console.log(`[Fix Missing Order] Order ${mollieOrderId} does not exist, will create new one`)
      }
    }

    // Create new order
    const order = await OrderService.createOrder(user.id, products)

    // Update order status to PAID
    if (paymentId) {
      await OrderService.updateOrderStatus(order.id, 'paid', paymentId)
      console.log(`[Fix Missing Order] Order ${order.id} created and marked as PAID`)
    } else {
      // If no payment ID, still mark as paid (manual fix)
      await OrderService.updateOrderStatus(order.id, 'paid')
      console.log(`[Fix Missing Order] Order ${order.id} created and marked as PAID (no payment ID)`)
    }

    // Get full order details
    const fullOrder = await OrderService.getOrder(order.id)

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: fullOrder,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        price: p.price
      }))
    })

  } catch (error) {
    console.error('[Fix Missing Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix missing order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

