// Test script to verify the new visibility course
async function testVisibilityCourse() {
  console.log('🧪 Testing visibility course...')

  try {
    // Test API
    console.log('\n1️⃣ Testing products API...')
    const response = await fetch('http://localhost:3000/api/products')
    
    if (response.ok) {
      const products = await response.json()
      console.log(`✅ Products API successful! Found ${products.length} products`)
      
      // Check for the visibility course
      console.log('\n2️⃣ Checking for visibility course...')
      const visibilityCourse = products.find(p => p.name === 'Zichtbaarheid voor kleine bedrijven')
      
      if (visibilityCourse) {
        console.log('✅ Visibility course found!')
        console.log(`   Name: ${visibilityCourse.name}`)
        console.log(`   Type: ${visibilityCourse.type}`)
        console.log(`   Price: €${(visibilityCourse.price / 100).toFixed(2)}`)
        console.log(`   Duration: ${visibilityCourse.duration}`)
        console.log(`   Lessons: ${visibilityCourse.lessons}`)
        console.log(`   Featured: ${visibilityCourse.featured}`)
        console.log(`   Active: ${visibilityCourse.isActive}`)
      } else {
        console.log('❌ Visibility course not found!')
      }
      
      // Show all courses
      console.log('\n3️⃣ All courses in database:')
      const courses = products.filter(p => p.type === 'course')
      courses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.name} - €${(course.price / 100).toFixed(2)}`)
      })
      
    } else {
      console.log('❌ Products API failed:', response.status)
    }

  } catch (error) {
    console.error('❌ Error testing visibility course:', error)
  }
}

testVisibilityCourse()
