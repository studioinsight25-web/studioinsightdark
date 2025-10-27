'use client'

import { Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'

export default function RecentReviews() {
  const { products, loading } = useProducts()
  
  // Get recent review products (max 2)
  const recentReviews = products
    .filter(product => product.type === 'review' && product.isActive)
    .slice(0, 2)

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Reviews laden...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Recent toegevoegde reviews
        </h2>
        
        {recentReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="group bg-dark-card p-6 rounded-xl text-center border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-24 h-24 rounded-lg overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${review.imageId || '1507003211169-0a1dd7228f2d'}?w=200&h=200&fit=crop`}
                      alt={review.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {review.name}
                </h3>
                <div className="flex justify-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <Link
                  href={`/products/${review.id}`}
                  className="bg-transparent border border-primary text-primary py-2 px-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-all duration-300"
                >
                  Bekijk review
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Geen reviews beschikbaar
              </h3>
              <p className="text-text-secondary text-lg mb-8">
                Op dit moment zijn er geen product reviews beschikbaar. We werken hard aan nieuwe reviews voor je.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Stuur een product in
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cursussen"
                  className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Bekijk onze cursussen
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

