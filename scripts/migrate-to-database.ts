// scripts/migrate-to-database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateData() {
  try {
    console.log('🚀 Starting data migration...')

    // Sample data to migrate (replace with your actual localStorage data)
    const sampleProducts = [
      {
        name: 'Podcasten voor beginners',
        description: 'Leer de basis van podcasten',
        shortDescription: 'Complete gids voor podcast beginners',
        price: 4999, // €49.99 in cents
        type: 'COURSE' as const,
        category: null,
        isActive: true,
        featured: true,
        comingSoon: false,
        sales: 0,
        rating: 5.0,
        duration: '4 uur',
        level: 'Beginner',
        students: '0',
        lessons: '13',
        metaTitle: 'Podcasten voor beginners - Studio Insight',
        metaDescription: 'Leer podcasten met onze complete cursus',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Rode Microfoon Review',
        description: 'Uitgebreide review van de Rode PodMic',
        shortDescription: 'Professionele review van de Rode PodMic microfoon',
        price: 0,
        type: 'REVIEW' as const,
        category: 'microfoon',
        isActive: true,
        featured: false,
        comingSoon: false,
        sales: 0,
        rating: 4.5,
        externalUrl: 'https://amazon.nl/dp/example',
        metaTitle: 'Rode Microfoon Review - Studio Insight',
        metaDescription: 'Uitgebreide review van de Rode PodMic microfoon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // Create products
    for (const productData of sampleProducts) {
      const product = await prisma.product.create({
        data: productData
      })
      console.log(`✅ Created product: ${product.name}`)
    }

    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()

