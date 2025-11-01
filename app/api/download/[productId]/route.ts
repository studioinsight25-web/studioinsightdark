// app/api/download/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'
import SessionManager from '@/lib/session'

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

    // CRITICAL: Verify userId from session matches request (prevent user impersonation)
    const session = SessionManager.getSession()
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

    // Get download record for tracking
    const downloadRecord = await DigitalProductDatabaseService.getUserDownload(userId, productId)
    const downloadCount = downloadRecord ? downloadRecord.downloadCount : 0

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

    // Check authentication via session
    const session = SessionManager.getSession()
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

    // Generate a secure download URL with token
    const expiryTime = Date.now() + 3600000 // 1 hour expiry
    const token = btoa(`${userId}-${productId}-${expiryTime}`)
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/download/${productId}?token=${encodeURIComponent(token)}&userId=${userId}`

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

