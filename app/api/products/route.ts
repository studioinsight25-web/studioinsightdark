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
    if (!productData.name || !productData.price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    const newProduct = await DatabaseProductService.createProduct(productData)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
