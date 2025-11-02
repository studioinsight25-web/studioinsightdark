// app/api/download/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'
import { getSessionFromRequest } from '@/lib/session-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Missing authentication parameters' },
        { status: 400 }
      )
    }

    // Verify token (in production, use proper JWT verification)
    // Token format: userId::productId::expiresAt (using :: as separator since UUIDs contain -)
    let expiresAt: string
    try {
      const decoded = atob(token)
      const parts = decoded.split('::')
      
      if (parts.length !== 3) {
        console.error('[Download] Invalid token format: wrong number of parts', parts.length)
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        )
      }
      
      const [tokenUserId, tokenProductId, tokenExpiresAt] = parts
      expiresAt = tokenExpiresAt
      
      console.log(`[Download] Token verification: userId=${tokenUserId === userId}, productId=${tokenProductId === productId}, expiresAt=${expiresAt}`)
      
      if (tokenUserId !== userId || tokenProductId !== productId) {
        console.error(`[Download] Token mismatch: tokenUserId=${tokenUserId}, userId=${userId}, tokenProductId=${tokenProductId}, productId=${productId}`)
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Check expiration
      const expirationDate = new Date(parseInt(expiresAt))
      if (expirationDate < new Date()) {
        console.error(`[Download] Token expired: ${expirationDate} < ${new Date()}`)
        return NextResponse.json(
          { error: 'Download link expired' },
          { status: 410 }
        )
      }
    } catch (error) {
      console.error('[Download] Token decode error:', error)
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      )
    }

    // CRITICAL: Verify userId from session matches request (prevent user impersonation)
    const session = getSessionFromRequest(request)
    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access attempt' },
        { status: 403 }
      )
    }

    // Get digital product
    const digitalProduct = await DigitalProductDatabaseService.getDigitalProduct(productId)
    if (!digitalProduct) {
      return NextResponse.json(
        { error: 'Digital product not found' },
        { status: 404 }
      )
    }

    // CRITICAL SECURITY CHECK: Verify user has purchased and can download
    const canDownload = await DigitalProductDatabaseService.canUserDownload(userId, productId)
    
    if (!canDownload) {
      return NextResponse.json(
        { error: 'You have not purchased this product or download limit exceeded. Access denied.' },
        { status: 403 }
      )
    }

    // Get product name for filename
    const { DatabaseProductService } = await import('@/lib/products-database')
    const product = await DatabaseProductService.getProduct(digitalProduct.productId)
    
    // Generate filename: productName-productId.extension
    const originalFileName = digitalProduct.fileName || 'download'
    const fileExtension = originalFileName.split('.').pop() || 'pdf'
    const productName = product ? 
      product.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 
      'product'
    const safeFileName = `${productName}-${digitalProduct.productId}.${fileExtension}`

    // Track download
    await DigitalProductDatabaseService.trackDownload(userId, productId)

    // Fetch file from Cloudinary/storage and stream it
    try {
      const fileResponse = await fetch(digitalProduct.fileUrl)
      
      if (!fileResponse.ok) {
        console.error(`[Download] Failed to fetch file from ${digitalProduct.fileUrl}: ${fileResponse.status}`)
        return NextResponse.json(
          { error: 'File not found in storage' },
          { status: 404 }
        )
      }

      // Get file content
      const fileBuffer = await fileResponse.arrayBuffer()
      
      // Determine content type
      const contentType = digitalProduct.fileType || 
        (fileExtension === 'pdf' ? 'application/pdf' :
         fileExtension === 'zip' ? 'application/zip' :
         fileExtension === 'epub' ? 'application/epub+zip' :
         'application/octet-stream')

      // Return file with proper headers for download
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`,
          'Content-Length': fileBuffer.byteLength.toString(),
          'Cache-Control': 'no-cache',
        },
      })
    } catch (error) {
      console.error('[Download] Error fetching file:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve file' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate secure download link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const { userId } = await request.json()

    // Check authentication via session
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // CRITICAL: Verify userId from request matches session (prevent user impersonation)
    if (userId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access attempt' },
        { status: 403 }
      )
    }

    // CRITICAL SECURITY CHECK: Verify user has purchased the product
    const canDownload = await DigitalProductDatabaseService.canUserDownload(userId, productId)
    
    if (!canDownload) {
      return NextResponse.json(
        { error: 'You have not purchased this product or download limit exceeded. Access denied.' },
        { status: 403 }
      )
    }
    
    // Get digital product to generate download URL
    const digitalProduct = await DigitalProductDatabaseService.getDigitalProduct(productId)
    
    if (!digitalProduct) {
      return NextResponse.json(
        { error: 'Digital product not found' },
        { status: 404 }
      )
    }

    // Generate a secure download URL with token (30 days expiry)
    // Using :: as separator since UUIDs contain - characters
    const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days expiry
    const token = btoa(`${userId}::${productId}::${expiryTime}`)
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/download/${productId}?token=${encodeURIComponent(token)}&userId=${userId}`
    
    console.log(`[Download] Generated token for userId=${userId}, productId=${productId}, expiresAt=${expiryTime}`)

    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl
    })

  } catch (error) {
    console.error('Generate download link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

