// app/api/check-users/route.ts - Check existing users in database
import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET() {
  try {
    console.log('🔍 Checking existing users...')
    
    // Get all users
    const users = await DatabaseService.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    )
    
    console.log('✅ Users retrieved successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.rows,
        count: users.rows.length
      }
    })
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
