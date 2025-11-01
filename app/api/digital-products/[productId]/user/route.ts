// app/api/digital-products/[productId]/user/route.ts - Get digital products for authenticated user
import { NextRequest, NextResponse } from 'next/server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'
import { OrderService } from '@/lib/orders'
import { getSessionFromRequest } from '@/lib/session-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Check authentication
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { productId } = await params
    
    // CRITICAL SECURITY CHECK: Verify user has purchased this product
    const hasPurchased = await DigitalProductDatabaseService.hasUserPurchasedProduct(
      session.userId, 
      productId
    )
    
    if (!hasPurchased) {
      console.log(`Access denied: User ${session.userId} attempted to access digital products for unpurchased product ${productId}`)
      return NextResponse.json(
        { error: 'You have not purchased this product. Access denied.' },
        { status: 403 }
      )
    }
    
    // Get digital products for this product ID (only if user has access)
    const products = await DigitalProductDatabaseService.getDigitalProductsByProductId(productId)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching digital products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch digital products' },
      { status: 500 }
    )
  }
}

