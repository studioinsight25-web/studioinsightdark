// Test script to check both admin and user login
async function testBothLogins() {
  console.log('🧪 Testing both admin and user login...')

  try {
    // Test 1: Admin login
    console.log('\n1️⃣ Testing admin login...')
    const adminResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@studio-insight.nl',
        password: 'Kaasboer19792014@'
      }),
    })

    const adminResult = await adminResponse.json()
    
    if (adminResponse.ok && adminResult.user) {
      console.log('✅ Admin login successful!')
      console.log('   Email:', adminResult.user.email)
      console.log('   Role:', adminResult.user.role)
      console.log('   Should redirect to: /admin')
    } else {
      console.log('❌ Admin login failed:', adminResult.error)
    }

    // Test 2: User login
    console.log('\n2️⃣ Testing user login...')
    const userResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@studioinsight.nl',
        password: 'demo123'
      }),
    })

    const userResult = await userResponse.json()
    
    if (userResponse.ok && userResult.user) {
      console.log('✅ User login successful!')
      console.log('   Email:', userResult.user.email)
      console.log('   Role:', userResult.user.role)
      console.log('   Should redirect to: /dashboard')
    } else {
      console.log('❌ User login failed:', userResult.error)
    }

    // Test 3: Wrong credentials
    console.log('\n3️⃣ Testing wrong credentials...')
    const wrongResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'wrong@email.com',
        password: 'wrongpassword'
      }),
    })

    const wrongResult = await wrongResponse.json()
    
    if (!wrongResponse.ok) {
      console.log('✅ Wrong credentials correctly rejected:', wrongResult.error)
    } else {
      console.log('❌ Wrong credentials were accepted!')
    }

  } catch (error) {
    console.error('❌ Error during login tests:', error)
  }
}

testBothLogins()


