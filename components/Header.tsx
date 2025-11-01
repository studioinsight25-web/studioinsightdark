'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react'
// Removed direct database import - using API routes instead
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
  const userRef = useRef<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [, forceUpdate] = useState(0)
  
  // Keep ref in sync with state
  useEffect(() => {
    userRef.current = user
  }, [user])
  
  // Direct function to get current session (reads directly from localStorage)
  const getCurrentSession = () => {
    if (typeof window === 'undefined') return null
    try {
      const sessionData = localStorage.getItem('studio-insight-session')
      if (!sessionData) return null
      const session = JSON.parse(sessionData)
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        return null
      }
      return session
    } catch {
      return null
    }
  }
  
  // Get current session directly - this runs on every render to always get latest
  const currentSession = typeof window !== 'undefined' ? getCurrentSession() : null
  
  // Optional: Debug logging (can be removed in production)
  // Uncomment to debug session issues:
  // if (typeof window !== 'undefined') {
  //   const rawStorage = localStorage.getItem('studio-insight-session')
  //   console.log('[Header Render] Session check:', { 
  //     currentSession: currentSession ? { userId: currentSession.userId, role: currentSession.role } : null,
  //     rawStorageExists: !!rawStorage,
  //     userState: user ? { id: user.id, role: user.role } : null,
  //     isAdmin: currentSession?.role === 'ADMIN' || user?.role === 'ADMIN'
  //   })
  // }
  
  // Update user state based on current session - ALWAYS check on mount and when session might change
  useEffect(() => {
    const checkAndUpdate = () => {
      const session = getCurrentSession()
      
      if (session) {
        const newUser = {
          id: session.userId,
          email: session.email,
          name: session.name || session.email.split('@')[0] || 'User',
          role: session.role
        }
        
        if (!user || user.id !== newUser.id || user.role !== newUser.role) {
          setUser(newUser)
        }
      } else if (user) {
        setUser(null)
      }
      setIsLoading(false)
    }
    
    // Check immediately
    checkAndUpdate()
    
    // Check again after a short delay (for page reloads)
    const timeout1 = setTimeout(checkAndUpdate, 100)
    const timeout2 = setTimeout(checkAndUpdate, 500)
    
    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
    }
  }, []) // Only run on mount - polling will handle updates

  // Force re-render on session updates + aggressive polling
  useEffect(() => {
    const handleSessionUpdate = () => {
      const session = getCurrentSession()
      
      if (session) {
        const newUser = {
          id: session.userId,
          email: session.email,
          name: session.name || session.email.split('@')[0] || 'User',
          role: session.role
        }
        setUser(newUser)
        forceUpdate(prev => prev + 1)
      } else {
        setUser(null)
      }
    }

    window.addEventListener('sessionUpdated', handleSessionUpdate)
    window.addEventListener('storage', handleSessionUpdate)
    
    // Aggressive polling - every 500ms for first 10 seconds, then every 2 seconds
    let pollCount = 0
    const pollInterval = setInterval(() => {
      pollCount++
      const session = getCurrentSession()
      
      // Always update if session changed (use ref to avoid closure issues)
      const currentUser = userRef.current
      if (session) {
        const needsUpdate = !currentUser || currentUser.id !== session.userId || currentUser.role !== session.role
        if (needsUpdate) {
          setUser({
            id: session.userId,
            email: session.email,
            name: session.name || session.email.split('@')[0] || 'User',
            role: session.role
          })
        }
      } else if (currentUser) {
        setUser(null)
      }
      
      // After 20 polls (10 seconds), slow down to every 2 seconds
      if (pollCount > 20) {
        clearInterval(pollInterval)
        const slowPoll = setInterval(() => {
          const session = getCurrentSession()
          const currentUser = userRef.current
          if (session && (!currentUser || currentUser.role !== session.role)) {
            setUser({
              id: session.userId,
              email: session.email,
              name: session.name || session.email.split('@')[0] || 'User',
              role: session.role
            })
          } else if (!session && currentUser) {
            setUser(null)
          }
        }, 2000)
        
        return () => clearInterval(slowPoll)
      }
    }, 500)

    return () => {
      window.removeEventListener('sessionUpdated', handleSessionUpdate)
      window.removeEventListener('storage', handleSessionUpdate)
      clearInterval(pollInterval)
    }
  }, []) // Run once on mount - don't depend on user

  // Load cart item count
  useEffect(() => {
    const loadCartCount = async () => {
      const userId = SessionManager.getCurrentUserId()
      if (userId) {
        try {
          const response = await fetch('/api/cart')
          if (response.ok) {
            const data = await response.json()
            const count = data.cartItems.length
            setCartItemCount(count)
          }
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
      
      // Dispatch event to notify of session change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sessionUpdated'))
      }
      
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
            
            {(() => {
              // ALWAYS check session directly - don't rely on state
              const session = getCurrentSession() || SessionManager.getSession()
              const displayUser = session ? {
                id: session.userId,
                email: session.email,
                name: session.name || session.email.split('@')[0] || 'User',
                role: session.role
              } : user
              
              if (isLoading && !session && !user) {
                return <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              }
              
              if (displayUser || session) {
                const isAdmin = (displayUser?.role === 'ADMIN') || (session?.role === 'ADMIN')
                
                
                return (
                  <div className="flex items-center gap-3">
                    {/* User Avatar - Clickable to Dashboard */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-3 py-2 bg-dark-card/50 rounded-lg border border-dark-border/50 hover:border-primary hover:bg-dark-card transition-colors duration-300 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {displayUser?.name || session?.email?.split('@')[0] || 'User'}
                      </span>
                    </Link>
                    
                    {/* Admin Link - Always show if session is admin */}
                    {isAdmin && (
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
                )
              }
              
              // Not logged in
              return (
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
              )
            })()}
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
                
                {(() => {
                  // ALWAYS check session directly
                  const session = getCurrentSession() || SessionManager.getSession()
                  const displayUser = session ? {
                    id: session.userId,
                    email: session.email,
                    name: session.name || session.email.split('@')[0] || 'User',
                    role: session.role
                  } : user
                  
                  if (displayUser || session) {
                    const isAdmin = (displayUser?.role === 'ADMIN') || (session?.role === 'ADMIN')
                    
                    return (
                      <div className="space-y-3">
                        {/* User Info - Clickable to Dashboard */}
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 bg-dark-card/50 rounded-lg border border-dark-border/50 hover:border-primary hover:bg-dark-card transition-all duration-300"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-black" />
                          </div>
                          <span className="font-medium text-white">
                            {displayUser?.name || session?.email?.split('@')[0] || 'User'}
                          </span>
                        </Link>
                        
                        <Link
                          href="/dashboard/profiel"
                          className="flex items-center gap-3 px-4 py-3 text-white hover:text-primary hover:bg-dark-card/50 transition-all duration-300 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          Profiel
                        </Link>
                        
                        {/* Admin Link - Always show if session is admin */}
                        {isAdmin && (
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
                    )
                  }
                  
                  // Not logged in
                  return (
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
                  )
                })()}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
