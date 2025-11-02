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

    // Get user orders
    const orders = await OrderService.getUserOrders(session.userId)
    
    console.log(`[Purchases] Found ${orders.length} orders for user ${session.userId}`)
    console.log(`[Purchases] Order statuses:`, orders.map(o => ({ id: o.id, status: o.status, itemsCount: o.items.length })))
    
    // Filter only paid orders (check both uppercase and lowercase)
    const paidOrders = orders.filter(order => {
      const status = typeof order.status === 'string' ? order.status.toLowerCase() : String(order.status).toLowerCase()
      const isPaid = status === 'paid'
      if (isPaid) {
        console.log(`[Purchases] ✅ Found PAID order ${order.id} with ${order.items.length} items`)
        console.log(`[Purchases] Order items:`, order.items.map((item: any) => ({ 
          id: item.id, 
          name: item.name, 
          type: item.type 
        })))
      } else {
        console.log(`[Purchases] ⚠️ Order ${order.id} has status: ${status} (not paid)`)
      }
      return isPaid
    })
    
    console.log(`[Purchases] Found ${paidOrders.length} paid orders out of ${orders.length} total`)
    
    // Collect all purchased product IDs
    const purchasedProductIds = new Set<string>()
    paidOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item && item.id) {
          purchasedProductIds.add(item.id)
          console.log(`[Purchases] Adding product ID to purchased set: ${item.id} (${item.name || 'unnamed'})`)
        } else {
          console.error(`[Purchases] ⚠️ Invalid item in order ${order.id}:`, item)
        }
      })
    })
    
    console.log(`[Purchases] Total unique purchased product IDs: ${purchasedProductIds.size}`)
    console.log(`[Purchases] Product IDs:`, Array.from(purchasedProductIds))
    
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

