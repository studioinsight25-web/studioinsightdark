'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  User, 
  ShoppingCart, 
  BookOpen, 
  Star,
  LogOut,
  Settings,
  CreditCard,
  Play,
  Download,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import SessionManager from '@/lib/session'
import { Product, formatPrice } from '@/lib/products'
import { ProductCardSkeleton } from '@/components/LoadingSkeleton'

export default function DashboardPage() {
  // Check if user is admin and redirect to admin dashboard
  useEffect(() => {
    const session = SessionManager.getSession()
    if (session && session.role === 'ADMIN') {
      console.log('[Dashboard] Admin user detected, redirecting to admin dashboard')
      window.location.href = '/admin'
    }
  }, [])
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)

  useEffect(() => {
    const session = SessionManager.getSession()
    if (!session) {
      router.push('/inloggen')
      return
    }
    setUser(session)
    setIsLoading(false)
    
    // Load purchased products
    const loadPurchases = async () => {
      try {
        const response = await fetch('/api/user/purchases')
        if (response.ok) {
          const data = await response.json()
          setPurchasedProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error loading purchases:', error)
      } finally {
        setLoadingPurchases(false)
      }
    }
    
    loadPurchases()
  }, [router])

  const handleLogout = () => {
    SessionManager.clearSession()
    router.push('/')
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Mijn Dashboard</h1>
              <p className="text-text-secondary">Welkom terug, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                ← Terug naar site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-text-secondary hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Profile Card */}
            <Link
              href="/dashboard/profiel"
              className="group bg-gradient-to-br from-dark-card to-dark-section p-6 rounded-xl border border-dark-border hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">Profiel</h3>
                    <p className="text-text-secondary text-sm truncate max-w-[140px]">{user.email}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <p className="text-text-secondary text-sm group-hover:text-white/80 transition-colors">
                Beheer je persoonlijke gegevens
              </p>
            </Link>

            {/* Cart Card */}
            <Link
              href="/cart"
              className="group bg-gradient-to-br from-dark-card to-dark-section p-6 rounded-xl border border-dark-border hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">Winkelwagen</h3>
                    <p className="text-text-secondary text-sm">Bekijk je items</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <p className="text-text-secondary text-sm group-hover:text-white/80 transition-colors">
                Bekijk en beheer je winkelwagen
              </p>
            </Link>

            {/* Courses Card */}
            <Link
              href="/dashboard/cursussen"
              className="group bg-gradient-to-br from-dark-card via-blue-950/20 to-dark-section p-6 rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">Mijn Cursussen</h3>
                    <p className="text-text-secondary text-sm">
                      {purchasedProducts.filter(p => p.type === 'course').length} {purchasedProducts.filter(p => p.type === 'course').length === 1 ? 'cursus' : 'cursussen'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {purchasedProducts.filter(p => p.type === 'course').length > 0 && (
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">
                      {purchasedProducts.filter(p => p.type === 'course').length}
                    </span>
                  )}
                  <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
              <p className="text-text-secondary text-sm group-hover:text-white/80 transition-colors">
                Start met leren en ontwikkelen
              </p>
            </Link>

            {/* E-books Card */}
            <Link
              href="/dashboard/ebooks"
              className="group bg-gradient-to-br from-dark-card via-green-950/20 to-dark-section p-6 rounded-xl border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">Mijn E-books</h3>
                    <p className="text-text-secondary text-sm">
                      {purchasedProducts.filter(p => p.type === 'ebook').length} {purchasedProducts.filter(p => p.type === 'ebook').length === 1 ? 'e-book' : 'e-books'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {purchasedProducts.filter(p => p.type === 'ebook').length > 0 && (
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                      {purchasedProducts.filter(p => p.type === 'ebook').length}
                    </span>
                  )}
                  <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
              <p className="text-text-secondary text-sm group-hover:text-white/80 transition-colors">
                Download en lees je e-books
              </p>
            </Link>

            {/* Orders Card */}
            <Link
              href="/dashboard/orders"
              className="group bg-gradient-to-br from-dark-card via-orange-950/20 to-dark-section p-6 rounded-xl border border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">Mijn Orders</h3>
                    <p className="text-text-secondary text-sm">Bekijk je bestellingen</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <p className="text-text-secondary text-sm group-hover:text-white/80 transition-colors">
                Overzicht van al je aankopen
              </p>
            </Link>

          </div>

          {/* My Purchased Products Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Mijn Gekochte Producten</h2>
                <p className="text-text-secondary">
                  {loadingPurchases 
                    ? 'Laden...' 
                    : purchasedProducts.length === 0 
                    ? 'Je hebt nog geen producten gekocht'
                    : `${purchasedProducts.length} ${purchasedProducts.length === 1 ? 'product' : 'producten'} gekocht`}
                </p>
              </div>
            </div>

            {loadingPurchases ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : purchasedProducts.length === 0 ? (
              <div className="bg-dark-card rounded-xl p-12 border border-dark-border text-center">
                <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nog geen producten gekocht</h3>
                <p className="text-text-secondary mb-6">
                  Begin met het bekijken van onze cursussen en e-books!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/cursussen"
                    className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Bekijk Cursussen
                  </Link>
                  <Link
                    href="/ebooks"
                    className="bg-dark-section border border-dark-border text-white px-6 py-3 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Bekijk E-books
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-gradient-to-br from-dark-card to-dark-section rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20"
                  >
                      {/* Product Image */}
                    <div className="relative h-52 bg-gradient-to-br from-dark-section to-dark-card overflow-hidden">
                      {product.imageUrl ? (
                        <>
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border ${
                          product.type === 'course' 
                            ? 'bg-blue-500/90 text-white border-blue-400/50 shadow-lg shadow-blue-500/30'
                            : product.type === 'ebook'
                            ? 'bg-green-500/90 text-white border-green-400/50 shadow-lg shadow-green-500/30'
                            : 'bg-orange-500/90 text-white border-orange-400/50 shadow-lg shadow-orange-500/30'
                        }`}>
                          {product.type === 'course' ? '📚 Cursus' : product.type === 'ebook' ? '📖 E-book' : '⭐ Review'}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.shortDescription && (
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      )}

                      {/* Action Button */}
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-black py-3.5 px-4 rounded-xl font-bold hover:from-primary/90 hover:to-primary/80 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {product.type === 'course' ? (
                          <>
                            <Play className="w-4 h-4" />
                            Start Cursus
                          </>
                        ) : product.type === 'ebook' ? (
                          <>
                            <Download className="w-4 h-4" />
                            Bekijk E-book
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Bekijk Review
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}