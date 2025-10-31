// components/admin/DigitalProductUpload.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, File, X, Download, Trash2, AlertCircle } from 'lucide-react'

export interface DigitalProduct {
  id: string
  productId: string
  fileName: string
  fileType: 'pdf' | 'video' | 'audio' | 'zip' | 'doc' | 'docx'
  fileSize: number
  fileUrl: string
  secureUrl?: string
  downloadLimit?: number
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface DigitalProductUploadProps {
  productId: string
  onDigitalProductsChange: (products: DigitalProduct[]) => void
  className?: string
}

export default function DigitalProductUpload({ 
  productId, 
  onDigitalProductsChange, 
  className = '' 
}: DigitalProductUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing digital products on mount
  useEffect(() => {
    const loadDigitalProducts = async () => {
      console.log('Loading digital products for productId:', productId)
      
      try {
        const response = await fetch(`/api/digital-products/${productId}`)
        if (response.ok) {
          const existingProducts = await response.json()
          console.log('Found existing digital products:', existingProducts)
          setDigitalProducts(existingProducts)
          onDigitalProductsChange(existingProducts)
        } else {
          console.error('Failed to load digital products:', response.statusText)
          setDigitalProducts([])
          onDigitalProductsChange([])
        }
      } catch (error) {
        console.error('Error loading digital products:', error)
        setDigitalProducts([])
        onDigitalProductsChange([])
      }
    }

    loadDigitalProducts()
  }, [productId, onDigitalProductsChange])

  const allowedTypes = [
    'application/pdf',
    'video/mp4',
    'video/avi',
    'video/mov',
    'audio/mp3',
    'audio/wav',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  const getFileType = (mimeType: string): DigitalProduct['fileType'] => {
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('video')) return 'video'
    if (mimeType.includes('audio')) return 'audio'
    if (mimeType.includes('zip')) return 'zip'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc'
    return 'pdf'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('Starting file upload:', file.name, file.type, file.size)
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Bestandstype niet ondersteund. Toegestaan: PDF, Video, Audio, ZIP, Word')
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        throw new Error('Bestand te groot. Maximum grootte is 100MB')
      }

      console.log('File validation passed, creating digital product...')

      // Create digital product via API
      const response = await fetch(`/api/digital-products/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: getFileType(file.type),
          fileSize: file.size,
          fileUrl: URL.createObjectURL(file), // Temporary URL for demo
          downloadLimit: 5, // Default download limit
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create digital product')
      }

      const digitalProduct = await response.json()
      console.log('Digital product created:', digitalProduct)

      // Update state
      const updatedProducts = [...digitalProducts, digitalProduct]
      setDigitalProducts(updatedProducts)
      onDigitalProductsChange(updatedProducts)

      console.log('State updated, digital products:', updatedProducts)
      
      // Show success message
      setSuccess(`Bestand "${file.name}" succesvol geüpload!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload fout')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteDigitalProduct = async (id: string) => {
    if (confirm('Weet je zeker dat je dit digitale bestand wilt verwijderen?')) {
      console.log('Deleting digital product:', id)
      
      try {
        const response = await fetch(`/api/digital-products/${productId}?id=${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete digital product')
        }
        
        const updatedProducts = digitalProducts.filter(dp => dp.id !== id)
        setDigitalProducts(updatedProducts)
        onDigitalProductsChange(updatedProducts)
        
        console.log('Digital product deleted, updated list:', updatedProducts)
      } catch (error) {
        console.error('Error deleting digital product:', error)
        setError('Kon digitale product niet verwijderen')
      }
    }
  }

  const getFileIcon = (fileType: DigitalProduct['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return <File className="w-5 h-5 text-red-400" />
      case 'video':
        return <File className="w-5 h-5 text-blue-400" />
      case 'audio':
        return <File className="w-5 h-5 text-green-400" />
      case 'zip':
        return <File className="w-5 h-5 text-yellow-400" />
      case 'doc':
      case 'docx':
        return <File className="w-5 h-5 text-blue-500" />
      default:
        return <File className="w-5 h-5 text-text-secondary" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Digitale Bestanden</h3>
        <p className="text-sm text-text-secondary mb-4">
          Upload digitale bestanden die klanten kunnen downloaden na aankoop
        </p>
        <p className="text-xs text-text-secondary">
          Product ID: {productId} | Geüploade bestanden: {digitalProducts.length}
        </p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-primary transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.mp4,.avi,.mov,.mp3,.wav,.zip,.doc,.docx"
          className="hidden"
          disabled={uploading}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-text-secondary">Uploaden...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-primary mx-auto" />
              <p className="text-white font-medium">Klik om bestand te uploaden</p>
              <p className="text-sm text-text-secondary">
                PDF, Video, Audio, ZIP, Word documenten (max 100MB)
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-semibold">Upload Fout</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-semibold">Succesvol!</span>
          </div>
          <p className="text-green-300 text-sm mt-1">{success}</p>
        </div>
      )}

      {/* Digital Products List */}
      {digitalProducts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-white">Geüploade Bestanden</h4>
          {digitalProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 bg-dark-section rounded-lg border border-dark-border"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(product.fileType)}
                <div>
                  <p className="font-medium text-white">{product.fileName}</p>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{formatFileSize(product.fileSize)}</span>
                    <span>{product.fileType.toUpperCase()}</span>
                    <span>Downloads: {product.downloadLimit || '∞'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // In production, this would generate a secure download link
                    alert('Download link generatie komt binnenkort!')
                  }}
                  className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                  title="Download link genereren"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDigitalProduct(product.id)}
                  className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                  title="Verwijderen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">💡 Tips voor digitale bestanden</h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• PDF: Cursus materialen, handleidingen, certificaten</li>
          <li>• Video: Cursus lessen, tutorials, demo's</li>
          <li>• Audio: Podcasts, muziek, geluidseffecten</li>
          <li>• ZIP: Meerdere bestanden, software, templates</li>
          <li>• Word: Bewerkbare documenten, templates</li>
        </ul>
      </div>
    </div>
  )
}
