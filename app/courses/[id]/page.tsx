'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play, Clock, CheckCircle, Lock, ArrowLeft, Download } from 'lucide-react'
import { Product, formatPrice } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const { products, loading } = useProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [hasAccess, setHasAccess] = useState(true) // Temporarily allow access

  useEffect(() => {
    if (!loading && products.length > 0) {
      const foundProduct = products.find(p => p.id === params.id)
      if (foundProduct && foundProduct.type === 'course') {
        setProduct(foundProduct)
      } else {
        router.push('/cursussen')
      }
    }
  }, [params.id, products, loading, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Cursus laden...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 bg-dark-card rounded-xl border border-dark-border">
          <h1 className="text-3xl font-bold text-white mb-4">Cursus niet gevonden</h1>
          <p className="text-text-secondary mb-8">
            De cursus die je zoekt bestaat niet of is niet beschikbaar.
          </p>
          <Link
            href="/cursussen"
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar cursussen
          </Link>
        </div>
      </main>
    )
  }
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/cursussen"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar cursussen
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-text-secondary">
              Je hebt geen toegang tot deze cursus. Koop de cursus om toegang te krijgen.
            </p>
          </div>
        </section>

        {/* Access Denied */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border max-w-md mx-auto">
              <Lock className="w-16 h-16 text-text-secondary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Toegang Vereist</h2>
              <p className="text-text-secondary mb-6">
                Je hebt deze cursus nog niet gekocht. Koop de cursus om toegang te krijgen tot alle lessen en materialen.
              </p>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </div>
                <Link
                  href="/cursussen"
                  className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Koop Cursus
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // Course content for users with access
  const courseLessons = getCourseLessons(params.id)
  const courseProgress = getCourseProgress(user.id, params.id)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link
            href="/cursussen"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar cursussen
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {product.name}
          </h1>
          <p className="text-text-secondary mb-4">
            Door Studio Insight
          </p>
          <p className="text-text-secondary">
            {product.description}
          </p>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Video */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
                <div className="aspect-video bg-dark-section rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Welkom bij {product.name}</h3>
                    <p className="text-text-secondary">
                      Klik op een les hiernaast om te beginnen
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Cursus Overzicht</h2>
                  <div className="text-sm text-text-secondary">
                    {courseProgress.completed}/{courseLessons.length} lessen voltooid
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">Over deze cursus</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-text-secondary leading-relaxed">
                    {getCourseDescription(params.id)}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">Voortgang</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Voortgang</span>
                    <span>{Math.round((courseProgress.completed / courseLessons.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-dark-section rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(courseProgress.completed / courseLessons.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>{courseProgress.completed} voltooid</span>
                    <span>{courseLessons.length - courseProgress.completed} resterend</span>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">Lessen</h3>
                <div className="space-y-2">
                  {courseLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        lesson.completed
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-dark-section border-dark-border hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-text-secondary rounded-full" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{lesson.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">Materialen</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      console.log('Downloading course PDF for:', product.name)
                      alert('Download functionaliteit komt binnenkort!')
                    }}
                    className="w-full text-left p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors flex items-center gap-3"
                  >
                    <Download className="w-4 h-4 text-primary" />
                    <span className="text-white">Cursus PDF</span>
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Downloading exercises for:', product.name)
                      alert('Download functionaliteit komt binnenkort!')
                    }}
                    className="w-full text-left p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors flex items-center gap-3"
                  >
                    <Download className="w-4 h-4 text-primary" />
                    <span className="text-white">Oefeningen</span>
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Downloading certificate for:', product.name)
                      alert('Download functionaliteit komt binnenkort!')
                    }}
                    className="w-full text-left p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors flex items-center gap-3"
                  >
                    <Download className="w-4 h-4 text-primary" />
                    <span className="text-white">Certificaat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Helper functions
function getCourseLessons(courseId: string) {
  const lessons: Record<string, any[]> = {
    'course-podcast': [
      { id: 1, title: 'Introductie tot podcasten', duration: '15 min', completed: true },
      { id: 2, title: 'Equipment en opname setup', duration: '20 min', completed: true },
      { id: 3, title: 'Script schrijven', duration: '25 min', completed: false },
      { id: 4, title: 'Opname technieken', duration: '30 min', completed: false },
      { id: 5, title: 'Audio editing basics', duration: '35 min', completed: false },
      { id: 6, title: 'Publiceren en distributie', duration: '20 min', completed: false }
    ],
    'course-website': [
      { id: 1, title: 'Planning en wireframes', duration: '20 min', completed: true },
      { id: 2, title: 'HTML fundamenten', duration: '30 min', completed: true },
      { id: 3, title: 'CSS styling', duration: '40 min', completed: false },
      { id: 4, title: 'Responsive design', duration: '35 min', completed: false },
      { id: 5, title: 'JavaScript basics', duration: '45 min', completed: false },
      { id: 6, title: 'Deployment', duration: '25 min', completed: false }
    ],
    'course-video': [
      { id: 1, title: 'Video planning', duration: '20 min', completed: true },
      { id: 2, title: 'Camera instellingen', duration: '25 min', completed: false },
      { id: 3, title: 'Licht en geluid', duration: '30 min', completed: false },
      { id: 4, title: 'Opname technieken', duration: '35 min', completed: false },
      { id: 5, title: 'Post-productie', duration: '40 min', completed: false },
      { id: 6, title: 'Export en compressie', duration: '20 min', completed: false }
    ],
    'course-content': [
      { id: 1, title: 'Content strategie basics', duration: '25 min', completed: true },
      { id: 2, title: 'Doelgroep analyse', duration: '20 min', completed: false },
      { id: 3, title: 'Content planning', duration: '30 min', completed: false },
      { id: 4, title: 'Content creatie', duration: '35 min', completed: false },
      { id: 5, title: 'Distributie strategie', duration: '25 min', completed: false },
      { id: 6, title: 'Analytics en optimalisatie', duration: '20 min', completed: false }
    ]
  }
  
  return lessons[courseId] || []
}

function getCourseProgress(userId: string, courseId: string) {
  // In a real app, this would come from a database
  return {
    completed: 2,
    total: getCourseLessons(courseId).length
  }
}

function getCourseDescription(courseId: string): string {
  const descriptions: Record<string, string> = {
    'course-podcast': 'Leer alles over podcasten, van het opzetten van je studio tot het publiceren van je eerste aflevering. Deze cursus behandelt alle aspecten van podcast productie.',
    'course-website': 'Bouw een professionele website van scratch. Leer moderne web development technieken en creëer een responsive website die perfect werkt op alle apparaten.',
    'course-video': 'Ontwikkel je videobewerking skills met deze uitgebreide cursus. Van basis editing tot geavanceerde effecten en kleurcorrectie.',
    'course-content': 'Ontwikkel een winnende content strategie voor je merk. Leer hoe je effectieve content creëert die je doelgroep aanspreekt en je doelen behaalt.'
  }
  
  return descriptions[courseId] || 'Een uitgebreide cursus die je helpt om nieuwe vaardigheden te ontwikkelen.'
}

