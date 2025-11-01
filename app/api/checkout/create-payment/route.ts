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
    
    console.log('Checkout: Session found, userId:', session.userId, 'userId type:', typeof session.userId, 'email:', session.email)
    
    // Get full user details from database
    // Try email first since it's more reliable, then userId
    let user = null
    let queryError = null
    
    // Also try a direct database query as fallback
    const { DatabaseService } = await import('@/lib/database-direct')
    
    if (session.email) {
      console.log('Checkout: Trying to find user by email first:', session.email)
      try {
        user = await UserService.getUserByEmail(session.email)
        if (user) {
          console.log('Checkout: User found by email, id:', user.id, 'email:', user.email)
        } else {
          console.warn('Checkout: User not found by email:', session.email)
          // Try direct database query as fallback
          try {
            console.log('Checkout: Trying direct DB query by email')
            const directResult = await DatabaseService.query(
              'SELECT id, email, name, role FROM users WHERE LOWER(email) = LOWER($1)',
              [session.email]
            )
            if (directResult.length > 0) {
              console.log('Checkout: Direct DB query found user:', directResult[0])
              user = {
                id: directResult[0].id,
                email: directResult[0].email,
                name: directResult[0].name,
                role: directResult[0].role
              }
            }
          } catch (directError) {
            console.error('Checkout: Direct DB query error:', directError)
          }
        }
      } catch (error) {
        queryError = error
        console.error('Checkout: Error fetching user by email:', error)
      }
    }
    
    // If not found by email, try userId
    if (!user && session.userId) {
      console.log('Checkout: User not found by email, trying userId:', session.userId)
      try {
        user = await UserService.getUserById(session.userId)
        if (user) {
          console.log('Checkout: User found by userId, id:', user.id, 'email:', user.email)
        } else {
          console.warn('Checkout: User not found by userId:', session.userId)
          // Try direct database query as fallback
          try {
            console.log('Checkout: Trying direct DB query by userId')
            // Try UUID first
            let directResult = await DatabaseService.query(
              'SELECT id, email, name, role FROM users WHERE id = $1::uuid',
              [session.userId]
            )
            // If no result, try as text
            if (directResult.length === 0) {
              directResult = await DatabaseService.query(
                'SELECT id, email, name, role FROM users WHERE id::text = $1',
                [session.userId.toString()]
              )
            }
            if (directResult.length > 0) {
              console.log('Checkout: Direct DB query found user:', directResult[0])
              user = {
                id: directResult[0].id,
                email: directResult[0].email,
                name: directResult[0].name,
                role: directResult[0].role
              }
            } else {
              // List all users to debug
              const allUsers = await DatabaseService.query('SELECT id, email FROM users LIMIT 10')
              console.log('Checkout: No user found. Sample users in DB:', allUsers.map((u: any) => ({ id: u.id, email: u.email })))
            }
          } catch (directError) {
            console.error('Checkout: Direct DB query error:', directError)
          }
        }
      } catch (error) {
        queryError = error
        console.error('Checkout: Error fetching user by userId:', error)
      }
    }
    
    if (!user) {
      console.error('Checkout: User not found in database after all attempts. userId:', session.userId, 'email:', session.email)
      if (queryError) {
        console.error('Checkout: Query error details:', queryError instanceof Error ? queryError.message : queryError)
      }
      // Return a more helpful error message
      return NextResponse.json(
        { 
          error: 'Gebruiker niet gevonden in database. Probeer opnieuw in te loggen.',
          debug: process.env.NODE_ENV === 'development' ? {
            userId: session.userId,
            email: session.email,
            queryError: queryError instanceof Error ? queryError.message : null
          } : undefined
        },
        { status: 404 }
      )
    }
    
    console.log('Checkout: User found successfully, id:', user.id, 'email:', user.email)

    // Validate request body
    const body = await request.json()
    console.log('Checkout: Received request body:', JSON.stringify(body, null, 2))
    
    let validatedData
    try {
      validatedData = checkoutSchema.parse(body)
      console.log('Checkout: Validation successful:', JSON.stringify(validatedData, null, 2))
    } catch (validationError) {
      console.error('Checkout: Validation error:', validationError)
      if (validationError instanceof z.ZodError) {
        console.error('Checkout: Validation errors:', JSON.stringify(validationError.issues, null, 2))
        return NextResponse.json(
          { 
            error: 'Ongeldige checkout gegevens',
            details: validationError.issues.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      }
      throw validationError
    }

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

    console.log('Checkout: Creating Mollie payment with data:', {
      amount: paymentData.amount,
      description: paymentData.description,
      redirectUrl: paymentData.redirectUrl,
      webhookUrl: paymentData.webhookUrl,
      hasApiKey: !!process.env.MOLLIE_API_KEY
    })

    const paymentResult = await MollieService.createPayment(paymentData)

    if (!paymentResult.success) {
      console.error('Checkout: Mollie payment creation failed:', paymentResult.error)
      return NextResponse.json(
        { error: paymentResult.error || 'Betaling aanmaken mislukt' },
        { status: 500 }
      )
    }

    console.log('Checkout: Mollie payment created successfully:', {
      paymentId: paymentResult.paymentId,
      checkoutUrl: paymentResult.checkoutUrl
    })

    // Update order with payment ID
    await OrderService.updateOrderStatus(order.id, 'pending', paymentResult.paymentId)

    return NextResponse.json({
      success: true,
      checkoutUrl: paymentResult.checkoutUrl,
      orderId: order.id,
      paymentId: paymentResult.paymentId
    })

  } catch (error) {
    // ZodError should already be handled above, but just in case
    if (error instanceof z.ZodError) {
      console.error('Checkout: Unhandled ZodError:', error.issues)
      return NextResponse.json(
        { 
          error: 'Ongeldige checkout gegevens',
          details: error.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Checkout error:', error)
    if (error instanceof Error) {
      console.error('Checkout error message:', error.message)
      console.error('Checkout error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}


