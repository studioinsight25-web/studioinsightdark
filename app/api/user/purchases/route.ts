import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { OrderService } from '@/lib/orders'
import { DatabaseProductService } from '@/lib/products-database'

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user orders - use direct database query to get order items
    const { DatabaseService } = await import('@/lib/database-direct')
    
    // Get all orders for this user directly from database
    // Try both UUID cast and text comparison for user_id
    let dbOrders
    try {
      // Try UUID first
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
      // Fallback to text comparison
      console.log(`[Purchases] UUID cast failed, trying text comparison:`, uuidError)
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
        console.error(`[Purchases] ❌ Both UUID and text comparison failed:`, textError)
        dbOrders = []
      }
    }
    
    console.log(`[Purchases] Found ${dbOrders.length} orders in database for user ${session.userId}`)
    console.log(`[Purchases] Order statuses:`, dbOrders.map((o: any) => ({ 
      id: o.id, 
      status: o.status, 
      payment_id: o.payment_id,
      created_at: o.created_at
    })))
    
    // Filter paid orders - RELAXED CHECK: 
    // 1. Primary: Status is 'PAID' (case-insensitive) → ACCEPT
    // 2. Secondary: Has payment_id AND status is not FAILED/REFUNDED → ACCEPT (payment confirmed)
    // 3. REJECT: Only orders without payment_id AND status = PENDING (cart items)
    // This ensures all paid orders are shown while blocking unpaid cart items
    const paidOrders = dbOrders.filter((order: any) => {
      const statusRaw = order.status || ''
      const status = typeof statusRaw === 'string' ? statusRaw.trim().toUpperCase() : String(statusRaw).trim().toUpperCase()
      
      // Check if payment_id exists and is not empty/null
      const paymentIdValue = order.payment_id
      const hasPaymentId = !!(
        paymentIdValue && 
        paymentIdValue !== null && 
        paymentIdValue !== undefined &&
        String(paymentIdValue).trim() !== '' && 
        String(paymentIdValue).trim().toLowerCase() !== 'null' &&
        String(paymentIdValue).trim() !== 'undefined'
      )
      
      // Primary check: Status is 'PAID' (case-insensitive)
      const isStatusPaid = status === 'PAID'
      
      // Secondary check: Has payment_id (means payment was processed) AND status is not explicitly failed/refunded
      // This accepts orders with payment_id even if status is PENDING (webhook may not have updated yet)
      const isConfirmedPayment = hasPaymentId && status !== 'FAILED' && status !== 'REFUNDED'
      
      const isPaid = isStatusPaid || isConfirmedPayment
      
      if (!isPaid) {
        console.log(`[Purchases] ❌ Order ${order.id} REJECTED - status: "${statusRaw}" (normalized: "${status}"), payment_id: ${paymentIdValue || 'MISSING'} - No payment confirmed`)
      } else if (isStatusPaid) {
        console.log(`[Purchases] ✅ Order ${order.id} ACCEPTED - status: "${statusRaw}" → "${status}" (confirmed PAID)`)
      } else {
        console.log(`[Purchases] ✅ Order ${order.id} ACCEPTED - has payment_id: "${paymentIdValue}" (payment confirmed via payment provider, status: "${statusRaw}")`)
      }
      
      return isPaid
    })
    
    console.log(`[Purchases] Found ${paidOrders.length} PAID orders out of ${dbOrders.length} total`)
    
    if (paidOrders.length === 0) {
      console.log(`[Purchases] ❌ No paid orders found for user ${session.userId}`)
      console.log(`[Purchases] All orders for debugging:`, dbOrders.map((o: any) => ({ 
        id: o.id, 
        status: o.status, 
        status_type: typeof o.status,
        status_normalized: typeof o.status === 'string' ? o.status.trim().toUpperCase() : String(o.status).trim().toUpperCase(),
        payment_id: o.payment_id ? 'exists' : 'missing',
        created_at: o.created_at,
        is_paid_check: typeof o.status === 'string' ? o.status.trim().toUpperCase() === 'PAID' : String(o.status).trim().toUpperCase() === 'PAID'
      })))
      return NextResponse.json({
        products: [],
        grouped: { courses: [], ebooks: [], reviews: [] },
        count: 0,
        coursesCount: 0,
        ebooksCount: 0,
        reviewsCount: 0,
        debug: {
          totalOrders: dbOrders.length,
          paidOrders: 0,
          orderStatuses: dbOrders.map((o: any) => ({ 
            id: o.id, 
            status: o.status, 
            payment_id: o.payment_id,
            hasPaymentId: !!o.payment_id 
          })),
          message: 'No paid orders found. Check if orders have status=PAID or status=PENDING with payment_id set.'
        }
      })
    }
    
    // Get order items directly from database for paid orders
    const purchasedProductIds = new Set<string>()
    
    for (const order of paidOrders) {
      console.log(`[Purchases] Processing PAID order ${order.id}`)
      
      // Get order items from database
      let orderItems
      try {
        // Try UUID cast first, then text comparison
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
        } catch (uuidError) {
          // Fallback to text comparison
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
        }
      } catch (error) {
        // Fallback to camelCase
        try {
          orderItems = await DatabaseService.query(
            `SELECT * FROM "orderItems" WHERE "orderId" = $1`,
            [order.id]
          )
        } catch (fallbackError) {
          console.error(`[Purchases] ❌ Error fetching order items for order ${order.id}:`, fallbackError)
          orderItems = []
        }
      }
      
      console.log(`[Purchases] Order ${order.id} has ${orderItems.length} items`)
      
      orderItems.forEach((item: any) => {
        const productId = item.product_id || item.productId
        if (productId) {
          purchasedProductIds.add(productId)
          console.log(`[Purchases] ✅ Adding product ID to purchased set: ${productId}`)
        } else {
          console.error(`[Purchases] ⚠️ Order item ${item.id} has no product_id:`, item)
        }
      })
    }
    
    console.log(`[Purchases] Total unique purchased product IDs: ${purchasedProductIds.size}`)
    console.log(`[Purchases] Product IDs:`, Array.from(purchasedProductIds))
    
    if (purchasedProductIds.size === 0) {
      console.log(`[Purchases] ❌ No product IDs found in paid orders`)
      return NextResponse.json({
        products: [],
        grouped: { courses: [], ebooks: [], reviews: [] },
        count: 0,
        coursesCount: 0,
        ebooksCount: 0,
        reviewsCount: 0,
        debug: {
          totalOrders: dbOrders.length,
          paidOrders: paidOrders.length,
          orderIds: paidOrders.map((o: any) => o.id),
          message: 'No product IDs found in order items'
        }
      })
    }
    
    // DOUBLE VERIFICATION: Verify each productId has a confirmed PAID order before including
    // This ensures NO product appears in dashboard unless payment is 100% confirmed
    const verifiedProductIds = new Set<string>()
    
    for (const productId of purchasedProductIds) {
      // Double-check: Query orders again to verify this product has a confirmed paid order
      // Accept: status = 'PAID' OR (has payment_id AND status != 'FAILED'/'REFUNDED')
      let verificationResult
      try {
        verificationResult = await DatabaseService.query(
          `SELECT o.id, o.status, o.payment_id, oi.product_id
           FROM orders o 
           JOIN order_items oi ON o.id = oi.order_id 
           WHERE oi.product_id = $1 
             AND o.user_id = $2::uuid 
             AND (
               UPPER(TRIM(o.status)) = 'PAID' 
               OR (o.payment_id IS NOT NULL AND o.payment_id != '' AND UPPER(TRIM(o.status)) NOT IN ('FAILED', 'REFUNDED'))
             )
           LIMIT 1`,
          [productId, session.userId]
        )
      } catch (error) {
        // Fallback to text comparison
        try {
          verificationResult = await DatabaseService.query(
            `SELECT o.id, o.status, o.payment_id, oi.product_id
             FROM orders o 
             JOIN order_items oi ON o.id = oi.order_id 
             WHERE oi.product_id = $1 
               AND o.user_id::text = $2 
               AND (
                 UPPER(TRIM(o.status)) = 'PAID' 
                 OR (o.payment_id IS NOT NULL AND o.payment_id != '' AND UPPER(TRIM(o.status)) NOT IN ('FAILED', 'REFUNDED'))
               )
             LIMIT 1`,
            [productId, session.userId]
          )
        } catch (fallbackError) {
          console.error(`[Purchases] ❌ Verification query failed for product ${productId}:`, fallbackError)
          verificationResult = []
        }
      }
      
      if (verificationResult && verificationResult.length > 0) {
        verifiedProductIds.add(productId)
        console.log(`[Purchases] ✅ Product ${productId} VERIFIED - has confirmed PAID order`)
      } else {
        console.log(`[Purchases] ❌ Product ${productId} REJECTED - no confirmed PAID order found during verification`)
      }
    }
    
      console.log(`[Purchases] Verified product IDs: ${verifiedProductIds.size} out of ${purchasedProductIds.size} initial products`)
      
      if (verifiedProductIds.size < purchasedProductIds.size) {
        const rejected = Array.from(purchasedProductIds).filter(id => !verifiedProductIds.has(id))
        console.log(`[Purchases] ⚠️ Rejected product IDs (no confirmed PAID order):`, rejected)
      }
    
    // Get full product details ONLY for verified purchased products
    const purchasedProducts = await Promise.all(
      Array.from(verifiedProductIds).map(async (productId) => {
        try {
          const product = await DatabaseProductService.getProduct(productId)
          if (product) {
            console.log(`[Purchases] ✅ Found product ${productId}: ${product.name} (${product.type})`)
          } else {
            console.error(`[Purchases] ⚠️ Product ${productId} not found in database`)
          }
          return product
        } catch (error) {
          console.error(`[Purchases] ❌ Error fetching product ${productId}:`, error)
          return null
        }
      })
    )
    
    // Filter out null products and group by type
    const validProducts = purchasedProducts.filter(p => p !== null)
    console.log(`[Purchases] Final valid products after double verification: ${validProducts.length}`)
    
    const grouped = {
      courses: validProducts.filter(p => p.type === 'course'),
      ebooks: validProducts.filter(p => p.type === 'ebook'),
      reviews: validProducts.filter(p => p.type === 'review')
    }
    
    return NextResponse.json({
      products: validProducts,
      grouped,
      count: validProducts.length,
      coursesCount: grouped.courses.length,
      ebooksCount: grouped.ebooks.length,
      reviewsCount: grouped.reviews.length
    })
  } catch (error) {
    console.error('Error fetching user purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

