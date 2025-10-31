// app/api/cart/route.ts - Cart API endpoints
import { NextRequest, NextResponse } from 'next/server'
import { CartService } from '@/lib/cart-database'
import SessionManager from '@/lib/session'

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = SessionManager.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await CartService.getCartItems(session.userId)
    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = SessionManager.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const success = await CartService.addToCart(session.userId, productId, quantity)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = SessionManager.getSession()
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



