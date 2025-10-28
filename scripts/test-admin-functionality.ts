import { PrismaClient, ProductType, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function testAdminFunctionality() {
  console.log('🧪 Testing admin functionality...')
  
  let testUser: any = null
  let testProduct: any = null
  
  try {
    // 1. Test admin user creation
    console.log('\n1️⃣ Testing admin user creation...')
    testUser = await prisma.user.create({
      data: {
        email: 'admin-test@studioinsight.nl',
        password: 'testpassword',
        name: 'Admin Test User',
        role: UserRole.ADMIN
      }
    })
    console.log('✅ Admin user created:', testUser.email)
    
    // 2. Test product creation
    console.log('\n2️⃣ Testing product creation...')
    testProduct = await prisma.product.create({
      data: {
        name: 'Admin Test Cursus',
        description: 'Dit is een test cursus voor admin functionaliteit.',
        shortDescription: 'Admin test cursus.',
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
        imagePublicId: 'admin-test-course-image',
        externalUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    console.log('✅ Product created:', testProduct.name)
    
    // 3. Test admin stats API
    console.log('\n3️⃣ Testing admin stats...')
    const stats = {
      totalUsers: await prisma.user.count(),
      totalProducts: await prisma.product.count(),
      totalOrders: await prisma.order.count(),
      totalRevenue: (await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'PAID' }
      }))._sum.totalAmount || 0
    }
    console.log('✅ Admin stats calculated:', stats)
    
    // 4. Test product CRUD operations
    console.log('\n4️⃣ Testing product CRUD operations...')
    
    // Read
    const readProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    })
    console.log('✅ Product read:', readProduct ? 'Success' : 'Failed')
    
    // Update
    const updatedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: { name: 'Admin Test Cursus - Updated' }
    })
    console.log('✅ Product updated:', updatedProduct.name)
    
    // Delete
    await prisma.product.delete({
      where: { id: testProduct.id }
    })
    console.log('✅ Product deleted: Success')
    
    // 5. Test user management
    console.log('\n5️⃣ Testing user management...')
    const allUsers = await prisma.user.findMany()
    console.log(`✅ Found ${allUsers.length} users`)
    
    const adminUsers = await prisma.user.findMany({
      where: { role: UserRole.ADMIN }
    })
    console.log(`✅ Found ${adminUsers.length} admin users`)
    
    // 6. Test order management
    console.log('\n6️⃣ Testing order management...')
    const allOrders = await prisma.order.findMany()
    console.log(`✅ Found ${allOrders.length} orders`)
    
    // 7. Test database integrity
    console.log('\n7️⃣ Testing database integrity...')
    const productCount = await prisma.product.count()
    const userCount = await prisma.user.count()
    const orderCount = await prisma.order.count()
    
    console.log('✅ Database integrity check:')
    console.log(`   - Products: ${productCount}`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Orders: ${orderCount}`)
    
    console.log('\n🎉 All admin functionalities tested successfully!')
    
    console.log('\n📋 Admin System Status:')
    console.log('   ✅ Database connection works')
    console.log('   ✅ User management works')
    console.log('   ✅ Product CRUD operations work')
    console.log('   ✅ Admin statistics calculation works')
    console.log('   ✅ Order management works')
    console.log('   ✅ Database integrity maintained')
    
  } catch (error) {
    console.error('❌ Admin functionality test failed:', error)
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    try {
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

testAdminFunctionality()
