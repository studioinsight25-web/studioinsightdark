import { DatabaseProductService } from '../lib/products-database'

async function checkDatabaseProducts() {
  console.log('🔍 Checking products in database...')

  try {
    const products = await DatabaseProductService.getAllProducts()
    
    console.log(`\n📊 Total products in database: ${products.length}`)
    
    if (products.length === 0) {
      console.log('❌ No products found in database!')
      return
    }

    console.log('\n📋 Products in database:')
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Type: ${product.type}`)
      console.log(`   Price: €${(product.price / 100).toFixed(2)}`)
      console.log(`   Active: ${product.isActive}`)
      console.log(`   Featured: ${product.featured}`)
      console.log(`   Image: ${product.imageUrl ? 'Yes' : 'No'}`)
    })

  } catch (error) {
    console.error('❌ Error checking database products:', error)
  }
}

checkDatabaseProducts()
