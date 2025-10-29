// scripts/test-database-connection.ts - Test database connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ User count query successful: ${userCount} users`)
    
    // Test product query
    const productCount = await prisma.product.count()
    console.log(`✅ Product count query successful: ${productCount} products`)
    
    // Test order query
    const orderCount = await prisma.order.count()
    console.log(`✅ Order count query successful: ${orderCount} orders`)
    
    console.log('\n🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        console.error('💡 Check if DATABASE_URL environment variable is set')
      } else if (error.message.includes('connection')) {
        console.error('💡 Check if database is accessible and credentials are correct')
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()
