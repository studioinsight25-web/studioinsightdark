'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react'
import { CartService } from '@/lib/cart-database'
import SessionManager from '@/lib/session'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)

  // Load user and cart data
  useEffect(() => {
    const loadUserData = () => {
      const session = SessionManager.getSession()
      if (session) {
        setUser({
          id: session.userId,
          email: session.email,
          name: session.name || '',
          role: session.role
        })
      }
      setIsLoading(false)
    }

    loadUserData()
  }, [])

  // Load cart item count
  useEffect(() => {
    const loadCartCount = async () => {
      const userId = SessionManager.getCurrentUserId()
      if (userId) {
        try {
          const count = await CartService.getCartItemCount(userId)
          setCartItemCount(count)
        } catch (error) {
          console.error('Error loading cart count:', error)
        }
      }
    }

    loadCartCount()

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Clear session
      SessionManager.clearSession()
      
      // Clear user state
      setUser(null)
      
      // Redirect to home
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    { name: 'Cursussen', href: '/cursussen' },
    { name: 'E-books', href: '/ebooks' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Contact', href: '/contact' },
    { name: 'Over Ons', href: '/over-ons' },
  ]

  return (
    <header className="bg-dark-section/95 backdrop-blur-md border-b border-dark-border/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
              <span className="text-black font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
              Studio Insight
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-white hover:text-primary transition-all duration-300 font-medium text-sm rounded-lg hover:bg-dark-card/50 group"
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Link with Counter */}
            <Link
              href="/cart"
              className="relative bg-transparent border border-dark-border text-white px-2 xl:px-4 py-2 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 flex items-center gap-1 xl:gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden xl:inline">Winkelwagen</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="flex items-center gap-3 px-3 py-2 bg-dark-card/50 rounded-lg border border-dark-border/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-sm font-medium text-white">{user.name}</span>
                </div>
                
                {/* Admin Link - Only visible for admin users */}
                {SessionManager.isAdmin() && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 rounded-lg border border-primary/20"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden xl:inline text-sm font-medium">Admin</span>
                  </Link>
                )}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-white hover:bg-red-500/10 transition-all duration-300 rounded-lg border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline text-sm">Uitloggen</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/inloggen"
                  className="px-4 py-2 text-white hover:text-primary transition-all duration-300 font-medium text-sm rounded-lg hover:bg-dark-card/50"
                >
                  Inloggen
                </Link>
                <Link
                  href="/registreren"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary/90 text-black font-semibold hover:from-primary/90 hover:to-primary transition-all duration-300 rounded-lg text-sm shadow-lg hover:shadow-primary/25"
                >
                  Registreren
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white hover:text-primary transition-colors duration-300 rounded-lg hover:bg-dark-card/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-dark-border/50 bg-dark-section/95 backdrop-blur-md">
            <nav className="py-6 space-y-3 px-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-white hover:text-primary hover:bg-dark-card/50 transition-all duration-300 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="border-t border-dark-border/50 pt-6 mt-6">
                {/* Mobile Cart Link */}
                <Link
                  href="/cart"
                  className="flex items-center gap-3 px-4 py-3 mb-4 bg-transparent border border-dark-border text-white rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Winkelwagen</span>
                  {cartItemCount > 0 && (
                    <span className="ml-auto bg-primary text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                
                {user ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-dark-card/50 rounded-lg border border-dark-border/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-black" />
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                    
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-3 text-white hover:text-primary hover:bg-dark-card/50 transition-all duration-300 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Account
                    </Link>
                    
                    {/* Admin Link - Only visible for admin users */}
                    {SessionManager.isAdmin() && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 rounded-lg border border-primary/20"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-red-500/10 transition-all duration-300 rounded-lg border border-transparent hover:border-red-500/20 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Uitloggen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/inloggen"
                      className="block px-4 py-3 text-white hover:text-primary hover:bg-dark-card/50 transition-all duration-300 rounded-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Inloggen
                    </Link>
                    <Link
                      href="/registreren"
                      className="block px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-black hover:from-primary/90 hover:to-primary transition-all duration-300 rounded-lg text-center font-semibold shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registreren
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
