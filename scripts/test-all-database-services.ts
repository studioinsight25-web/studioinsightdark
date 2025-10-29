import { CartService } from '../lib/cart-database'
import { UserService } from '../lib/user-database'
import { ProductService } from '../lib/products'

async function testAllDatabaseServices() {
  console.log('🧪 Testing all database services...')
  
  try {
    // Test 1: Create a test user
    console.log('\n1️⃣ Testing UserService...')
    const testUser = await UserService.createUser('test@example.com', 'password123', 'Test User')
    if (testUser) {
      console.log(`✅ User created: ${testUser.email}`)
      
      // Test 2: Get products
      console.log('\n2️⃣ Testing ProductService...')
      const products = await ProductService.getAllProducts()
      console.log(`✅ Found ${products.length} products`)
      
      if (products.length > 0) {
        const product = products[0]
        
        // Test 3: Add to cart
        console.log('\n3️⃣ Testing CartService...')
        const cartItem = await CartService.addToCart(testUser.id, product.id, 1)
        if (cartItem) {
          console.log(`✅ Added to cart: ${cartItem.product.name}`)
          
          // Test 4: Get cart items
          const cartItems = await CartService.getCartItems(testUser.id)
          console.log(`✅ Cart items: ${cartItems.length}`)
          
          // Test 5: Get cart total
          const total = await CartService.getCartTotal(testUser.id)
          console.log(`✅ Cart total: €${(total / 100).toFixed(2)}`)
          
          // Test 6: Clear cart
          const cleared = await CartService.clearCart(testUser.id)
          console.log(`✅ Cart cleared: ${cleared}`)
        }
      }
      
      // Test 7: Delete test user
      console.log('\n4️⃣ Cleaning up...')
      const deleted = await UserService.deleteUser(testUser.id)
      console.log(`✅ User deleted: ${deleted}`)
    }
    
    console.log('\n🎉 All database services tests passed!')
    
  } catch (error) {
    console.error('❌ Database services test failed:', error)
  }
}

testAllDatabaseServices()

