import { UserService } from '../lib/user-database'

async function testAdminLogin() {
  console.log('🧪 Testing admin login...')

  try {
    // Test admin login
    const admin = await UserService.authenticateUser('admin@studioinsight.nl', 'Admin123!')
    
    if (admin) {
      console.log('✅ Admin login successful!')
      console.log('📧 Email:', admin.email)
      console.log('👤 Name:', admin.name)
      console.log('👑 Role:', admin.role)
    } else {
      console.log('❌ Admin login failed - invalid credentials')
    }

    // Test with wrong password
    const wrongPassword = await UserService.authenticateUser('admin@studioinsight.nl', 'wrongpassword')
    if (!wrongPassword) {
      console.log('✅ Wrong password correctly rejected')
    } else {
      console.log('❌ Wrong password was accepted (security issue!)')
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error)
  }
}

testAdminLogin()
