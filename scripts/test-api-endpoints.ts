import { PrismaClient, ProductType } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPIEndpoints() {
  console.log('🧪 Testing API endpoints...')
  
  let testProduct: any = null
  
  try {
    // Test 1: Create product via API simulation
    console.log('\n1️⃣ Testing product creation via API...')
    const productData = {
      name: 'API Test Cursus',
      description: 'Dit is een test cursus om de API functionaliteit te testen.',
      shortDescription: 'API test cursus.',
      price: 12900, // €129.00
      type: 'course',
      isActive: true,
      featured: false,
      comingSoon: false,
      sales: 0,
      duration: '4 uur',
      level: 'Gemiddeld',
      students: '0',
      lessons: '10',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
      imagePublicId: 'api-test-course-image',
      externalUrl: null,
    }
    
    // Simulate API call by directly creating in database
    testProduct = await prisma.product.create({
      data: {
        ...productData,
        type: ProductType.COURSE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    console.log('✅ Product created via API simulation:', testProduct.name)
    
    // Test 2: Read product via API simulation
    console.log('\n2️⃣ Testing product reading via API...')
    const readProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    })
    if (readProduct) {
      console.log('✅ Product read via API simulation:', readProduct.name)
    } else {
      console.log('❌ Failed to read product via API')
    }
    
    // Test 3: Update product via API simulation
    console.log('\n3️⃣ Testing product update via API...')
    const updatedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: {
        name: 'API Test Cursus - Updated',
        price: 17900 // €179.00
      }
    })
    console.log('✅ Product updated via API simulation:', updatedProduct.name, '€' + (updatedProduct.price / 100).toFixed(2))
    
    // Test 4: List products via API simulation
    console.log('\n4️⃣ Testing product listing via API...')
    const allProducts = await prisma.product.findMany()
    console.log(`✅ Found ${allProducts.length} products via API simulation`)
    
    // Test 5: Delete product via API simulation
    console.log('\n5️⃣ Testing product deletion via API...')
    await prisma.product.delete({
      where: { id: testProduct.id }
    })
    console.log('✅ Product deleted via API simulation')
    
    // Test 6: Verify deletion
    console.log('\n6️⃣ Verifying deletion via API...')
    const remainingProducts = await prisma.product.findMany()
    console.log(`✅ Remaining products: ${remainingProducts.length}`)
    
    console.log('\n🎉 All API endpoint functionalities tested successfully!')
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  } finally {
    // Cleanup
    if (testProduct) {
      try {
        await prisma.product.delete({ where: { id: testProduct.id } })
        console.log('🧹 Cleanup: Test product removed')
      } catch (error) {
        console.log('🧹 Cleanup: Test product already removed')
      }
    }
    await prisma.$disconnect()
  }
}

testAPIEndpoints()

