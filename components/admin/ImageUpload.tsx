'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onImageChange: (file: File | null, imageUrl?: string) => void
  currentImage?: string
  className?: string
}

export default function ImageUpload({ onImageChange, currentImage, className = '' }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'studio-insight/products')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        const imageUrl = result.data.secure_url
        setUploadedImageUrl(imageUrl)
        onImageChange(file, imageUrl)
        
        // Create preview from uploaded image
        setPreview(imageUrl)
      } else {
        alert(`Upload fout: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Er is een fout opgetreden bij het uploaden')
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Alleen afbeeldingen zijn toegestaan')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Afbeelding mag maximaal 5MB zijn')
      return
    }
    
    // Upload the image
    uploadImage(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    handleFiles(e.target.files)
  }

  const removeImage = async () => {
    // Note: For now, we'll just remove from UI
    // In production, you might want to delete from Cloudinary as well
    // This would require storing the public_id and calling deleteImage()
    
    setPreview(null)
    setUploadedImageUrl(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Preview */}
      {preview && (
        <div className="relative">
          <div className="w-full h-32 bg-dark-section border border-dark-border rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={removeImage}
            disabled={uploading}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-dark-border hover:border-primary'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="space-y-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-text-secondary mx-auto" />
          )}
          <div>
            <p className="text-text-secondary text-sm mb-2">
              {uploading
                ? 'Afbeelding wordt geüpload...'
                : dragActive
                ? 'Laat de afbeelding los'
                : 'Sleep een afbeelding hierheen of klik om te selecteren'
              }
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-transparent border border-dark-border text-white px-4 py-2 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 disabled:opacity-50"
            >
              {uploading ? 'Uploaden...' : 'Selecteer Afbeelding'}
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            PNG, JPG, GIF tot 5MB
          </p>
        </div>
      </div>

      {/* Image Info */}
      {!preview && !uploading && (
        <div className="text-center py-4">
          <ImageIcon className="w-12 h-12 text-text-secondary mx-auto mb-2" />
          <p className="text-text-secondary text-sm">
            Nog geen afbeelding geselecteerd
          </p>
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-center py-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-text-secondary text-sm">
            Afbeelding wordt geüpload...
          </p>
        </div>
      )}
    </div>
  )
}
