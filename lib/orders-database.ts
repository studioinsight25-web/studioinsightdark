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
      // Use snake_case column names as per database schema
      const result = await DatabaseService.query(
        'INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at',
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
      // Use snake_case column names as per database schema
      const result = await DatabaseService.query(
        'SELECT id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at FROM orders WHERE id = $1',
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
      // Use snake_case column names as per database schema
      const result = await DatabaseService.query(
        'SELECT id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
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

  static async updateOrderStatus(orderId: string, status: OrderStatus, paymentId?: string): Promise<Order | null> {
    try {
      // Use snake_case column names as per database schema
      let updateQuery = 'UPDATE orders SET status = $1, updated_at = NOW()'
      const updateParams: any[] = [status]

      if (status === 'PAID') {
        updateQuery = 'UPDATE orders SET status = $1, paid_at = NOW(), updated_at = NOW()'
      }

      // Update payment_id if provided
      if (paymentId) {
        // Replace the SET clause to include payment_id
        updateQuery = updateQuery.replace('SET status = $1', 'SET status = $1, payment_id = $2')
        updateParams.push(paymentId)
      }
      
      updateParams.push(orderId)
      
      const paramIndex = updateParams.length
      const result = await DatabaseService.query(
        `${updateQuery} WHERE id = $${paramIndex} RETURNING id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at`,
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
      // Use snake_case column names as per database schema
      const result = await DatabaseService.query(
        'SELECT id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at FROM orders ORDER BY created_at DESC'
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
      // Use snake_case column names as per database schema
      const result = await DatabaseService.query(
        'SELECT id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at FROM orders WHERE status = $1 ORDER BY created_at DESC',
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

  static async getOrderByPaymentId(paymentId: string): Promise<Order | null> {
    try {
      // Use snake_case column names as per database schema
      const result = await DatabaseService.query(
        'SELECT id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at FROM orders WHERE payment_id = $1',
        [paymentId]
      )

      if (result.length === 0) {
        return null
      }

      const order = result[0]
      const items = await this.getOrderItems(order.id)
      
      return {
        ...this.convertDbOrder(order),
        items
      }
    } catch (error) {
      console.error('Error fetching order by paymentId:', error)
      return null
    }
  }

  static async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    try {
      // Use snake_case column names as per database schema
      const result = await DatabaseService.query(
        'SELECT id, user_id, status, total_amount, payment_id, created_at, updated_at, paid_at FROM orders WHERE created_at >= $1 AND created_at <= $2 ORDER BY created_at DESC',
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
          oi.product_id as "productId", 
          SUM(oi.quantity) as "totalSold", 
          SUM(oi.quantity * oi.price) as "totalRevenue"
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id 
        WHERE o.status = 'PAID'
        GROUP BY oi.product_id 
        ORDER BY "totalSold" DESC 
        LIMIT $1`,
        [limit]
      )

      return result.map((row: any) => ({
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
      // Use snake_case column names as per database schema (order_items table)
      // Database has: order_id, product_id (snake_case)
      // But code might be using "orderItems" with camelCase - check both
      let result
      try {
        // Try camelCase first (if table was created with quotes)
        result = await DatabaseService.query(
          'SELECT * FROM "orderItems" WHERE "orderId" = $1',
          [orderId]
        )
      } catch {
        // Fallback to snake_case (actual database schema)
        result = await DatabaseService.query(
          'SELECT id, order_id, product_id, quantity, price FROM order_items WHERE order_id = $1',
          [orderId]
        )
      }

      return result.map((item: any) => ({
        id: item.id,
        orderId: item.order_id || item.orderId, // Support both formats
        productId: item.product_id || item.productId, // Support both formats
        quantity: parseInt(item.quantity || '0', 10),
        price: parseFloat(item.price || '0')
      }))
    } catch (error) {
      console.error('Error fetching order items:', error)
      return []
    }
  }

  private static convertDbOrder(dbOrder: any): Omit<Order, 'items'> {
    // Map snake_case database columns to camelCase TypeScript interface
    return {
      id: dbOrder.id,
      userId: dbOrder.user_id || dbOrder.userId, // Support both formats for compatibility
      status: (dbOrder.status as string).toUpperCase() as OrderStatus,
      totalAmount: parseFloat(dbOrder.total_amount || dbOrder.totalAmount || '0'),
      createdAt: dbOrder.created_at || dbOrder.createdAt 
        ? new Date(dbOrder.created_at || dbOrder.createdAt).toISOString() 
        : new Date().toISOString(),
      updatedAt: dbOrder.updated_at || dbOrder.updatedAt
        ? new Date(dbOrder.updated_at || dbOrder.updatedAt).toISOString()
        : new Date().toISOString(),
      paidAt: (dbOrder.paid_at || dbOrder.paidAt) 
        ? new Date(dbOrder.paid_at || dbOrder.paidAt).toISOString() 
        : undefined
    }
  }
}

// Export with alias for compatibility
export { DatabaseOrderService as OrderDatabaseService }