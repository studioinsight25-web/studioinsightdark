// app/api/affiliate/track/[linkCode]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import AffiliateService from '@/lib/affiliate'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkCode: string }> }
) {
  try {
    const { linkCode } = await params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || undefined

    // Track the click
    const click = AffiliateService.trackClick(
      linkCode,
      productId,
      ipAddress,
      userAgent,
      referrer
    )

    // Return tracking pixel (1x1 transparent image)
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('Affiliate tracking error:', error)
    
    // Return empty pixel even on error
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    })
  }
}

