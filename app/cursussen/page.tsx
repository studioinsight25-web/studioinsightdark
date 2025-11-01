'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Clock, Users, Star, Play, ArrowRight, Lock, ShoppingCart } from 'lucide-react'
import { Product, formatPrice } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'
import { trackAddToCart } from '@/lib/analytics'
import { useToast } from '@/hooks/useToast'
// Removed direct database import - using API routes instead
import SessionManager from '@/lib/session'

export default function CoursesPage() {
  const router = useRouter()
  const { products, loading } = useProducts()
  const [userId, setUserId] = useState<string | null>(null)
  const { showToast } = useToast()
  
  const courses = products.filter(product => product.type === 'course' && product.isActive)

  useEffect(() => {
    const currentUserId = SessionManager.getCurrentUserId()
    setUserId(currentUserId)
  }, [])

  const handleAddToCart = async (product: Product) => {
    if (!userId) {
      showToast('Je moet ingelogd zijn om producten toe te voegen aan je winkelwagen.', 'info')
      router.push('/inloggen')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })

      if (response.ok) {
        trackAddToCart(product)
        window.dispatchEvent(new CustomEvent('cartUpdated'))
        showToast(`${product.name} is toegevoegd aan je winkelwagen!`, 'success')
        setTimeout(() => {
          router.push('/cart')
        }, 1000)
      } else {
        showToast('Er is een fout opgetreden bij het toevoegen aan je winkelwagen.', 'error')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      showToast('Er is een fout opgetreden bij het toevoegen aan je winkelwagen.', 'error')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Cursussen laden...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Onze Cursussen
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Leer nieuwe vaardigheden met onze professionele cursussen. 
              Van podcasten tot videobewerking, wij helpen je verder.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                {/* Course Image */}
                <div className="relative h-48 bg-dark-section">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-border flex items-center justify-center">
                      <Play className="w-12 h-12 text-text-secondary" />
                    </div>
                  )}
                  {course.featured && (
                    <div className="absolute top-4 left-4 bg-primary text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                  <p className="text-text-secondary mb-4">Door Studio Insight</p>
                  <p className="text-text-secondary text-sm mb-4">
                    {course.shortDescription || course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    {!course.comingSoon && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(course.price)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || '4 uur'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Users className="w-4 h-4" />
                      <span>{course.students || '1,000'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Play className="w-4 h-4" />
                      <span>{course.lessons || '10'} lessen</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Lock className="w-4 h-4" />
                      <span>{course.level || 'Beginner'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {course.comingSoon ? (
                      <div className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold text-center">
                        🚀 Binnenkort beschikbaar
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(course)}
                        className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Koop Nu
                      </button>
                    )}
                    <Link
                      href={`/products/${course.id}`}
                      className="w-full bg-transparent border border-primary text-primary py-3 px-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-all duration-300 block text-center"
                    >
                      Bekijk cursus
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <Play className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Geen cursussen beschikbaar</h3>
              <p className="text-text-secondary">
                Er zijn momenteel geen actieve cursussen beschikbaar.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}