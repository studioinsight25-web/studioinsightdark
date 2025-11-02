// app/api/admin/fix-cloudinary-access/route.ts
// Endpoint to fix Cloudinary file access control via API
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      )
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 500 }
      )
    }

    // Try to update the resource access mode
    // Note: Cloudinary API doesn't directly allow changing access_mode after upload
    // We'll need to use the Admin API to update context/metadata
    // Alternative: Use the explicit resource type endpoint
    
    console.log(`[Fix Cloudinary Access] Attempting to update public_id: ${publicId}`)
    
    // Method 1: Try to update via context API (may not work for access_mode)
    const updateResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          access_mode: 'open',
          api_key: apiKey,
          api_secret: apiSecret,
          timestamp: Math.floor(Date.now() / 1000),
        }),
      }
    )

    if (updateResponse.ok) {
      const result = await updateResponse.json()
      console.log(`[Fix Cloudinary Access] ✅ Successfully updated:`, result)
      return NextResponse.json({
        success: true,
        message: 'File access mode updated successfully',
        data: result
      })
    }

    // Method 2: If that doesn't work, try raw resource type
    const rawUpdateResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          access_mode: 'open',
          api_key: apiKey,
          api_secret: apiSecret,
          timestamp: Math.floor(Date.now() / 1000),
        }),
      }
    )

    if (rawUpdateResponse.ok) {
      const result = await rawUpdateResponse.json()
      console.log(`[Fix Cloudinary Access] ✅ Successfully updated (raw):`, result)
      return NextResponse.json({
        success: true,
        message: 'File access mode updated successfully',
        data: result
      })
    }

    const errorText = await rawUpdateResponse.text()
    console.error(`[Fix Cloudinary Access] ❌ Failed:`, errorText)

    // If API update doesn't work, return instructions
    return NextResponse.json({
      success: false,
      error: 'Could not update via API. Cloudinary may not allow changing access_mode after upload.',
      instructions: [
        '1. Go to Cloudinary Console',
        '2. Find the file in Media Library',
        '3. Open the file',
        '4. In the right panel, look for "Access control" or "Settings"',
        '5. Change "Blocked for delivery" to "Open"',
        'OR: Re-upload the file via admin panel (it will now be automatically public)'
      ],
      alternative: 'Upload the file again via admin panel - it will be automatically set to public'
    }, { status: 400 })

  } catch (error) {
    console.error('[Fix Cloudinary Access] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

