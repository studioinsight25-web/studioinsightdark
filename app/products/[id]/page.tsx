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
  Eye
} from 'lucide-react'
import Cart from '@/components/Cart'
import { Product, formatPrice } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'
import { trackViewItem, trackCourseEnrollment, trackEbookDownload, trackReviewView, trackAddToCart } from '@/lib/analytics'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { products, loading } = useProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [cartItems, setCartItems] = useState<Product[]>([])

  useEffect(() => {
    if (!loading && products.length > 0) {
      const foundProduct = products.find(p => p.id === params.id)
      if (foundProduct) {
        setProduct(foundProduct)
        // Track product view
        trackViewItem(foundProduct)
        
        // Track specific product type views
        if (foundProduct.type === 'course') {
          trackCourseEnrollment(foundProduct.id, foundProduct.name)
        } else if (foundProduct.type === 'ebook') {
          trackEbookDownload(foundProduct.id, foundProduct.name)
        } else if (foundProduct.type === 'review') {
          trackReviewView(foundProduct.id, foundProduct.name)
        }
      } else {
        // Product not found, redirect to 404 or products list
        router.push('/products')
      }
    }
  }, [params.id, products, loading, router])

  // Load cart items on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('studio-insight-cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  const handleAddToCart = () => {
    if (!product) return
    
    const existingCart = JSON.parse(localStorage.getItem('studio-insight-cart') || '[]')
    const isAlreadyInCart = existingCart.some((item: Product) => item.id === product.id)
    
    console.log('Current cart:', existingCart)
    console.log('Adding product:', product)
    console.log('Already in cart:', isAlreadyInCart)
    
    if (!isAlreadyInCart) {
      const updatedCart = [...existingCart, product]
      localStorage.setItem('studio-insight-cart', JSON.stringify(updatedCart))
      setCartItems(updatedCart)
      trackAddToCart(product)
      
      console.log('Updated cart:', updatedCart)
      
      // Dispatch custom event to update header cart
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      
      // Show success message
      alert(`${product.name} is toegevoegd aan je winkelwagen!`)
      
      // Go to cart page instead of checkout
      router.push('/cart')
    } else {
      alert('Dit product staat al in je winkelwagen!')
      // Still go to cart page
      router.push('/cart')
    }
  }

  const handleCheckout = (items: Product[]) => {
    const checkoutData = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        type: item.type
      }))
    }
    
    sessionStorage.setItem('checkout-items', JSON.stringify(checkoutData))
    window.location.href = '/checkout'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Product laden...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Product niet gevonden</h1>
          <p className="text-text-secondary mb-8">Het product dat je zoekt bestaat niet meer.</p>
          <Link
            href="/products"
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar producten
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-6xl pt-8">
        <div className="flex items-center gap-2 text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link 
            href={product.type === 'course' ? '/cursussen' : product.type === 'ebook' ? '/ebooks' : '/reviews'}
            className="hover:text-primary transition-colors"
          >
            {product.type === 'course' ? 'Cursussen' : product.type === 'ebook' ? 'E-books' : 'Reviews'}
          </Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 max-w-6xl pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-card border border-dark-border">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-dark-card flex items-center justify-center">
                  <div className="text-center text-text-secondary">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-lg">Geen afbeelding geüpload</p>
                    <p className="text-sm mt-2">Upload een afbeelding via het admin panel</p>
                  </div>
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-white">
                  {product.name}
                </h1>
                {product.category && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.category === 'microfoon' 
                      ? 'bg-blue-900/20 text-blue-400' 
                      : product.category === 'webcam'
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-purple-900/20 text-purple-400'
                  }`}>
                    {product.category === 'microfoon' && '🎙️ Microfoon'}
                    {product.category === 'webcam' && '📹 Webcam'}
                    {product.category === 'accessoires' && '🔧 Accessoires'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-text-secondary">
                  Door Studio Insight
                </span>
              </div>
              <div className="text-3xl font-bold text-primary mb-6">
                {!product.comingSoon && product.type !== 'review' && formatPrice(product.price)}
              </div>
              
              {/* Large Buy Button */}
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
                    <span className="text-2xl">🛒</span>
                    Koop Nu - {formatPrice(product.price)}
                  </button>
                )}
              </div>
              
              {/* Amazon Button for Review Products - Moved up */}
              {product.type === 'review' && product.externalUrl && (
                <div className="text-center mb-8">
                  <a
                    href={product.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 bg-orange-500 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="text-2xl">🛒</span>
                    Koop op Amazon.nl
                    <span className="text-lg">↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
                {/* Short Description Section */}
                {product.shortDescription && (
                  <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Samenvatting
                    </h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-text-secondary text-lg leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>
                )}

                {/* Full Description Section */}
                <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Over dit {product.type === 'course' ? 'cursus' : product.type === 'ebook' ? 'e-book' : 'product'}
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                </div>


              {/* E-book specific details */}
              {product.type === 'ebook' && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Download className="w-4 h-4" />
                  <span>Direct download beschikbaar</span>
                </div>
              )}

              {/* Review specific details */}
              {product.type === 'review' && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Eye className="w-4 h-4" />
                  <span>Uitgebreide product review</span>
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-text-secondary pt-4 border-t border-dark-border">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Toegevoegd: {new Date(product.createdAt).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Action buttons removed - user is already viewing the product */}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 space-y-8">
          {/* Additional content can go here */}
        </div>
      </div>
    </main>
  )
}
