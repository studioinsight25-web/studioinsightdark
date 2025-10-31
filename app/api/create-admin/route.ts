// app/api/create-admin/route.ts - Create admin account via API
import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔍 Creating admin account...')
    
    // Check if admin already exists
    const existingAdmin = await DatabaseService.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@studioinsight.nl']
    )
    
    if (existingAdmin.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Admin account already exists',
        data: {
          email: existingAdmin.rows[0].email,
          id: existingAdmin.rows[0].id
        }
      })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Create admin user
    const result = await DatabaseService.query(
      `INSERT INTO users (id, email, name, password, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, email, name, role`,
      [crypto.randomUUID(), 'admin@studioinsight.nl', 'Admin', hashedPassword, 'ADMIN']
    )
    
    console.log('✅ Admin account created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        email: result[0].email,
        name: result[0].name,
        role: result[0].role,
        password: 'admin123'
      }
    })
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}




