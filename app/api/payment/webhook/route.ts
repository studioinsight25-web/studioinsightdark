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

    // Find order by payment ID from database
    console.log('[Webhook] 🔍 Looking for order with paymentId:', paymentId)
    let order = await OrderService.getOrderByPaymentId(paymentId)

    if (!order) {
      console.error('[Webhook] ❌ Order not found by paymentId:', paymentId)
      
      // Fallback: Try to find order via Mollie metadata
      try {
        console.log('[Webhook] 🔄 Trying fallback: fetching payment details from Mollie to get orderId from metadata')
        // Use MollieService to get payment status which includes metadata
        const paymentStatusResult = await MollieService.getPaymentStatus(paymentId)
        if (paymentStatusResult.success && (paymentStatusResult as any).payment) {
          const molliePayment = (paymentStatusResult as any).payment
          const metadata = molliePayment?.metadata
          
          if (metadata && (metadata as any).orderId) {
            const orderIdFromMetadata = (metadata as any).orderId
            console.log('[Webhook] ✅ Found orderId in Mollie metadata:', orderIdFromMetadata)
            
            // Get order by ID
            order = await OrderService.getOrder(orderIdFromMetadata)
            
            if (order) {
              console.log('[Webhook] ✅ Found order via metadata, updating payment_id')
              // Update the order with the payment_id so future webhooks work
              await OrderService.updateOrderStatus(order.id, order.status as any, paymentId)
            }
          } else {
            console.log('[Webhook] ⚠️ No orderId found in Mollie metadata:', metadata)
          }
        }
      } catch (fallbackError) {
        console.error('[Webhook] ❌ Fallback also failed:', fallbackError)
      }
      
      if (!order) {
        console.error('[Webhook] ❌ CRITICAL: Order not found by paymentId or metadata:', paymentId)
        return NextResponse.json(
          { error: 'Order not found for this payment' },
          { status: 404 }
        )
      }
    }
    
    console.log('Webhook: Found order:', order.id, 'current status:', order.status)

    // Update order status based on payment status
    if (paymentStatus.paid) {
      await OrderService.updateOrderStatus(order.id, 'paid', paymentId)
      console.log(`✅ Order ${order.id} marked as PAID`)
      
      // Clear user's cart after successful payment
      try {
        const { CartService } = await import('@/lib/cart-database')
        await CartService.clearCart(order.userId)
        console.log(`✅ Cart cleared for user ${order.userId} after payment`)
      } catch (cartError) {
        console.error('⚠️ Error clearing cart after payment:', cartError)
        // Don't fail the webhook if cart clearing fails
      }
      
      // Send invoice emails to customer and admin
      try {
        const { sendInvoiceEmails } = await import('@/lib/invoice')
        const invoiceResult = await sendInvoiceEmails(order.id)
        if (invoiceResult.customerSent && invoiceResult.adminSent && invoiceResult.customerCopySent) {
          console.log(`✅ Invoice emails sent for order ${order.id} (customer, customer copy, and admin)`)
        } else {
          console.warn(`⚠️ Invoice emails partially sent for order ${order.id}:`, invoiceResult)
        }
      } catch (invoiceError) {
        console.error('⚠️ Error sending invoice emails:', invoiceError)
        // Don't fail the webhook if invoice emails fail
      }
    } else if (paymentStatus.failed) {
      await OrderService.updateOrderStatus(order.id, 'failed', paymentId)
      console.log(`Order ${order.id} marked as failed`)
    } else if (paymentStatus.canceled) {
      await OrderService.updateOrderStatus(order.id, 'failed', paymentId)
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


