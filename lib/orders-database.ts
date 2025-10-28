// lib/orders-database.ts - Database Orders Service
import { PrismaClient } from '@prisma/client'
import { Product } from './products'

const prisma = new PrismaClient()

export interface Order {
  id: string
  userId: string
  items: Product[]
  totalAmount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentId?: string
  createdAt: string
  paidAt?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}

export class OrderDatabaseService {
  // Convert Prisma Order to our Order interface
  private static convertPrismaOrder(prismaOrder: any): Order {
    return {
      id: prismaOrder.id,
      userId: prismaOrder.userId,
      items: prismaOrder.items.map((item: any) => ({
        ...item.product,
        // Ensure price is number and other fields are correctly typed
        price: item.price,
        type: item.product.type.toLowerCase() as 'course' | 'ebook' | 'review',
        category: item.product.category?.toLowerCase() as 'microfoon' | 'webcam' | 'accessoires' | undefined,
        createdAt: item.product.createdAt.toISOString(),
        updatedAt: item.product.updatedAt.toISOString(),
      })),
      totalAmount: prismaOrder.totalAmount,
      currency: prismaOrder.currency,
      status: prismaOrder.status.toLowerCase() as 'pending' | 'paid' | 'failed' | 'refunded',
      paymentId: prismaOrder.paymentId,
      createdAt: prismaOrder.createdAt.toISOString(),
      paidAt: prismaOrder.paidAt?.toISOString(),
    }
  }

  static async createOrder(userId: string, items: Product[]): Promise<Order> {
    try {
      const totalAmount = items.reduce((sum, item) => sum + item.price, 0)
      
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          currency: 'EUR',
          status: 'PENDING',
          items: {
            create: items.map(item => ({
              productId: item.id,
              quantity: 1, // Default quantity
              price: item.price,
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      return this.convertPrismaOrder(order)
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      return order ? this.convertPrismaOrder(order) : null
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return orders.map(this.convertPrismaOrder)
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return []
    }
  }

  static async updateOrderStatus(orderId: string, status: Order['status'], paymentId?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status: status.toUpperCase(),
      }

      if (status === 'paid') {
        updateData.paidAt = new Date()
      }

      if (paymentId) {
        updateData.paymentId = paymentId
      }

      await prisma.order.update({
        where: { id: orderId },
        data: updateData
      })

      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      await prisma.order.delete({
        where: { id: orderId }
      })
      return true
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }

  static async getOrderStats(): Promise<{ totalOrders: number, totalRevenue: number, averageOrderValue: number }> {
    try {
      const orders = await prisma.order.findMany({
        where: { status: 'PAID' }
      })

      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue
      }
    } catch (error) {
      console.error('Error getting order stats:', error)
      return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 }
    }
  }

  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { status: status.toUpperCase() as OrderStatus },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return orders.map(this.convertPrismaOrder)
    } catch (error) {
      console.error('Error fetching orders by status:', error)
      return []
    }
  }

  static async getRecentOrders(limit: number = 10): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return orders.map(this.convertPrismaOrder)
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      return []
    }
  }

  static async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return orders.map(this.convertPrismaOrder)
    } catch (error) {
      console.error('Error fetching orders by date range:', error)
      return []
    }
  }

  static async getTopProducts(limit: number = 10): Promise<{ productId: string, productName: string, totalSold: number, totalRevenue: number }[]> {
    try {
      const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            status: 'PAID'
          }
        },
        _sum: {
          quantity: true,
          price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: limit
      })

      // Get product names
      const productIds = topProducts.map(item => item.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true }
      })

      const productMap = new Map(products.map(p => [p.id, p.name]))

      return topProducts.map(item => ({
        productId: item.productId,
        productName: productMap.get(item.productId) || 'Unknown Product',
        totalSold: item._sum.quantity || 0,
        totalRevenue: item._sum.price || 0
      }))
    } catch (error) {
      console.error('Error getting top products:', error)
      return []
    }
  }
}
