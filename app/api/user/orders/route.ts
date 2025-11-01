import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { OrderService } from '@/lib/orders'

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user orders
    const orders = await OrderService.getUserOrders(session.userId)

    return NextResponse.json({
      orders,
      count: orders.length
    })
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

