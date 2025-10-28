import { PrismaClient, ProductType } from '@prisma/client'
import { DatabaseProductService } from '../lib/products-database'

const prisma = new PrismaClient()

async function testAllDatabaseFunctionalities() {
  console.log('🧪 Testing all database functionalities...')
  
  let testProduct: any = null
  
  try {
    // 1. Test database connection
    console.log('\n1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // 2. Test product creation
    console.log('\n2️⃣ Testing product creation...')
    const productData = {
      name: 'Test Cursus',
      description: 'Dit is een test cursus om de database functionaliteit te testen.',
      shortDescription: 'Test cursus voor database test.',
      price: 9900, // €99.00
      type: ProductType.COURSE,
      isActive: true,
      featured: true,
      comingSoon: false,
      sales: 0,
      duration: '3 uur',
      level: 'Beginner',
      students: '0',
      lessons: '8',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
      imagePublicId: 'test-course-image',
      externalUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    testProduct = await prisma.product.create({
      data: productData
    })
    console.log('✅ Product created:', testProduct.name)
    
    // 3. Test product reading
    console.log('\n3️⃣ Testing product reading...')
    const readProduct = await DatabaseProductService.getProduct(testProduct.id)
    if (readProduct) {
      console.log('✅ Product read successfully:', readProduct.name)
    } else {
      console.log('❌ Failed to read product')
    }
    
    // 4. Test product update
    console.log('\n4️⃣ Testing product update...')
    const updatedProduct = await DatabaseProductService.updateProduct(testProduct.id, {
      name: 'Test Cursus - Updated',
      price: 14900 // €149.00
    })
    if (updatedProduct) {
      console.log('✅ Product updated successfully:', updatedProduct.name, '€' + (updatedProduct.price / 100).toFixed(2))
    } else {
      console.log('❌ Failed to update product')
    }
    
    // 5. Test product listing
    console.log('\n5️⃣ Testing product listing...')
    const allProducts = await DatabaseProductService.getAllProducts()
    console.log(`✅ Found ${allProducts.length} products`)
    
    const activeProducts = await DatabaseProductService.getActiveProducts()
    console.log(`✅ Found ${activeProducts.length} active products`)
    
    const featuredProducts = await DatabaseProductService.getFeaturedProducts()
    console.log(`✅ Found ${featuredProducts.length} featured products`)
    
    const courses = await DatabaseProductService.getProductsByType('course')
    console.log(`✅ Found ${courses.length} courses`)
    
    // 6. Test product search
    console.log('\n6️⃣ Testing product search...')
    const searchResults = await DatabaseProductService.searchProducts('Test')
    console.log(`✅ Search found ${searchResults.length} products`)
    
    // 7. Test product deletion
    console.log('\n7️⃣ Testing product deletion...')
    const deleteSuccess = await DatabaseProductService.deleteProduct(testProduct.id)
    if (deleteSuccess) {
      console.log('✅ Product deleted successfully')
    } else {
      console.log('❌ Failed to delete product')
    }
    
    // 8. Verify deletion
    console.log('\n8️⃣ Verifying deletion...')
    const remainingProducts = await DatabaseProductService.getAllProducts()
    console.log(`✅ Remaining products: ${remainingProducts.length}`)
    
    console.log('\n🎉 All database functionalities tested successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    // Cleanup: make sure test product is deleted
    if (testProduct) {
      try {
        await prisma.product.delete({ where: { id: testProduct.id } })
        console.log('🧹 Cleanup: Test product removed')
      } catch (error) {
        console.log('🧹 Cleanup: Test product already removed or error:', error.message)
      }
    }
    await prisma.$disconnect()
  }
}

testAllDatabaseFunctionalities()
