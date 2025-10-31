'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/products'
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
    
    // Store checkout data
    const checkoutData = {
      items: cartItems
        .filter(item => item.product !== undefined)
        .map(item => ({
          id: item.product!.id,
          name: item.product!.name,
          price: item.product!.price,
          quantity: item.quantity,
          type: item.product!.type
        })),
      total: getTotalPrice()
    }
    
    sessionStorage.setItem('checkout-data', JSON.stringify(checkoutData))
    router.push('/checkout')
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
      <section className="py-12 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/cursussen"
              className="text-text-secondary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Winkelwagen
              </h1>
              <p className="text-text-secondary">
                {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'} in je winkelwagen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-dark-card rounded-xl p-6 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">Jouw Winkelwagen</h2>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary text-lg">Je winkelwagen is leeg.</p>
                  <Link href="/cursussen" className="text-primary hover:text-primary/80 transition-colors mt-4 inline-block">
                    Bekijk onze producten
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems
                    .filter(item => item.product !== undefined)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-dark-section rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-dark-card rounded-lg overflow-hidden">
                            {item.product!.imageUrl ? (
                              <Image
                                src={item.product!.imageUrl}
                                alt={item.product!.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-dark-border flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-text-secondary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{item.product!.name}</h3>
                            <p className="text-sm text-text-secondary">
                              {item.product!.type === 'course' ? 'Cursus' : 
                               item.product!.type === 'ebook' ? 'E-book' : 'Review'}
                            </p>
                            <p className="text-primary font-semibold">
                              {formatPrice(item.product!.price)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="w-8 h-8 bg-dark-section border border-dark-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="w-8 text-center text-white font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="w-8 h-8 bg-dark-section border border-dark-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-400 hover:text-red-500 transition-colors"
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
            <div className="lg:col-span-1">
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border sticky top-6">
                <h3 className="text-xl font-bold mb-6">Bestelling Overzicht</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotaal ({getItemCount()} items)</span>
                    <span>{formatPrice(subtotalExclVAT)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>BTW (21%)</span>
                    <span>{formatPrice(vatAmount)}</span>
                  </div>
                  <div className="border-t border-dark-border pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Totaal (incl. BTW)</span>
                      <span className="text-primary">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}