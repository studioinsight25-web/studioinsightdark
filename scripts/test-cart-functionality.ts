import { PrismaClient, ProductType, UserRole } from '@prisma/client'
import { CartService } from '../lib/cart-database'

const prisma = new PrismaClient()

async function testCartFunctionality() {
  console.log('🧪 Testing cart functionality...')
  
  let testUser: any = null
  let testProduct: any = null
  let testCartItem: any = null
  
  try {
    // Create test user
    console.log('\n1️⃣ Creating test user...')
    testUser = await prisma.user.create({
      data: {
        email: 'test-cart@example.com',
        password: 'testpassword',
        name: 'Test Cart User',
        role: UserRole.USER
      }
    })
    console.log('✅ Test user created:', testUser.email)
    
    // Create test product
    console.log('\n2️⃣ Creating test product...')
    testProduct = await prisma.product.create({
      data: {
        name: 'Cart Test Product',
        description: 'Test product for cart functionality.',
        price: 5000, // €50.00
        type: ProductType.COURSE,
        isActive: true,
        featured: false,
        comingSoon: false,
        sales: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    console.log('✅ Test product created:', testProduct.name)
    
    // Test adding to cart
    console.log('\n3️⃣ Testing add to cart...')
    const cartItem = await CartService.addToCart(testUser.id, testProduct.id, 2)
    if (cartItem) {
      console.log('✅ Added to cart:', cartItem.product.name, 'Quantity:', cartItem.quantity)
      testCartItem = cartItem
    } else {
      console.log('❌ Failed to add to cart')
    }
    
    // Test getting cart items
    console.log('\n4️⃣ Testing get cart items...')
    const cartItems = await CartService.getCartItems(testUser.id)
    console.log(`✅ Found ${cartItems.length} items in cart`)
    
    // Test cart count
    console.log('\n5️⃣ Testing cart count...')
    const cartCount = await CartService.getCartItemCount(testUser.id)
    console.log(`✅ Cart count: ${cartCount}`)
    
    // Test cart total
    console.log('\n6️⃣ Testing cart total...')
    const cartTotal = await CartService.getCartTotal(testUser.id)
    console.log(`✅ Cart total: €${(cartTotal / 100).toFixed(2)}`)
    
    // Test updating cart item
    console.log('\n7️⃣ Testing update cart item...')
    const updatedItem = await CartService.updateCartItemQuantity(testUser.id, testProduct.id, 3)
    if (updatedItem) {
      console.log('✅ Cart item updated, new quantity:', updatedItem.quantity)
    } else {
      console.log('❌ Failed to update cart item')
    }
    
    // Test removing from cart
    console.log('\n8️⃣ Testing remove from cart...')
    const removed = await CartService.removeFromCart(testUser.id, testProduct.id)
    if (removed) {
      console.log('✅ Removed from cart successfully')
    } else {
      console.log('❌ Failed to remove from cart')
    }
    
    // Test clearing cart
    console.log('\n9️⃣ Testing clear cart...')
    const cleared = await CartService.clearCart(testUser.id)
    if (cleared) {
      console.log('✅ Cart cleared successfully')
    } else {
      console.log('❌ Failed to clear cart')
    }
    
    console.log('\n🎉 All cart functionalities tested successfully!')
    
  } catch (error) {
    console.error('❌ Cart test failed:', error)
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    try {
      if (testCartItem) {
        await prisma.cartItem.delete({ where: { id: testCartItem.id } })
        console.log('✅ Test cart item removed')
      }
      if (testProduct) {
        await prisma.product.delete({ where: { id: testProduct.id } })
        console.log('✅ Test product removed')
      }
      if (testUser) {
        await prisma.user.delete({ where: { id: testUser.id } })
        console.log('✅ Test user removed')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.log('🧹 Cleanup error (some items may already be removed):', msg)
    }
    await prisma.$disconnect()
  }
}

testCartFunctionality()
