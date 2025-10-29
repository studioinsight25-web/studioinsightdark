import { PrismaClient, ProductType } from '@prisma/client'

const prisma = new PrismaClient()

async function addOndernemerCursus() {
  console.log('📚 Adding "Ondernemer van plan naar aanpak" course...')

  const courseData = {
    id: 'course-ondernemer-plan-aanpak',
    name: 'Ondernemer van plan naar aanpak',
    description: 'Leer hoe je van een idee naar een concrete aanpak komt als ondernemer. Van businessplan tot uitvoering, deze cursus helpt je stap voor stap op weg naar succes.',
    shortDescription: 'Van idee naar concrete aanpak als ondernemer.',
    price: 19700, // €197.00 in cents
    type: ProductType.COURSE,
    isActive: true,
    featured: true,
    comingSoon: false,
    sales: 0,
    duration: '6 uur',
    level: 'Beginner',
    students: '0',
    lessons: '15',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop', // Business/entrepreneurship image
    imagePublicId: 'ondernemer-course-image',
    externalUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  try {
    // Check if course already exists
    const existingCourse = await prisma.product.findUnique({
      where: { id: courseData.id }
    })

    if (existingCourse) {
      console.log(`✅ Course "${courseData.name}" already exists. Skipping creation.`)
      return
    }

    const newCourse = await prisma.product.create({
      data: courseData
    })

    console.log('✅ Course created successfully!')
    console.log('📚 Name:', newCourse.name)
    console.log('💰 Price: €' + (newCourse.price / 100).toFixed(2))
    console.log('⏱️ Duration:', newCourse.duration)
    console.log('📖 Lessons:', newCourse.lessons)
    console.log('⭐ Featured:', newCourse.featured)
    console.log('📝 Description:', newCourse.description)

    // Verify course addition
    console.log('\n🔍 Verifying course addition...')
    const totalCourses = await prisma.product.count({ where: { type: ProductType.COURSE } })
    const allCourses = await prisma.product.findMany({ where: { type: ProductType.COURSE }, orderBy: { name: 'asc' } })

    console.log(`📊 Total courses in database: ${totalCourses}`)
    console.log('\n📚 All courses:')
    allCourses.forEach(c => console.log(`   ${c.name} - €${(c.price / 100).toFixed(2)}`))

  } catch (error) {
    console.error('❌ Error adding ondernemer course:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addOndernemerCursus()

