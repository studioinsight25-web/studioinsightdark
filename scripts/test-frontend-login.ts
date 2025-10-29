// Test script to simulate frontend login
async function testFrontendLogin() {
  console.log('🧪 Testing frontend login simulation...')

  try {
    // Simulate the exact same request as the frontend
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
    
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(result, null, 2))

    if (response.ok && result.user) {
      console.log('✅ Frontend login simulation successful!')
      console.log('📧 Email:', result.user.email)
      console.log('👤 Name:', result.user.name)
      console.log('👑 Role:', result.user.role)
      
      // Test session data structure
      const sessionData = {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name || '',
        role: result.user.role,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      
      console.log('\n📝 Session data that would be stored:')
      console.log(JSON.stringify(sessionData, null, 2))
      
    } else {
      console.log('❌ Frontend login simulation failed!')
      console.log('Error:', result.error)
    }

  } catch (error) {
    console.error('❌ Error during frontend login test:', error)
  }
}

testFrontendLogin()

