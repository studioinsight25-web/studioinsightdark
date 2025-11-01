// components/DigitalProductDownload.tsx
'use client'

import { useState, useEffect } from 'react'
import { Download, File, AlertCircle, CheckCircle, Lock, CreditCard } from 'lucide-react'

interface DigitalProduct {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  downloadLimit?: number
}

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
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)

  // Check if user has access and load digital products
  useEffect(() => {
    const checkAccessAndLoad = async () => {
      try {
        // Check if user has purchased this product
        const purchasesResponse = await fetch('/api/user/purchases')
        if (purchasesResponse.ok) {
          const purchasesData = await purchasesResponse.json()
          const purchasedProductIds = (purchasesData.products || []).map((p: any) => p.id)
          setHasAccess(purchasedProductIds.includes(productId))
        }

        // Load digital products via API for authenticated users
        try {
          const response = await fetch(`/api/digital-products/${productId}/user`)
          if (response.ok) {
            const products = await response.json()
            setDigitalProducts(products)
          } else {
            // No products or not authorized
            setDigitalProducts([])
          }
        } catch (err) {
          // API might not be available - that's OK
          console.log('Could not load digital products:', err)
          setDigitalProducts([])
        }
      } catch (error) {
        console.error('Error checking access:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAccessAndLoad()
  }, [productId, userId])

  const handleDownload = async (digitalProductId: string, fileName: string) => {
    if (!hasAccess) {
      setError('Je hebt geen toegang tot dit product. Koop het product eerst.')
      return
    }

    setDownloading(digitalProductId)
    setError('')

    try {
      // Generate download link via API
      const response = await fetch(`/api/download/${digitalProductId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Download link kon niet worden gegenereerd')
      }

      // Use the download URL
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      } else {
        throw new Error('Geen download URL ontvangen')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download mislukt. Probeer het opnieuw.')
    } finally {
      setDownloading(null)
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <File className="w-5 h-5 text-red-400" />
      case 'video':
      case 'mp4':
        return <File className="w-5 h-5 text-blue-400" />
      case 'audio':
      case 'mp3':
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
    if (!bytes || bytes === 0) return '0 Bytes'
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

  // Show access denied if user doesn't have access
  if (!hasAccess) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Toegang Geweigerd</h3>
          <p className="text-red-300 mb-4">
            Je hebt geen toegang tot de digitale bestanden van dit product. Koop het product eerst om toegang te krijgen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => {
                window.location.href = `/products/${productId}`
              }}
              className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Koop Product
            </button>
          </div>
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
                  {product.fileSize && <span>{formatFileSize(product.fileSize)}</span>}
                  {product.fileType && <span>{product.fileType.toUpperCase()}</span>}
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
