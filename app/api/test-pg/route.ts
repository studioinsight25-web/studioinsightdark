// app/api/test-pg/route.ts - Simple PostgreSQL test
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing PostgreSQL connection...')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found',
        timestamp: new Date().toISOString()
      })
    }
    
    // Simple test without Prisma
    const { Pool } = require('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
    
    const result = await pool.query('SELECT 1 as test, NOW() as current_time')
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: 'PostgreSQL connection successful',
      data: {
        test: result.rows[0].test,
        currentTime: result.rows[0].current_time,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ PostgreSQL test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
