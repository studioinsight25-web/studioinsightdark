import { UserService } from '../lib/user-database'
import { prisma } from '../lib/prisma'

async function updateAdminPassword() {
  console.log('🔐 Updating admin password...')

  try {
    // Find admin user
    const admin = await UserService.getUserByEmail('admin@studio-insight.nl')
    
    if (!admin) {
      console.log('❌ Admin user not found!')
      return
    }

    console.log('✅ Admin user found:', admin.email)

    // Hash new password
    const newPassword = 'Kaasboer19792014@'
    const hashedPassword = await require('bcryptjs').hash(newPassword, 12)

    // Update password in database
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })

    console.log('✅ Admin password updated successfully!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 New Password: Kaasboer19792014@')
    console.log('👑 Role:', admin.role)

    // Test the new password
    console.log('\n🧪 Testing new password...')
    const testLogin = await UserService.authenticateUser('admin@studio-insight.nl', newPassword)
    
    if (testLogin) {
      console.log('✅ New password works correctly!')
    } else {
      console.log('❌ New password test failed!')
    }

  } catch (error) {
    console.error('❌ Error updating admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()
