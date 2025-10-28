async function testAdminLoginAPI() {
  console.log('🧪 Testing admin login API...')

  try {
    const response = await fetch('http://localhost:3000/api/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@studioinsight.nl',
        password: 'Admin123!'
      }),
    })

    const result = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', result)

    if (response.ok && result.user) {
      console.log('✅ Admin login API successful!')
      console.log('📧 Email:', result.user.email)
      console.log('👤 Name:', result.user.name)
      console.log('👑 Role:', result.user.role)
    } else {
      console.log('❌ Admin login API failed:', result.error)
    }

  } catch (error) {
    console.error('❌ Error testing admin login API:', error)
  }
}

testAdminLoginAPI()
