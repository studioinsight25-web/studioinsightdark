// app/api/reset-admin-password-final/route.ts - Final admin password reset
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Resetting admin password...')
    
    const email = 'admin@studio-insight.nl'
    const password = 'admin123'
    
    // Generate NEW hash
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('✅ Password hashed:', hashedPassword.substring(0, 30) + '...')
    
    // Update password
    const result = await DatabaseService.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, name, role',
      [hashedPassword, email]
    )
    
    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    const user = result[0]
    console.log('✅ Password reset successful')
    
    // Verify the hash works
    const verifyResult = await DatabaseService.query(
      'SELECT password FROM users WHERE email = $1',
      [email]
    )
    
    const isValid = await bcrypt.compare(password, verifyResult[0].password)
    console.log('✅ Password verification:', isValid)
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      loginCredentials: {
        email: email,
        password: password
      },
      passwordVerified: isValid
    })
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset password',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to reset admin password',
    email: 'admin@studio-insight.nl'
  })
}

