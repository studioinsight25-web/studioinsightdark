// app/api/checkout/create-payment/route.ts - Create Payment API
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { MollieService } from '@/lib/mollie'
import { OrderService } from '@/lib/orders'
import { UserService } from '@/lib/user-database'
import { z } from 'zod'

// Define OrderItem interface for checkout
interface OrderItem {
  id: string
  name: string
  price: number
  type: 'course' | 'ebook' | 'review'
}

    const checkoutSchema = z.object({
      items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        type: z.enum(['course', 'ebook', 'review'])
      }))
    })

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in (using session cookie)
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      console.error('Checkout: No session or userId found')
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn om te betalen' },
        { status: 401 }
      )
    }
    
    console.log('Checkout: Session found, userId:', session.userId, 'type:', typeof session.userId, 'email:', session.email)
    
    // Get full user details from database
    // Try both userId and email to handle any format issues
    let user = await UserService.getUserById(session.userId)
    
    if (!user && session.email) {
      console.log('Checkout: User not found by ID, trying email:', session.email)
      user = await UserService.getUserByEmail(session.email)
      if (user) {
        console.log('Checkout: User found by email, userId in DB:', user.id, 'userId in session:', session.userId)
        // Update session with correct userId if they differ
        if (user.id !== session.userId) {
          console.warn('Checkout: userId mismatch - session:', session.userId, 'database:', user.id)
        }
      }
    }
    
    if (!user) {
      console.error('Checkout: User not found in database. userId:', session.userId, 'email:', session.email)
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden in database. Probeer opnieuw in te loggen.' },
        { status: 404 }
      )
    }
    
    console.log('Checkout: User found successfully, id:', user.id, 'email:', user.email)

    // Validate request body
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    if (validatedData.items.length === 0) {
      return NextResponse.json(
        { error: 'Geen items gevonden om te betalen' },
        { status: 400 }
      )
    }

    // Calculate total amount
    // Prices sent from frontend are in cents and already include VAT
    // So we just sum them up
    const totalAmount = validatedData.items.reduce((sum, item) => sum + item.price, 0)

    // Create order
    const orderItems: OrderItem[] = validatedData.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.type
    }))

    // Convert OrderItem to Product for OrderService
    const products = await Promise.all(orderItems.map(async (item) => {
      // Fetch full product details from database
      const product = await import('@/lib/products-database').then(m => m.DatabaseProductService.getProduct(item.id))
      if (!product) {
        throw new Error(`Product ${item.id} not found`)
      }
      return product
    }))

    const order = await OrderService.createOrder(user.id, products)

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
    await OrderService.updateOrderStatus(order.id, 'pending', paymentResult.paymentId)

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


