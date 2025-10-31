// lib/cart-database.ts - Database Cart Service (without Prisma)
import { DatabaseService } from '@/lib/database-direct'
import { Product } from './products'

export interface CartItem {
  id: string
  userId: string
  productId: string
  product?: Product
  quantity: number
  createdAt: string
  updatedAt: string
}

export class DatabaseCartService {
  static async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const result = await DatabaseService.query(
        `SELECT 
          ci.*,
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.price as product_price,
          p.type as product_type,
          p.category as product_category,
          p."imageUrl" as product_imageUrl,
          p."shortDescription" as product_shortDescription,
          p."isActive" as product_isActive,
          p.featured as product_featured,
          p.sales as product_sales
         FROM "cartItems" ci
         JOIN products p ON ci."productId" = p.id
         WHERE ci."userId" = $1 
         ORDER BY ci."createdAt" DESC`,
        [userId]
      )

      return result.map(this.convertDbCartItem)
    } catch (error) {
      console.error('Error fetching cart items:', error)
      return []
    }
  }

  static async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem | null> {
    try {
      // Check if item already exists
      const existing = await DatabaseService.query(
        'SELECT * FROM "cartItems" WHERE "userId" = $1 AND "productId" = $2',
        [userId, productId]
      )

      if (existing.length > 0) {
        // Update existing item
        const result = await DatabaseService.query(
          'UPDATE "cartItems" SET quantity = quantity + $1, "updatedAt" = NOW() WHERE "userId" = $2 AND "productId" = $3 RETURNING *',
          [quantity, userId, productId]
        )
        return result.length > 0 ? this.convertDbCartItem(result[0]) : null
      } else {
        // Create new item
        const id = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const result = await DatabaseService.query(
          'INSERT INTO "cartItems" (id, "userId", "productId", quantity, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
          [id, userId, productId, quantity]
        )
        return result.length > 0 ? this.convertDbCartItem(result[0]) : null
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return null
    }
  }

  static async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | null> {
    try {
      const existing = await DatabaseService.query(
        'SELECT * FROM "cartItems" WHERE "userId" = $1 AND "productId" = $2',
        [userId, productId]
      )

      if (existing.length === 0) {
        return null
      }

      if (quantity <= 0) {
        await this.removeCartItemById(existing[0].id)
        return null
      }

      const result = await DatabaseService.query(
        'UPDATE "cartItems" SET quantity = $1, "updatedAt" = NOW() WHERE "userId" = $2 AND "productId" = $3 RETURNING *',
        [quantity, userId, productId]
      )

      return result.length > 0 ? this.convertDbCartItem(result[0]) : null
    } catch (error) {
      console.error('Error updating cart item quantity:', error)
      return null
    }
  }

  static async updateCartItem(itemId: string, quantity: number): Promise<CartItem | null> {
    try {
      if (quantity <= 0) {
        await this.removeCartItemById(itemId)
        return null
      }

      const result = await DatabaseService.query(
        'UPDATE "cartItems" SET quantity = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
        [quantity, itemId]
      )

      return result.length > 0 ? this.convertDbCartItem(result[0]) : null
    } catch (error) {
      console.error('Error updating cart item:', error)
      return null
    }
  }

  static async removeFromCart(userId: string, productId: string): Promise<boolean> {
    try {
      await DatabaseService.query(
        'DELETE FROM "cartItems" WHERE "userId" = $1 AND "productId" = $2',
        [userId, productId]
      )
      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      return false
    }
  }

  static async removeCartItemById(itemId: string): Promise<boolean> {
    try {
      await DatabaseService.query(
        'DELETE FROM "cartItems" WHERE id = $1',
        [itemId]
      )
      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      return false
    }
  }

  static async clearCart(userId: string): Promise<boolean> {
    try {
      await DatabaseService.query(
        'DELETE FROM "cartItems" WHERE "userId" = $1',
        [userId]
      )
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      return false
    }
  }

  static async getCartItemCount(userId: string): Promise<number> {
    try {
      const result = await DatabaseService.query(
        'SELECT COUNT(*) as count FROM "cartItems" WHERE "userId" = $1',
        [userId]
      )
      return parseInt(result[0].count || '0', 10)
    } catch (error) {
      console.error('Error getting cart item count:', error)
      return 0
    }
  }

  static async getCartTotal(userId: string): Promise<number> {
    try {
      const result = await DatabaseService.query(
        `SELECT SUM(ci.quantity * p.price) as total
         FROM "cartItems" ci
         JOIN products p ON ci."productId" = p.id
         WHERE ci."userId" = $1`,
        [userId]
      )
      return parseFloat(result[0].total || '0')
    } catch (error) {
      console.error('Error getting cart total:', error)
      return 0
    }
  }

  private static convertDbCartItem(dbItem: any): CartItem {
    return {
      id: dbItem.id,
      userId: dbItem.userId,
      productId: dbItem.productId,
      quantity: parseInt(dbItem.quantity || '0', 10),
      createdAt: dbItem.createdAt ? new Date(dbItem.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: dbItem.updatedAt ? new Date(dbItem.updatedAt).toISOString() : new Date().toISOString(),
      product: dbItem.product_id ? {
        id: dbItem.product_id,
        name: dbItem.product_name,
        description: dbItem.product_description,
        price: parseFloat(dbItem.product_price || '0'),
        type: dbItem.product_type,
        category: dbItem.product_category,
        imageUrl: dbItem.product_imageUrl,
        shortDescription: dbItem.product_shortDescription,
        isActive: dbItem.product_isActive,
        featured: dbItem.product_featured,
        sales: parseInt(dbItem.product_sales || '0', 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : undefined
    }
  }
}

// Export with alias for compatibility
export { DatabaseCartService as CartService }