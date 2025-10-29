// app/api/test-db-direct/route.ts - Direct database connection test
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing direct database connection...')
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    // Use pg directly instead of Prisma
    const { default: pg } = await import('pg')
    const { Pool } = pg
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    console.log('✅ Database pool created')
    
    // Test simple query
    const result = await pool.query('SELECT 1 as test, COUNT(*) as user_count FROM users')
    
    console.log('✅ Query executed successfully')
    
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: 'Direct database connection successful',
      data: {
        test: result.rows[0].test,
        userCount: parseInt(result.rows[0].user_count),
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Direct database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
