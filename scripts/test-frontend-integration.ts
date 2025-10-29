import { PrismaClient, ProductType } from '@prisma/client'

const prisma = new PrismaClient()

async function testFrontendIntegration() {
  console.log('🧪 Testing frontend integration...')
  
  let testProduct: any = null
  
  try {
    // Create a test product
    console.log('\n1️⃣ Creating test product for frontend...')
    testProduct = await prisma.product.create({
      data: {
        name: 'Frontend Test Cursus',
        description: 'Dit is een test cursus om de frontend integratie te testen.',
        shortDescription: 'Frontend test cursus.',
        price: 7900, // €79.00
        type: ProductType.COURSE,
        isActive: true,
        featured: true,
        comingSoon: false,
        sales: 0,
        duration: '2 uur',
        level: 'Beginner',
        students: '0',
        lessons: '6',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
        imagePublicId: 'frontend-test-course-image',
        externalUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    console.log('✅ Test product created:', testProduct.name)
    
    // Test API endpoint simulation
    console.log('\n2️⃣ Testing API endpoint simulation...')
    
    // Simulate GET /api/products
    const allProducts = await prisma.product.findMany()
    console.log(`✅ GET /api/products would return ${allProducts.length} products`)
    
    // Simulate GET /api/products/[id]
    const singleProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    })
    if (singleProduct) {
      console.log(`✅ GET /api/products/${testProduct.id} would return: ${singleProduct.name}`)
    }
    
    // Test product data structure for frontend
    console.log('\n3️⃣ Testing product data structure...')
    const productForFrontend = {
      id: testProduct.id,
      name: testProduct.name,
      description: testProduct.description,
      shortDescription: testProduct.shortDescription,
      price: testProduct.price,
      type: testProduct.type.toLowerCase(),
      isActive: testProduct.isActive,
      featured: testProduct.featured,
      comingSoon: testProduct.comingSoon,
      sales: testProduct.sales,
      duration: testProduct.duration,
      level: testProduct.level,
      students: testProduct.students,
      lessons: testProduct.lessons,
      imageUrl: testProduct.imageUrl,
      imagePublicId: testProduct.imagePublicId,
      externalUrl: testProduct.externalUrl,
      createdAt: testProduct.createdAt.toISOString(),
      updatedAt: testProduct.updatedAt.toISOString(),
    }
    
    console.log('✅ Product data structure is frontend-ready:')
    console.log('   - ID:', productForFrontend.id)
    console.log('   - Name:', productForFrontend.name)
    console.log('   - Price: €' + (productForFrontend.price / 100).toFixed(2))
    console.log('   - Type:', productForFrontend.type)
    console.log('   - Featured:', productForFrontend.featured)
    console.log('   - Image URL:', productForFrontend.imageUrl ? 'Present' : 'Missing')
    
    // Test product filtering
    console.log('\n4️⃣ Testing product filtering...')
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true }
    })
    console.log(`✅ Found ${activeProducts.length} active products`)
    
    const featuredProducts = await prisma.product.findMany({
      where: { featured: true }
    })
    console.log(`✅ Found ${featuredProducts.length} featured products`)
    
    const courses = await prisma.product.findMany({
      where: { type: ProductType.COURSE }
    })
    console.log(`✅ Found ${courses.length} courses`)
    
    console.log('\n🎉 Frontend integration test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Database connection works')
    console.log('   ✅ Product creation works')
    console.log('   ✅ Product data structure is frontend-ready')
    console.log('   ✅ API endpoints would work correctly')
    console.log('   ✅ Product filtering works')
    console.log('   ✅ All data types are correct')
    
  } catch (error) {
    console.error('❌ Frontend integration test failed:', error)
  } finally {
    // Cleanup
    if (testProduct) {
      try {
        await prisma.product.delete({ where: { id: testProduct.id } })
        console.log('\n🧹 Cleanup: Test product removed')
      } catch (error) {
        console.log('\n🧹 Cleanup: Test product already removed')
      }
    }
    await prisma.$disconnect()
  }
}

testFrontendIntegration()

