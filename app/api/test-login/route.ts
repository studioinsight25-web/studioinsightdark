// app/api/test-login/route.ts - Test login functionality
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Testing login for:', email)

    // Get user from database
    const result = await DatabaseService.query(
      'SELECT id, email, name, password, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    )

    if (result.length === 0) {
      console.log('❌ User not found:', email)
      return NextResponse.json({
        success: false,
        message: 'User not found',
        email: email
      })
    }

    const user = result[0]
    console.log('✅ User found:', user.email, 'Role:', user.role)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('🔐 Password valid:', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email)
      return NextResponse.json({
        success: false,
        message: 'Invalid password',
        email: email
      })
    }

    console.log('✅ Login test successful for:', email)

    return NextResponse.json({
      success: true,
      message: 'Login test successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    })

  } catch (error) {
    console.error('❌ Login test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login test failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test login',
    testCredentials: [
      { email: 'admin@studioinsight.nl', password: 'admin123' },
      { email: 'test@example.com', password: 'password123' }
    ]
  })
}




