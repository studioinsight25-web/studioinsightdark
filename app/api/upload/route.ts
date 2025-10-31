import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'studio-insight/products'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Try Cloudinary first if configured
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME
    const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      try {
        console.log('Uploading to Cloudinary...')
        const cloudinaryFormData = new FormData()
        cloudinaryFormData.append('file', file)
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
          throw new Error(`Cloudinary upload failed: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('Cloudinary upload successful')

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
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, falling back to local:', cloudinaryError)
        // Fall through to local upload
      }
    }

    // Fallback to local upload
    console.log('Uploading locally...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `product-${timestamp}.${extension}`

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Write file to public/uploads directory
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return success response with local URL
    return NextResponse.json({
      success: true,
      data: {
        public_id: filename,
        secure_url: `/uploads/${filename}`,
        width: 800, // Default values for now
        height: 600,
        format: extension,
        bytes: file.size,
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