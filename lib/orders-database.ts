// lib/orders-database.ts - Database Order Service (without Prisma)
import { DatabaseService } from '@/lib/database-direct'

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  updatedAt: string
  paidAt?: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}

export class DatabaseOrderService {
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>): Promise<Order | null> {
    try {
      const id = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const result = await DatabaseService.query(
        'INSERT INTO orders (id, "userId", status, "totalAmount", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
        [id, orderData.userId, orderData.status, orderData.totalAmount]
      )

      if (result.length === 0) {
        return null
      }

      return {
        ...this.convertDbOrder(result[0]),
        items: []
      }
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      )

      if (result.length === 0) {
        return null
      }

      const order = result[0]
      const items = await this.getOrderItems(orderId)
      
      return {
        ...this.convertDbOrder(order),
        items
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  static async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM orders WHERE "userId" = $1 ORDER BY "createdAt" DESC',
        [userId]
      )

      const orders = await Promise.all(result.map(async (order: any) => {
        const items = await this.getOrderItems(order.id)
        return {
          ...this.convertDbOrder(order),
          items
        }
      }))

      return orders
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return []
    }
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      let updateQuery = 'UPDATE orders SET status = $1, "updatedAt" = NOW()'
      const updateParams: any[] = [status]

      if (status === 'PAID') {
        updateQuery = 'UPDATE orders SET status = $1, "paidAt" = NOW(), "updatedAt" = NOW()'
      }

      updateParams.push(orderId)

      const result = await DatabaseService.query(
        `${updateQuery} WHERE id = $2 RETURNING *`,
        updateParams
      )

      if (result.length === 0) {
        return null
      }

      const order = result[0]
      const items = await this.getOrderItems(orderId)
      
      return {
        ...this.convertDbOrder(order),
        items
      }
    } catch (error) {
      console.error('Error updating order:', error)
      return null
    }
  }

  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      await DatabaseService.query(
        'DELETE FROM orders WHERE id = $1',
        [orderId]
      )
      return true
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM orders ORDER BY "createdAt" DESC'
      )

      const orders = await Promise.all(result.map(async (order: any) => {
        const items = await this.getOrderItems(order.id)
        return {
          ...this.convertDbOrder(order),
          items
        }
      }))

      return orders
    } catch (error) {
      console.error('Error fetching all orders:', error)
      return []
    }
  }

  static async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM orders WHERE status = $1 ORDER BY "createdAt" DESC',
        [status]
      )

      const orders = await Promise.all(result.map(async (order: any) => {
        const items = await this.getOrderItems(order.id)
        return {
          ...this.convertDbOrder(order),
          items
        }
      }))

      return orders
    } catch (error) {
      console.error('Error fetching orders by status:', error)
      return []
    }
  }

  static async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM orders WHERE "createdAt" >= $1 AND "createdAt" <= $2 ORDER BY "createdAt" DESC',
        [startDate, endDate]
      )

      const orders = await Promise.all(result.map(async (order: any) => {
        const items = await this.getOrderItems(order.id)
        return {
          ...this.convertDbOrder(order),
          items
        }
      }))

      return orders
    } catch (error) {
      console.error('Error fetching orders by date range:', error)
      return []
    }
  }

  static async getTopProducts(limit: number = 10): Promise<Array<{ productId: string; totalSold: number; totalRevenue: number }>> {
    try {
      const result = await DatabaseService.query(
        `SELECT 
          "productId", 
          SUM(quantity) as "totalSold", 
          SUM(quantity * price) as "totalRevenue"
        FROM "orderItems" 
        JOIN orders ON "orderItems"."orderId" = orders.id 
        WHERE orders.status = 'PAID'
        GROUP BY "productId" 
        ORDER BY "totalSold" DESC 
        LIMIT $1`,
        [limit]
      )

      return result.map(row => ({
        productId: row.productId,
        totalSold: parseInt(row.totalSold || '0', 10),
        totalRevenue: parseFloat(row.totalRevenue || '0')
      }))
    } catch (error) {
      console.error('Error fetching top products:', error)
      return []
    }
  }

  private static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM "orderItems" WHERE "orderId" = $1',
        [orderId]
      )

      return result.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: parseInt(item.quantity || '0', 10),
        price: parseFloat(item.price || '0')
      }))
    } catch (error) {
      console.error('Error fetching order items:', error)
      return []
    }
  }

  private static convertDbOrder(dbOrder: any): Omit<Order, 'items'> {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId,
      status: dbOrder.status as OrderStatus,
      totalAmount: parseFloat(dbOrder.totalAmount || '0'),
      createdAt: dbOrder.createdAt ? new Date(dbOrder.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: dbOrder.updatedAt ? new Date(dbOrder.updatedAt).toISOString() : new Date().toISOString(),
      paidAt: dbOrder.paidAt ? new Date(dbOrder.paidAt).toISOString() : undefined
    }
  }
}

// Export with alias for compatibility
export { DatabaseOrderService as OrderDatabaseService }