'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight, MessageSquare, Clock, User } from 'lucide-react'
import { Product, formatPrice } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'

export default function ReviewsPage() {
  const { products, loading } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const reviews = products.filter(product => product.type === 'review' && product.isActive)

  // Filter reviews by category using the category field
  const filteredReviews = reviews.filter(review => {
    if (selectedCategory === 'all') return true
    return review.category === selectedCategory
  })

  const categories = [
    { id: 'all', name: 'Alle Reviews', icon: '📝', count: reviews.length },
    { id: 'microfoon', name: 'Microfoons', icon: '🎙️', count: reviews.filter(r => r.category === 'microfoon').length },
    { id: 'webcam', name: 'Webcams', icon: '📹', count: reviews.filter(r => r.category === 'webcam').length },
    { id: 'accessoires', name: 'Accessoires', icon: '🔧', count: reviews.filter(r => r.category === 'accessoires').length }
  ]

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Reviews laden...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-24">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="mb-6">
            <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
              🎙️ MICROFOONS • 📹 WEBCAMS • 🔧 ACCESSOIRES
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Product Reviews
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Onze uitgebreide en eerlijke reviews van de beste microfoons, webcams en accessoires voor content creators, 
            podcasters en professionals. Getest door experts, beoordeeld door gebruikers.
          </p>
          
          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-black shadow-lg'
                    : 'bg-dark-card/50 text-white border border-dark-border hover:border-primary hover:text-primary'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {reviews.length > 0 ? (
        <>
          {/* Reviews Grid */}
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-7xl">
              {/* Filter Results Header */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedCategory === 'all' ? 'Alle Reviews' : 
                   selectedCategory === 'microfoons' ? 'Microfoon Reviews' :
                   selectedCategory === 'webcams' ? 'Webcam Reviews' :
                   'Accessoire Reviews'}
                </h2>
                <p className="text-text-secondary">
                  {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'} gevonden
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {filteredReviews.map((review) => (
                  <article
                    key={review.id}
                    className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20"
                  >
                    {/* Large Product Image */}
                    <div className="relative h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-dark-section to-dark-card">
                      {review.imageUrl ? (
                        <Image
                          src={review.imageUrl}
                          alt={review.name}
                          fill
                          className="object-contain p-8 hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-text-secondary">
                            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Star className="w-12 h-12 text-primary" />
                            </div>
                            <p className="text-lg">Geen afbeelding beschikbaar</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Review Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-black px-3 py-1 rounded-full text-sm font-bold">
                          REVIEW
                        </span>
                      </div>
                    </div>
                    
                    {/* Review Content */}
                    <div className="p-8">
                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-2xl lg:text-3xl font-bold text-white">
                            {review.name}
                          </h2>
                          {review.category && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              review.category === 'microfoon' 
                                ? 'bg-blue-900/20 text-blue-400' 
                                : review.category === 'webcam'
                                ? 'bg-green-900/20 text-green-400'
                                : 'bg-purple-900/20 text-purple-400'
                            }`}>
                              {review.category === 'microfoon' && '🎙️ Microfoon'}
                              {review.category === 'webcam' && '📹 Webcam'}
                              {review.category === 'accessoires' && '🔧 Accessoires'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-current" />
                            ))}
                          </div>
                          <span className="text-text-secondary text-sm">
                            Door Studio Insight
                          </span>
                        </div>
                        
                        {/* Price (only if not coming soon) */}
                        {!review.comingSoon && review.price > 0 && (
                          <div className="text-3xl font-bold text-primary mb-4">
                            {formatPrice(review.price)}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="mb-8">
                        <p className="text-text-secondary text-lg leading-relaxed">
                          {review.shortDescription || review.description}
                        </p>
                      </div>

                      {/* Amazon Button - Moved up */}
                      {review.externalUrl && (
                        <div className="mb-6">
                          <a
                            href={review.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <span>🛒</span>
                            Koop op Amazon
                            <span>↗</span>
                          </a>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-4 mb-8">
                        {review.comingSoon ? (
                          <div className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg text-center shadow-lg">
                            🚀 Binnenkort beschikbaar
                          </div>
                        ) : (
                          <Link
                            href={`/products/${review.id}`}
                            className="w-full bg-gradient-to-r from-primary to-primary/90 text-black py-4 px-6 rounded-xl font-bold text-lg hover:from-primary/90 hover:to-primary transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                          >
                            Lees volledige review
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          
          {/* No Results State */}
          {filteredReviews.length === 0 && reviews.length > 0 && (
            <section className="py-20 bg-background">
              <div className="container mx-auto px-4 max-w-4xl text-center">
                <div className="bg-dark-card rounded-xl p-12 border border-dark-border">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    Geen reviews in deze categorie
                  </h2>
                  <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                    Er zijn nog geen reviews beschikbaar voor {selectedCategory === 'microfoon' ? 'microfoons' : 
                    selectedCategory === 'webcam' ? 'webcams' : 'accessoires'}. 
                    Bekijk andere categorieën of kom later terug.
                  </p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
                  >
                    Bekijk alle reviews
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        /* Empty State */
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Reviews komen binnenkort!
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                We werken aan uitgebreide reviews van de beste microfoons, webcams en accessoires voor content creators. 
                Binnenkort vind je hier eerlijke beoordelingen van professionele apparatuur.
              </p>
              
              {/* Coming Soon Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-dark-section/50 rounded-lg p-4 border border-dark-border">
                  <div className="text-2xl mb-2">🎙️</div>
                  <h3 className="font-semibold text-white mb-2">Microfoons</h3>
                  <p className="text-sm text-text-secondary">Podcast, streaming & studio microfoons</p>
                </div>
                <div className="bg-dark-section/50 rounded-lg p-4 border border-dark-border">
                  <div className="text-2xl mb-2">📹</div>
                  <h3 className="font-semibold text-white mb-2">Webcams</h3>
                  <p className="text-sm text-text-secondary">4K, PTZ & conferentie camera's</p>
                </div>
                <div className="bg-dark-section/50 rounded-lg p-4 border border-dark-border">
                  <div className="text-2xl mb-2">🔧</div>
                  <h3 className="font-semibold text-white mb-2">Accessoires</h3>
                  <p className="text-sm text-text-secondary">Statieven, verlichting & meer</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Stuur een product in
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cursussen"
                  className="bg-transparent border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Bekijk onze cursussen
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
            Heb je een product dat je wilt laten reviewen?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            We testen graag nieuwe producten en delen onze eerlijke mening met de community.
          </p>
          <Link
            href="/contact"
            className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/25 inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Stuur een product in
          </Link>
        </div>
      </section>
    </main>
  )
}

