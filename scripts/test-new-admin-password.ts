import { UserService } from '../lib/user-database'

async function testNewAdminPassword() {
  console.log('🧪 Testing admin login with new password...')

  try {
    // Test admin login with new password
    const admin = await UserService.authenticateUser('admin@studio-insight.nl', 'Kaasboer19792014@')
    
    if (admin) {
      console.log('✅ Admin login with new password successful!')
      console.log('📧 Email:', admin.email)
      console.log('👤 Name:', admin.name)
      console.log('👑 Role:', admin.role)
    } else {
      console.log('❌ Admin login with new password failed!')
    }

    // Test with old password (should fail)
    const oldPassword = await UserService.authenticateUser('admin@studio-insight.nl', 'Admin123!')
    if (!oldPassword) {
      console.log('✅ Old password correctly rejected')
    } else {
      console.log('❌ Old password was accepted (should be updated)')
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error)
  }
}

testNewAdminPassword()
