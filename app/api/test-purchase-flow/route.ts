// app/api/test-purchase-flow/route.ts - Complete diagnostic endpoint for purchase flow
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

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      userId: session.userId,
      email: session.email,
      checks: {}
    }

    // Check 1: User exists in database
    try {
      let userResult
      try {
        userResult = await DatabaseService.query(
          'SELECT id, email, name FROM users WHERE id = $1::uuid',
          [session.userId]
        )
      } catch {
        userResult = await DatabaseService.query(
          'SELECT id, email, name FROM users WHERE id::text = $1',
          [session.userId]
        )
      }
      
      diagnostics.checks.user = {
        exists: userResult.length > 0,
        user: userResult.length > 0 ? userResult[0] : null
      }
    } catch (error) {
      diagnostics.checks.user = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check 2: Orders for this user
    try {
      let ordersResult
      try {
        ordersResult = await DatabaseService.query(
          'SELECT id, user_id, status, total_amount, payment_id, created_at FROM orders WHERE user_id = $1::uuid ORDER BY created_at DESC',
          [session.userId]
        )
      } catch {
        ordersResult = await DatabaseService.query(
          'SELECT id, user_id, status, total_amount, payment_id, created_at FROM orders WHERE user_id::text = $1 ORDER BY created_at DESC',
          [session.userId]
        )
      }
      
      diagnostics.checks.orders = {
        count: ordersResult.length,
        orders: ordersResult.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          status: o.status,
          paymentId: o.payment_id,
          createdAt: o.created_at
        }))
      }

      // Check order items for each order
      for (const order of ordersResult) {
        let itemsResult
        try {
          try {
            itemsResult = await DatabaseService.query(
              'SELECT id, order_id, product_id, product_name, quantity, price FROM order_items WHERE order_id = $1::uuid',
              [order.id]
            )
          } catch {
            itemsResult = await DatabaseService.query(
              'SELECT id, order_id, product_id, product_name, quantity, price FROM order_items WHERE order_id::text = $1',
              [order.id]
            )
          }
          
          const orderWithItems: any = order
          orderWithItems.items = itemsResult
          orderWithItems.itemsCount = itemsResult.length
          
          // Log order item details
          orderWithItems.itemsDetail = itemsResult.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity
          }))
          
          // If order has items but no paymentId and is PENDING
          if (orderWithItems.status === 'PENDING' && !orderWithItems.paymentId && itemsResult.length > 0) {
            orderWithItems.needsManualFix = true
            orderWithItems.note = 'This order has items but no paymentId. If payment was successful, manually update to PAID.'
          }
          
          // If order has paymentId but is still PENDING, it should show in dashboard
          if (orderWithItems.status === 'PENDING' && orderWithItems.paymentId && itemsResult.length > 0) {
            orderWithItems.shouldShowInDashboard = true
            orderWithItems.note = 'This order has paymentId and items - should appear in dashboard even though status is PENDING'
          }
        } catch (error) {
          (order as any).itemsError = error instanceof Error ? error.message : 'Unknown error'
        }
      }
    } catch (error) {
      diagnostics.checks.orders = {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check 3: Paid orders specifically
    // Include orders with status PAID, or PENDING orders that have a payment_id
    const paidOrders = diagnostics.checks.orders?.orders?.filter((o: any) => {
      const status = typeof o.status === 'string' ? o.status.toLowerCase() : String(o.status).toLowerCase()
      const isPaid = status === 'paid'
      const hasPaymentId = o.paymentId && o.paymentId !== null
      const mightBePaid = hasPaymentId && status === 'pending'
      return isPaid || mightBePaid
    }) || []
    
    diagnostics.checks.paidOrders = {
      count: paidOrders.length,
      orders: paidOrders
    }

    // Check 4: Product IDs from paid orders
    const purchasedProductIds = new Set<string>()
    paidOrders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.product_id
          if (productId) {
            purchasedProductIds.add(productId)
          }
        })
      }
    })

    diagnostics.checks.products = {
      purchasedProductIds: Array.from(purchasedProductIds),
      count: purchasedProductIds.size
    }

    // Check 5: Verify products exist
    if (purchasedProductIds.size > 0) {
      const productChecks = await Promise.all(
        Array.from(purchasedProductIds).map(async (productId) => {
          try {
            const productResult = await DatabaseService.query(
              'SELECT id, name, type, price FROM products WHERE id = $1',
              [productId]
            )
            return {
              productId,
              exists: productResult.length > 0,
              product: productResult.length > 0 ? productResult[0] : null
            }
          } catch (error) {
            return {
              productId,
              exists: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )
      
      diagnostics.checks.productDetails = productChecks
    }

    // Check 6: Test /api/user/purchases endpoint logic
    diagnostics.checks.purchasesEndpoint = {
      wouldReturnProducts: purchasedProductIds.size > 0,
      productIds: Array.from(purchasedProductIds),
      note: 'This is what /api/user/purchases should return'
    }

    return NextResponse.json(diagnostics)

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

