// Test script to check if the visibility course is accessible via API
async function testVisibilityCourseAPI() {
  console.log('🧪 Testing visibility course API access...')

  try {
    // Test 1: Get all products
    console.log('\n1️⃣ Testing GET /api/products...')
    const response = await fetch('http://localhost:3000/api/products')
    
    if (response.ok) {
      const products = await response.json()
      console.log(`✅ Products API successful! Found ${products.length} products`)
      
      // Check for the visibility course
      console.log('\n2️⃣ Looking for visibility course...')
      const visibilityCourse = products.find(p => p.name === 'Zichtbaarheid voor kleine bedrijven')
      
      if (visibilityCourse) {
        console.log('✅ Visibility course found in API!')
        console.log(`   ID: ${visibilityCourse.id}`)
        console.log(`   Name: ${visibilityCourse.name}`)
        console.log(`   Type: ${visibilityCourse.type}`)
        console.log(`   Price: €${(visibilityCourse.price / 100).toFixed(2)}`)
        console.log(`   Featured: ${visibilityCourse.featured}`)
        console.log(`   Active: ${visibilityCourse.isActive}`)
        console.log(`   Image URL: ${visibilityCourse.imageUrl}`)
      } else {
        console.log('❌ Visibility course NOT found in API!')
        console.log('\n📋 Available products:')
        products.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (${product.type})`)
        })
      }
      
      // Test 3: Check courses specifically
      console.log('\n3️⃣ All courses in API:')
      const courses = products.filter(p => p.type === 'course')
      courses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.name} - €${(course.price / 100).toFixed(2)} ${course.featured ? '⭐' : ''}`)
      })
      
    } else {
      console.log('❌ Products API failed:', response.status)
      const errorText = await response.text()
      console.log('Error details:', errorText)
    }

  } catch (error) {
    console.error('❌ Error testing API:', error)
  }
}

testVisibilityCourseAPI()
