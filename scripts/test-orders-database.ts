import { OrderDatabaseService } from '../lib/orders-database'
import { UserService } from '../lib/user-database'
import { ProductService } from '../lib/products'

async function testOrdersDatabase() {
  console.log('🧪 Testing Orders Database Service...')

  try {
    // Create a test user first
    console.log('\n0️⃣ Creating test user...')
    const testUser = await UserService.createUser('test-orders@example.com', 'password123', 'Test User')
    console.log(`✅ Test user created: ${testUser.email}`)

    // Get some products for testing
    console.log('\n1️⃣ Getting products for testing...')
    const products = await ProductService.getAllProducts()
    const testProducts = products.slice(0, 2) // Take first 2 products
    console.log(`✅ Found ${testProducts.length} products for testing`)

    console.log('\n2️⃣ Testing createOrder...')
    const testOrder = await OrderDatabaseService.createOrder(testUser.id, testProducts)
    console.log(`✅ Order created: ${testOrder.id} with ${testOrder.items.length} items`)

    console.log('\n3️⃣ Testing getOrder...')
    const retrievedOrder = await OrderDatabaseService.getOrder(testOrder.id)
    console.log(`✅ Retrieved order: ${retrievedOrder?.id}`)

    console.log('\n4️⃣ Testing getUserOrders...')
    const userOrders = await OrderDatabaseService.getUserOrders(testUser.id)
    console.log(`✅ Found ${userOrders.length} orders for user`)

    console.log('\n5️⃣ Testing updateOrderStatus...')
    const updated = await OrderDatabaseService.updateOrderStatus(testOrder.id, 'paid', 'test-payment-123')
    console.log(`✅ Order status updated: ${updated}`)

    console.log('\n6️⃣ Testing getOrdersByStatus...')
    const paidOrders = await OrderDatabaseService.getOrdersByStatus('paid')
    console.log(`✅ Found ${paidOrders.length} paid orders`)

    console.log('\n7️⃣ Testing getRecentOrders...')
    const recentOrders = await OrderDatabaseService.getRecentOrders(5)
    console.log(`✅ Found ${recentOrders.length} recent orders`)

    console.log('\n8️⃣ Testing getOrderStats...')
    const stats = await OrderDatabaseService.getOrderStats()
    console.log(`✅ Order stats: ${stats.totalOrders} total orders, €${(stats.totalRevenue / 100).toFixed(2)} total revenue`)

    console.log('\n9️⃣ Testing getTopProducts...')
    const topProducts = await OrderDatabaseService.getTopProducts(5)
    console.log(`✅ Found ${topProducts.length} top products`)

    console.log('\n🔟 Testing getOrdersByDateRange...')
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    const endDate = new Date()
    const ordersInRange = await OrderDatabaseService.getOrdersByDateRange(startDate, endDate)
    console.log(`✅ Found ${ordersInRange.length} orders in date range`)

    console.log('\n1️⃣1️⃣ Testing deleteOrder...')
    const deleted = await OrderDatabaseService.deleteOrder(testOrder.id)
    console.log(`✅ Order deleted: ${deleted}`)

    console.log('\n🧹 Cleaning up test user...')
    const { prisma } = await import('../lib/prisma')
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log('✅ Test user deleted')

    console.log('\n🎉 All orders database tests passed!')

  } catch (error) {
    console.error('❌ Orders database test failed:', error)
  }
}

testOrdersDatabase()
