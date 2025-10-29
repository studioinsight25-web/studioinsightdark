import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET(request: NextRequest) {
  try {
    // Get real statistics from database
    const [usersResult, productsResult, ordersResult, revenueResult] = await Promise.all([
      DatabaseService.query('SELECT COUNT(*) as count FROM users'),
      DatabaseService.query('SELECT COUNT(*) as count FROM products'),
      DatabaseService.query('SELECT COUNT(*) as count FROM orders'),
      DatabaseService.query('SELECT COALESCE(SUM("totalAmount"), 0) as total FROM orders WHERE status = $1', ['PAID'])
    ])

    const stats = {
      totalUsers: parseInt(usersResult[0].count || '0', 10),
      totalProducts: parseInt(productsResult[0].count || '0', 10),
      totalOrders: parseInt(ordersResult[0].count || '0', 10),
      totalRevenue: parseFloat(revenueResult[0].total || '0')
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}