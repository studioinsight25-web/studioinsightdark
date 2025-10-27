// app/api/payment/webhook/route.ts - Mollie Webhook Handler
import { NextResponse } from 'next/server'
import { MollieService } from '@/lib/mollie'
import { OrderService } from '@/lib/orders'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id: paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get payment status from Mollie
    const paymentStatus = await MollieService.getPaymentStatus(paymentId)

    if (!paymentStatus.success) {
      console.error('Failed to get payment status:', paymentStatus.error)
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      )
    }

    // Find order by payment ID
    // In a real application, you'd query your database
    // For now, we'll use a simple approach
    const orders = OrderService.getUserOrders('') // This would need to be improved
    const order = orders.find(o => o.paymentId === paymentId)

    if (!order) {
      console.error('Order not found for payment:', paymentId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status based on payment status
    if (paymentStatus.paid) {
      OrderService.updateOrderStatus(order.id, 'paid', paymentId)
      console.log(`Order ${order.id} marked as paid`)
    } else if (paymentStatus.failed) {
      OrderService.updateOrderStatus(order.id, 'failed', paymentId)
      console.log(`Order ${order.id} marked as failed`)
    } else if (paymentStatus.canceled) {
      OrderService.updateOrderStatus(order.id, 'failed', paymentId)
      console.log(`Order ${order.id} marked as canceled`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'Mollie webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}

