// app/api/cart/route.ts - Cart API endpoints
import { NextRequest, NextResponse } from 'next/server'
import { CartService } from '@/lib/cart-database'
import { getSessionFromRequest } from '@/lib/session-server'

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await CartService.getCartItems(session.userId)
    // Always return cartItems array, even if empty
    return NextResponse.json({ cartItems: cartItems || [] })
  } catch (error) {
    console.error('Error fetching cart:', error)
    // Return empty array instead of error to allow page to display empty state
    return NextResponse.json({ cartItems: [] })
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      console.error('Cart API: No session or userId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body
    
    if (!productId) {
      console.error('Cart API: Missing productId', body)
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    console.log(`Cart API: Adding product ${productId} to cart for user ${session.userId}`)

    const result = await CartService.addToCart(session.userId, productId, quantity)
    
    if (result) {
      console.log(`Cart API: Successfully added product ${productId} to cart`)
      return NextResponse.json({ success: true, cartItem: result })
    } else {
      console.error(`Cart API: Failed to add product ${productId} to cart - returned null`)
      return NextResponse.json({ 
        error: 'Failed to add to cart. Please check if the cartItems table exists in the database.' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Cart API: Error adding to cart:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Cart API: Error details:', { errorMessage, errorStack })
    
    return NextResponse.json({ 
      error: `Failed to add to cart: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const success = await CartService.removeFromCart(session.userId, productId)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}



