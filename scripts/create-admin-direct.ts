// scripts/create-admin-direct.ts - Create admin account using direct database
import { DatabaseService } from '../lib/database-direct'
import bcrypt from 'bcryptjs'

async function createAdminAccount() {
  try {
    console.log('🔍 Creating admin account...')
    
    // Check if admin already exists
    const existingAdmin = await DatabaseService.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@studioinsight.nl']
    )
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin account already exists:', existingAdmin.rows[0].email)
      return
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
    
    console.log('✅ Admin account created successfully:')
    console.log('   Email:', result.rows[0].email)
    console.log('   Name:', result.rows[0].name)
    console.log('   Role:', result.rows[0].role)
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error)
  } finally {
    await DatabaseService.close()
  }
}

createAdminAccount()

