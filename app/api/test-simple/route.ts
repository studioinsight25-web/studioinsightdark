// app/api/test-simple/route.ts - Simple test without database
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Simple test endpoint called')
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL_PREVIEW: process.env.DATABASE_URL?.substring(0, 20) + '...'
    }
    
    console.log('Environment check:', envCheck)
    
    return NextResponse.json({
      success: true,
      message: 'Simple test successful',
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Simple test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

