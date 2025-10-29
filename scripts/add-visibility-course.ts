import { DatabaseProductService } from '../lib/products-database'
import { prisma } from '../lib/prisma'

async function addVisibilityCourse() {
  console.log('📚 Adding "Zichtbaarheid voor kleine bedrijven" course...')

  try {
    // Check if course already exists
    const existingCourse = await prisma.product.findUnique({
      where: { id: 'course-visibility' }
    })

    if (existingCourse) {
      console.log('✅ Course already exists:', existingCourse.name)
      return
    }

    // Create the new course
    const newCourse = await prisma.product.create({
      data: {
        id: 'course-visibility',
        name: 'Zichtbaarheid voor kleine bedrijven',
        description: 'Leer hoe je als kleine ondernemer meer zichtbaarheid krijgt en je doelgroep bereikt. Van social media tot lokale marketing strategieën.',
        shortDescription: 'Meer zichtbaarheid en klanten voor je kleine bedrijf.',
        price: 12700, // €127.00 in cents
        type: 'COURSE',
        isActive: true,
        featured: true,
        comingSoon: false,
        sales: 0,
        duration: '5 uur',
        level: 'Beginner',
        students: '0',
        lessons: '12',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Course created successfully!')
    console.log('📚 Name:', newCourse.name)
    console.log('💰 Price: €' + (newCourse.price / 100).toFixed(2))
    console.log('⏱️ Duration:', newCourse.duration)
    console.log('📖 Lessons:', newCourse.lessons)
    console.log('⭐ Featured:', newCourse.featured)

    // Verify the course was added
    console.log('\n🔍 Verifying course addition...')
    const allCourses = await prisma.product.findMany({
      where: { type: 'COURSE' }
    })
    
    console.log(`📊 Total courses in database: ${allCourses.length}`)
    console.log('\n📚 All courses:')
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} - €${(course.price / 100).toFixed(2)}`)
    })

  } catch (error) {
    console.error('❌ Error adding course:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addVisibilityCourse()

