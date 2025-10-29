import { UserService } from '../lib/user-database'
import { prisma } from '../lib/prisma'

async function updateAdminAccount() {
  console.log('🔐 Updating admin account...')

  try {
    // Delete old admin account
    const oldAdmin = await UserService.getUserByEmail('admin@studioinsight.nl')
    if (oldAdmin) {
      await prisma.user.delete({ where: { id: oldAdmin.id } })
      console.log('✅ Old admin account deleted')
    }

    // Check if new admin already exists
    const existingAdmin = await UserService.getUserByEmail('admin@studio-insight.nl')
    if (existingAdmin) {
      console.log('✅ Admin account already exists:', existingAdmin.email)
      return
    }

    // Create new admin account with correct email
    const admin = await prisma.user.create({
      data: {
        email: 'admin@studio-insight.nl',
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
    console.error('❌ Error updating admin account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminAccount()


