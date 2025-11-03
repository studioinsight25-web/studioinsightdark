import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { OrderService } from '@/lib/orders'
import { DatabaseProductService } from '@/lib/products-database'
import { MollieService } from '@/lib/mollie'

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
    
    // Filter paid orders - SMART CHECK with Mollie verification: 
    // 1. Primary: Status is 'PAID' (case-insensitive) → ACCEPT
    // 2. Secondary: Has payment_id AND status is NOT PENDING (not FAILED/REFUNDED) → ACCEPT
    // 3. Tertiary: Has payment_id AND status is PENDING → Check Mollie, if paid → ACCEPT and update status
    // 4. REJECT: No payment_id AND status is PENDING (cart items)
    // This ensures all paid orders are shown while blocking unpaid cart items
    const paidOrders: any[] = []
    
    for (const order of dbOrders) {
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
      
      // Secondary check: Has payment_id AND status is NOT PENDING (means payment was processed and confirmed)
      const isConfirmedPayment = hasPaymentId && status !== 'PENDING' && status !== 'FAILED' && status !== 'REFUNDED'
      
      let isPaid = isStatusPaid || isConfirmedPayment
      
      // Tertiary check: If PENDING with payment_id, verify with Mollie
      if (!isPaid && status === 'PENDING' && hasPaymentId) {
        console.log(`[Purchases] 🔍 Order ${order.id} has payment_id but status is PENDING - checking Mollie status...`)
        try {
          const mollieStatus = await MollieService.getPaymentStatus(String(paymentIdValue))
          if (mollieStatus.success && mollieStatus.paid) {
            console.log(`[Purchases] ✅ Mollie confirms payment is PAID for order ${order.id} - updating status and accepting order`)
            // Update order status to PAID in background (don't await to avoid blocking)
            OrderService.updateOrderStatus(order.id, 'paid', String(paymentIdValue)).catch(err => {
              console.error(`[Purchases] ⚠️ Failed to update order ${order.id} status to PAID:`, err)
            })
            isPaid = true
          } else {
            console.log(`[Purchases] ❌ Mollie confirms payment is NOT paid for order ${order.id} (status: ${mollieStatus.status || 'unknown'})`)
          }
        } catch (mollieError) {
          console.error(`[Purchases] ⚠️ Error checking Mollie status for order ${order.id}:`, mollieError)
          // If we can't check Mollie, reject to be safe
        }
      }
      
      if (!isPaid) {
        if (status === 'PENDING') {
          console.log(`[Purchases] ❌ Order ${order.id} REJECTED - status: "${statusRaw}" (PENDING - payment not confirmed), payment_id: ${paymentIdValue || 'MISSING'}`)
        } else {
          console.log(`[Purchases] ❌ Order ${order.id} REJECTED - status: "${statusRaw}" (normalized: "${status}"), payment_id: ${paymentIdValue || 'MISSING'} - No payment confirmed`)
        }
      } else if (isStatusPaid) {
        console.log(`[Purchases] ✅ Order ${order.id} ACCEPTED - status: "${statusRaw}" → "${status}" (confirmed PAID)`)
        paidOrders.push(order)
      } else if (status === 'PENDING' && hasPaymentId) {
        console.log(`[Purchases] ✅ Order ${order.id} ACCEPTED - Mollie verified as PAID (will update status to PAID)`)
        paidOrders.push(order)
      } else {
        console.log(`[Purchases] ✅ Order ${order.id} ACCEPTED - has payment_id: "${paymentIdValue}", status: "${statusRaw}" (payment confirmed)`)
        paidOrders.push(order)
      }
    }
    
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
    
    // Get order items from ALL orders (not just paid) - we'll verify each product separately
    // This allows ebook in PAID order to show while course in PENDING order doesn't
    const allProductIds = new Map<string, { orderId: string, orderStatus: string, paymentId: string | null }>()
    
    // Loop through ALL orders to collect all products, then verify each product individually
    for (const order of dbOrders) {
      console.log(`[Purchases] Processing order ${order.id} (status: ${order.status}, payment_id: ${order.payment_id || 'none'})`)
      
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
          // Store product with its order info - we'll verify each product separately later
          // If product appears in multiple orders, we'll check all of them during verification
          if (!allProductIds.has(productId)) {
            allProductIds.set(productId, { 
              orderId: order.id, 
              orderStatus: order.status,
              paymentId: order.payment_id 
            })
            console.log(`[Purchases] 📦 Found product ${productId} in order ${order.id} (status: ${order.status})`)
          } else {
            // Product already found in another order - we'll check all orders during verification
            console.log(`[Purchases] 📦 Product ${productId} also exists in other order(s) - will check all orders during verification`)
          }
        } else {
          console.error(`[Purchases] ⚠️ Order item ${item.id} has no product_id:`, item)
        }
      })
    }
    
    console.log(`[Purchases] Total unique product IDs found: ${allProductIds.size}`)
    console.log(`[Purchases] Product IDs:`, Array.from(allProductIds.keys()))
    
    if (allProductIds.size === 0) {
      console.log(`[Purchases] ❌ No product IDs found in any orders`)
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
          orderIds: [],
          message: 'No product IDs found in order items'
        }
      })
    }
    
    // PER-PRODUCT VERIFICATION: Verify each productId individually
    // This allows ebook in PAID order to show while course in PENDING order doesn't
    // Check per product, including Mollie verification for PENDING orders
    const verifiedProductIds = new Set<string>()
    
    for (const [productId, orderInfo] of allProductIds.entries()) {
      // Get product type for better logging
      let productInfo: any = null
      try {
        const productResult = await DatabaseProductService.getProduct(productId)
        productInfo = productResult
      } catch (err) {
        // Ignore, just for logging
      }
      const productType = productInfo?.type || 'unknown'
      
      // Query ALL orders for this specific product (not just the first one found)
      // This allows us to check if product is in ANY paid order, even if also in pending orders
      let verificationResult
      try {
        verificationResult = await DatabaseService.query(
          `SELECT o.id, o.status, o.payment_id, oi.product_id, o.created_at
           FROM orders o 
           JOIN order_items oi ON o.id = oi.order_id 
           WHERE oi.product_id = $1 
             AND o.user_id = $2::uuid 
           ORDER BY o.created_at DESC`,
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
             ORDER BY o.created_at DESC`,
            [productId, session.userId]
          )
        } catch (fallbackError) {
          console.error(`[Purchases] ❌ Verification query failed for product ${productId} (${productType}):`, fallbackError)
          verificationResult = []
        }
      }
      
      console.log(`[Purchases] 🔍 Verifying product ${productId} (${productType}) - found ${verificationResult?.length || 0} orders`)
      
      // Check all orders for this product
      let isVerified = false
      for (const orderRow of verificationResult || []) {
        const orderStatus = orderRow.status || ''
        const status = typeof orderStatus === 'string' ? orderStatus.trim().toUpperCase() : String(orderStatus).trim().toUpperCase()
        const paymentId = orderRow.payment_id
        
        const hasPaymentId = !!(paymentId && String(paymentId).trim() !== '' && String(paymentId).trim().toLowerCase() !== 'null')
        const isStatusPaid = status === 'PAID'
        const isConfirmedPayment = hasPaymentId && status !== 'PENDING' && status !== 'FAILED' && status !== 'REFUNDED'
        
        console.log(`[Purchases]   Order ${orderRow.id}: status="${orderStatus}" (${status}), payment_id=${paymentId ? 'exists' : 'missing'}`)
        
        if (isStatusPaid || isConfirmedPayment) {
          console.log(`[Purchases] ✅ Product ${productId} (${productType}) VERIFIED via order ${orderRow.id} - status: ${status}`)
          isVerified = true
          break
        }
        
        // If PENDING with payment_id, check Mollie
        if (status === 'PENDING' && hasPaymentId) {
          console.log(`[Purchases] 🔍 Product ${productId} (${productType}) has PENDING order ${orderRow.id} with payment_id - checking Mollie...`)
          try {
            const mollieStatus = await MollieService.getPaymentStatus(String(paymentId))
            if (mollieStatus.success && mollieStatus.paid) {
              console.log(`[Purchases] ✅ Product ${productId} (${productType}) VERIFIED via Mollie - payment is PAID, updating order status`)
              // Update order status in background
              OrderService.updateOrderStatus(orderRow.id, 'paid', String(paymentId)).catch(err => {
                console.error(`[Purchases] ⚠️ Failed to update order ${orderRow.id} status:`, err)
              })
              isVerified = true
              break
            } else {
              console.log(`[Purchases] ❌ Product ${productId} (${productType}) NOT verified - Mollie status: ${mollieStatus.status || 'unknown'}`)
            }
          } catch (mollieError) {
            console.error(`[Purchases] ⚠️ Error checking Mollie for product ${productId} (${productType}):`, mollieError)
          }
        }
      }
      
      if (isVerified) {
        verifiedProductIds.add(productId)
        console.log(`[Purchases] ✅ Product ${productId} (${productType}) ADDED to verified list`)
      } else {
        console.log(`[Purchases] ❌ Product ${productId} (${productType}) NOT VERIFIED - no confirmed paid order found`)
      }
    }
    
      console.log(`[Purchases] Verified product IDs: ${verifiedProductIds.size} out of ${allProductIds.size} initial products`)
      
      if (verifiedProductIds.size < allProductIds.size) {
        const rejected = Array.from(allProductIds.keys()).filter(id => !verifiedProductIds.has(id))
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

