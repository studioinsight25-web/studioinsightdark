// lib/cart-database.ts - Database Cart Service
import { PrismaClient } from '@prisma/client'
import { Product } from './products'

const prisma = new PrismaClient()

export interface CartItem {
  id: string
  userId: string
  productId: string
  product: Product
  quantity: number
  createdAt: string
  updatedAt: string
}

export class CartService {
  // Convert Prisma CartItem to our CartItem interface
  private static convertPrismaCartItem(prismaItem: any): CartItem {
    return {
      id: prismaItem.id,
      userId: prismaItem.userId,
      productId: prismaItem.productId,
      product: prismaItem.product,
      quantity: prismaItem.quantity,
      createdAt: prismaItem.createdAt.toISOString(),
      updatedAt: prismaItem.updatedAt.toISOString(),
    }
  }

  static async getCartItems(userId: string): Promise<CartItem[]> {
    // Don't run Prisma in browser
    if (typeof window !== 'undefined') {
      return []
    }
    
    try {
      const items = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return items.map(this.convertPrismaCartItem)
    } catch (error) {
      console.error('Error fetching cart items:', error)
      return []
    }
  }

  static async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem | null> {
    try {
      // Check if item already exists
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId
        }
      })

      if (existingItem) {
        // Update quantity
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: existingItem.quantity + quantity,
            updatedAt: new Date()
          },
          include: {
            product: true
          }
        })
        return this.convertPrismaCartItem(updatedItem)
      } else {
        // Create new item
        const newItem = await prisma.cartItem.create({
          data: {
            userId,
            productId,
            quantity
          },
          include: {
            product: true
          }
        })
        return this.convertPrismaCartItem(newItem)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return null
    }
  }

  static async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | null> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId)
      }

      const updatedItem = await prisma.cartItem.updateMany({
        where: {
          userId,
          productId
        },
        data: {
          quantity,
          updatedAt: new Date()
        }
      })

      if (updatedItem.count > 0) {
        const item = await prisma.cartItem.findFirst({
          where: {
            userId,
            productId
          },
          include: {
            product: true
          }
        })
        return item ? this.convertPrismaCartItem(item) : null
      }
      return null
    } catch (error) {
      console.error('Error updating cart item:', error)
      return null
    }
  }

  static async removeFromCart(userId: string, productId: string): Promise<boolean> {
    try {
      await prisma.cartItem.deleteMany({
        where: {
          userId,
          productId
        }
      })
      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      return false
    }
  }

  static async clearCart(userId: string): Promise<boolean> {
    try {
      await prisma.cartItem.deleteMany({
        where: { userId }
      })
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      return false
    }
  }

  static async getCartItemCount(userId: string): Promise<number> {
    // Don't run Prisma in browser
    if (typeof window !== 'undefined') {
      return 0
    }
    
    try {
      const result = await prisma.cartItem.aggregate({
        where: { userId },
        _sum: {
          quantity: true
        }
      })
      return result._sum.quantity || 0
    } catch (error) {
      console.error('Error getting cart count:', error)
      return 0
    }
  }

  static async getCartTotal(userId: string): Promise<number> {
    try {
      const items = await this.getCartItems(userId)
      return items.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
      }, 0)
    } catch (error) {
      console.error('Error calculating cart total:', error)
      return 0
    }
  }
}
