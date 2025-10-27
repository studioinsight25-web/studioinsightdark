// lib/digital-products.ts
'use client'

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

export interface UserDownload {
  id: string
  userId: string
  digitalProductId: string
  downloadCount: number
  lastDownloadedAt: string
  createdAt: string
}

class DigitalProductService {
  private static digitalProducts: Record<string, DigitalProduct> = {}
  private static userDownloads: Record<string, UserDownload> = {}

  static initializeWithDefaults() {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('studio-insight-digital-products')
    if (stored) {
      this.digitalProducts = JSON.parse(stored)
    }

    const storedDownloads = localStorage.getItem('studio-insight-user-downloads')
    if (storedDownloads) {
      this.userDownloads = JSON.parse(storedDownloads)
    }
  }

  static saveToStorage() {
    if (typeof window === 'undefined') return

    localStorage.setItem('studio-insight-digital-products', JSON.stringify(this.digitalProducts))
    localStorage.setItem('studio-insight-user-downloads', JSON.stringify(this.userDownloads))
  }

  static addDigitalProduct(product: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>): DigitalProduct {
    const id = `digital-${Date.now()}`
    const newProduct: DigitalProduct = {
      ...product,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.digitalProducts[id] = newProduct
    this.saveToStorage()
    return newProduct
  }

  static getDigitalProductsByProductId(productId: string): DigitalProduct[] {
    this.initializeWithDefaults()
    return Object.values(this.digitalProducts).filter(dp => dp.productId === productId)
  }

  static getDigitalProduct(id: string): DigitalProduct | null {
    this.initializeWithDefaults()
    return this.digitalProducts[id] || null
  }

  static updateDigitalProduct(id: string, updates: Partial<DigitalProduct>): DigitalProduct | null {
    this.initializeWithDefaults()
    if (!this.digitalProducts[id]) return null

    this.digitalProducts[id] = {
      ...this.digitalProducts[id],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    this.saveToStorage()
    return this.digitalProducts[id]
  }

  static deleteDigitalProduct(id: string): boolean {
    this.initializeWithDefaults()
    if (!this.digitalProducts[id]) return false

    delete this.digitalProducts[id]
    this.saveToStorage()
    return true
  }

  static trackDownload(userId: string, digitalProductId: string): UserDownload {
    this.initializeWithDefaults()
    
    const downloadKey = `${userId}-${digitalProductId}`
    const existingDownload = this.userDownloads[downloadKey]

    if (existingDownload) {
      existingDownload.downloadCount += 1
      existingDownload.lastDownloadedAt = new Date().toISOString()
      this.userDownloads[downloadKey] = existingDownload
    } else {
      const newDownload: UserDownload = {
        id: `download-${Date.now()}`,
        userId,
        digitalProductId,
        downloadCount: 1,
        lastDownloadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
      this.userDownloads[downloadKey] = newDownload
    }

    this.saveToStorage()
    return this.userDownloads[downloadKey]
  }

  static getUserDownloads(userId: string): UserDownload[] {
    this.initializeWithDefaults()
    return Object.values(this.userDownloads).filter(download => download.userId === userId)
  }

  static canUserDownload(userId: string, digitalProductId: string): boolean {
    this.initializeWithDefaults()
    
    const digitalProduct = this.digitalProducts[digitalProductId]
    if (!digitalProduct) return false

    // Check if product has download limit
    if (digitalProduct.downloadLimit) {
      const downloadKey = `${userId}-${digitalProductId}`
      const userDownload = this.userDownloads[downloadKey]
      
      if (userDownload && userDownload.downloadCount >= digitalProduct.downloadLimit) {
        return false
      }
    }

    // Check if product has expired
    if (digitalProduct.expiresAt) {
      const expirationDate = new Date(digitalProduct.expiresAt)
      if (expirationDate < new Date()) {
        return false
      }
    }

    return true
  }

  static generateSecureDownloadUrl(digitalProductId: string, userId: string): string | null {
    this.initializeWithDefaults()
    
    const digitalProduct = this.digitalProducts[digitalProductId]
    if (!digitalProduct) return null

    // Check if user can download
    if (!this.canUserDownload(userId, digitalProductId)) {
      return null
    }

    // Generate secure URL with expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const secureUrl = `${digitalProduct.fileUrl}?token=${btoa(`${userId}-${digitalProductId}-${expiresAt}`)}&expires=${expiresAt}`
    
    return secureUrl
  }
}

export default DigitalProductService
