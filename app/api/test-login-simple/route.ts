// app/api/test-login-simple/route.ts - Simple login test
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Testing login for:', email)

    // Get user from database
    const result = await DatabaseService.query(
      'SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM users WHERE email = $1',
      [email]
    )

    console.log('📊 Database result:', result.length, 'users found')

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
    console.log('🔐 Stored password hash:', user.password.substring(0, 20) + '...')

    // Test password
    const testPassword = 'admin123'
    const isValidPassword = await bcrypt.compare(testPassword, user.password)
    console.log('🔐 Password test result:', isValidPassword)

    // Also test with provided password
    const providedPasswordValid = await bcrypt.compare(password, user.password)
    console.log('🔐 Provided password test result:', providedPasswordValid)

    return NextResponse.json({
      success: true,
      message: 'Login test completed',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      passwordTests: {
        testPassword: testPassword,
        testPasswordValid: isValidPassword,
        providedPassword: password,
        providedPasswordValid: providedPasswordValid
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
    testData: {
      email: 'admin@studio-insight.nl',
      password: 'admin123'
    }
  })
}





