// Test script to check if Google Analytics is working
console.log('🧪 Testing Google Analytics setup...')

// Check if the Analytics component is working
const checkAnalytics = () => {
  console.log('\n1️⃣ Checking Google Analytics script loading...')
  
  // Check if gtag script is loaded
  const gtagScript = document.querySelector('script[src*="googletagmanager.com"]')
  if (gtagScript) {
    console.log('✅ Google Analytics script found in DOM')
    console.log('   Script src:', gtagScript.getAttribute('src'))
  } else {
    console.log('❌ Google Analytics script not found in DOM')
  }
  
  // Check if gtag function exists
  if (typeof window.gtag === 'function') {
    console.log('✅ gtag function is available')
  } else {
    console.log('❌ gtag function not available')
  }
  
  // Check if dataLayer exists
  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    console.log('✅ dataLayer is available')
    console.log('   DataLayer length:', window.dataLayer.length)
  } else {
    console.log('❌ dataLayer not available')
  }
  
  // Check environment variable
  console.log('\n2️⃣ Checking environment variables...')
  console.log('   NEXT_PUBLIC_GA_ID:', process.env.NEXT_PUBLIC_GA_ID || 'undefined')
  
  console.log('\n🎉 Google Analytics test completed!')
}

// Run the test
checkAnalytics()
