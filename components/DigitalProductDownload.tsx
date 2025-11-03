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
            console.log(`[DigitalProductDownload] Loaded ${products.length} digital products for product ${productId}:`, products)
            setDigitalProducts(Array.isArray(products) ? products : [])
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.warn(`[DigitalProductDownload] Failed to load digital products for ${productId}:`, response.status, errorData)
            // No products or not authorized
            setDigitalProducts([])
          }
        } catch (err) {
          // API might not be available - that's OK
          console.error('[DigitalProductDownload] Error loading digital products:', err)
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
      const linkResponse = await fetch(`/api/download/${digitalProductId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const linkResult = await linkResponse.json()

      if (!linkResponse.ok) {
        throw new Error(linkResult.error || 'Download link kon niet worden gegenereerd')
      }

      // Get the download URL with token
      if (!linkResult.downloadUrl) {
        throw new Error('Geen download URL ontvangen')
      }

      // Fetch the actual file using the secure download URL
      // IMPORTANT: Use credentials to ensure session cookie is sent
      const downloadResponse = await fetch(linkResult.downloadUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies for session
      })
      
      if (!downloadResponse.ok) {
        // Try to get error message, but if it's a file stream, it might not be JSON
        let errorMessage = 'Download mislukt'
        try {
          const contentType = downloadResponse.headers.get('Content-Type')
          if (contentType?.includes('application/json')) {
            const errorData = await downloadResponse.json()
            errorMessage = errorData.error || errorMessage
          } else {
            errorMessage = `Download mislukt: ${downloadResponse.status} ${downloadResponse.statusText}`
          }
        } catch {
          errorMessage = `Download mislukt: ${downloadResponse.status}`
        }
        throw new Error(errorMessage)
      }

      // Get filename from Content-Disposition header or use provided filename
      const contentDisposition = downloadResponse.headers.get('Content-Disposition')
      let downloadFileName = fileName
      
      if (contentDisposition) {
        // Try both formats: filename="..." and filename*=UTF-8''...
        const quotedMatch = contentDisposition.match(/filename="([^"]+)"/)
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
        
        if (utf8Match) {
          downloadFileName = decodeURIComponent(utf8Match[1])
        } else if (quotedMatch) {
          downloadFileName = quotedMatch[1]
        } else {
          const simpleMatch = contentDisposition.match(/filename=([^;]+)/)
          if (simpleMatch) {
            downloadFileName = simpleMatch[1].trim().replace(/['"]/g, '')
          }
        }
      }

      // Create blob and trigger DIRECT download (no page navigation)
      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadFileName // Use the filename from server
      link.style.display = 'none' // Hide the link
      document.body.appendChild(link)
      link.click() // Trigger download
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      console.log(`[DigitalProductDownload] ✅ Download started: ${downloadFileName}`)
      
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
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/30">
          <File className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1.5">Downloadbare Bestanden</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Download de digitale bestanden die bij dit product horen
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/40 rounded-xl p-4 shadow-lg shadow-red-500/10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-red-400 font-semibold text-sm uppercase tracking-wide">Download Fout</span>
          </div>
          <p className="text-red-300 text-sm pl-7">{error}</p>
        </div>
      )}

      {/* Digital Products List */}
      <div className="space-y-4">
        {digitalProducts.map((product) => (
          <div
            key={product.id}
            className="group relative overflow-hidden bg-gradient-to-br from-dark-card via-dark-card/95 to-dark-section rounded-xl border border-dark-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 p-5"
          >
            {/* Background gradient effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-primary/5 transition-all duration-500 opacity-0 group-hover:opacity-100" />
            
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              {/* File Info Section */}
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                {/* File Icon with enhanced styling */}
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-dark-section to-dark-card rounded-xl border border-dark-border/50 group-hover:border-primary/30 transition-all duration-300 group-hover:scale-105">
                  {getFileIcon(product.fileType)}
                </div>
                
                {/* File Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white mb-2 truncate group-hover:text-primary transition-colors duration-300">
                    {product.fileName}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {product.fileSize && (
                      <span className="px-2.5 py-1 bg-dark-section/50 rounded-md text-text-secondary border border-dark-border/50">
                        {formatFileSize(product.fileSize)}
                      </span>
                    )}
                    {product.fileType && (
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md border border-primary/20 font-medium">
                        {product.fileType.toUpperCase()}
                      </span>
                    )}
                    {product.downloadLimit && (
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                        Max {product.downloadLimit} downloads
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Button - Enhanced Design */}
              <button
                onClick={() => handleDownload(product.id, product.fileName)}
                disabled={downloading === product.id}
                className="group/btn relative flex-shrink-0 px-6 py-3.5 bg-gradient-to-r from-primary via-primary to-primary/90 text-black font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg overflow-hidden hover:scale-105 active:scale-95"
              >
                {/* Animated background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                
                {/* Button Content */}
                <span className="relative flex items-center gap-2.5">
                  {downloading === product.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Downloaden...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                      <span className="text-sm">Download</span>
                    </>
                  )}
                </span>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Help/Info Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-900/20 via-green-800/15 to-green-900/10 border border-green-500/30 rounded-xl p-5 shadow-lg shadow-green-500/5">
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-400/5 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-bold text-green-400 text-base">Download Tips & Beveiliging</h4>
          </div>
          <ul className="text-sm text-green-300/90 space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Klik op "Download" om het bestand veilig te downloaden</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Bewaar de bestanden op een veilige locatie (versleutelde drive aanbevolen)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Download links zijn <strong className="text-green-200">30 dagen geldig</strong> voor beveiliging</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Bestanden worden versleuteld en beveiligd gedownload</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
