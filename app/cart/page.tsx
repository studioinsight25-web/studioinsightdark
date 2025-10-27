'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react'
import { Product, formatPrice } from '@/lib/products'
import { trackBeginCheckout } from '@/lib/analytics'

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('studio-insight-cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
    setIsLoading(false)
  }, [])

  const updateCart = (newItems: Product[]) => {
    setCartItems(newItems)
    localStorage.setItem('studio-insight-cart', JSON.stringify(newItems))
    
    // Dispatch custom event to update header cart
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const removeFromCart = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId)
    updateCart(updatedItems)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    
    // Track begin checkout event
    trackBeginCheckout(cartItems)
    
    // Store checkout data
    const checkoutData = {
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        type: item.type
      })),
      total: getTotalPrice()
    }
    
    sessionStorage.setItem('checkout-items', JSON.stringify(checkoutData))
    
    // Redirect to checkout
    router.push('/checkout')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Winkelwagen laden...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">Winkelwagen</h1>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Je winkelwagen is leeg</h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                Voeg producten toe aan je winkelwagen om verder te gaan met je bestelling.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/cursussen"
                  className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Bekijk Cursussen
                </Link>
                <Link
                  href="/ebooks"
                  className="bg-transparent border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Bekijk E-books
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold mb-6">Je Producten ({cartItems.length})</h2>
                
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-dark-card rounded-xl p-6 border border-dark-border hover:border-primary transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-dark-section rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="text-center text-text-secondary">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                              <ShoppingCart className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-text-secondary mb-2 capitalize">
                          {item.type}
                        </p>
                        {item.shortDescription && (
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {item.shortDescription}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-primary">
                            {formatPrice(item.price)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-400/10 rounded-lg"
                            title="Verwijderen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-dark-card rounded-xl p-6 border border-dark-border sticky top-6">
                  <h3 className="text-xl font-bold mb-6">Bestelling Overzicht</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-text-secondary">
                      <span>Subtotaal ({cartItems.length} items)</span>
                      <span>{formatPrice(Math.round(getTotalPrice() / 1.21))}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>BTW (21%)</span>
                      <span>{formatPrice(getTotalPrice() - Math.round(getTotalPrice() / 1.21))}</span>
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
                    className="w-full bg-primary text-black py-4 px-6 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <CreditCard className="w-5 h-5" />
                    Naar Checkout
                  </button>

                  <p className="text-xs text-text-secondary text-center mt-4">
                    Veilig betalen via Mollie
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
