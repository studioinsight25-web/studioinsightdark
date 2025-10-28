// app/products/[id]/page.tsx - Individual Product Detail Page
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Users, 
  Play, 
  Download, 
  Tag,
  Calendar,
  Eye,
  ShoppingCart
} from 'lucide-react'
import { Product, formatPrice } from '@/lib/products'
import { ProductService } from '@/lib/products'
import { trackViewItem, trackCourseEnrollment, trackEbookDownload, trackReviewView, trackAddToCart } from '@/lib/analytics'
import { CartService } from '@/lib/cart-database'
import SessionManager from '@/lib/session'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await ProductService.getProduct(productId)
        if (productData) {
          setProduct(productData)
          trackViewItem(productData)
        } else {
          console.error('Product not found')
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    const currentUserId = SessionManager.getCurrentUserId()
    setUserId(currentUserId)

    if (productId) {
      loadProduct()
    }
  }, [productId])

  const handleAddToCart = async () => {
    if (!product) return
    
    if (!userId) {
      alert('Je moet ingelogd zijn om producten toe te voegen aan je winkelwagen.')
      router.push('/inloggen')
      return
    }

    try {
      const success = await CartService.addToCart(userId, product.id, 1)
      if (success) {
        trackAddToCart(product)
        window.dispatchEvent(new CustomEvent('cartUpdated'))
        alert(`${product.name} is toegevoegd aan je winkelwagen!`)
        router.push('/cart')
      } else {
        alert('Er is een fout opgetreden bij het toevoegen aan je winkelwagen.')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Er is een fout opgetreden bij het toevoegen aan je winkelwagen.')
    }
  }

  const handleCourseEnrollment = () => {
    if (!product) return
    trackCourseEnrollment(product)
    // Redirect to course content or dashboard
    router.push('/dashboard')
  }

  const handleEbookDownload = () => {
    if (!product) return
    trackEbookDownload(product)
    // Handle ebook download logic
    alert('E-book download gestart!')
  }

  const handleReviewView = () => {
    if (!product) return
    trackReviewView(product)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Product laden...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product niet gevonden</h1>
            <p className="text-text-secondary mb-6">
              Het product dat je zoekt bestaat niet of is niet meer beschikbaar.
            </p>
            <Link 
              href="/cursussen"
              className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
            >
              Terug naar cursussen
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href={`/${product.type === 'course' ? 'cursussen' : product.type === 'ebook' ? 'ebooks' : 'reviews'}`}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {product.name}
              </h1>
              <p className="text-text-secondary">
                Door Studio Insight
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Image */}
            <div className="lg:col-span-1">
              <div className="bg-dark-card rounded-xl overflow-hidden border border-dark-border">
                <div className="relative h-64 bg-dark-section">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-border flex items-center justify-center">
                      {product.type === 'course' ? (
                        <Play className="w-16 h-16 text-text-secondary" />
                      ) : product.type === 'ebook' ? (
                        <Download className="w-16 h-16 text-text-secondary" />
                      ) : (
                        <Eye className="w-16 h-16 text-text-secondary" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
                {/* Product Info */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      product.type === 'course' 
                        ? 'bg-blue-900/20 text-blue-400' 
                        : product.type === 'ebook'
                        ? 'bg-green-900/20 text-green-400'
                        : 'bg-orange-900/20 text-orange-400'
                    }`}>
                      {product.type === 'course' ? 'Cursus' : product.type === 'ebook' ? 'E-book' : 'Review'}
                    </span>
                    {product.featured && (
                      <span className="px-3 py-1 bg-yellow-900/20 text-yellow-400 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4">{product.name}</h2>
                  <p className="text-text-secondary mb-6">{product.description}</p>

                  {/* Course Stats */}
                  {product.type === 'course' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">Duur</p>
                        <p className="font-semibold text-white">{product.duration || '4 uur'}</p>
                      </div>
                      <div className="text-center">
                        <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">Studenten</p>
                        <p className="font-semibold text-white">{product.students || '1,000'}</p>
                      </div>
                      <div className="text-center">
                        <Play className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">Lessen</p>
                        <p className="font-semibold text-white">{product.lessons || '10'}</p>
                      </div>
                      <div className="text-center">
                        <Tag className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">Niveau</p>
                        <p className="font-semibold text-white">{product.level || 'Beginner'}</p>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <span className="text-text-secondary">(4.8/5)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-8">
                  {product.comingSoon ? (
                    <div className="w-full bg-orange-500 text-white py-4 px-8 rounded-xl font-bold text-xl text-center shadow-lg">
                      🚀 Binnenkort beschikbaar
                    </div>
                  ) : product.type === 'review' ? (
                    <div className="w-full bg-gradient-to-r from-primary to-primary/90 text-black py-4 px-8 rounded-xl font-bold text-xl text-center shadow-lg">
                      📝 Review Product
                    </div>
                  ) : (
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-black py-4 px-8 rounded-xl font-bold text-xl hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      Koop Nu - {formatPrice(product.price)}
                    </button>
                  )}
                </div>

                {/* Amazon Button for Review Products */}
                {product.type === 'review' && product.externalUrl && (
                  <div className="text-center mb-8">
                    <a
                      href={product.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleReviewView}
                      className="inline-flex items-center gap-4 bg-orange-500 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <span className="text-2xl">🛒</span>
                      Koop op Amazon.nl
                      <span className="text-lg">↗</span>
                    </a>
                  </div>
                )}

                {/* Course Actions */}
                {product.type === 'course' && !product.comingSoon && (
                  <div className="space-y-3">
                    <button
                      onClick={handleCourseEnrollment}
                      className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start Cursus
                    </button>
                  </div>
                )}

                {/* E-book Actions */}
                {product.type === 'ebook' && !product.comingSoon && (
                  <div className="space-y-3">
                    <button
                      onClick={handleEbookDownload}
                      className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download E-book
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}