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
    
    console.log(`[Digital Products API] POST request for productId: ${productId}`)
    console.log(`[Digital Products API] Request body keys:`, Object.keys(body))
    console.log(`[Digital Products API] fileName: ${body.fileName}, fileType: ${body.fileType}, fileSize: ${body.fileSize}`)
    console.log(`[Digital Products API] has fileData: ${!!body.fileData}, fileData length: ${body.fileData?.length || 0}`)
    console.log(`[Digital Products API] has fileUrl: ${!!body.fileUrl}`)
    
    // Validate required fields
    // Either fileUrl OR fileData must be provided
    if (!body.fileName) {
      console.error('[Digital Products API] Missing fileName')
      return NextResponse.json(
        { error: 'fileName is verplicht' },
        { status: 400 }
      )
    }
    
    if (!body.fileUrl && !body.fileData) {
      console.error('[Digital Products API] Missing both fileUrl and fileData')
      return NextResponse.json(
        { error: 'fileUrl of fileData is verplicht' },
        { status: 400 }
      )
    }
    
    // Validate fileType
    const allowedTypes = ['pdf', 'video', 'audio', 'zip', 'doc', 'docx']
    if (!body.fileType || !allowedTypes.includes(body.fileType.toLowerCase())) {
      console.error(`[Digital Products API] Invalid fileType: ${body.fileType}`)
      return NextResponse.json(
        { error: 'Ongeldig bestandstype' },
        { status: 400 }
      )
    }
    
    // Convert base64 fileData to Buffer if provided
    let fileData: Buffer | undefined
    if (body.fileData && typeof body.fileData === 'string') {
      try {
        console.log(`[Digital Products API] Converting base64 to Buffer (input length: ${body.fileData.length})`)
        fileData = Buffer.from(body.fileData, 'base64')
        console.log(`[Digital Products API] ✅ Converted base64 fileData to Buffer (${fileData.length} bytes)`)
      } catch (error) {
        console.error('[Digital Products API] ❌ Failed to decode base64 fileData:', error)
        return NextResponse.json(
          { error: 'Ongeldige fileData (geen geldige base64 string)' },
          { status: 400 }
        )
      }
    }
    
    console.log(`[Digital Products API] Calling addDigitalProduct with:`, {
      productId,
      fileName: body.fileName,
      fileType: body.fileType,
      fileSize: body.fileSize,
      hasFileData: !!fileData,
      fileDataLength: fileData?.length || 0,
      fileUrl: body.fileUrl || ''
    })
    
    const digitalProduct = await DigitalProductDatabaseService.addDigitalProduct({
      ...body,
      fileData: fileData, // Buffer instead of base64 string
      productId
    })
    
    console.log(`[Digital Products API] ✅ Digital product created successfully:`, {
      id: digitalProduct.id,
      productId: digitalProduct.productId,
      fileName: digitalProduct.fileName
    })
    
    return NextResponse.json(digitalProduct, { status: 201 })
  } catch (error) {
    console.error('[Digital Products API] ❌ Error creating digital product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create digital product'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('[Digital Products API] Error stack:', errorStack)
    return NextResponse.json(
      { error: errorMessage, details: errorStack },
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


