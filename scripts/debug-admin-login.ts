import { UserService } from '../lib/user-database'

async function debugAdminLogin() {
  console.log('🔍 Debugging admin login...')

  try {
    // Test 1: Check if admin exists
    console.log('\n1️⃣ Checking if admin user exists...')
    const admin = await UserService.getUserByEmail('admin@studio-insight.nl')
    
    if (admin) {
      console.log('✅ Admin user found:')
      console.log('   ID:', admin.id)
      console.log('   Email:', admin.email)
      console.log('   Name:', admin.name)
      console.log('   Role:', admin.role)
    } else {
      console.log('❌ Admin user not found!')
      return
    }

    // Test 2: Test authentication
    console.log('\n2️⃣ Testing authentication...')
    const authResult = await UserService.authenticateUser('admin@studio-insight.nl', 'Kaasboer19792014@')
    
    if (authResult) {
      console.log('✅ Authentication successful!')
      console.log('   User ID:', authResult.id)
      console.log('   Email:', authResult.email)
      console.log('   Role:', authResult.role)
    } else {
      console.log('❌ Authentication failed!')
    }

    // Test 3: Test with wrong password
    console.log('\n3️⃣ Testing with wrong password...')
    const wrongAuth = await UserService.authenticateUser('admin@studio-insight.nl', 'wrongpassword')
    
    if (!wrongAuth) {
      console.log('✅ Wrong password correctly rejected')
    } else {
      console.log('❌ Wrong password was accepted!')
    }

    // Test 4: Test API endpoint
    console.log('\n4️⃣ Testing API endpoint...')
    try {
      const response = await fetch('http://localhost:3000/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@studio-insight.nl',
          password: 'Kaasboer19792014@'
        }),
      })

      const result = await response.json()
      
      console.log('API Response status:', response.status)
      console.log('API Response data:', result)

      if (response.ok && result.user) {
        console.log('✅ API login successful!')
      } else {
        console.log('❌ API login failed:', result.error)
      }
    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message)
    }

  } catch (error) {
    console.error('❌ Error during debug:', error)
  }
}

debugAdminLogin()
