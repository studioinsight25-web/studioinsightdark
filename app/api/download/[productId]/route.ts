// app/api/download/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'

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
    let expiresAt: string
    try {
      const decoded = atob(token)
      const [tokenUserId, tokenProductId, tokenExpiresAt] = decoded.split('-')
      expiresAt = tokenExpiresAt
      
      if (tokenUserId !== userId || tokenProductId !== productId) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Check expiration
      if (new Date(expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Download link expired' },
          { status: 410 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
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

    // Check if user can download (simplified for API route)
    const downloadRecord = await DigitalProductDatabaseService.getUserDownload(userId, productId)
    const downloadCount = downloadRecord ? downloadRecord.downloadCount : 0
    
    if (digitalProduct.downloadLimit && downloadCount >= digitalProduct.downloadLimit) {
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 403 }
      )
    }

    // Track download
    await DigitalProductDatabaseService.trackDownload(userId, productId)

    // In production, you would:
    // 1. Generate a signed URL from your cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Set appropriate headers for file download
    // 3. Stream the file content

    // For demo purposes, return the file URL
    return NextResponse.json({
      success: true,
      downloadUrl: digitalProduct.fileUrl,
      fileName: digitalProduct.fileName,
      fileSize: digitalProduct.fileSize,
      expiresAt: expiresAt
    })

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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if user has access to the product
    // In production, verify user has purchased the product
    
    // Get digital product to generate download URL
    const digitalProduct = await DigitalProductDatabaseService.getDigitalProduct(productId)
    
    if (!digitalProduct) {
      return NextResponse.json(
        { error: 'Digital product not found' },
        { status: 404 }
      )
    }

    // Generate a simple download URL with token
    const token = btoa(`${userId}-${productId}-${Date.now() + 3600000}`) // 1 hour expiry
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${productId}?token=${token}&userId=${userId}`

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

