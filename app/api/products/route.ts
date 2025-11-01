import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/products-database'

export async function GET() {
  try {
    const products = await DatabaseProductService.getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()
    
    // Validate required fields
    if (!productData.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    
    // Price is required for course and ebook, but optional for review products (they use affiliate links)
    if (productData.type !== 'review' && (!productData.price || productData.price <= 0)) {
      return NextResponse.json(
        { error: 'Price is required for course and ebook products' },
        { status: 400 }
      )
    }
    
    // For review products, set price to 0 if not provided (or undefined)
    if (productData.type === 'review' && (productData.price === undefined || productData.price === null)) {
      productData.price = 0
    }

    const newProduct = await DatabaseProductService.createProduct(productData)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to create product: ${errorMessage}` },
      { status: 500 }
    )
  }
}






