import { prisma } from '../lib/prisma'

async function checkProducts() {
  console.log('🔍 Checking products in database...')
  
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📊 Total products in database: ${products.length}`)
    
    if (products.length > 0) {
      console.log('\n📚 All products:')
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   Type: ${product.type}`)
        console.log(`   Price: €${(product.price / 100).toFixed(2)}`)
        console.log(`   Active: ${product.isActive}`)
        console.log(`   Featured: ${product.featured}`)
        console.log(`   Created: ${product.createdAt.toISOString()}`)
        console.log(`   Image: ${product.imageUrl ? 'Yes' : 'No'}`)
        console.log(`   Description: ${product.description ? product.description.substring(0, 100) + '...' : 'No description'}`)
        console.log('')
      })
    } else {
      console.log('❌ No products found in database')
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()