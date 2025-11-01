'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react'
// Note: formatPrice from lib/products expects cents, but database stores prices in euros
// So we'll format prices directly here
import { trackBeginCheckout } from '@/lib/analytics'
import { useCart } from '@/hooks/useCart'
import SessionManager from '@/lib/session'

export default function CartPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const { 
    cartItems, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice, 
    getItemCount 
  } = useCart(userId || '')

  useEffect(() => {
    // Get current user ID from session
    const currentUserId = SessionManager.getCurrentUserId()
    setUserId(currentUserId)
  }, [])

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId)
    } else {
      await updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    
    // Track begin checkout event (filter out undefined products)
    const products = cartItems.map(item => item.product).filter((p): p is NonNullable<typeof p> => p !== undefined)
    trackBeginCheckout(products)
    
    // Store checkout data (use the key that checkout page expects)
    const checkoutData = {
      items: cartItems
        .filter(item => item.product !== undefined)
        .map(item => ({
          id: item.product!.id,
          name: item.product!.name,
          price: item.product!.price,
          quantity: item.quantity,
          type: (item.product!.type?.toLowerCase() || 'course') as 'course' | 'ebook' | 'review' // Normalize to lowercase
        }))
    }
    
    // Use 'checkout-items' key that the checkout page expects
    sessionStorage.setItem('checkout-items', JSON.stringify(checkoutData))
    router.push('/checkout')
  }

  // Helper to format price - prices from database are in CENTS (like formatPrice expects)
  const formatPriceInEuros = (priceInCents: number): string => {
    if (priceInCents === 0) return 'Gratis'
    // Prices are stored in cents in the Product interface, so divide by 100
    const priceInEuros = priceInCents / 100
    return `€${priceInEuros.toFixed(2).replace('.', ',')}`
  }

  const VAT_RATE = 0.21
  const subtotalExclVAT = Math.round(getTotalPrice() / (1 + VAT_RATE))
  const vatAmount = getTotalPrice() - subtotalExclVAT

  if (!userId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Inloggen vereist</h1>
            <p className="text-text-secondary mb-6">
              Je moet ingelogd zijn om je winkelwagen te bekijken.
            </p>
            <Link 
              href="/inloggen"
              className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Winkelwagen laden...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="bg-dark-section border-b border-dark-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Terug naar homepage
              </Link>
              <h1 className="text-2xl font-bold text-white">Winkelwagen</h1>
              <p className="text-text-secondary">
                {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'} in je winkelwagen
              </p>
            </div>
            {userId && (
              <Link
                href="/dashboard"
                className="text-text-secondary hover:text-primary transition-colors text-sm"
              >
                Dashboard →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-dark-card rounded-xl p-6 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">Jouw Winkelwagen</h2>
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Je winkelwagen is leeg</h3>
                  <p className="text-text-secondary mb-6">
                    Voeg producten toe aan je winkelwagen om verder te gaan met bestellen.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link 
                      href="/cursussen" 
                      className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                    >
                      Bekijk Cursussen
                    </Link>
                    <Link 
                      href="/ebooks" 
                      className="bg-dark-section border border-dark-border text-white px-6 py-3 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                      Bekijk E-books
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems
                    .filter(item => item.product !== undefined)
                    .map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative w-20 h-20 bg-dark-card rounded-lg overflow-hidden flex-shrink-0">
                            {item.product!.imageUrl ? (
                              <Image
                                src={item.product!.imageUrl}
                                alt={item.product!.name}
                                fill
                                className="object-contain p-2"
                              />
                            ) : (
                              <div className="w-full h-full bg-dark-border flex items-center justify-center">
                                <ShoppingCart className="w-8 h-8 text-text-secondary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white mb-1 truncate">{item.product!.name}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                item.product!.type === 'course' 
                                  ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                                  : item.product!.type === 'ebook'
                                  ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                  : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                              }`}>
                                {item.product!.type === 'course' ? '📚 Cursus' : item.product!.type === 'ebook' ? '📖 E-book' : '⭐ Review'}
                              </span>
                              <span className="text-primary font-semibold text-sm">
                                {formatPriceInEuros(item.product!.price)} per stuk
                              </span>
                              <span className="text-text-secondary text-sm">
                                Totaal: {formatPriceInEuros(item.product!.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-dark-card px-2 py-1 rounded-lg border border-dark-border">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="w-8 h-8 bg-dark-section border border-dark-border rounded flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-colors"
                              aria-label="Verlaag aantal"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="w-10 text-center text-white font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="w-8 h-8 bg-dark-section border border-dark-border rounded flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-colors"
                              aria-label="Verhoog aantal"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            aria-label="Verwijder uit winkelwagen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cartItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-dark-card rounded-xl p-6 border border-dark-border sticky top-6">
                  <h3 className="text-xl font-bold mb-6">Bestelling Overzicht</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-text-secondary text-sm">
                      <span>Subtotaal ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})</span>
                      <span>{formatPriceInEuros(subtotalExclVAT)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary text-sm">
                      <span>BTW (21%)</span>
                      <span>{formatPriceInEuros(vatAmount)}</span>
                    </div>
                    <div className="border-t border-dark-border pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-white">Totaal</span>
                        <span className="text-xl font-bold text-primary">
                          {formatPriceInEuros(getTotalPrice())}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">Inclusief BTW</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                    className="w-full bg-primary text-black py-4 px-6 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-5 h-5" />
                    Naar Checkout
                  </button>
                  <p className="text-xs text-text-secondary text-center mt-4">
                    Veilig betalen met Mollie
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}