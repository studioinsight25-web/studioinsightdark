import { config } from 'dotenv'
import fetch from 'node-fetch'

// Load environment variables
config({ path: '.env.local' })

async function testNewsletterAPI() {
  console.log('🧪 Testing Newsletter API endpoint...')
  
  const testEmail = 'test@studio-insight.nl'
  const testName = 'Test User'
  
  try {
    const response = await fetch('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: testName,
        consent: true
      })
    })
    
    const result = await response.json()
    console.log('API Response Status:', response.status)
    console.log('API Response:', result)
    
    if (response.ok) {
      console.log('✅ Newsletter API test successful!')
      console.log('📧 Check your email for confirmation message')
    } else {
      console.log('❌ Newsletter API test failed')
    }
    
  } catch (error) {
    console.error('❌ Error testing newsletter API:', error)
  }
}

testNewsletterAPI()
