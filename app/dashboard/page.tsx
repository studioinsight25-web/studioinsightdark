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
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Profiel</h3>
                  <p className="text-text-secondary text-sm">{user.email}</p>
                </div>
              </div>
              <Link
                href="/account"
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                Profiel bewerken →
              </Link>
            </div>

            {/* Cart Card */}
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Winkelwagen</h3>
                  <p className="text-text-secondary text-sm">Bekijk je items</p>
                </div>
              </div>
              <Link
                href="/cart"
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                Winkelwagen bekijken →
              </Link>
            </div>

            {/* Courses Card */}
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Mijn Cursussen</h3>
                  <p className="text-text-secondary text-sm">Bekijk je cursussen</p>
                </div>
              </div>
              <Link
                href="/cursussen"
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                Cursussen bekijken →
              </Link>
            </div>

            {/* E-books Card */}
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Mijn E-books</h3>
                  <p className="text-text-secondary text-sm">Bekijk je e-books</p>
                </div>
              </div>
              <Link
                href="/ebooks"
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                E-books bekijken →
              </Link>
            </div>

            {/* Orders Card */}
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Mijn Orders</h3>
                  <p className="text-text-secondary text-sm">Bekijk je bestellingen</p>
                </div>
              </div>
              <Link
                href="/orders"
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                Orders bekijken →
              </Link>
            </div>

            {/* Reviews Card */}
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Mijn Reviews</h3>
                  <p className="text-text-secondary text-sm">Bekijk je reviews</p>
                </div>
              </div>
              <Link
                href="/reviews"
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                Reviews bekijken →
              </Link>
            </div>

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
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Producten laden...</p>
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
                    className="bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-dark-section to-dark-card">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-text-secondary" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.type === 'course' 
                            ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                            : product.type === 'ebook'
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                            : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
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
                        className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
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