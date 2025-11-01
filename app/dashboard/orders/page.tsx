'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Package, Calendar, CheckCircle, XCircle, Clock, Download, Play, ExternalLink } from 'lucide-react'
import SessionManager from '@/lib/session'
import { formatPrice } from '@/lib/products'

interface OrderItem {
  id: string
  name: string
  price: number
  type: 'course' | 'ebook' | 'review'
  imageUrl?: string
}

interface Order {
  id: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  paidAt?: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const session = SessionManager.getSession()
    if (!session) {
      router.push('/inloggen')
      return
    }
    
    setUser(session)
    
    // Load orders
    const loadOrders = async () => {
      try {
        const response = await fetch('/api/user/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadOrders()
  }, [router])

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'paid':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Betaald
          </span>
        )
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            In behandeling
          </span>
        )
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Mislukt
          </span>
        )
      case 'refunded':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-900/30 text-gray-400 border border-gray-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Terugbetaald
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-900/30 text-gray-400 border border-gray-500/30">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProductAction = (item: OrderItem, orderStatus: string) => {
    if (orderStatus.toLowerCase() !== 'paid') {
      return null
    }

    if (item.type === 'course') {
      return (
        <Link
          href={`/dashboard/cursussen`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4" />
          Start Cursus
        </Link>
      )
    } else if (item.type === 'ebook') {
      return (
        <Link
          href={`/dashboard/ebooks`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download E-book
        </Link>
      )
    } else if (item.type === 'review') {
      return (
        <Link
          href={`/products/${item.id}`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Bekijk Review
        </Link>
      )
    }
    return null
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
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Mijn Orders</h1>
          <p className="text-text-secondary">
            {orders.length === 0 
              ? 'Je hebt nog geen orders geplaatst' 
              : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} totaal`}
          </p>
        </div>
      </header>

      {/* Orders Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {orders.length === 0 ? (
            <div className="bg-dark-card rounded-xl p-12 border border-dark-border text-center">
              <Package className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nog geen orders</h3>
              <p className="text-text-secondary mb-6">
                Je hebt nog geen producten besteld. Begin met het bekijken van onze cursussen en e-books!
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/cursussen"
                  className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
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
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-dark-card rounded-xl border border-dark-border overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-dark-section px-6 py-4 border-b border-dark-border">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Order #{order.id.substring(0, 8)}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.createdAt)}
                            </div>
                            {order.paidAt && (
                              <div className="flex items-center gap-2 text-green-400 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Betaald: {formatDate(order.paidAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(order.status)}
                        <div className="text-right">
                          <p className="text-sm text-text-secondary">Totaal</p>
                          <p className="text-xl font-bold text-white">{formatPrice(order.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="text-md font-semibold text-white mb-4">Bestelde Producten</h4>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors"
                        >
                          {/* Product Image */}
                          <div className="relative w-20 h-20 bg-dark-card rounded-lg overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-contain p-2"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-text-secondary" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white font-semibold mb-1 truncate">{item.name}</h5>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                item.type === 'course' 
                                  ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                                  : item.type === 'ebook'
                                  ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                  : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                              }`}>
                                {item.type === 'course' ? '📚 Cursus' : item.type === 'ebook' ? '📖 E-book' : '⭐ Review'}
                              </span>
                              <span className="text-text-secondary text-sm">{formatPrice(item.price)}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex-shrink-0">
                            {getProductAction(item, order.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

