// lib/cloudinary.ts - Cloudinary Configuration and Upload Functions
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface CloudinaryUploadOptions {
  folder?: string
  transformation?: any
  public_id?: string
}

/**
 * Upload an image to Cloudinary
 */
export const uploadImage = async (
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'studio-insight')
  
  // Add folder if specified
  if (options.folder) {
    formData.append('folder', options.folder)
  }

  // Add transformation if specified
  if (options.transformation) {
    formData.append('transformation', JSON.stringify(options.transformation))
  }

  // Add public_id if specified
  if (options.public_id) {
    formData.append('public_id', options.public_id)
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Delete an image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

/**
 * Generate optimized image URL with transformations
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformations: any = {}
): string => {
  const defaultTransformations = {
    quality: 'auto',
    format: 'auto',
    width: 400,
    height: 250,
    crop: 'fill',
    gravity: 'auto',
    ...transformations,
  }

  return cloudinary.url(publicId, {
    ...defaultTransformations,
  })
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export const getResponsiveImageUrls = (publicId: string) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 200 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 400 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 800 }),
  }
}

export default cloudinary


