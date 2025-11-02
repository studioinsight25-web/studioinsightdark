// app/api/admin/cloudinary-config/route.ts - Returns Cloudinary config for client-side uploads
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdminAPI()
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          error: 'Cloudinary niet geconfigureerd. Stel CLOUDINARY_CLOUD_NAME en CLOUDINARY_UPLOAD_PRESET in.',
        },
        { status: 500 }
      )
    }

    // Only return safe config values (no secrets)
    return NextResponse.json({
      cloudName,
      uploadPreset
    })

  } catch (error) {
    console.error('Cloudinary config error:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Onbekende fout bij ophalen configuratie' },
      { status: 500 }
    )
  }
}

