import { NextResponse } from 'next/server'

export async function GET() {
  const cloudinaryConfig = {
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    hasUploadPreset: !!process.env.CLOUDINARY_UPLOAD_PRESET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'Not set',
    isConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_UPLOAD_PRESET
    )
  }

  return NextResponse.json({
    message: 'Cloudinary Configuration Status',
    config: cloudinaryConfig,
    environment: process.env.NODE_ENV
  })
}

