// app/api/check-admin/route.ts - Check if admin exists
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET() {
  try {
    console.log('🔍 Checking for admin users...')
    
    // Get all users
    const result = await DatabaseService.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    )
    
    const users = result.rows
    console.log('📊 Found users:', users.length)
    
    // Check for admin users
    const adminUsers = users.filter(user => user.role === 'ADMIN')
    console.log('👑 Admin users:', adminUsers.length)
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      adminUsers: adminUsers.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      })),
      adminUsers: adminUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      }))
    })
    
  } catch (error) {
    console.error('❌ Error checking admin:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check admin users',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
