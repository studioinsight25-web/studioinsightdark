// app/api/test-db-working/route.ts - Working database test with direct queries
import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET() {
  try {
    console.log('🔍 Testing working database connection...')
    
    // Test basic connection
    const testResult = await DatabaseService.query('SELECT 1 as test, NOW() as current_time')
    console.log('✅ Basic query successful')
    
    // Test counts
    const userCount = await DatabaseService.getUserCount()
    const productCount = await DatabaseService.getProductCount()
    const orderCount = await DatabaseService.getOrderCount()
    
    console.log('✅ All queries successful')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful with direct queries',
      data: {
        test: testResult.rows[0].test,
        currentTime: testResult.rows[0].current_time,
        users: userCount,
        products: productCount,
        orders: orderCount,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
    
  } finally {
    // Don't close the pool in serverless environment
    // await DatabaseService.close()
  }
}
