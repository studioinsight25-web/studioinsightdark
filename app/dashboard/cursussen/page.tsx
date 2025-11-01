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
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border text-center">
              <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nog geen cursussen gekocht</h3>
              <p className="text-text-secondary mb-6">
                Begin met het bekijken van onze cursussen!
              </p>
              <Link
                href="/cursussen"
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
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

