// lib/digital-products.ts
'use client'

import { DigitalProductDatabaseService } from './digital-products-database'

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

  // Database methods
  static async getAllDigitalProducts(): Promise<DigitalProduct[]> {
    try {
      return await DigitalProductDatabaseService.getAllDigitalProducts()
    } catch (error) {
      console.error('Error fetching digital products:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        this.initializeWithDefaults()
        return Object.values(this.digitalProducts)
      }
      return []
    }
  }

  static async getDigitalProductsByProductId(productId: string): Promise<DigitalProduct[]> {
    try {
      return await DigitalProductDatabaseService.getDigitalProductsByProductId(productId)
    } catch (error) {
      console.error('Error fetching digital products by product ID:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        this.initializeWithDefaults()
        return Object.values(this.digitalProducts).filter(p => p.productId === productId)
      }
      return []
    }
  }

  static async getDigitalProduct(digitalProductId: string): Promise<DigitalProduct | null> {
    try {
      return await DigitalProductDatabaseService.getDigitalProduct(digitalProductId)
    } catch (error) {
      console.error('Error fetching digital product:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        this.initializeWithDefaults()
        return this.digitalProducts[digitalProductId] || null
      }
      return null
    }
  }

  static async addDigitalProduct(product: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<DigitalProduct> {
    try {
      return await DigitalProductDatabaseService.addDigitalProduct(product)
    } catch (error) {
      console.error('Error adding digital product:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
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
      throw error
    }
  }

  static async updateDigitalProduct(digitalProductId: string, updates: Partial<DigitalProduct>): Promise<DigitalProduct | null> {
    try {
      return await DigitalProductDatabaseService.updateDigitalProduct(digitalProductId, updates)
    } catch (error) {
      console.error('Error updating digital product:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const product = this.digitalProducts[digitalProductId]
        if (product) {
          const updatedProduct = { ...product, ...updates, updatedAt: new Date().toISOString() }
          this.digitalProducts[digitalProductId] = updatedProduct
          this.saveToStorage()
          return updatedProduct
        }
      }
      return null
    }
  }

  static async deleteDigitalProduct(digitalProductId: string): Promise<boolean> {
    try {
      return await DigitalProductDatabaseService.deleteDigitalProduct(digitalProductId)
    } catch (error) {
      console.error('Error deleting digital product:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        if (this.digitalProducts[digitalProductId]) {
          delete this.digitalProducts[digitalProductId]
          this.saveToStorage()
          return true
        }
      }
      return false
    }
  }

  static async trackDownload(userId: string, digitalProductId: string): Promise<UserDownload> {
    try {
      return await DigitalProductDatabaseService.trackDownload(userId, digitalProductId)
    } catch (error) {
      console.error('Error tracking download:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const downloadKey = `${userId}-${digitalProductId}`
        const existingDownload = this.userDownloads[downloadKey]
        
        if (existingDownload) {
          existingDownload.downloadCount++
          existingDownload.lastDownloadedAt = new Date().toISOString()
        } else {
          this.userDownloads[downloadKey] = {
            id: `download-${Date.now()}`,
            userId,
            digitalProductId,
            downloadCount: 1,
            lastDownloadedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        }
        this.saveToStorage()
        return this.userDownloads[downloadKey]
      }
      throw error
    }
  }

  static async canUserDownload(userId: string, digitalProductId: string): Promise<boolean> {
    try {
      return await DigitalProductDatabaseService.canUserDownload(userId, digitalProductId)
    } catch (error) {
      console.error('Error checking download access:', error)
      // Fallback to localStorage (simplified check)
      if (typeof window !== 'undefined') {
        // For demo purposes, allow access to products 1, 2, 3
        const product = this.digitalProducts[digitalProductId]
        if (product && ['1', '2', '3'].includes(product.productId)) {
          return true
        }
      }
      return false
    }
  }

  static async getUserDownloads(userId: string): Promise<UserDownload[]> {
    try {
      return await DigitalProductDatabaseService.getUserDownloads(userId)
    } catch (error) {
      console.error('Error fetching user downloads:', error)
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        this.initializeWithDefaults()
        return Object.values(this.userDownloads).filter(d => d.userId === userId)
      }
      return []
    }
  }

  static async getDownloadStats(digitalProductId: string): Promise<{ totalDownloads: number, uniqueUsers: number }> {
    try {
      return await DigitalProductDatabaseService.getDownloadStats(digitalProductId)
    } catch (error) {
      console.error('Error getting download stats:', error)
      return { totalDownloads: 0, uniqueUsers: 0 }
    }
  }

  // Legacy localStorage methods (for backward compatibility)
  static getDigitalProductsByProductIdSync(productId: string): DigitalProduct[] {
    if (typeof window === 'undefined') return []
    this.initializeWithDefaults()
    return Object.values(this.digitalProducts).filter(p => p.productId === productId)
  }

  static addDigitalProductSync(product: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>): DigitalProduct {
    if (typeof window === 'undefined') {
      throw new Error('Cannot add digital product on server side')
    }
    
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

  static deleteDigitalProductSync(id: string): boolean {
    if (typeof window === 'undefined') return false
    
    this.initializeWithDefaults()
    if (!this.digitalProducts[id]) return false

    delete this.digitalProducts[id]
    this.saveToStorage()
    return true
  }
}

export default DigitalProductService