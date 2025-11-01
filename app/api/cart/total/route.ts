// app/api/cart/total/route.ts - Get cart total
import { NextRequest, NextResponse } from 'next/server'
import { CartService } from '@/lib/cart-database'
import { getSessionFromRequest } from '@/lib/session-server'

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const total = await CartService.getCartTotal(session.userId)
    return NextResponse.json({ total })
  } catch (error) {
    console.error('Error fetching cart total:', error)
    return NextResponse.json({ error: 'Failed to fetch cart total' }, { status: 500 })
  }
}



