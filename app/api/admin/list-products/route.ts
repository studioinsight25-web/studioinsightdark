// app/api/admin/list-products/route.ts - List all products for admin
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'
import { DatabaseProductService } from '@/lib/products-database'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'ebook' or 'course'

    let products
    if (type) {
      products = await DatabaseProductService.getProductsByType(type as 'course' | 'ebook')
    } else {
      products = await DatabaseProductService.getAllProducts()
    }

    // Return simplified product list
    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        price: p.price,
        category: p.category
      })),
      count: products.length
    })

  } catch (error) {
    console.error('[List Products] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

