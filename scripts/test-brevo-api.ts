import { config } from 'dotenv'
import { brevoSendConfirmationEmail, brevoUpsertContact } from '../lib/brevo'

// Load environment variables
config({ path: '.env.local' })

async function testBrevoAPI() {
  console.log('🧪 Testing Brevo API...')
  
  const testEmail = 'test@example.com'
  const testName = 'Test User'
  const confirmationUrl = 'http://localhost:3000/newsletter/confirm?token=test123'
  
  try {
    // Test 1: Send confirmation email
    console.log('\n1️⃣ Testing confirmation email...')
    const emailResult = await brevoSendConfirmationEmail(testEmail, testName, confirmationUrl)
    console.log('Email result:', emailResult)
    
    // Test 2: Upsert contact
    console.log('\n2️⃣ Testing contact upsert...')
    const contactResult = await brevoUpsertContact(testEmail, testName, 'pending')
    console.log('Contact result:', contactResult)
    
    console.log('\n✅ Brevo API test completed')
    
  } catch (error) {
    console.error('❌ Brevo API test failed:', error)
  }
}

testBrevoAPI()
