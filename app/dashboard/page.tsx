'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  ShoppingCart, 
  BookOpen, 
  Star,
  LogOut,
  Settings,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import SessionManager from '@/lib/session'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = SessionManager.getSession()
    if (!session) {
      router.push('/inloggen')
      return
    }
    setUser(session)
    setIsLoading(false)
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
        </div>
      </section>
    </main>
  )
}