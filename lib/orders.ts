// lib/orders.ts - Order Management System
import { v4 as uuidv4 } from 'uuid'
import { Product, ProductService } from './products'
import { DatabaseOrderService } from './orders-database'

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

// In-memory order storage (fallback for development)
const orders: Order[] = []

export class OrderService {
  // Database methods
  static async createOrder(userId: string, items: Product[]): Promise<Order> {
    try {
      const totalAmount = items.reduce((sum, item) => sum + item.price, 0)
      const dbOrder = await DatabaseOrderService.createOrder({
        userId,
        status: 'PENDING',
        totalAmount
      })
      
      if (!dbOrder) {
        throw new Error('Failed to create order')
      }

      // Create order items
      const { DatabaseService } = await import('@/lib/database-direct')
      for (const item of items) {
        const itemId = `order-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        await DatabaseService.query(
          'INSERT INTO "orderItems" (id, "orderId", "productId", quantity, price, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [itemId, dbOrder.id, item.id, 1, item.price]
        )
      }

      return {
        id: dbOrder.id,
        userId: dbOrder.userId,
        items,
        totalAmount: dbOrder.totalAmount,
        currency: 'EUR',
        status: dbOrder.status.toLowerCase() as Order['status'],
        createdAt: dbOrder.createdAt,
        paidAt: dbOrder.paidAt
      }
    } catch (error) {
      console.error('Error creating order:', error)
      // Fallback to in-memory storage
      const totalAmount = items.reduce((sum, item) => sum + item.price, 0)
      
      const order: Order = {
        id: uuidv4(),
        userId,
        items,
        totalAmount,
        currency: 'EUR',
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      orders.push(order)
      return order
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const dbOrder = await DatabaseOrderService.getOrder(orderId)
      if (!dbOrder) return null

      // Convert items
      const items: Product[] = []
      for (const item of dbOrder.items) {
        const product = await ProductService.getProduct(item.productId)
        if (product) {
          items.push(product)
        }
      }

      return {
        id: dbOrder.id,
        userId: dbOrder.userId,
        items,
        totalAmount: dbOrder.totalAmount,
        currency: 'EUR',
        status: dbOrder.status.toLowerCase() as Order['status'],
        createdAt: dbOrder.createdAt,
        paidAt: dbOrder.paidAt
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      // Fallback to in-memory storage
      return orders.find(order => order.id === orderId) || null
    }
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const dbOrders = await DatabaseOrderService.getOrdersByUser(userId)
      
      const orders: Order[] = []
      for (const dbOrder of dbOrders) {
        const items: Product[] = []
        for (const item of dbOrder.items) {
          const product = await ProductService.getProduct(item.productId)
          if (product) {
            items.push(product)
          }
        }
        
        orders.push({
          id: dbOrder.id,
          userId: dbOrder.userId,
          items,
          totalAmount: dbOrder.totalAmount,
          currency: 'EUR',
          status: dbOrder.status.toLowerCase() as Order['status'],
          createdAt: dbOrder.createdAt,
          paidAt: dbOrder.paidAt
        })
      }
      
      return orders
    } catch (error) {
      console.error('Error fetching user orders:', error)
      // Fallback to in-memory storage
      return orders.filter(order => order.userId === userId)
    }
  }

  static async updateOrderStatus(orderId: string, status: Order['status'], paymentId?: string): Promise<boolean> {
    try {
      const dbOrder = await DatabaseOrderService.updateOrderStatus(orderId, status.toUpperCase() as any)
      return dbOrder !== null
    } catch (error) {
      console.error('Error updating order status:', error)
      // Fallback to in-memory storage
      const order = orders.find(o => o.id === orderId)
      if (!order) return false

      order.status = status
      if (paymentId) {
        order.paymentId = paymentId
      }
      if (status === 'paid') {
        order.paidAt = new Date().toISOString()
      }

      return true
    }
  }

  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      return await DatabaseOrderService.deleteOrder(orderId)
    } catch (error) {
      console.error('Error deleting order:', error)
      // Fallback to in-memory storage
      const index = orders.findIndex(o => o.id === orderId)
      if (index === -1) return false

      orders.splice(index, 1)
      return true
    }
  }

  static async getOrderStats(): Promise<{ totalOrders: number, totalRevenue: number, averageOrderValue: number }> {
    try {
      const paidOrders = await DatabaseOrderService.getOrdersByStatus('PAID')
      const totalOrders = paidOrders.length
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      return { totalOrders, totalRevenue, averageOrderValue }
    } catch (error) {
      console.error('Error getting order stats:', error)
      // Fallback to in-memory storage
      const paidOrders = orders.filter(o => o.status === 'paid')
      const totalOrders = paidOrders.length
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      return { totalOrders, totalRevenue, averageOrderValue }
    }
  }

  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const dbOrders = await DatabaseOrderService.getOrdersByStatus(status.toUpperCase() as any)
      
      const orders: Order[] = []
      for (const dbOrder of dbOrders) {
        const items: Product[] = []
        for (const item of dbOrder.items) {
          const product = await ProductService.getProduct(item.productId)
          if (product) {
            items.push(product)
          }
        }
        
        orders.push({
          id: dbOrder.id,
          userId: dbOrder.userId,
          items,
          totalAmount: dbOrder.totalAmount,
          currency: 'EUR',
          status: dbOrder.status.toLowerCase() as Order['status'],
          createdAt: dbOrder.createdAt,
          paidAt: dbOrder.paidAt
        })
      }
      
      return orders
    } catch (error) {
      console.error('Error fetching orders by status:', error)
      // Fallback to in-memory storage
      return orders.filter(order => order.status === status)
    }
  }

  static async getRecentOrders(limit: number = 10): Promise<Order[]> {
    try {
      const dbOrders = await DatabaseOrderService.getAllOrders()
      
      const orders: Order[] = []
      for (const dbOrder of dbOrders.slice(0, limit)) {
        const items: Product[] = []
        for (const item of dbOrder.items) {
          const product = await ProductService.getProduct(item.productId)
          if (product) {
            items.push(product)
          }
        }
        
        orders.push({
          id: dbOrder.id,
          userId: dbOrder.userId,
          items,
          totalAmount: dbOrder.totalAmount,
          currency: 'EUR',
          status: dbOrder.status.toLowerCase() as Order['status'],
          createdAt: dbOrder.createdAt,
          paidAt: dbOrder.paidAt
        })
      }
      
      return orders
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      // Fallback to in-memory storage
      return orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
    }
  }

  static async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const dbOrders = await DatabaseOrderService.getOrdersByDateRange(startDate.toISOString(), endDate.toISOString())
      
      const orders: Order[] = []
      for (const dbOrder of dbOrders) {
        const items: Product[] = []
        for (const item of dbOrder.items) {
          const product = await ProductService.getProduct(item.productId)
          if (product) {
            items.push(product)
          }
        }
        
        orders.push({
          id: dbOrder.id,
          userId: dbOrder.userId,
          items,
          totalAmount: dbOrder.totalAmount,
          currency: 'EUR',
          status: dbOrder.status.toLowerCase() as Order['status'],
          createdAt: dbOrder.createdAt,
          paidAt: dbOrder.paidAt
        })
      }
      
      return orders
    } catch (error) {
      console.error('Error fetching orders by date range:', error)
      // Fallback to in-memory storage
      return orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startDate && orderDate <= endDate
      })
    }
  }

  static async getTopProducts(limit: number = 10): Promise<{ productId: string, productName: string, totalSold: number, totalRevenue: number }[]> {
    try {
      const topProducts = await DatabaseOrderService.getTopProducts(limit)
      
      const result = []
      for (const topProduct of topProducts) {
        const product = await ProductService.getProduct(topProduct.productId)
        result.push({
          productId: topProduct.productId,
          productName: product?.name || 'Unknown',
          totalSold: topProduct.totalSold,
          totalRevenue: topProduct.totalRevenue
        })
      }
      
      return result
    } catch (error) {
      console.error('Error getting top products:', error)
      // Fallback to in-memory storage
      const productStats = new Map<string, { name: string, totalSold: number, totalRevenue: number }>()
      
      orders.filter(o => o.status === 'paid').forEach(order => {
        order.items.forEach(item => {
          const existing = productStats.get(item.id)
          if (existing) {
            existing.totalSold += 1
            existing.totalRevenue += item.price
          } else {
            productStats.set(item.id, {
              name: item.name,
              totalSold: 1,
              totalRevenue: item.price
            })
          }
        })
      })

      return Array.from(productStats.entries())
        .map(([productId, stats]) => ({
          productId,
          productName: stats.name,
          totalSold: stats.totalSold,
          totalRevenue: stats.totalRevenue
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit)
    }
  }

  // Legacy in-memory methods (for backward compatibility)
  static createOrderSync(userId: string, items: Product[]): Order {
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0)
    
    const order: Order = {
      id: uuidv4(),
      userId,
      items,
      totalAmount,
      currency: 'EUR',
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    orders.push(order)
    return order
  }

  static getOrderSync(orderId: string): Order | null {
    return orders.find(order => order.id === orderId) || null
  }

  static getUserOrdersSync(userId: string): Order[] {
    return orders.filter(order => order.userId === userId)
  }

  static updateOrderStatusSync(orderId: string, status: Order['status'], paymentId?: string): boolean {
    const order = orders.find(o => o.id === orderId)
    if (!order) return false

    order.status = status
    if (paymentId) {
      order.paymentId = paymentId
    }
    if (status === 'paid') {
      order.paidAt = new Date().toISOString()
    }

    return true
  }

  static deleteOrderSync(orderId: string): boolean {
    const index = orders.findIndex(o => o.id === orderId)
    if (index === -1) return false

    orders.splice(index, 1)
    return true
  }

  // Helper method to get user's purchased products
  static async getUserPurchasedProducts(userId: string): Promise<string[]> {
    try {
      const userOrders = await this.getUserOrders(userId)
      const purchasedProducts = new Set<string>()
      
      userOrders
        .filter(order => order.status === 'paid')
        .forEach(order => {
          order.items.forEach(item => {
            purchasedProducts.add(item.id)
          })
        })
      
      return Array.from(purchasedProducts)
    } catch (error) {
      console.error('Error getting user purchased products:', error)
      // Fallback to in-memory storage
      const userOrders = this.getUserOrdersSync(userId)
      const purchasedProducts = new Set<string>()
      
      userOrders
        .filter(order => order.status === 'paid')
        .forEach(order => {
          order.items.forEach(item => {
            purchasedProducts.add(item.id)
          })
        })
      
      return Array.from(purchasedProducts)
    }
  }
}

export default OrderService