import { ProductService } from '../lib/products'

async function testDatabaseIntegration() {
  console.log('🧪 Testing database integration...')
  
  try {
    // Test 1: Get all products
    console.log('\n1️⃣ Testing getAllProducts...')
    const products = await ProductService.getAllProducts()
    console.log(`✅ Found ${products.length} products`)
    products.forEach(p => console.log(`  - ${p.name} (${p.type})`))
    
    // Test 2: Get products by type
    console.log('\n2️⃣ Testing getProductsByType...')
    const courses = await ProductService.getProductsByType('course')
    console.log(`✅ Found ${courses.length} courses`)
    
    const reviews = await ProductService.getProductsByType('review')
    console.log(`✅ Found ${reviews.length} reviews`)
    
    // Test 3: Get featured products
    console.log('\n3️⃣ Testing getFeaturedProducts...')
    const featured = await ProductService.getFeaturedProducts()
    console.log(`✅ Found ${featured.length} featured products`)
    
    // Test 4: Search products
    console.log('\n4️⃣ Testing searchProducts...')
    const searchResults = await ProductService.searchProducts('podcast')
    console.log(`✅ Found ${searchResults.length} products matching 'podcast'`)
    
    console.log('\n🎉 All database integration tests passed!')
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error)
  }
}

testDatabaseIntegration()
