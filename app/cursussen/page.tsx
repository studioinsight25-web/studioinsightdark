'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Clock, Users, Star, Play, ArrowRight, Lock, ShoppingCart } from 'lucide-react'
import { Product, formatPrice } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'
import { trackAddToCart } from '@/lib/analytics'

export default function CoursesPage() {
  const router = useRouter()
  const { products, loading } = useProducts()
  const [cartItems, setCartItems] = useState<Product[]>([])
  
  const courses = products.filter(product => product.type === 'course' && product.isActive)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('studio-insight-cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  const handleAddToCart = (product: Product) => {
    const existingCart = JSON.parse(localStorage.getItem('studio-insight-cart') || '[]')
    const isAlreadyInCart = existingCart.some((item: Product) => item.id === product.id)
    
    if (!isAlreadyInCart) {
      const updatedCart = [...existingCart, product]
      localStorage.setItem('studio-insight-cart', JSON.stringify(updatedCart))
      setCartItems(updatedCart)
      trackAddToCart(product)
      
      // Dispatch custom event to update header cart
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      
      // Show success message
      alert(`${product.name} is toegevoegd aan je winkelwagen!`)
      
      // Go to cart page
      router.push('/cart')
    } else {
      alert('Dit product staat al in je winkelwagen!')
      // Still go to cart page
      router.push('/cart')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Cursussen laden...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Onze Cursussen
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Praktische cursussen die je helpen om je studio, merk en impact te ontwikkelen. 
            Van beginners tot gevorderden.
          </p>
        </div>
      </section>

      {courses.length > 0 ? (
        <>
          {/* Courses Grid */}
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {course.imageUrl ? (
                        <Image
                          src={course.imageUrl}
                          alt={course.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-card flex items-center justify-center">
                          <div className="text-center text-text-secondary">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Play className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-sm">Geen afbeelding</p>
                          </div>
                        </div>
                      )}
                      {course.level && (
                        <div className="absolute top-4 right-4 bg-dark-card/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-white">
                          {course.level}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {course.name}
                      </h3>
                      <p className="text-text-secondary mb-4">
                        Door Studio Insight
                      </p>
                      <p className="text-text-secondary text-sm mb-4">
                        {course.shortDescription || course.description}
                      </p>
                      

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
            </div>
          </section>
        </>
      ) : (
        /* Empty State */
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Geen cursussen beschikbaar
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                Op dit moment zijn er geen cursussen beschikbaar. We werken hard aan nieuwe content voor je.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/ebooks"
                  className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Bekijk onze E-books
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Neem contact op
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-dark-section">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Blijf op de hoogte
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Schrijf je in voor onze nieuwsbrief om als eerste te horen over nieuwe cursussen.
          </p>
          <Link
            href="/contact"
            className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
          >
            Inschrijven voor updates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}