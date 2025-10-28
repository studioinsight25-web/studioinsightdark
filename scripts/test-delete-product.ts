import { prisma } from '../lib/prisma'

async function testDeleteProduct() {
  console.log('🧪 Testing product deletion...')
  
  try {
    // First, let's see what products we have
    const products = await prisma.product.findMany()
    console.log(`\n📊 Found ${products.length} products:`)
    products.forEach((p, i) => console.log(`${i + 1}. ${p.name} (${p.id})`))
    
    if (products.length === 0) {
      console.log('❌ No products found to delete')
      return
    }
    
    // Try to delete the first product
    const firstProduct = products[0]
    console.log(`\n🗑️ Attempting to delete: ${firstProduct.name} (${firstProduct.id})`)
    
    const deleteResult = await prisma.product.delete({
      where: { id: firstProduct.id }
    })
    
    console.log('✅ Product deleted successfully:', deleteResult.name)
    
    // Check remaining products
    const remainingProducts = await prisma.product.findMany()
    console.log(`\n📊 Remaining products: ${remainingProducts.length}`)
    
  } catch (error) {
    console.error('❌ Error deleting product:', error)
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error details:', msg)
    
    // Check if there are foreign key constraints
    if ((error as any).code === 'P2003') {
      console.log('\n🔍 This error suggests foreign key constraints.')
      console.log('The product might be referenced by other tables (orders, cart items, etc.)')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDeleteProduct()
