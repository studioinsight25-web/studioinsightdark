'use client'

import Link from 'next/link'
import { FileText, Play } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { formatPrice } from '@/lib/products'

function truncate(text: string, max: number) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

export default function FeaturedRow() {
  const { products, loading } = useProducts()

  const active = products.filter(p => p.isActive && !p.comingSoon)

  const ebooks = active
    .filter(p => p.type === 'ebook')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const featuredEbooks = ebooks.filter(p => p.featured)
  const ebook = (featuredEbooks.length > 0 ? featuredEbooks : ebooks)[0]

  const courses = active
    .filter(p => p.type === 'course')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const featuredCourses = courses.filter(p => p.featured)
  const course = (featuredCourses.length > 0 ? featuredCourses : courses)[0]

  if (loading) {
    return (
      <section className="py-16 bg-dark-section">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Aan het laden…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-dark-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ebook card */}
          {ebook && (
            <div className="group bg-dark-card p-8 rounded-xl border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{ebook.name}</h3>
                </div>
                <span className="text-2xl font-bold text-primary">{formatPrice(ebook.price)}</span>
              </div>
              <p className="text-text-secondary mb-4">{truncate(ebook.description || '', 140)}</p>
              <Link
                href={`/products/${ebook.id}`}
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 inline-block"
              >
                Bekijk e-book
              </Link>
            </div>
          )}

          {/* Course card */}
          {course && (
            <div className="group bg-dark-card p-8 rounded-xl border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{course.name}</h3>
                </div>
                <span className="text-2xl font-bold text-primary">{formatPrice(course.price)}</span>
              </div>
              <p className="text-text-secondary mb-4">{truncate(course.description || '', 140)}</p>
              <Link
                href={`/products/${course.id}`}
                className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-all duration-300 inline-block"
              >
                Bekijk cursus
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


