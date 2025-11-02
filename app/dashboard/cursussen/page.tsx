'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, BookOpen, Play, Lock, Download } from 'lucide-react'
import SessionManager from '@/lib/session'
import { Product } from '@/lib/products'
import DigitalProductDownload from '@/components/DigitalProductDownload'

export default function MyCoursesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Product[]>([])

  useEffect(() => {
    const session = SessionManager.getSession()
    if (!session) {
      router.push('/inloggen')
      return
    }
    
    setUser(session)
    
    // Load purchased courses
    const loadCourses = async () => {
      try {
        const response = await fetch('/api/user/purchases')
        if (response.ok) {
          const data = await response.json()
          // Filter only courses
          const purchasedCourses = (data.products || []).filter(
            (product: Product) => product.type === 'course'
          )
          setCourses(purchasedCourses)
        }
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCourses()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Laden...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-dark-section border-b border-dark-border">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Mijn Cursussen</h1>
          <p className="text-text-secondary">
            {courses.length === 0 
              ? 'Je hebt nog geen cursussen gekocht' 
              : `${courses.length} ${courses.length === 1 ? 'cursus' : 'cursussen'} gekocht`}
          </p>
        </div>
      </header>

      {/* Courses Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {courses.length === 0 ? (
            <div className="bg-gradient-to-br from-dark-card to-dark-section rounded-xl p-12 border border-dark-border text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Nog geen cursussen gekocht</h3>
              <p className="text-text-secondary mb-8 leading-relaxed">
                Ontdek onze uitgebreide collectie cursussen en begin vandaag met leren!
              </p>
              <Link
                href="/cursussen"
                className="bg-gradient-to-r from-primary to-primary/90 text-black px-8 py-3.5 rounded-xl font-bold hover:from-primary/90 hover:to-primary/80 transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-5 h-5" />
                Bekijk Cursussen
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300"
                >
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-dark-section to-dark-card">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.name}
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-text-secondary" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900/30 text-blue-400 border border-blue-500/30">
                        📚 Cursus
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {course.name}
                    </h3>
                    {course.shortDescription && (
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {course.shortDescription}
                      </p>
                    )}

                    {/* Digital Product Download */}
                    <div className="mt-4">
                      <DigitalProductDownload 
                        productId={course.id}
                        userId={user.userId}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

