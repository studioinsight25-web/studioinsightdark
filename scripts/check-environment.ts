import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEnvironmentSetup() {
  console.log('🔍 Checking environment setup...')
  
  try {
    // Check database connection
    console.log('\n1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if we can read environment variables
    console.log('\n2️⃣ Checking environment variables...')
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    console.log('   NEXT_PUBLIC_GA_ID:', gaId || 'undefined')
    
    if (gaId && gaId !== 'G-XXXXXXXXXX') {
      console.log('✅ Google Analytics ID configured:', gaId)
    } else if (gaId === 'G-XXXXXXXXXX') {
      console.log('⚠️  Google Analytics ID is still placeholder')
      console.log('   To fix: Update NEXT_PUBLIC_GA_ID in .env.local with your real GA ID')
    } else {
      console.log('⚠️  Google Analytics ID not found in environment')
      console.log('   To fix: Make sure .env.local exists and contains NEXT_PUBLIC_GA_ID')
    }
    
    // Check database tables
    console.log('\n3️⃣ Checking database tables...')
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    
    console.log(`✅ Users: ${userCount}`)
    console.log(`✅ Products: ${productCount}`)
    console.log(`✅ Orders: ${orderCount}`)
    
    // Check admin users
    console.log('\n4️⃣ Checking admin users...')
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true }
    })
    
    if (adminUsers.length > 0) {
      console.log('✅ Admin users found:')
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.name})`)
      })
    } else {
      console.log('⚠️  No admin users found')
      console.log('   To fix: Run "npx tsx scripts/create-admin-account.ts"')
    }
    
    console.log('\n🎉 Environment setup check completed!')
    
    if (gaId === 'G-XXXXXXXXXX') {
      console.log('\n📋 Next steps:')
      console.log('1. Get your Google Analytics ID from https://analytics.google.com')
      console.log('2. Update NEXT_PUBLIC_GA_ID in .env.local')
      console.log('3. Restart your development server')
      console.log('4. Visit /admin/analytics to see live data')
    }
    
  } catch (error) {
    console.error('❌ Environment check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEnvironmentSetup()
