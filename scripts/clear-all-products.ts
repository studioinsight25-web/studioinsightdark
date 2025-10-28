import { prisma } from '../lib/prisma'

async function clearAllProducts() {
  console.log('🗑️ Clearing all products from database...')

  try {
    // Delete all products
    const result = await prisma.product.deleteMany({})
    
    console.log(`✅ Deleted ${result.count} products from database`)
    console.log('📊 Database is now empty and ready for new products')

  } catch (error) {
    console.error('❌ Error clearing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllProducts()
