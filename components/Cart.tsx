'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, Lock, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { Product, formatPrice } from '@/lib/products'
import { trackAddToCart, trackBeginCheckout } from '@/lib/analytics'

interface CartProps {
  onCheckout: (items: Product[]) => void
}

export default function Cart({ onCheckout }: CartProps) {
  const [cartItems, setCartItems] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('studio-insight-cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  const updateCart = (newItems: Product[]) => {
    setCartItems(newItems)
    localStorage.setItem('studio-insight-cart', JSON.stringify(newItems))
  }

  const addToCart = (item: Product) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id)
    if (!existingItem) {
      updateCart([...cartItems, item])
      // Track add to cart event
      trackAddToCart(item)
    }
  }

  const removeFromCart = (itemId: string) => {
    updateCart(cartItems.filter(item => item.id !== itemId))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    // Track begin checkout event
    trackBeginCheckout(cartItems)
    onCheckout(cartItems)
    setIsOpen(false)
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative bg-transparent border border-dark-border text-white px-2 xl:px-4 py-2 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 flex items-center gap-1 xl:gap-2 text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        <span className="hidden xl:inline">Winkelwagen</span>
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-dark-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Winkelwagen</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary">Je winkelwagen is leeg</p>
                  <Link
                    href="/cursussen"
                    className="text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Bekijk cursussen
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-dark-section rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-text-secondary capitalize">{item.type}</p>
                        <p className="text-primary font-semibold">€{formatPrice(item.price)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-dark-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Totaal:</span>
                  <span className="text-xl font-bold text-primary">€{formatPrice(getTotalPrice())}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Afrekenen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

