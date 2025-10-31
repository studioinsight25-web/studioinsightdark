// create-admin-direct.js - Create admin directly in database
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Load environment variables
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function createAdmin() {
  const client = await pool.connect()
  try {
    console.log('🚀 Creating admin user directly...')
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    const email = 'admin@studio-insight.nl'
    const password = 'admin123'
    const name = 'Admin User'
    const role = 'ADMIN'
    
    // Check if admin exists
    const checkResult = await client.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    )
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('🔐 Password hashed')
    
    let user
    if (checkResult.rows.length > 0) {
      // Update existing admin user
      const result = await client.query(
        'UPDATE users SET password = $1, name = $2, role = $3, "updatedAt" = NOW() WHERE email = $4 RETURNING id, email, name, role',
        [hashedPassword, name, role, email]
      )
      user = result.rows[0]
      console.log('✅ Admin user updated successfully!')
      console.log('User details:', user)
    } else {
      // Create admin user
      const result = await client.query(
        'INSERT INTO users (email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email, name, role',
        [email, name, hashedPassword, role]
      )
      user = result.rows[0]
      console.log('✅ Admin user created successfully!')
      console.log('User details:', user)
    }
    console.log('')
    console.log('🔑 Login credentials:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('')
    console.log('You can now login at: https://studioinsightdark.vercel.app/inloggen')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    client.release()
  }
  await pool.end()
}

createAdmin()




