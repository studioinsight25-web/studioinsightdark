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
    
    // Validate required fields
    // Either fileUrl OR fileData must be provided
    if (!body.fileName || (!body.fileUrl && !body.fileData)) {
      return NextResponse.json(
        { error: 'fileName en fileUrl of fileData zijn verplicht' },
        { status: 400 }
      )
    }
    
    // Validate fileType
    const allowedTypes = ['pdf', 'video', 'audio', 'zip', 'doc', 'docx']
    if (!body.fileType || !allowedTypes.includes(body.fileType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Ongeldig bestandstype' },
        { status: 400 }
      )
    }
    
    // Convert base64 fileData to Buffer if provided
    let fileData: Buffer | undefined
    if (body.fileData && typeof body.fileData === 'string') {
      try {
        fileData = Buffer.from(body.fileData, 'base64')
        console.log(`[Digital Products API] Converted base64 fileData to Buffer (${fileData.length} bytes)`)
      } catch (error) {
        console.error('[Digital Products API] Failed to decode base64 fileData:', error)
        return NextResponse.json(
          { error: 'Ongeldige fileData (geen geldige base64 string)' },
          { status: 400 }
        )
      }
    }
    
    const digitalProduct = await DigitalProductDatabaseService.addDigitalProduct({
      ...body,
      fileData: fileData, // Buffer instead of base64 string
      productId
    })
    
    return NextResponse.json(digitalProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating digital product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create digital product'
    return NextResponse.json(
      { error: errorMessage },
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


