import { UserService } from '../lib/user-database'
import { prisma } from '../lib/prisma'

async function createAdminAccount() {
  console.log('🔐 Creating admin account...')

  try {
    // Check if admin already exists
    const existingAdmin = await UserService.getUserByEmail('admin@studioinsight.nl')
    if (existingAdmin) {
      console.log('✅ Admin account already exists:', existingAdmin.email)
      return
    }

    // Create admin account with ADMIN role
    const admin = await prisma.user.create({
      data: {
        email: 'admin@studioinsight.nl',
        password: await require('bcryptjs').hash('Admin123!', 12),
        name: 'Studio Insight Admin',
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin account created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('🔑 Password: Admin123!')
    console.log('👑 Role: ADMIN')
    console.log('⚠️  Please change the password after first login!')

  } catch (error) {
    console.error('❌ Error creating admin account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminAccount()
