// components/DigitalProductDownload.tsx
'use client'

import { useState, useEffect } from 'react'
import { Download, File, AlertCircle, CheckCircle, Lock, CreditCard } from 'lucide-react'
import { useDigitalProducts } from '@/hooks/useDigitalProducts'
import DigitalProductService from '@/lib/digital-products'

interface DigitalProductDownloadProps {
  productId: string
  userId: string
  className?: string
}

export default function DigitalProductDownload({ 
  productId, 
  userId, 
  className = '' 
}: DigitalProductDownloadProps) {
  const { digitalProducts, loading, downloadFile } = useDigitalProducts(productId)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)

  // Check if user has access to this product (in production, this would check payment status)
  useEffect(() => {
    // For demo purposes, simulate access check
    // In production, this would check:
    // 1. User has purchased the product
    // 2. Payment is completed
    // 3. Product is not expired
    const checkAccess = async () => {
      // Simulate API call to check purchase status
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For demo: assume user has access to products 1, 2, 3
      const hasPurchased = ['1', '2', '3'].includes(productId)
      setHasAccess(hasPurchased)
    }
    
    checkAccess()
  }, [productId, userId])

  const handleDownload = async (digitalProductId: string, fileName: string) => {
    if (!hasAccess) {
      setError('Je hebt geen toegang tot dit product. Koop het product eerst.')
      return
    }

    setDownloading(digitalProductId)
    setError('')

    try {
      // Check if user can download (download limits, expiration, etc.)
      const canDownload = DigitalProductService.canUserDownload(userId, digitalProductId)
      
      if (!canDownload) {
        setError('Download niet beschikbaar. Mogelijk is je download limiet bereikt of is het product verlopen.')
        return
      }

      const success = await downloadFile(digitalProductId, userId)
      
      if (!success) {
        setError('Download mislukt. Probeer het opnieuw.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download fout')
    } finally {
      setDownloading(null)
    }
  }

  const getFileIcon = (fileType: string) => {
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (digitalProducts.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-dark-card rounded-lg p-6 border border-dark-border text-center">
          <File className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Geen digitale bestanden</h3>
          <p className="text-text-secondary">
            Er zijn nog geen digitale bestanden beschikbaar voor dit product.
          </p>
        </div>
      </div>
    )
  }

  // Show access denied if user doesn't have access
  if (!hasAccess) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Toegang Geweigerd</h3>
          <p className="text-red-300 mb-4">
            Je hebt geen toegang tot de digitale bestanden van dit product.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => {
                // Redirect to product page to purchase
                window.location.href = `/products/${productId}`
              }}
              className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Koop Product
            </button>
            <button 
              onClick={() => {
                // Redirect to product page
                window.location.href = `/products/${productId}`
              }}
              className="bg-transparent border border-red-500 text-red-400 px-6 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
              <File className="w-4 h-4" />
              Bekijk Product
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">📁 Downloadbare Bestanden</h3>
        <p className="text-sm text-text-secondary">
          Download de digitale bestanden die bij dit product horen
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-semibold">Download Fout</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Digital Products List */}
      <div className="space-y-3">
        {digitalProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 bg-dark-card rounded-lg border border-dark-border hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(product.fileType)}
              <div>
                <p className="font-medium text-white">{product.fileName}</p>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>{formatFileSize(product.fileSize)}</span>
                  <span>{product.fileType.toUpperCase()}</span>
                  {product.downloadLimit && (
                    <span>Max {product.downloadLimit} downloads</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload(product.id, product.fileName)}
              disabled={downloading === product.id}
              className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {downloading === product.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Downloaden...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <h4 className="font-medium text-green-400">✅ Download Tips</h4>
        </div>
        <ul className="text-sm text-green-300 space-y-1">
          <li>• Klik op "Download" om het bestand te downloaden</li>
          <li>• Bewaar de bestanden op een veilige locatie</li>
          <li>• Download links verlopen na 1 uur</li>
          <li>• Er zijn download limieten per bestand</li>
        </ul>
      </div>
    </div>
  )
}
