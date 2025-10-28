// lib/digital-products-database.ts - Database Digital Products Service
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

export class DigitalProductDatabaseService {
  // Convert Prisma DigitalProduct to our DigitalProduct interface
  private static convertPrismaDigitalProduct(prismaProduct: any): DigitalProduct {
    return {
      id: prismaProduct.id,
      productId: prismaProduct.productId,
      fileName: prismaProduct.fileName,
      fileType: prismaProduct.mimeType.toLowerCase() as 'pdf' | 'video' | 'audio' | 'zip' | 'doc' | 'docx',
      fileSize: prismaProduct.fileSize,
      fileUrl: prismaProduct.filePath, // Use filePath as fileUrl
      secureUrl: prismaProduct.filePath, // Use filePath as secureUrl
      downloadLimit: prismaProduct.downloadLimit,
      expiresAt: prismaProduct.expiresAt?.toISOString(),
      createdAt: prismaProduct.createdAt.toISOString(),
      updatedAt: prismaProduct.createdAt.toISOString(), // Prisma schema doesn't have updatedAt
    }
  }

  // Convert Prisma UserDownload to our UserDownload interface
  private static convertPrismaUserDownload(prismaDownload: any): UserDownload {
    return {
      id: prismaDownload.id,
      userId: prismaDownload.userId,
      digitalProductId: prismaDownload.digitalProductId,
      downloadCount: prismaDownload.downloadCount,
      lastDownloadedAt: prismaDownload.lastDownloadedAt.toISOString(),
      createdAt: prismaDownload.createdAt.toISOString(),
    }
  }

  static async getAllDigitalProducts(): Promise<DigitalProduct[]> {
    try {
      const products = await prisma.digitalProduct.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaDigitalProduct)
    } catch (error) {
      console.error('Error fetching digital products:', error)
      return []
    }
  }

  static async getDigitalProductsByProductId(productId: string): Promise<DigitalProduct[]> {
    try {
      const products = await prisma.digitalProduct.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaDigitalProduct)
    } catch (error) {
      console.error('Error fetching digital products by product ID:', error)
      return []
    }
  }

  static async getDigitalProduct(digitalProductId: string): Promise<DigitalProduct | null> {
    try {
      const product = await prisma.digitalProduct.findUnique({
        where: { id: digitalProductId }
      })
      return product ? this.convertPrismaDigitalProduct(product) : null
    } catch (error) {
      console.error('Error fetching digital product:', error)
      return null
    }
  }

  static async addDigitalProduct(product: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<DigitalProduct> {
    try {
      const newProduct = await prisma.digitalProduct.create({
        data: {
          productId: product.productId,
          fileName: product.fileName,
          filePath: product.fileUrl, // Use fileUrl as filePath
          fileSize: product.fileSize,
          mimeType: product.fileType.toUpperCase(),
          downloadLimit: product.downloadLimit,
          expiresAt: product.expiresAt ? new Date(product.expiresAt) : null,
        }
      })
      return this.convertPrismaDigitalProduct(newProduct)
    } catch (error) {
      console.error('Error adding digital product:', error)
      throw error
    }
  }

  static async updateDigitalProduct(digitalProductId: string, updates: Partial<DigitalProduct>): Promise<DigitalProduct | null> {
    try {
      const updatedProduct = await prisma.digitalProduct.update({
        where: { id: digitalProductId },
        data: {
          fileName: updates.fileName,
          filePath: updates.fileUrl, // Use fileUrl as filePath
          fileSize: updates.fileSize,
          mimeType: updates.fileType?.toUpperCase(),
          downloadLimit: updates.downloadLimit,
          expiresAt: updates.expiresAt ? new Date(updates.expiresAt) : undefined,
        }
      })
      return this.convertPrismaDigitalProduct(updatedProduct)
    } catch (error) {
      console.error('Error updating digital product:', error)
      return null
    }
  }

  static async deleteDigitalProduct(digitalProductId: string): Promise<boolean> {
    try {
      await prisma.digitalProduct.delete({
        where: { id: digitalProductId }
      })
      return true
    } catch (error) {
      console.error('Error deleting digital product:', error)
      return false
    }
  }

  static async getUserDownloads(userId: string): Promise<UserDownload[]> {
    try {
      const downloads = await prisma.userDownload.findMany({
        where: { userId },
        orderBy: { lastDownloadedAt: 'desc' }
      })
      return downloads.map(this.convertPrismaUserDownload)
    } catch (error) {
      console.error('Error fetching user downloads:', error)
      return []
    }
  }

  static async getUserDownload(userId: string, digitalProductId: string): Promise<UserDownload | null> {
    try {
      const download = await prisma.userDownload.findFirst({
        where: {
          userId,
          digitalProductId
        }
      })
      return download ? this.convertPrismaUserDownload(download) : null
    } catch (error) {
      console.error('Error fetching user download:', error)
      return null
    }
  }

  static async trackDownload(userId: string, digitalProductId: string): Promise<UserDownload> {
    try {
      // Check if download record exists
      const existingDownload = await prisma.userDownload.findFirst({
        where: {
          userId,
          digitalProductId
        }
      })

      if (existingDownload) {
        // Update existing download
        const updatedDownload = await prisma.userDownload.update({
          where: { id: existingDownload.id },
          data: {
            downloadCount: existingDownload.downloadCount + 1,
            lastDownloadedAt: new Date()
          }
        })
        return this.convertPrismaUserDownload(updatedDownload)
      } else {
        // Create new download record
        const newDownload = await prisma.userDownload.create({
          data: {
            userId,
            digitalProductId,
            downloadCount: 1,
            lastDownloadedAt: new Date()
          }
        })
        return this.convertPrismaUserDownload(newDownload)
      }
    } catch (error) {
      console.error('Error tracking download:', error)
      throw error
    }
  }

  static async canUserDownload(userId: string, digitalProductId: string): Promise<boolean> {
    try {
      // Check if user has purchased the product
      const digitalProduct = await prisma.digitalProduct.findUnique({
        where: { id: digitalProductId },
        include: {
          product: {
            include: {
              orderItems: {
                include: {
                  order: true
                }
              }
            }
          }
        }
      })

      if (!digitalProduct) return false

      // Check if user has purchased the product
      const hasPurchased = digitalProduct.product.orderItems.some(item => 
        item.order.userId === userId && item.order.status === 'PAID'
      )

      if (!hasPurchased) return false

      // Check download limit
      const userDownload = await this.getUserDownload(userId, digitalProductId)
      if (userDownload && digitalProduct.downloadLimit) {
        return userDownload.downloadCount < digitalProduct.downloadLimit
      }

      // Check expiration
      if (digitalProduct.expiresAt) {
        return new Date() < new Date(digitalProduct.expiresAt)
      }

      return true
    } catch (error) {
      console.error('Error checking download access:', error)
      return false
    }
  }

  static async getDownloadStats(digitalProductId: string): Promise<{ totalDownloads: number, uniqueUsers: number }> {
    try {
      const downloads = await prisma.userDownload.findMany({
        where: { digitalProductId }
      })

      const totalDownloads = downloads.reduce((sum, download) => sum + download.downloadCount, 0)
      const uniqueUsers = new Set(downloads.map(download => download.userId)).size

      return { totalDownloads, uniqueUsers }
    } catch (error) {
      console.error('Error getting download stats:', error)
      return { totalDownloads: 0, uniqueUsers: 0 }
    }
  }
}
