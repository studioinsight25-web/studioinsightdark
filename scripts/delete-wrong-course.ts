import { prisma } from '../lib/prisma'

async function deleteWrongCourse() {
  console.log('🗑️ Deleting the wrong course...')
  
  try {
    const deletedCourse = await prisma.product.delete({
      where: { id: 'course-ondernemer-plan-aanpak' }
    })
    
    console.log('✅ Course deleted:', deletedCourse.name)
    
    // Check remaining products
    const remainingProducts = await prisma.product.findMany()
    console.log(`\n📊 Remaining products: ${remainingProducts.length}`)
    
  } catch (error) {
    console.error('❌ Error deleting course:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteWrongCourse()
