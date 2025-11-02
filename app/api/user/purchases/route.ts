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
    
    // Filter only paid orders (check both uppercase and lowercase)
    const paidOrders = orders.filter(order => {
      const status = typeof order.status === 'string' ? order.status.toLowerCase() : String(order.status).toLowerCase()
      const isPaid = status === 'paid' || status === 'PAID'
      if (isPaid) {
        console.log(`[Purchases] Found PAID order ${order.id} with ${order.items.length} items`)
      }
      return isPaid
    })
    
    console.log(`[Purchases] Found ${paidOrders.length} paid orders`)
    
    // Collect all purchased product IDs
    const purchasedProductIds = new Set<string>()
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        purchasedProductIds.add(item.id)
      })
    })
    
    // Get full product details for purchased products
    const purchasedProducts = await Promise.all(
      Array.from(purchasedProductIds).map(async (productId) => {
        try {
          const product = await DatabaseProductService.getProduct(productId)
          return product
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error)
          return null
        }
      })
    )
    
    // Filter out null products and group by type
    const validProducts = purchasedProducts.filter(p => p !== null)
    
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

