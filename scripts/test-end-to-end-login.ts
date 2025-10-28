// Test script to check if login works end-to-end
async function testEndToEndLogin() {
  console.log('🧪 Testing end-to-end admin login...')

  try {
    // Step 1: Test API login
    console.log('\n1️⃣ Testing API login...')
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
    
    if (response.ok && result.user) {
      console.log('✅ API login successful!')
      console.log('   User ID:', result.user.id)
      console.log('   Email:', result.user.email)
      console.log('   Role:', result.user.role)
      
      // Step 2: Test session data
      console.log('\n2️⃣ Testing session data structure...')
      const sessionData = {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name || '',
        role: result.user.role,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      
      console.log('✅ Session data structure:')
      console.log(JSON.stringify(sessionData, null, 2))
      
      // Step 3: Test cookie format
      console.log('\n3️⃣ Testing cookie format...')
      const cookieValue = JSON.stringify(sessionData)
      console.log('✅ Cookie value length:', cookieValue.length)
      console.log('✅ Cookie value preview:', cookieValue.substring(0, 100) + '...')
      
      // Step 4: Test admin dashboard access
      console.log('\n4️⃣ Testing admin dashboard access...')
      try {
        const dashboardResponse = await fetch('http://localhost:3000/admin', {
          headers: {
            'Cookie': `studio-insight-session=${encodeURIComponent(cookieValue)}`
          }
        })
        
        console.log('Dashboard response status:', dashboardResponse.status)
        
        if (dashboardResponse.status === 200) {
          console.log('✅ Admin dashboard accessible!')
        } else if (dashboardResponse.status === 302) {
          console.log('⚠️  Admin dashboard redirects (middleware issue)')
        } else {
          console.log('❌ Admin dashboard not accessible:', dashboardResponse.status)
        }
      } catch (dashboardError) {
        const msg = dashboardError instanceof Error ? dashboardError.message : String(dashboardError)
        console.log('❌ Dashboard access error:', msg)
      }
      
    } else {
      console.log('❌ API login failed:', result.error)
    }

  } catch (error) {
    console.error('❌ Error during end-to-end test:', error)
  }
}

testEndToEndLogin()
