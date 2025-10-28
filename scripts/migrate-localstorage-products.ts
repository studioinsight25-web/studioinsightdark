import { PrismaClient } from '@prisma/client'
import { Product } from '../lib/products'

const prisma = new PrismaClient()

// Alle localStorage producten die naar database moeten
const LOCALSTORAGE_PRODUCTS: Product[] = [
  {
    id: 'course-podcast',
    name: 'Podcasten voor beginners',
    description: 'Leer de basis van podcasten en bouw je eigen podcast op.',
    price: 9700, // €97.00 in cents
    type: 'course',
    isActive: true,
    featured: true,
    sales: 45,
    createdAt: '2024-10-20',
    updatedAt: '2024-10-26',
    duration: '4 uur',
    level: 'Beginner',
    students: '1,250',
    lessons: '13',
    imageId: '1507003211169-0a1dd7228f2d',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
  },
  {
    id: 'course-website',
    name: 'Bouw een persoonlijke website',
    description: 'Van concept tot live website. Leer moderne web development technieken.',
    price: 14700, // €147.00 in cents
    type: 'course',
    isActive: true,
    featured: false,
    sales: 32,
    createdAt: '2024-10-18',
    updatedAt: '2024-10-25',
    duration: '6 uur',
    level: 'Beginner',
    students: '2,100',
    lessons: '14',
    imageId: '1467232004584-a241de8bcf5d',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop'
  },
  {
    id: 'course-video',
    name: 'Videobewerking fundamentals',
    description: 'Professionele video editing technieken voor content creators.',
    price: 19700, // €197.00 in cents
    type: 'course',
    isActive: true,
    featured: true,
    sales: 28,
    createdAt: '2024-10-15',
    updatedAt: '2024-10-24',
    duration: '8 uur',
    level: 'Gevorderd',
    students: '890',
    lessons: '15',
    imageId: '1574717024653-61fd2cf4d44d',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop'
  },
  {
    id: 'course-content',
    name: 'Content strategie masterclass',
    description: 'Ontwikkel een winnende content strategie voor je merk.',
    price: 12700, // €127.00 in cents
    type: 'course',
    isActive: true,
    featured: false,
    sales: 22,
    createdAt: '2024-10-12',
    updatedAt: '2024-10-23',
    duration: '5 uur',
    level: 'Gemiddeld',
    students: '1,500',
    lessons: '12',
    imageId: '1552664730-d307ca884978',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },
  {
    id: 'ebook-email',
    name: 'E-mail marketing voor ondernemers',
    description: 'Leer effectieve e-mail campagnes opzetten.',
    price: 0, // Free
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 156,
    createdAt: '2024-10-10',
    updatedAt: '2024-10-22',
    imageId: '1507003211169-0a1dd7228f2d',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
  },
  {
    id: 'ebook-seo',
    name: 'SEO voor starters',
    description: 'Zoekmachine optimalisatie van A tot Z.',
    price: 0, // Free
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 89,
    createdAt: '2024-10-08',
    updatedAt: '2024-10-21',
    imageId: '1467232004584-a241de8bcf5d',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop'
  },
  {
    id: 'ebook-content',
    name: 'Content strategie gids',
    description: 'Ontwikkel een winnende content strategie.',
    price: 1900, // €19.00 in cents
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 67,
    createdAt: '2024-10-05',
    updatedAt: '2024-10-20',
    imageId: '1552664730-d307ca884978',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },
  {
    id: 'ebook-branding',
    name: 'Branding handboek',
    description: 'Creëer een sterke merkidentiteit.',
    price: 2500, // €25.00 in cents
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 43,
    createdAt: '2024-10-03',
    updatedAt: '2024-10-19',
    imageId: '1574717024653-61fd2cf4d44d',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop'
  },
  {
    id: 'review-microfoon-1',
    name: 'Rode NT-USB Mini Review',
    description: 'Een uitgebreide review van de Rode NT-USB Mini microfoon voor podcasters en content creators.',
    shortDescription: 'De perfecte microfoon voor podcasts en streaming.',
    price: 0,
    type: 'review',
    category: 'microfoon',
    isActive: true,
    featured: true,
    sales: 0,
    createdAt: '2024-10-27',
    updatedAt: '2024-10-27',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop',
    externalUrl: 'https://www.amazon.nl/Rode-NT-USB-Mini-USB-Microfoon/dp/B082G92K7M'
  },
  {
    id: 'review-webcam-1',
    name: 'Logitech C920 Pro Review',
    description: 'Een diepgaande review van de Logitech C920 Pro webcam voor professionals.',
    shortDescription: 'Professionele webcam voor streaming en video calls.',
    price: 0,
    type: 'review',
    category: 'webcam',
    isActive: true,
    featured: false,
    sales: 0,
    createdAt: '2024-10-27',
    updatedAt: '2024-10-27',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=250&fit=crop',
    externalUrl: 'https://www.amazon.nl/Logitech-C920-Pro-HD-Webcam/dp/B006JH8T3S'
  },
  {
    id: 'review-accessoires-1',
    name: 'Elgato Stream Deck Review',
    description: 'Review van de Elgato Stream Deck voor streamers en content creators.',
    shortDescription: 'Professionele controle voor je stream setup.',
    price: 0,
    type: 'review',
    category: 'accessoires',
    isActive: true,
    featured: false,
    sales: 0,
    createdAt: '2024-10-27',
    updatedAt: '2024-10-27',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=250&fit=crop',
    externalUrl: 'https://www.amazon.nl/Elgato-Stream-Deck-Controller/dp/B06XKNZT1P'
  }
]

async function migrateLocalStorageProducts() {
  console.log('🚀 Starting localStorage to database migration...')
  
  try {
    // Clear existing products (optional - remove this if you want to keep existing data)
    console.log('🧹 Clearing existing products...')
    await prisma.product.deleteMany()
    console.log('✅ Existing products cleared')

    // Migrate all localStorage products
    console.log('📦 Migrating localStorage products...')
    for (const product of LOCALSTORAGE_PRODUCTS) {
      try {
        await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription,
            price: product.price,
            type: product.type.toUpperCase() as any,
            category: product.category?.toUpperCase() as any,
            isActive: product.isActive,
            featured: product.featured,
            comingSoon: product.comingSoon || false,
            sales: product.sales,
            duration: product.duration,
            level: product.level,
            students: product.students,
            lessons: product.lessons,
            imageUrl: product.imageUrl,
            imagePublicId: product.imagePublicId,
            externalUrl: product.externalUrl,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt)
          }
        })
        console.log(`✅ Migrated: ${product.name} (${product.type})`)
      } catch (error) {
        console.error(`❌ Failed to migrate ${product.name}:`, error)
      }
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...')
    const totalProducts = await prisma.product.count()
    const courses = await prisma.product.count({ where: { type: 'COURSE' } })
    const ebooks = await prisma.product.count({ where: { type: 'EBOOK' } })
    const reviews = await prisma.product.count({ where: { type: 'REVIEW' } })

    console.log(`📊 Migration Summary:`)
    console.log(`   Total products: ${totalProducts}`)
    console.log(`   Courses: ${courses}`)
    console.log(`   E-books: ${ebooks}`)
    console.log(`   Reviews: ${reviews}`)

    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateLocalStorageProducts()
