'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ProductService, formatPrice } from '@/lib/products'
import { Play, ArrowRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'

export default function PopularCourses() {
  const { products, loading } = useProducts()
  
  // Get featured courses from the centralized product service
  const featuredCourses = products.filter(product => product.type === 'course' && product.featured && product.isActive)

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Cursussen laden...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Populaire cursussen
        </h2>
        
        {featuredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/photo-${course.imageId || '1507003211169-0a1dd7228f2d'}?w=400&h=250&fit=crop`}
                    alt={course.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-black px-3 py-1 rounded-full text-sm font-semibold">
                    {course.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-dark-card/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-white">
                    {course.level || 'Beginner'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {course.name}
                  </h3>
                  <p className="text-text-secondary mb-3">
                    Door Studio Insight
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="text-text-secondary text-sm">
                      {course.lessons || '10'} lessen
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(course.price)}
                    </div>
                  </div>
                  <Link
                    href={`/courses/${course.id}`}
                    className="w-full bg-transparent border border-primary text-primary py-3 px-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-all duration-300 block text-center"
                  >
                    Bekijk cursus
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Geen cursussen beschikbaar
              </h3>
              <p className="text-text-secondary text-lg mb-8">
                Op dit moment zijn er geen cursussen beschikbaar. We werken hard aan nieuwe content voor je.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/ebooks"
                  className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Bekijk onze E-books
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Neem contact op
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

