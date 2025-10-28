// Test script to check if products API works
async function testProductsAPI() {
  console.log('🧪 Testing products API...')

  try {
    // Test 1: Get all products
    console.log('\n1️⃣ Testing GET /api/products...')
    const response = await fetch('http://localhost:3000/api/products')
    
    if (response.ok) {
      const products = await response.json()
      console.log(`✅ Products API successful! Found ${products.length} products`)
      
      if (products.length > 0) {
        console.log('\n📋 First few products:')
        products.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (${product.type}) - €${(product.price / 100).toFixed(2)}`)
        })
      }
    } else {
      console.log('❌ Products API failed:', response.status)
    }

    // Test 2: Get specific product
    console.log('\n2️⃣ Testing GET /api/products/[id]...')
    const productResponse = await fetch('http://localhost:3000/api/products/course-podcast')
    
    if (productResponse.ok) {
      const product = await productResponse.json()
      console.log('✅ Single product API successful!')
      console.log(`   Product: ${product.name}`)
      console.log(`   Type: ${product.type}`)
      console.log(`   Price: €${(product.price / 100).toFixed(2)}`)
    } else {
      console.log('❌ Single product API failed:', productResponse.status)
    }

  } catch (error) {
    console.error('❌ Error testing products API:', error)
  }
}

testProductsAPI()
