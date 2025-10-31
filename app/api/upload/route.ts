import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Debug: log all form data entries
    console.log('All form data entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, typeof value === 'string' ? value : `File: ${(value as File).name}`)
    }
    
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
    const isVercel = !!process.env.VERCEL

    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      try {
        console.log('Uploading to Cloudinary...')
        console.log('File name:', file.name)
        console.log('File type:', file.type)
        console.log('File size:', file.size)
        console.log('Folder from form:', folder)
        
        // Create a new File object with just the filename (not the full path)
        const sanitizedFileName = file.name.split(/[/\\]/).pop() || 'image.jpg'
        const sanitizedFile = new File([file], sanitizedFileName, { type: file.type })
        
        console.log('Sanitized file name:', sanitizedFileName)
        
        const cloudinaryFormData = new FormData()
        cloudinaryFormData.append('file', sanitizedFile)
        cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset)
        cloudinaryFormData.append('folder', folder)
        
        // Debug: log what we're sending
        console.log('Cloudinary cloud name:', cloudinaryCloudName)
        console.log('Cloudinary upload preset:', cloudinaryUploadPreset)
        console.log('Cloudinary folder:', folder)

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
          throw new Error(`Cloudinary upload failed: ${response.statusText} - ${errorText}`)
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
        console.error('Cloudinary upload failed:', cloudinaryError)
        const errorMsg = cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)
        
        // On Vercel, don't fall back to local - that won't work
        if (isVercel) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Cloudinary upload failed: ${errorMsg}` 
            },
            { status: 500 }
          )
        }
        // Fall through to local upload only in development
      }
    }

    // Fallback to local upload (only in development)
    console.log('Uploading locally...')
    
    // On Vercel without Cloudinary configured, return error
    if (isVercel) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET environment variables.' 
        },
        { status: 500 }
      )
    }
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