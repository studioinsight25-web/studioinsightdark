import { UserService } from '../lib/user-database'
import { prisma } from '../lib/prisma'

async function createDemoUser() {
  console.log('👤 Creating demo user account...')

  try {
    // Check if demo user already exists
    const existingUser = await UserService.getUserByEmail('demo@studioinsight.nl')
    if (existingUser) {
      console.log('✅ Demo user already exists:', existingUser.email)
      return
    }

    // Create demo user account
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@studioinsight.nl',
        password: await require('bcryptjs').hash('demo123', 12),
        name: 'Demo Gebruiker',
        role: 'USER'
      }
    })

    console.log('✅ Demo user created successfully!')
    console.log('📧 Email:', demoUser.email)
    console.log('👤 Name:', demoUser.name)
    console.log('🔑 Password: demo123')
    console.log('👤 Role: USER')

  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUser()

