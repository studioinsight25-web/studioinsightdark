// Test script to verify correct products are loaded
async function testCorrectProducts() {
  console.log('🧪 Testing correct products loading...')

  try {
    // Test API
    console.log('\n1️⃣ Testing products API...')
    const response = await fetch('http://localhost:3000/api/products')
    
    if (response.ok) {
      const products = await response.json()
      console.log(`✅ Products API successful! Found ${products.length} products`)
      
      // Check for specific products
      const expectedProducts = [
        'Podcasten voor beginners',
        'Bouw een persoonlijke website', 
        'Videobewerking fundamentals',
        'Content strategie masterclass',
        'E-mail marketing voor ondernemers',
        'SEO voor starters',
        'Content strategie gids',
        'Branding handboek',
        'Rode NT-USB Mini Review',
        'Logitech C920 Pro Review',
        'Elgato Stream Deck Review'
      ]
      
      console.log('\n2️⃣ Checking for expected products...')
      let foundCount = 0
      expectedProducts.forEach(expectedName => {
        const found = products.find((p: any) => p.name === expectedName)
        if (found) {
          console.log(`✅ Found: ${expectedName} (${found.type}) - €${(found.price / 100).toFixed(2)}`)
          foundCount++
        } else {
          console.log(`❌ Missing: ${expectedName}`)
        }
      })
      
      console.log(`\n📊 Found ${foundCount}/${expectedProducts.length} expected products`)
      
      if (foundCount === expectedProducts.length) {
        console.log('🎉 All expected products found!')
      } else {
        console.log('⚠️  Some products are missing')
      }
      
    } else {
      console.log('❌ Products API failed:', response.status)
    }

  } catch (error) {
    console.error('❌ Error testing products:', error)
  }
}

testCorrectProducts()
