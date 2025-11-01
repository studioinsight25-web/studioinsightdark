import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/products-database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await DatabaseProductService.getProduct(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    console.log(`[API] Updating product ${id} with data:`, updates)
    
    const updatedProduct = await DatabaseProductService.updateProduct(id, updates)
    
    if (!updatedProduct) {
      console.error(`[API] Product ${id} not found or update failed`)
      return NextResponse.json(
        { error: 'Product not found or update failed', productId: id },
        { status: 404 }
      )
    }

    console.log(`[API] Product ${id} updated successfully`)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('[API] Error updating product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await DatabaseProductService.deleteProduct(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
