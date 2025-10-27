// lib/orders.ts - Order Management System
import { v4 as uuidv4 } from 'uuid'
import { Product, ProductService } from './products'

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

// In-memory order storage (in production, use a database)
const orders: Order[] = []

export class OrderService {
  static createOrder(userId: string, items: Product[]): Order {
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

  static getOrder(orderId: string): Order | null {
    return orders.find(order => order.id === orderId) || null
  }

  static getUserOrders(userId: string): Order[] {
    return orders.filter(order => order.userId === userId)
  }

  static updateOrderStatus(orderId: string, status: Order['status'], paymentId?: string): boolean {
    const order = orders.find(o => o.id === orderId)
    if (!order) return false

    order.status = status
    if (paymentId) order.paymentId = paymentId
    if (status === 'paid') order.paidAt = new Date().toISOString()

    return true
  }

  static getUserPurchasedProducts(userId: string): string[] {
    const userOrders = this.getUserOrders(userId)
    const paidOrders = userOrders.filter(order => order.status === 'paid')
    
    return paidOrders.flatMap(order => 
      order.items.map(item => item.id)
    )
  }

  static hasAccessToProduct(userId: string, productId: string): boolean {
    const purchasedProducts = this.getUserPurchasedProducts(userId)
    return purchasedProducts.includes(productId)
  }
}

// Backward compatibility functions
export function getProduct(productId: string): Product | null {
  return ProductService.getProduct(productId)
}

export function getAllProducts(): Product[] {
  return ProductService.getAllProducts()
}

export function getProductsByType(type: 'course' | 'ebook'): Product[] {
  return ProductService.getProductsByType(type)
}

