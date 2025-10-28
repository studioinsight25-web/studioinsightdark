import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLocalStorageProducts() {
  console.log('🔍 Checking localStorage for products...')
  
  try {
    // Check if there are any products in localStorage by looking at the ProductStorage
    // Since we can't directly access localStorage from Node.js, we'll check if there are
    // any products that might have been stored in localStorage format
    
    console.log('📊 Checking database for any existing products...')
    const existingProducts = await prisma.product.findMany()
    console.log(`Found ${existingProducts.length} products in database`)
    
    if (existingProducts.length > 0) {
      console.log('\n📚 Current products in database:')
      existingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   Type: ${product.type}`)
        console.log(`   Price: €${(product.price / 100).toFixed(2)}`)
        console.log(`   Created: ${product.createdAt.toISOString()}`)
        console.log('')
      })
    }
    
    console.log('\n💡 To check localStorage products, you can:')
    console.log('1. Open your browser developer tools (F12)')
    console.log('2. Go to Application/Storage tab')
    console.log('3. Look for "studio-insight-products" in localStorage')
    console.log('4. Copy the JSON data and share it with me')
    
    console.log('\n🔍 Or run this in your browser console:')
    console.log('console.log(JSON.parse(localStorage.getItem("studio-insight-products") || "[]"))')
    
  } catch (error) {
    console.error('❌ Error checking localStorage products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLocalStorageProducts()
