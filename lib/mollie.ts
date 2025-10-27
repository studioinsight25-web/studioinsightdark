// lib/mollie.ts - Mollie Payment Service
import { createMollieClient } from '@mollie/api-client'

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! })

export interface PaymentData {
  amount: {
    value: string
    currency: string
  }
  description: string
  redirectUrl: string
  webhookUrl: string
  metadata: {
    orderId: string
    userId: string
    products: string[]
  }
}

export interface OrderItem {
  id: string
  name: string
  price: number
  type: 'course' | 'ebook'
}

export class MollieService {
  static async createPayment(paymentData: PaymentData) {
    try {
      const payment = await mollieClient.payments.create({
        amount: paymentData.amount,
        description: paymentData.description,
        redirectUrl: paymentData.redirectUrl,
        webhookUrl: paymentData.webhookUrl,
        metadata: paymentData.metadata,
        locale: 'nl_NL',
        method: ['ideal', 'creditcard', 'paypal', 'bancontact']
      })

      return {
        success: true,
        paymentId: payment.id,
        checkoutUrl: payment.getCheckoutUrl()
      }
    } catch (error) {
      console.error('Mollie payment creation error:', error)
      return {
        success: false,
        error: 'Payment creation failed'
      }
    }
  }

  static async getPaymentStatus(paymentId: string) {
    try {
      const payment = await mollieClient.payments.get(paymentId)
      return {
        success: true,
        status: payment.status,
        paid: payment.isPaid(),
        failed: payment.isFailed(),
        canceled: payment.isCanceled(),
        expired: payment.isExpired()
      }
    } catch (error) {
      console.error('Mollie payment status error:', error)
      return {
        success: false,
        error: 'Failed to get payment status'
      }
    }
  }

  static async refundPayment(paymentId: string, amount?: { value: string; currency: string }) {
    try {
      const refund = await mollieClient.payments_refunds.create({
        paymentId,
        amount: amount || undefined
      })

      return {
        success: true,
        refundId: refund.id
      }
    } catch (error) {
      console.error('Mollie refund error:', error)
      return {
        success: false,
        error: 'Refund failed'
      }
    }
  }
}

// Helper functions
export function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2)
}

export function parsePrice(priceString: string): number {
  return Math.round(parseFloat(priceString) * 100)
}

