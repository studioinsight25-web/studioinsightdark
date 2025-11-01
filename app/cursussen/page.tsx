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
import { ProductGridSkeleton } from '@/components/LoadingSkeleton'
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Add to cart failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        showToast(
          errorData.error || `Fout bij toevoegen: ${response.status} ${response.statusText}`, 
          'error'
        )
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Full error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      })
      showToast(
        `Fout bij toevoegen: ${errorMessage}. Check console voor details.`, 
        'error'
      )
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background" aria-label="Cursussen pagina">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <div className="h-12 bg-dark-section rounded-lg w-64 mx-auto mb-6 animate-pulse" />
              <div className="h-6 bg-dark-section rounded-lg w-96 mx-auto animate-pulse" />
            </div>
          </div>
        </section>

        {/* Loading Skeleton */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <ProductGridSkeleton count={6} />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background" aria-label="Cursussen pagina">
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
              <div key={course.id} className="group bg-gradient-to-br from-dark-card to-dark-section rounded-xl overflow-hidden border border-dark-border hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
                {/* Course Image */}
                <div className="relative h-52 bg-dark-section overflow-hidden">
                  {course.imageUrl ? (
                    <>
                      <Image
                        src={course.imageUrl}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-dark-border to-dark-section flex items-center justify-center">
                      <Play className="w-16 h-16 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                    </div>
                  )}
                  {/* Featured Badge */}
                  {course.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-yellow-500/30 animate-pulse">
                      ⭐ Featured
                    </div>
                  )}
                  {/* Coming Soon Badge */}
                  {course.comingSoon && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-orange-500/30">
                      🚀 Binnenkort
                    </div>
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-blue-400/50">
                      📚 Cursus
                    </span>
                  </div>
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
                      <div className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 px-4 rounded-xl font-bold text-center shadow-lg shadow-orange-500/20">
                        🚀 Binnenkort beschikbaar
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(course)}
                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-black py-3.5 px-4 rounded-xl font-bold hover:from-primary/90 hover:to-primary/80 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                        aria-label={`Voeg ${course.name} toe aan winkelwagen`}
                      >
                        <ShoppingCart className="w-5 h-5" aria-hidden="true" />
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