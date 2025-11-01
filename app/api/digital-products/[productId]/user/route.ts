// app/api/digital-products/[productId]/user/route.ts - Get digital products for authenticated user
import { NextRequest, NextResponse } from 'next/server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'
import SessionManager from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Check authentication
    const session = SessionManager.getSession()
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { productId } = await params
    
    // Get digital products for this product ID
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

