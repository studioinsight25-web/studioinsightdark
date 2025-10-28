import { DatabaseProductService } from '../lib/products-database'

async function testDeleteViaAPI() {
  console.log('🧪 Testing product deletion via DatabaseProductService...')
  
  try {
    // Get all products first
    const products = await DatabaseProductService.getAllProducts()
    console.log(`\n📊 Found ${products.length} products:`)
    products.forEach((p, i) => console.log(`${i + 1}. ${p.name} (${p.id})`))
    
    if (products.length === 0) {
      console.log('❌ No products found to delete')
      return
    }
    
    // Try to delete the first product
    const firstProduct = products[0]
    console.log(`\n🗑️ Attempting to delete via DatabaseProductService: ${firstProduct.name} (${firstProduct.id})`)
    
    const success = await DatabaseProductService.deleteProduct(firstProduct.id)
    
    if (success) {
      console.log('✅ Product deleted successfully via DatabaseProductService')
    } else {
      console.log('❌ Failed to delete product via DatabaseProductService')
    }
    
    // Check remaining products
    const remainingProducts = await DatabaseProductService.getAllProducts()
    console.log(`\n📊 Remaining products: ${remainingProducts.length}`)
    
  } catch (error) {
    console.error('❌ Error testing delete via DatabaseProductService:', error)
    console.error('Error details:', error.message)
  }
}

testDeleteViaAPI()
