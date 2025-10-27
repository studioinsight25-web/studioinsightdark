'use client'

import { FileText } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'

export default function FeaturedEbooks() {
  const { products, loading } = useProducts()
  
  // Get featured ebooks from the centralized product service
  const featuredEbooks = products.filter(product => product.type === 'ebook' && product.featured && product.isActive)

  if (loading) {
    return (
      <section className="py-20 bg-dark-section">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">E-books laden...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-dark-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Uitgelichte e-books
        </h2>
        
        {featuredEbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuredEbooks.map((ebook) => (
              <div
                key={ebook.id}
                className="group bg-dark-card p-8 rounded-xl text-center border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                  {ebook.name}
                </h3>
                <p className="text-text-secondary mb-4 text-sm">
                  {ebook.description}
                </p>
                <div className="mb-6">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {formatPrice(ebook.price)}
                  </div>
                  <div className="text-text-secondary text-xs">
                    {ebook.category}
                  </div>
                </div>
                <Link
                  href={`/ebooks/${ebook.id}`}
                  className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 inline-block"
                >
                  {ebook.price === 0 ? 'Gratis Download' : 'Download PDF'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Geen e-books beschikbaar
              </h3>
              <p className="text-text-secondary text-lg mb-8">
                Op dit moment zijn er geen e-books beschikbaar. We werken hard aan nieuwe content voor je.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/cursussen"
                  className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Bekijk onze cursussen
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Neem contact op
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

