// app/api/checkout/create-payment/route.ts - Create Payment API
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { MollieService } from '@/lib/mollie'
import { OrderService, OrderItem } from '@/lib/orders'
import { z } from 'zod'

const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    type: z.enum(['course', 'ebook'])
  }))
})

export async function POST(request: Request) {
  try {
    // Check if user is logged in
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn om te betalen' },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    if (validatedData.items.length === 0) {
      return NextResponse.json(
        { error: 'Geen items gevonden om te betalen' },
        { status: 400 }
      )
    }

    // Calculate total amount (including VAT)
    const subtotal = validatedData.items.reduce((sum, item) => sum + item.price, 0)
    const vat = Math.round(subtotal * 0.21) // 21% VAT
    const totalAmount = subtotal + vat

    // Create order
    const orderItems: OrderItem[] = validatedData.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.type
    }))

    const order = OrderService.createOrder(user.id, orderItems)

    // Create Mollie payment
    const paymentData = {
      amount: {
        value: (totalAmount / 100).toFixed(2),
        currency: 'EUR'
      },
      description: `Studio Insight - Bestelling ${order.id}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?orderId=${order.id}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`,
      metadata: {
        orderId: order.id,
        userId: user.id,
        products: validatedData.items.map(item => item.id)
      }
    }

    const paymentResult = await MollieService.createPayment(paymentData)

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Betaling aanmaken mislukt' },
        { status: 500 }
      )
    }

    // Update order with payment ID
    OrderService.updateOrderStatus(order.id, 'pending', paymentResult.paymentId)

    return NextResponse.json({
      success: true,
      checkoutUrl: paymentResult.checkoutUrl,
      orderId: order.id,
      paymentId: paymentResult.paymentId
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ongeldige checkout gegevens' },
        { status: 400 }
      )
    }

    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}


