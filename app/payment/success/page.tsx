'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Download, Play } from 'lucide-react'
import { OrderService } from '@/lib/orders'

interface SuccessPageProps {
  searchParams: {
    orderId?: string
  }
}

function SuccessContent({ orderId }: { orderId?: string }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const loadOrder = async () => {
      try {
        // Fetch order from API since we're client-side now
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const orderData = await response.json()
          setOrder(orderData.order)
        }
      } catch (error) {
        console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  if (!orderId) {
    return (
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Betaling succesvol!</h1>
        <p className="text-text-secondary mb-6">
          Je betaling is verwerkt. Je kunt nu toegang krijgen tot je cursussen.
        </p>
        <Link
          href="/dashboard"
          className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
        >
          Naar Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const order = await OrderService.getOrder(orderId)
  
  if (!order) {
    return (
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Betaling succesvol!</h1>
        <p className="text-text-secondary mb-6">
          Je betaling is verwerkt. Je kunt nu toegang krijgen tot je cursussen.
        </p>
        <Link
          href="/dashboard"
          className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
        >
          Naar Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Betaling succesvol!</h1>
        <p className="text-text-secondary">
          Je bestelling is bevestigd en je hebt nu toegang tot je cursussen.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-8">
        <h2 className="text-xl font-semibold mb-4">Bestelling Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-secondary">Bestelnummer:</span>
            <span className="font-semibold">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Datum:</span>
            <span className="font-semibold">
              {new Date(order.createdAt).toLocaleDateString('nl-NL')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Totaal:</span>
            <span className="font-semibold text-primary">
              €{(order.totalAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Purchased Items */}
      <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-8">
        <h2 className="text-xl font-semibold mb-4">Gekochte Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-dark-section rounded-lg">
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-text-secondary capitalize">{item.type}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.type === 'course' ? (
                  <Link
                    href={`/courses/${item.id}`}
                    className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Cursus
                  </Link>
                ) : (
                  <Link
                    href={`/ebooks/${item.id}`}
                    className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download E-book
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-400 mb-4">Volgende Stappen</h2>
        <div className="space-y-3 text-green-300">
          <p>• Je hebt nu toegang tot alle gekochte cursussen en e-books</p>
          <p>• Bekijk je voortgang in je dashboard</p>
          <p>• Download je e-books direct</p>
          <p>• Start met leren wanneer je wilt</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard"
          className="flex-1 bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 text-center inline-flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Naar Dashboard
        </Link>
        <Link
          href="/cursussen"
          className="flex-1 bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 text-center"
        >
          Meer Cursussen Bekijken
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  // Clear cart on successful payment
  useEffect(() => {
    const clearCart = async () => {
      try {
        const response = await fetch('/api/cart/clear', {
          method: 'POST'
        })
        if (response.ok) {
          console.log('✅ Cart cleared after successful payment')
          // Dispatch event to update cart count in header
          window.dispatchEvent(new CustomEvent('cartUpdated'))
        }
      } catch (error) {
        console.error('Error clearing cart:', error)
      }
    }
    
    clearCart()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Betaling Voltooid
          </h1>
          <p className="text-xl text-text-secondary">
            Bedankt voor je aankoop! Je cursussen zijn nu beschikbaar.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <SuccessContent orderId={searchParams.orderId} />
        </div>
      </section>
    </main>
  )
}


