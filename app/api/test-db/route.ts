// app/api/test-db/route.ts - Test database connection on live site
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test basic connection
    await prisma.$connect()
    
    // Test queries
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
