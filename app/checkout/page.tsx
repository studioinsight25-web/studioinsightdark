'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Lock, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { trackPurchase } from '@/lib/analytics'
import SessionManager from '@/lib/session'

interface CheckoutItem {
  id: string
  name: string
  price: number
  type: 'course' | 'ebook' | 'review'
  quantity?: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load checkout items from sessionStorage
    const checkoutData = sessionStorage.getItem('checkout-items')
    if (checkoutData) {
      const data = JSON.parse(checkoutData)
      setItems(data.items)
    } else {
      // Redirect to courses if no items
      router.push('/cursussen')
    }
  }, [router])

  // Prices from cart are stored in CENTS (as per Product interface)
  const getTotalPrice = () => {
    // Prices are in cents, so sum them and divide by 100 for display
    return items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) / 100
  }

  // Format price - convert from cents to euros for display
  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return '0,00'
    const priceInEuros = priceInCents / 100
    return priceInEuros.toFixed(2).replace('.', ',')
  }

  const handlePayment = async () => {
    if (items.length === 0) return

    setIsLoading(true)
    setError('')

    try {
      // Check if user is logged in
      const userId = SessionManager.getCurrentUserId()
      if (!userId) {
        setError('Je moet ingelogd zijn om te betalen.')
        router.push('/login')
        return
      }

      // Create payment via API (which creates the order)
      const response = await fetch('/api/checkout/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: Math.round(item.price * 100), // Convert euros to cents for API
            type: item.type
          }))
        }),
      })

      const result = await response.json()

      if (response.ok && result.checkoutUrl) {
        // Track purchase event with estimated order ID
        trackPurchase({
          id: result.orderId || 'temp-id',
          total: getTotalPrice(),
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            price: item.price
          }))
        })
        // Clear checkout data
        sessionStorage.removeItem('checkout-items')
        // Redirect to Mollie checkout
        window.location.href = result.checkoutUrl
      } else {
        setError(result.error || 'Er is een fout opgetreden bij het aanmaken van de betaling')
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
      console.error('Checkout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Geen items gevonden</h1>
          <p className="text-text-secondary mb-6">Je hebt geen items in je winkelwagen.</p>
          <Link
            href="/cursussen"
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
          >
            Bekijk cursussen
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/cursussen"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar cursussen
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Afrekenen
          </h1>
          <p className="text-text-secondary">
            Controleer je bestelling en voltooi je betaling veilig.
          </p>
        </div>
      </section>

      {/* Checkout Form */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
              <h2 className="text-xl font-semibold mb-6">Bestelling Overzicht</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-dark-section rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-text-secondary capitalize">
                        {item.type === 'course' ? '📚 Cursus' : item.type === 'ebook' ? '📖 E-book' : '⭐ Review'}
                        {item.quantity && item.quantity > 1 && ` × ${item.quantity}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {item.price === 0 ? 'Gratis' : `€${formatPrice((item.price * (item.quantity || 1)) / 100)}`}
                      </p>
                      {item.quantity && item.quantity > 1 && (
                        <p className="text-xs text-text-secondary mt-1">
                          €{formatPrice(item.price / 100)} per stuk
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-border pt-4">
                {/* Prices are already inclusive of VAT, so calculate backwards */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Subtotaal (excl. BTW):</span>
                  <span className="text-lg font-semibold">€{formatPrice(getTotalPrice() / 1.21)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary">BTW (21%):</span>
                  <span className="text-text-secondary">€{formatPrice(getTotalPrice() - (getTotalPrice() / 1.21))}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold border-t border-dark-border pt-4">
                  <span>Totaal (incl. BTW):</span>
                  <span className="text-primary">€{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Betaling
              </h2>

              <div className="space-y-4 mb-6">
                <div className="bg-dark-section rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Veilige betaling via Mollie</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    Je wordt doorgestuurd naar een beveiligde betalingspagina waar je kunt betalen met:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['iDEAL', 'Creditcard', 'PayPal', 'Bancontact'].map((method) => (
                      <span key={method} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">Veilig en beveiligd</span>
                  </div>
                  <p className="text-sm text-green-300">
                    Je betalingsgegevens worden versleuteld en veilig verwerkt door Mollie.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-semibold">Fout</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isLoading || items.length === 0}
                className="w-full bg-primary text-black py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Betaling voorbereiden...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Betaal €{formatPrice(getTotalPrice())}
                  </>
                )}
              </button>

              <p className="text-xs text-text-secondary text-center mt-4">
                Door te betalen ga je akkoord met onze{' '}
                <Link href="/voorwaarden" className="text-primary hover:text-primary/80">
                  algemene voorwaarden
                </Link>{' '}
                en{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/80">
                  privacy policy
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

