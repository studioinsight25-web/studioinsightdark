import { UserService } from '../lib/user-database'

async function testCorrectAdminLogin() {
  console.log('🧪 Testing admin login with correct email...')

  try {
    // Test admin login with correct email
    const admin = await UserService.authenticateUser('admin@studio-insight.nl', 'Admin123!')
    
    if (admin) {
      console.log('✅ Admin login successful!')
      console.log('📧 Email:', admin.email)
      console.log('👤 Name:', admin.name)
      console.log('👑 Role:', admin.role)
    } else {
      console.log('❌ Admin login failed - invalid credentials')
    }

    // Test with old email (should fail)
    const oldEmail = await UserService.authenticateUser('admin@studioinsight.nl', 'Admin123!')
    if (!oldEmail) {
      console.log('✅ Old email correctly rejected')
    } else {
      console.log('❌ Old email was accepted (should be deleted)')
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error)
  }
}

testCorrectAdminLogin()
