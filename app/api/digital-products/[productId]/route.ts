// app/api/digital-products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'
import { requireAdminAPI } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await requireAdminAPI()
    const { productId } = await params
    
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await requireAdminAPI()
    const { productId } = await params
    const body = await request.json()
    
    const digitalProduct = await DigitalProductDatabaseService.addDigitalProduct({
      ...body,
      productId
    })
    
    return NextResponse.json(digitalProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating digital product:', error)
    return NextResponse.json(
      { error: 'Failed to create digital product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await requireAdminAPI()
    const { productId } = await params
    const { searchParams } = new URL(request.url)
    const digitalProductId = searchParams.get('id')
    
    if (!digitalProductId) {
      return NextResponse.json(
        { error: 'Digital product ID required' },
        { status: 400 }
      )
    }
    
    await DigitalProductDatabaseService.deleteDigitalProduct(digitalProductId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting digital product:', error)
    return NextResponse.json(
      { error: 'Failed to delete digital product' },
      { status: 500 }
    )
  }
}


