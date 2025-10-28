import { DigitalProductDatabaseService } from '../lib/digital-products-database'
import { UserService } from '../lib/user-database'

async function testDigitalProductsDatabase() {
  console.log('🧪 Testing Digital Products Database Service...')

  try {
    // Create a test user first
    console.log('\n0️⃣ Creating test user...')
    const testUser = await UserService.createUser('test-digital@example.com', 'password123', 'Test User')
    console.log(`✅ Test user created: ${testUser.email}`)

    console.log('\n1️⃣ Testing getAllDigitalProducts...')
    const allDigitalProducts = await DigitalProductDatabaseService.getAllDigitalProducts()
    console.log(`✅ Found ${allDigitalProducts.length} digital products`)

    console.log('\n2️⃣ Testing addDigitalProduct...')
    const testProduct = await DigitalProductDatabaseService.addDigitalProduct({
      productId: 'course-podcast',
      fileName: 'test-course.pdf',
      fileType: 'pdf',
      fileSize: 1024000, // 1MB
      fileUrl: 'https://example.com/test-course.pdf',
      downloadLimit: 5,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    })
    console.log(`✅ Digital product created: ${testProduct.fileName}`)

    console.log('\n3️⃣ Testing getDigitalProductsByProductId...')
    const courseDigitalProducts = await DigitalProductDatabaseService.getDigitalProductsByProductId('course-podcast')
    console.log(`✅ Found ${courseDigitalProducts.length} digital products for course-podcast`)

    console.log('\n4️⃣ Testing getDigitalProduct...')
    const singleProduct = await DigitalProductDatabaseService.getDigitalProduct(testProduct.id)
    console.log(`✅ Retrieved digital product: ${singleProduct?.fileName}`)

    console.log('\n5️⃣ Testing updateDigitalProduct...')
    const updatedProduct = await DigitalProductDatabaseService.updateDigitalProduct(testProduct.id, {
      fileName: 'updated-course.pdf',
      downloadLimit: 10
    })
    console.log(`✅ Updated digital product: ${updatedProduct?.fileName}`)

    console.log('\n6️⃣ Testing trackDownload...')
    const download = await DigitalProductDatabaseService.trackDownload(testUser.id, testProduct.id)
    console.log(`✅ Tracked download: ${download.downloadCount} downloads`)

    console.log('\n7️⃣ Testing getUserDownloads...')
    const userDownloads = await DigitalProductDatabaseService.getUserDownloads(testUser.id)
    console.log(`✅ Found ${userDownloads.length} downloads for user`)

    console.log('\n8️⃣ Testing getDownloadStats...')
    const stats = await DigitalProductDatabaseService.getDownloadStats(testProduct.id)
    console.log(`✅ Download stats: ${stats.totalDownloads} total downloads, ${stats.uniqueUsers} unique users`)

    console.log('\n9️⃣ Testing canUserDownload...')
    const canDownload = await DigitalProductDatabaseService.canUserDownload(testUser.id, testProduct.id)
    console.log(`✅ Can user download: ${canDownload}`)

    console.log('\n🔟 Testing deleteDigitalProduct...')
    const deleted = await DigitalProductDatabaseService.deleteDigitalProduct(testProduct.id)
    console.log(`✅ Digital product deleted: ${deleted}`)

    console.log('\n🧹 Cleaning up test user...')
    const { prisma } = await import('../lib/prisma')
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log('✅ Test user deleted')

    console.log('\n🎉 All digital products database tests passed!')

  } catch (error) {
    console.error('❌ Digital products database test failed:', error)
  }
}

testDigitalProductsDatabase()
