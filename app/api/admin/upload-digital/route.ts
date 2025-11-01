// app/api/admin/upload-digital/route.ts - Digital File Upload API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAPI()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'studio-insight/digital-products'
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Geen bestand geüpload' },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB for digital products)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Bestand te groot. Maximum grootte is 100MB' },
        { status: 400 }
      )
    }

    // Cloudinary credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary niet geconfigureerd. Stel CLOUDINARY_CLOUD_NAME en CLOUDINARY_UPLOAD_PRESET in.',
        },
        { status: 500 }
      )
    }

    // Determine resource type based on file type
    let resourceType = 'raw' // Default for PDF, ZIP, etc.
    if (file.type.startsWith('video/')) {
      resourceType = 'video'
    } else if (file.type.startsWith('audio/')) {
      resourceType = 'video' // Cloudinary uses 'video' for audio too
    }

    // Sanitize filename
    const safeFileName = file.name.split(/[/\\]/).pop() || 'upload'
    const cleanFile = new File([file], safeFileName, { type: file.type })

    console.log('Uploading digital file to Cloudinary:', safeFileName, 'Resource type:', resourceType)

    // Prepare upload form data for Cloudinary
    const cloudForm = new FormData()
    cloudForm.append('file', cleanFile)
    cloudForm.append('upload_preset', uploadPreset)
    cloudForm.append('folder', folder)
    cloudForm.append('resource_type', resourceType)

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: cloudForm,
      }
    )

    if (!cloudRes.ok) {
      const errText = await cloudRes.text()
      console.error('Cloudinary upload failed:', errText)
      return NextResponse.json(
        { success: false, error: `Cloudinary upload mislukt: ${errText}` },
        { status: 500 }
      )
    }

    const result = await cloudRes.json()

    console.log('✅ Digital file upload success:', result.secure_url)

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        bytes: result.bytes,
        resource_type: result.resource_type,
      },
      message: 'Bestand succesvol geüpload'
    })

  } catch (error) {
    console.error('Digital file upload error:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Onbekende fout bij upload' },
      { status: 500 }
    )
  }
}

