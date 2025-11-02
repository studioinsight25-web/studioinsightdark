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
    
    console.log(`[Digital Products API] Request for productId: ${productId}, userId: ${session.userId}`)
    
    // CRITICAL SECURITY CHECK: Verify user has purchased this product
    const hasPurchased = await DigitalProductDatabaseService.hasUserPurchasedProduct(
      session.userId, 
      productId
    )
    
    if (!hasPurchased) {
      console.log(`[Digital Products API] ❌ Access denied: User ${session.userId} attempted to access digital products for unpurchased product ${productId}`)
      return NextResponse.json(
        { error: 'You have not purchased this product. Access denied.' },
        { status: 403 }
      )
    }
    
    console.log(`[Digital Products API] ✅ User has access, fetching digital products for productId: ${productId}`)
    
    // Get digital products for this product ID (only if user has access)
    const products = await DigitalProductDatabaseService.getDigitalProductsByProductId(productId)
    
    console.log(`[Digital Products API] Found ${products.length} digital products for productId: ${productId}`)
    if (products.length > 0) {
      console.log(`[Digital Products API] Digital products:`, products.map(p => ({ id: p.id, fileName: p.fileName, productId: p.productId })))
    } else {
      console.warn(`[Digital Products API] ⚠️ No digital products found for productId: ${productId}`)
    }
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching digital products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch digital products' },
      { status: 500 }
    )
  }
}

