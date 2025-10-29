// app/api/create-admin-simple/route.ts - Simple admin creation
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating simple admin user...')
    
    const email = 'admin@studioinsight.nl'
    const password = 'admin123'
    const name = 'Admin User'
    const role = 'ADMIN'
    
    // Check if admin already exists
    const existingUser = await DatabaseService.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    )
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists')
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: existingUser.rows[0],
        loginCredentials: {
          email: email,
          password: password
        }
      })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('🔐 Password hashed')
    
    // Create admin user
    const result = await DatabaseService.query(
      'INSERT INTO users (email, name, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email, name, role',
      [email, name, hashedPassword, role]
    )
    
    const user = result.rows[0]
    console.log('✅ Admin user created successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: user,
      loginCredentials: {
        email: email,
        password: password
      }
    })
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create admin user',
    credentials: {
      email: 'admin@studioinsight.nl',
      password: 'admin123'
    }
  })
}
