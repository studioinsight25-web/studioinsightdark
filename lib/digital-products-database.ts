// lib/digital-products-database.ts - Database Digital Products Service (without Prisma)
import { DatabaseService } from '@/lib/database-direct'

export interface DigitalProduct {
  id: string
  productId: string
  fileName: string
  fileType: 'pdf' | 'video' | 'audio' | 'zip' | 'doc' | 'docx'
  fileSize: number
  fileUrl: string // URL to external storage (Cloudinary, etc.) - optional if fileData is present
  secureUrl?: string
  fileData?: Buffer | Uint8Array // Binary file data stored in database (BYTEA)
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
  static async getAllDigitalProducts(): Promise<DigitalProduct[]> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM "digitalProducts" ORDER BY "createdAt" DESC'
      )
      return result.map(this.convertDbDigitalProduct)
    } catch (error) {
      console.error('Error fetching digital products:', error)
      return []
    }
  }

  static async getDigitalProductsByProductId(productId: string): Promise<DigitalProduct[]> {
    try {
      console.log(`[getDigitalProductsByProductId] Searching for digital products with productId: ${productId}`)
      
      const result = await DatabaseService.query(
        'SELECT * FROM "digitalProducts" WHERE "productId" = $1 ORDER BY "createdAt" DESC',
        [productId]
      )
      
      console.log(`[getDigitalProductsByProductId] Found ${result.length} digital products in database for productId: ${productId}`)
      
      if (result.length === 0) {
        // Check if there are any digital products at all
        const allProducts = await DatabaseService.query('SELECT id, "productId", "fileName" FROM "digitalProducts" LIMIT 10')
        console.log(`[getDigitalProductsByProductId] Sample digital products in database:`, allProducts.map((p: any) => ({
          id: p.id,
          productId: p.productId,
          fileName: p.fileName
        })))
      }
      
      return result.map(this.convertDbDigitalProduct)
    } catch (error) {
      console.error('[getDigitalProductsByProductId] Error fetching digital products by product ID:', error)
      return []
    }
  }

  static async getDigitalProduct(digitalProductId: string): Promise<DigitalProduct | null> {
    try {
      // Don't select fileData by default (it's large) - only metadata
      const result = await DatabaseService.query(
        'SELECT id, "productId", "fileName", "filePath", "fileSize", "mimeType", "downloadLimit", "expiresAt", "createdAt", "updatedAt" FROM "digitalProducts" WHERE id = $1',
        [digitalProductId]
      )
      return result.length > 0 ? this.convertDbDigitalProduct(result[0]) : null
    } catch (error) {
      console.error('Error fetching digital product:', error)
      return null
    }
  }
  
  static async getDigitalProductWithData(digitalProductId: string): Promise<DigitalProduct | null> {
    try {
      // Select fileData when needed for downloads
      const result = await DatabaseService.query(
        'SELECT id, "productId", "fileName", "filePath", "fileData", "fileSize", "mimeType", "downloadLimit", "expiresAt", "createdAt", "updatedAt" FROM "digitalProducts" WHERE id = $1',
        [digitalProductId]
      )
      return result.length > 0 ? this.convertDbDigitalProduct(result[0]) : null
    } catch (error) {
      console.error('Error fetching digital product with data:', error)
      return null
    }
  }

  static async addDigitalProduct(product: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<DigitalProduct> {
    try {
      const id = `digital-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // If fileData is provided, store it directly in database (BYTEA)
      // Otherwise, store fileUrl (external storage like Cloudinary)
      const hasFileData = product.fileData && product.fileData.length > 0
      
      console.log(`[DatabaseOrderService] Adding digital product:`, {
        id,
        productId: product.productId,
        fileName: product.fileName,
        hasFileData,
        fileDataLength: product.fileData?.length || 0,
        fileUrl: product.fileUrl || ''
      })
      
      if (hasFileData) {
        // Store file data directly in database
        console.log(`[DatabaseOrderService] Inserting with fileData (BYTEA)`)
        try {
          const result = await DatabaseService.query(
            'INSERT INTO "digitalProducts" (id, "productId", "fileName", "filePath", "fileData", "fileSize", "mimeType", "downloadLimit", "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id, "productId", "fileName", "filePath", "fileSize", "mimeType", "downloadLimit", "expiresAt", "createdAt", "updatedAt"',
            [
              id,
              product.productId,
              product.fileName,
              '', // filePath is empty when using fileData
              product.fileData, // BYTEA binary data
              product.fileSize,
              product.fileType.toUpperCase(),
              product.downloadLimit,
              product.expiresAt ? new Date(product.expiresAt) : null
            ]
          )
          console.log(`[DatabaseOrderService] ✅ Inserted digital product with fileData`)
          return this.convertDbDigitalProduct(result[0])
        } catch (dbError) {
          console.error(`[DatabaseOrderService] ❌ Database error inserting with fileData:`, dbError)
          throw dbError
        }
      } else {
        // Store file URL (external storage)
        console.log(`[DatabaseOrderService] Inserting with fileUrl (external storage)`)
        try {
          const result = await DatabaseService.query(
            'INSERT INTO "digitalProducts" (id, "productId", "fileName", "filePath", "fileSize", "mimeType", "downloadLimit", "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id, "productId", "fileName", "filePath", "fileSize", "mimeType", "downloadLimit", "expiresAt", "createdAt", "updatedAt"',
            [
              id,
              product.productId,
              product.fileName,
              product.fileUrl,
              product.fileSize,
              product.fileType.toUpperCase(),
              product.downloadLimit,
              product.expiresAt ? new Date(product.expiresAt) : null
            ]
          )
          console.log(`[DatabaseOrderService] ✅ Inserted digital product with fileUrl`)
          return this.convertDbDigitalProduct(result[0])
        } catch (dbError) {
          console.error(`[DatabaseOrderService] ❌ Database error inserting with fileUrl:`, dbError)
          throw dbError
        }
      }
    } catch (error) {
      console.error('[DatabaseOrderService] Error adding digital product:', error)
      throw error
    }
  }

  static async updateDigitalProduct(digitalProductId: string, updates: Partial<DigitalProduct>): Promise<DigitalProduct | null> {
    try {
      const updateFields: string[] = []
      const updateValues: any[] = []
      let paramIndex = 1

      if (updates.fileName !== undefined) {
        updateFields.push(`"fileName" = $${paramIndex++}`)
        updateValues.push(updates.fileName)
      }
      if (updates.fileUrl !== undefined) {
        updateFields.push(`"filePath" = $${paramIndex++}`)
        updateValues.push(updates.fileUrl)
      }
      if (updates.fileSize !== undefined) {
        updateFields.push(`"fileSize" = $${paramIndex++}`)
        updateValues.push(updates.fileSize)
      }
      if (updates.fileType !== undefined) {
        updateFields.push(`"mimeType" = $${paramIndex++}`)
        updateValues.push(updates.fileType.toUpperCase())
      }
      if (updates.downloadLimit !== undefined) {
        updateFields.push(`"downloadLimit" = $${paramIndex++}`)
        updateValues.push(updates.downloadLimit)
      }
      if (updates.expiresAt !== undefined) {
        updateFields.push(`"expiresAt" = $${paramIndex++}`)
        updateValues.push(updates.expiresAt ? new Date(updates.expiresAt) : null)
      }

      if (updateFields.length === 0) {
        return this.getDigitalProduct(digitalProductId)
      }

      updateFields.push(`"updatedAt" = NOW()`)
      updateValues.push(digitalProductId)

      const result = await DatabaseService.query(
        `UPDATE "digitalProducts" SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        updateValues
      )

      return result.length > 0 ? this.convertDbDigitalProduct(result[0]) : null
    } catch (error) {
      console.error('Error updating digital product:', error)
      return null
    }
  }

  static async deleteDigitalProduct(digitalProductId: string): Promise<boolean> {
    try {
      await DatabaseService.query(
        'DELETE FROM "digitalProducts" WHERE id = $1',
        [digitalProductId]
      )
      return true
    } catch (error) {
      console.error('Error deleting digital product:', error)
      return false
    }
  }

  static async getUserDownloads(userId: string): Promise<UserDownload[]> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM "userDownloads" WHERE "userId" = $1 ORDER BY "lastDownloadedAt" DESC',
        [userId]
      )
      return result.map(this.convertDbUserDownload)
    } catch (error) {
      console.error('Error fetching user downloads:', error)
      return []
    }
  }

  static async getUserDownload(userId: string, digitalProductId: string): Promise<UserDownload | null> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM "userDownloads" WHERE "userId" = $1 AND "digitalProductId" = $2 LIMIT 1',
        [userId, digitalProductId]
      )
      return result.length > 0 ? this.convertDbUserDownload(result[0]) : null
    } catch (error) {
      console.error('Error fetching user download:', error)
      return null
    }
  }

  static async trackDownload(userId: string, digitalProductId: string): Promise<UserDownload> {
    try {
      const existing = await this.getUserDownload(userId, digitalProductId)

      if (existing) {
        const result = await DatabaseService.query(
          'UPDATE "userDownloads" SET "downloadCount" = "downloadCount" + 1, "lastDownloadedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1 RETURNING *',
          [existing.id]
        )
        return this.convertDbUserDownload(result[0])
      } else {
        const id = `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const result = await DatabaseService.query(
          'INSERT INTO "userDownloads" (id, "userId", "digitalProductId", "downloadCount", "lastDownloadedAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, 1, NOW(), NOW(), NOW()) RETURNING *',
          [id, userId, digitalProductId]
        )
        return this.convertDbUserDownload(result[0])
      }
    } catch (error) {
      console.error('Error tracking download:', error)
      throw error
    }
  }

  static async canUserDownload(userId: string, digitalProductId: string): Promise<boolean> {
    try {
      // First, get the digital product to find its associated productId
      const digitalProduct = await this.getDigitalProduct(digitalProductId)
      if (!digitalProduct) return false

      // STRICT CHECK: Accept PAID status OR order with payment_id (NOT PENDING/FAILED/REFUNDED)
      // This ensures downloads are only available after confirmed payment
      // PENDING status is rejected even with payment_id (payment started but not confirmed)
      console.log(`[canUserDownload] Checking if user ${userId} can download digital product ${digitalProductId} (productId: ${digitalProduct.productId})`)
      
      let productResult
      try {
        // Try UUID first - Accept PAID OR (has payment_id AND NOT PENDING/FAILED/REFUNDED)
        productResult = await DatabaseService.query(
          `SELECT o.id, o.status, o.payment_id, oi.product_id as "productId" 
           FROM orders o 
           JOIN order_items oi ON o.id = oi.order_id 
           WHERE oi.product_id = $1 
             AND o.user_id = $2::uuid 
             AND (
               UPPER(TRIM(o.status)) = 'PAID' 
               OR (o.payment_id IS NOT NULL AND o.payment_id != '' AND UPPER(TRIM(o.status)) NOT IN ('PENDING', 'FAILED', 'REFUNDED'))
             )
           LIMIT 1`,
          [digitalProduct.productId, userId]
        )
      } catch (uuidError) {
        // Fallback to text comparison - Accept PAID OR (has payment_id AND NOT PENDING/FAILED/REFUNDED)
        try {
          productResult = await DatabaseService.query(
            `SELECT o.id, o.status, o.payment_id, oi.product_id as "productId" 
             FROM orders o 
             JOIN order_items oi ON o.id = oi.order_id 
             WHERE oi.product_id = $1 
               AND o.user_id::text = $2 
               AND (
                 UPPER(TRIM(o.status)) = 'PAID' 
                 OR (o.payment_id IS NOT NULL AND o.payment_id != '' AND UPPER(TRIM(o.status)) NOT IN ('PENDING', 'FAILED', 'REFUNDED'))
               )
             LIMIT 1`,
            [digitalProduct.productId, userId]
          )
        } catch (textError) {
          // Last fallback: try camelCase
          try {
            productResult = await DatabaseService.query(
              `SELECT o.id, oi."productId" 
               FROM orders o 
               JOIN "orderItems" oi ON o.id = oi."orderId" 
               WHERE oi."productId" = $1 
                 AND o."userId" = $2 
                 AND UPPER(o.status) = 'PAID'
               LIMIT 1`,
              [digitalProduct.productId, userId]
            )
          } catch (camelError) {
            console.error('[canUserDownload] All query attempts failed:', camelError)
            return false
          }
        }
      }

      if (productResult.length === 0) {
        console.log(`[canUserDownload] ❌ Access denied: User ${userId} has not purchased product ${digitalProduct.productId}`)
        return false
      }
      
      console.log(`[canUserDownload] ✅ User ${userId} has purchased product ${digitalProduct.productId}`)

      // Download limit check - TEMPORARILY DISABLED FOR TESTING
      // const userDownload = await this.getUserDownload(userId, digitalProductId)
      // if (userDownload && digitalProduct.downloadLimit) {
      //   if (userDownload.downloadCount >= digitalProduct.downloadLimit) {
      //     console.log(`[canUserDownload] ❌ Access denied: Download limit exceeded for user ${userId}, product ${digitalProductId} (${userDownload.downloadCount}/${digitalProduct.downloadLimit})`)
      //     return false
      //   }
      //   console.log(`[canUserDownload] Download count: ${userDownload.downloadCount}/${digitalProduct.downloadLimit}`)
      // }

      // Product expiration check - TEMPORARILY DISABLED FOR TESTING
      // if (digitalProduct.expiresAt) {
      //   const expirationDate = new Date(digitalProduct.expiresAt)
      //   if (new Date() >= expirationDate) {
      //     console.log(`[canUserDownload] ❌ Access denied: Digital product expired for user ${userId}, product ${digitalProductId}`)
      //     return false
      //   }
      // }

      console.log(`[canUserDownload] ✅ User ${userId} can download digital product ${digitalProductId}`)
      return true
    } catch (error) {
      console.error('Error checking download access:', error)
      return false
    }
  }

  /**
   * Check if user has purchased a product (by productId, not digitalProductId)
   */
  static async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    try {
      console.log(`[hasUserPurchasedProduct] Checking if user ${userId} purchased product ${productId}`)
      
      // STRICT CHECK: Accept PAID status OR order with payment_id (NOT PENDING/FAILED/REFUNDED)
      // This ensures downloads are only available for confirmed, paid orders
      // PENDING status is rejected even with payment_id (payment started but not confirmed)
      let result
      try {
        // Try UUID first - Accept PAID OR (has payment_id AND NOT PENDING/FAILED/REFUNDED)
        result = await DatabaseService.query(
          `SELECT o.id, o.status, o.payment_id
           FROM orders o 
           JOIN order_items oi ON o.id = oi.order_id 
           WHERE oi.product_id = $1 
             AND o.user_id = $2::uuid 
             AND (
               UPPER(TRIM(o.status)) = 'PAID' 
               OR (o.payment_id IS NOT NULL AND o.payment_id != '' AND UPPER(TRIM(o.status)) NOT IN ('PENDING', 'FAILED', 'REFUNDED'))
             )
           LIMIT 1`,
          [productId, userId]
        )
      } catch (uuidError) {
        // Fallback to text comparison - Accept PAID OR (has payment_id AND NOT PENDING/FAILED/REFUNDED)
        try {
          result = await DatabaseService.query(
            `SELECT o.id, o.status, o.payment_id
             FROM orders o 
             JOIN order_items oi ON o.id = oi.order_id 
             WHERE oi.product_id = $1 
               AND o.user_id::text = $2 
               AND (
                 UPPER(TRIM(o.status)) = 'PAID' 
                 OR (o.payment_id IS NOT NULL AND o.payment_id != '' AND UPPER(TRIM(o.status)) NOT IN ('PENDING', 'FAILED', 'REFUNDED'))
               )
             LIMIT 1`,
            [productId, userId]
          )
        } catch (textError) {
          // Last fallback: try camelCase
          try {
            result = await DatabaseService.query(
              `SELECT o.id 
               FROM orders o 
               JOIN "orderItems" oi ON o.id = oi."orderId" 
               WHERE oi."productId" = $1 
                 AND o."userId" = $2 
                 AND UPPER(o.status) = 'PAID'
               LIMIT 1`,
              [productId, userId]
            )
          } catch (camelError) {
            console.error('[hasUserPurchasedProduct] All query attempts failed:', camelError)
            return false
          }
        }
      }
      
      const hasPurchased = result.length > 0
      if (hasPurchased) {
        console.log(`[hasUserPurchasedProduct] ✅ User ${userId} HAS purchased product ${productId}`)
      } else {
        console.log(`[hasUserPurchasedProduct] ❌ User ${userId} has NOT purchased product ${productId}`)
      }
      
      return hasPurchased
    } catch (error) {
      console.error('[hasUserPurchasedProduct] Error checking product purchase:', error)
      return false
    }
  }

  static async getDownloadStats(digitalProductId: string): Promise<{ totalDownloads: number, uniqueUsers: number }> {
    try {
      const result = await DatabaseService.query(
        'SELECT SUM("downloadCount") as "totalDownloads", COUNT(DISTINCT "userId") as "uniqueUsers" FROM "userDownloads" WHERE "digitalProductId" = $1',
        [digitalProductId]
      )
      return {
        totalDownloads: parseInt(result[0].totalDownloads || '0', 10),
        uniqueUsers: parseInt(result[0].uniqueUsers || '0', 10)
      }
    } catch (error) {
      console.error('Error getting download stats:', error)
      return { totalDownloads: 0, uniqueUsers: 0 }
    }
  }

  private static convertDbDigitalProduct(dbProduct: any): DigitalProduct {
    return {
      id: dbProduct.id,
      productId: dbProduct.productId,
      fileName: dbProduct.fileName,
      fileType: dbProduct.mimeType?.toLowerCase() as 'pdf' | 'video' | 'audio' | 'zip' | 'doc' | 'docx',
      fileSize: parseInt(dbProduct.fileSize || '0', 10),
      fileUrl: dbProduct.filePath || '',
      secureUrl: dbProduct.filePath || '',
      fileData: dbProduct.fileData ? Buffer.from(dbProduct.fileData) : undefined, // Convert BYTEA to Buffer
      downloadLimit: dbProduct.downloadLimit,
      expiresAt: dbProduct.expiresAt ? new Date(dbProduct.expiresAt).toISOString() : undefined,
      createdAt: dbProduct.createdAt ? new Date(dbProduct.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: dbProduct.updatedAt ? new Date(dbProduct.updatedAt).toISOString() : new Date().toISOString()
    }
  }

  private static convertDbUserDownload(dbDownload: any): UserDownload {
    return {
      id: dbDownload.id,
      userId: dbDownload.userId,
      digitalProductId: dbDownload.digitalProductId,
      downloadCount: parseInt(dbDownload.downloadCount || '0', 10),
      lastDownloadedAt: dbDownload.lastDownloadedAt ? new Date(dbDownload.lastDownloadedAt).toISOString() : new Date().toISOString(),
      createdAt: dbDownload.createdAt ? new Date(dbDownload.createdAt).toISOString() : new Date().toISOString()
    }
  }
}