// lib/products-database.ts - Database Product Service (without Prisma)
import { DatabaseService } from '@/lib/database-direct'
import { Product } from './products'

export type ProductType = 'COURSE' | 'EBOOK' | 'REVIEW'

export class DatabaseProductService {
  // Convert database row to Product interface
  private static convertDbProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description,
      shortDescription: dbProduct.shortDescription,
      price: parseFloat(dbProduct.price || '0'),
      type: dbProduct.type?.toLowerCase() as 'course' | 'ebook' | 'review',
      category: dbProduct.category?.toLowerCase() as 'microfoon' | 'webcam' | 'accessoires' | undefined,
      isActive: dbProduct.isActive || false,
      featured: dbProduct.featured || false,
      comingSoon: dbProduct.comingSoon || false,
      sales: parseInt(dbProduct.sales || '0', 10),
      createdAt: dbProduct.createdAt ? new Date(dbProduct.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: dbProduct.updatedAt ? new Date(dbProduct.updatedAt).toISOString() : new Date().toISOString(),
      duration: dbProduct.duration,
      level: dbProduct.level,
      students: parseInt(dbProduct.students || '0', 10),
      lessons: parseInt(dbProduct.lessons || '0', 10),
      imageId: dbProduct.imageId,
      imageUrl: dbProduct.imageUrl,
      imagePublicId: dbProduct.imagePublicId,
      externalUrl: dbProduct.externalUrl,
    }
  }

  static async getAllProducts(): Promise<Product[]> {
    try {
      const products = await DatabaseService.query(
        'SELECT * FROM products ORDER BY "createdAt" DESC'
      )
      return products.map(this.convertDbProduct)
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM products WHERE id = $1',
        [productId]
      )
      return result.length > 0 ? this.convertDbProduct(result[0]) : null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  static async getProductsByType(type: 'course' | 'ebook' | 'review'): Promise<Product[]> {
    try {
      const products = await DatabaseService.query(
        'SELECT * FROM products WHERE type = $1 AND "isActive" = true ORDER BY "createdAt" DESC',
        [type.toUpperCase()]
      )
      return products.map(this.convertDbProduct)
    } catch (error) {
      console.error('Error fetching products by type:', error)
      return []
    }
  }

  static async getActiveProducts(): Promise<Product[]> {
    try {
      const products = await DatabaseService.query(
        'SELECT * FROM products WHERE "isActive" = true ORDER BY "createdAt" DESC'
      )
      return products.map(this.convertDbProduct)
    } catch (error) {
      console.error('Error fetching active products:', error)
      return []
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await DatabaseService.query(
        'SELECT * FROM products WHERE featured = true AND "isActive" = true ORDER BY "createdAt" DESC'
      )
      return products.map(this.convertDbProduct)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const id = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const result = await DatabaseService.query(
        `INSERT INTO products (
          id, name, description, "shortDescription", price, type, category, 
          "isActive", featured, "comingSoon", sales, duration, level, 
          students, lessons, "imageId", "imageUrl", "imagePublicId", "externalUrl",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
        ) RETURNING *`,
        [
          id,
          productData.name,
          productData.description,
          productData.shortDescription,
          productData.price,
          productData.type?.toUpperCase(),
          productData.category?.toUpperCase(),
          productData.isActive || false,
          productData.featured || false,
          productData.comingSoon || false,
          productData.sales || 0,
          productData.duration,
          productData.level,
          productData.students || 0,
          productData.lessons || 0,
          productData.imageId,
          productData.imageUrl,
          productData.imagePublicId,
          productData.externalUrl
        ]
      )
      return this.convertDbProduct(result[0])
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const updateFields: string[] = []
      const updateValues: any[] = []
      let paramIndex = 1

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`)
        updateValues.push(updates.name)
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`)
        updateValues.push(updates.description)
      }
      if (updates.shortDescription !== undefined) {
        updateFields.push(`"shortDescription" = $${paramIndex++}`)
        updateValues.push(updates.shortDescription)
      }
      if (updates.price !== undefined) {
        updateFields.push(`price = $${paramIndex++}`)
        updateValues.push(updates.price)
      }
      if (updates.type !== undefined) {
        updateFields.push(`type = $${paramIndex++}`)
        updateValues.push(updates.type.toUpperCase())
      }
      if (updates.category !== undefined) {
        updateFields.push(`category = $${paramIndex++}`)
        updateValues.push(updates.category?.toUpperCase())
      }
      if (updates.isActive !== undefined) {
        updateFields.push(`"isActive" = $${paramIndex++}`)
        updateValues.push(updates.isActive)
      }
      if (updates.featured !== undefined) {
        updateFields.push(`featured = $${paramIndex++}`)
        updateValues.push(updates.featured)
      }
      if (updates.comingSoon !== undefined) {
        updateFields.push(`"comingSoon" = $${paramIndex++}`)
        updateValues.push(updates.comingSoon)
      }
      if (updates.sales !== undefined) {
        updateFields.push(`sales = $${paramIndex++}`)
        updateValues.push(updates.sales)
      }
      if (updates.duration !== undefined) {
        updateFields.push(`duration = $${paramIndex++}`)
        updateValues.push(updates.duration)
      }
      if (updates.level !== undefined) {
        updateFields.push(`level = $${paramIndex++}`)
        updateValues.push(updates.level)
      }
      if (updates.students !== undefined) {
        updateFields.push(`students = $${paramIndex++}`)
        updateValues.push(updates.students)
      }
      if (updates.lessons !== undefined) {
        updateFields.push(`lessons = $${paramIndex++}`)
        updateValues.push(updates.lessons)
      }
      if (updates.imageId !== undefined) {
        updateFields.push(`"imageId" = $${paramIndex++}`)
        updateValues.push(updates.imageId)
      }
      if (updates.imageUrl !== undefined) {
        updateFields.push(`"imageUrl" = $${paramIndex++}`)
        updateValues.push(updates.imageUrl)
      }
      if (updates.imagePublicId !== undefined) {
        updateFields.push(`"imagePublicId" = $${paramIndex++}`)
        updateValues.push(updates.imagePublicId)
      }
      if (updates.externalUrl !== undefined) {
        updateFields.push(`"externalUrl" = $${paramIndex++}`)
        updateValues.push(updates.externalUrl)
      }

      if (updateFields.length === 0) {
        return this.getProduct(productId)
      }

      updateFields.push(`"updatedAt" = NOW()`)
      updateValues.push(productId)

      const result = await DatabaseService.query(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        updateValues
      )

      return result.length > 0 ? this.convertDbProduct(result[0]) : null
    } catch (error) {
      console.error('Error updating product:', error)
      return null
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      await DatabaseService.query(
        'DELETE FROM products WHERE id = $1',
        [productId]
      )
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  static async getProductsByCategory(category: 'microfoon' | 'webcam' | 'accessoires'): Promise<Product[]> {
    try {
      const products = await DatabaseService.query(
        'SELECT * FROM products WHERE category = $1 AND type = $2 AND "isActive" = true ORDER BY "createdAt" DESC',
        [category.toUpperCase(), 'REVIEW']
      )
      return products.map(this.convertDbProduct)
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const products = await DatabaseService.query(
        `SELECT * FROM products 
         WHERE "isActive" = true 
         AND (
           LOWER(name) LIKE LOWER($1) 
           OR LOWER(description) LIKE LOWER($1) 
           OR LOWER("shortDescription") LIKE LOWER($1)
         )
         ORDER BY "createdAt" DESC`,
        [`%${query}%`]
      )
      return products.map(this.convertDbProduct)
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }
}