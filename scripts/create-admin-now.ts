// scripts/create-admin-now.ts - Create admin user directly
import { DatabaseService } from '../lib/database-direct'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user...')
    
    const email = 'admin@studioinsight.nl'
    const password = 'admin123'
    const name = 'Admin User'
    const role = 'ADMIN'
    
    // Check if admin already exists
    const existingUser = await DatabaseService.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists')
      console.log('Login credentials:')
      console.log('Email:', email)
      console.log('Password:', password)
      return
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
    console.log('User details:', user)
    console.log('')
    console.log('🔑 Login credentials:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('')
    console.log('You can now login at: https://studioinsightdark.vercel.app/login')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  }
}

createAdmin()

