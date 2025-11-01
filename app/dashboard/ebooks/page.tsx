'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, BookOpen, Download, Lock } from 'lucide-react'
import SessionManager from '@/lib/session'
import { Product } from '@/lib/products'
import DigitalProductDownload from '@/components/DigitalProductDownload'

export default function MyEbooksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ebooks, setEbooks] = useState<Product[]>([])

  useEffect(() => {
    const session = SessionManager.getSession()
    if (!session) {
      router.push('/inloggen')
      return
    }
    
    setUser(session)
    
    // Load purchased ebooks
    const loadEbooks = async () => {
      try {
        const response = await fetch('/api/user/purchases')
        if (response.ok) {
          const data = await response.json()
          // Filter only ebooks
          const purchasedEbooks = (data.products || []).filter(
            (product: Product) => product.type === 'ebook'
          )
          setEbooks(purchasedEbooks)
        }
      } catch (error) {
        console.error('Error loading ebooks:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadEbooks()
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
          <h1 className="text-2xl font-bold text-white">Mijn E-books</h1>
          <p className="text-text-secondary">
            {ebooks.length === 0 
              ? 'Je hebt nog geen e-books gekocht' 
              : `${ebooks.length} ${ebooks.length === 1 ? 'e-book' : 'e-books'} gekocht`}
          </p>
        </div>
      </header>

      {/* Ebooks Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {ebooks.length === 0 ? (
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border text-center">
              <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nog geen e-books gekocht</h3>
              <p className="text-text-secondary mb-6">
                Begin met het bekijken van onze e-books!
              </p>
              <Link
                href="/ebooks"
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Bekijk E-books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ebooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className="bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300"
                >
                  {/* Ebook Image */}
                  <div className="relative h-48 bg-gradient-to-br from-dark-section to-dark-card">
                    {ebook.imageUrl ? (
                      <Image
                        src={ebook.imageUrl}
                        alt={ebook.name}
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-text-secondary" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/30">
                        📖 E-book
                      </span>
                    </div>
                  </div>

                  {/* Ebook Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {ebook.name}
                    </h3>
                    {ebook.shortDescription && (
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {ebook.shortDescription}
                      </p>
                    )}

                    {/* Digital Product Download */}
                    <div className="mt-4">
                      <DigitalProductDownload 
                        productId={ebook.id}
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

