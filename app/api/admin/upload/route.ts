// app/api/admin/upload/route.ts - Image Upload API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAPI()
    
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Geen bestand geüpload' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Alleen afbeeldingen zijn toegestaan' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Afbeelding mag maximaal 5MB zijn' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `product-${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return success with file info
    const imageUrl = `/uploads/${fileName}`
    
    return NextResponse.json({
      success: true,
      data: {
        fileName,
        imageUrl,
        size: file.size,
        type: file.type
      },
      message: 'Afbeelding succesvol geüpload'
    })

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 403 }
      )
    }
    
    console.error('Image upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Interne serverfout bij uploaden' },
      { status: 500 }
    )
  }
}

// Handle DELETE requests to remove images
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminAPI()
    
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'Bestandsnaam is verplicht' },
        { status: 400 }
      )
    }

    // In een echte app zou je hier het bestand verwijderen
    // Voor nu simuleren we het
    console.log('Image deleted:', fileName)
    
    return NextResponse.json({
      success: true,
      message: 'Afbeelding succesvol verwijderd'
    })

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 403 }
      )
    }
    
    console.error('Image delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Interne serverfout bij verwijderen' },
      { status: 500 }
    )
  }
}


