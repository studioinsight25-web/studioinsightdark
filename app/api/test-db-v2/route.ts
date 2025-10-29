// app/api/test-db-v2/route.ts - Test database with better error handling
import { NextResponse } from 'next/server'

export async function GET() {
  let prisma: any = null
  
  try {
    console.log('🔍 Testing database connection v2...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 20) + '...')
    
    // Dynamic import to avoid build-time issues
    const { PrismaClient } = await import('@prisma/client')
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
    
    console.log('Prisma client created successfully')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Raw query successful:', result)
    
    // Test user count
    const userCount = await prisma.user.count()
    console.log('✅ User count query successful:', userCount)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: userCount,
        testQuery: result,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
    
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect()
        console.log('Prisma disconnected')
      } catch (disconnectError) {
        console.error('Error disconnecting Prisma:', disconnectError)
      }
    }
  }
}
