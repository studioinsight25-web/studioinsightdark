'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { ArrowLeft, ExternalLink, Package, DollarSign, Calendar, Tag, Eye } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface ProductData {
  id: string
  name: string
  description: string
  shortDescription: string
  price: number
  type: 'course' | 'ebook'
  category: string
  isActive: boolean
  featured: boolean
  tags: string[]
  metaTitle: string
  metaDescription: string
  sales: number
  createdAt: string
  updatedAt: string
}

export default function ProductPreviewPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<ProductData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Mock data - in echte app zou je API call maken
        const mockProduct: ProductData = {
          id: productId,
          name: 'Podcasten voor beginners',
          description: 'Leer alles over podcasten in deze uitgebreide cursus. Van het opzetten van je studio tot het publiceren van je eerste aflevering. Deze cursus behandelt alle aspecten van podcasten voor beginners.',
          shortDescription: 'Een complete cursus over podcasten voor beginners',
          price: 9700,
          type: 'course',
          category: 'Audio',
          isActive: true,
          featured: true,
          tags: ['podcast', 'audio', 'beginners', 'studio'],
          metaTitle: 'Podcasten voor beginners - Studio Insight',
          metaDescription: 'Leer podcasten met onze uitgebreide cursus voor beginners',
          sales: 45,
          createdAt: '2024-10-20',
          updatedAt: '2024-10-26'
        }
        
        setProduct(mockProduct)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading product:', error)
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const formatPrice = (priceInCents: number) => {
    return priceInCents === 0 ? 'Gratis' : `€${(priceInCents / 100).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Product niet gevonden</h3>
          <p className="text-text-secondary mb-6">
            Het product dat je zoekt bestaat niet of is verwijderd.
          </p>
          <Link
            href="/admin/products"
            className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Producten
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/products/${productId}`}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Product Preview</h1>
              <p className="text-text-secondary mt-2">
                Bekijk hoe "{product.name}" eruit ziet voor klanten
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/products/${productId}`}
              className="bg-transparent border border-dark-border text-white px-4 py-2 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 flex items-center gap-2"
            >
              Bewerken
            </Link>
            <Link
              href={`/${product.type === 'course' ? 'courses' : 'ebooks'}/${productId}`}
              target="_blank"
              className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Bekijk Live
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Preview */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
              {/* Product Image */}
              <div className="w-full h-64 bg-dark-section flex items-center justify-center">
                <div className="text-center">
                  <Package className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary">Product afbeelding</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {product.name}
                      {product.featured && (
                        <span className="ml-3 bg-yellow-900/20 text-yellow-400 text-sm px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </h2>
                    <p className="text-text-secondary">{product.shortDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
                    <p className="text-sm text-text-secondary">
                      {product.type === 'course' ? 'Cursus' : 'E-book'}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-white mb-3">Beschrijving</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex-1">
                    {product.price === 0 ? 'Gratis Downloaden' : 'Nu Kopen'}
                  </button>
                  <button className="bg-transparent border border-dark-border text-white px-6 py-3 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Sidebar */}
          <div className="space-y-6">
            {/* Product Stats */}
            <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-white mb-4">Product Statistieken</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-text-secondary">Verkocht</span>
                  </div>
                  <span className="text-white font-semibold">{product.sales}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-text-secondary">Aangemaakt</span>
                  </div>
                  <span className="text-white font-semibold">
                    {new Date(product.createdAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="text-text-secondary">Bijgewerkt</span>
                  </div>
                  <span className="text-white font-semibold">
                    {new Date(product.updatedAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-white mb-4">Product Informatie</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-text-secondary text-sm">Type</span>
                  <p className="text-white font-medium">
                    {product.type === 'course' ? 'Cursus' : 'E-book'}
                  </p>
                </div>
                
                <div>
                  <span className="text-text-secondary text-sm">Categorie</span>
                  <p className="text-white font-medium">{product.category}</p>
                </div>
                
                <div>
                  <span className="text-text-secondary text-sm">Status</span>
                  <p className={`font-medium ${
                    product.isActive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {product.isActive ? 'Actief' : 'Inactief'}
                  </p>
                </div>
                
                <div>
                  <span className="text-text-secondary text-sm">Prijs</span>
                  <p className="text-white font-medium">{formatPrice(product.price)}</p>
                </div>
              </div>
            </div>

            {/* SEO Preview */}
            <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-white mb-4">SEO Preview</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-text-secondary text-sm">Meta Titel</span>
                  <p className="text-white text-sm bg-dark-section p-2 rounded border">
                    {product.metaTitle || product.name}
                  </p>
                </div>
                
                <div>
                  <span className="text-text-secondary text-sm">Meta Beschrijving</span>
                  <p className="text-text-secondary text-sm bg-dark-section p-2 rounded border">
                    {product.metaDescription || product.shortDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}







