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
    
    // Filter only paid orders (check both uppercase and lowercase)
    const paidOrders = dbOrders.filter((order: any) => {
      const status = typeof order.status === 'string' ? order.status.toLowerCase() : String(order.status).toLowerCase()
      const isPaid = status === 'paid'
      if (!isPaid) {
        console.log(`[Purchases] ⚠️ Order ${order.id} has status: ${order.status} (${status}) - NOT PAID`)
      }
      return isPaid
    })
    
    console.log(`[Purchases] Found ${paidOrders.length} PAID orders out of ${dbOrders.length} total`)
    
    if (paidOrders.length === 0) {
      console.log(`[Purchases] ❌ No paid orders found for user ${session.userId}`)
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
          orderStatuses: dbOrders.map((o: any) => ({ id: o.id, status: o.status }))
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
    
    // Get full product details for purchased products
    const purchasedProducts = await Promise.all(
      Array.from(purchasedProductIds).map(async (productId) => {
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
    console.log(`[Purchases] Valid products after filtering: ${validProducts.length}`)
    
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

