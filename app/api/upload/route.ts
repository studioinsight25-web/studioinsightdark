import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'studio-insight/products'
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Check Cloudinary configuration
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME
    const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET environment variables.' 
        },
        { status: 500 }
      )
    }

    // Create a new File object with just the filename (not the full path)
    const sanitizedFileName = file.name.split(/[/\\]/).pop() || 'image.jpg'
    const sanitizedFile = new File([file], sanitizedFileName, { type: file.type })
    
    console.log('Uploading to Cloudinary:', sanitizedFileName)
    
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', sanitizedFile)
    cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset)
    cloudinaryFormData.append('folder', folder)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cloudinary upload failed:', errorText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Cloudinary upload failed: ${errorText}` 
        },
        { status: 500 }
      )
    }

    const result = await response.json()
    console.log('Cloudinary upload successful:', result.public_id)

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    })

  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `Failed to upload image: ${errorMessage}` },
      { status: 500 }
    )
  }
}