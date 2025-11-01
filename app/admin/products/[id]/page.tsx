'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import DigitalProductUpload from '@/components/admin/DigitalProductUpload'
import { ArrowLeft, Save, Eye, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { DigitalProduct } from '@/lib/digital-products'

interface ProductFormData {
  name: string
  description: string
  shortDescription: string
  price: number
  type: 'course' | 'ebook' | 'review'
  category: 'microfoon' | 'webcam' | 'accessoires' | ''
  isActive: boolean
  featured: boolean
  comingSoon: boolean
  tags: string[]
  metaTitle: string
  metaDescription: string
  // Course specific fields
  duration?: string
  level?: string
  students?: string
  lessons?: string
  externalUrl?: string
}

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const { products, loading, updateProduct, deleteProduct } = useProducts()
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([])
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    type: 'course',
    category: '',
    isActive: true,
    featured: false,
    comingSoon: false,
    tags: [],
    metaTitle: '',
    metaDescription: '',
    duration: '',
    level: '',
    students: '',
    lessons: '',
    externalUrl: ''
  })

  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const categories = [
    'Audio', 'Web Development', 'Video', 'Marketing', 'Branding', 'Design'
  ]

  // Load product data
  useEffect(() => {
    if (!loading && products.length > 0) {
      const product = products.find(p => p.id === productId)
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || '',
          price: product.price,
          type: product.type,
          category: product.category || '',
          isActive: product.isActive,
          featured: product.featured,
          comingSoon: product.comingSoon || false,
          tags: [], // Tags not implemented yet
          metaTitle: '', // Meta fields not implemented yet
          metaDescription: '',
          duration: product.duration || '',
          level: product.level || '',
          students: product.students || '',
          lessons: product.lessons || '',
          externalUrl: product.externalUrl || ''
        })
        setImageUrl(product.imageUrl || null)
        setIsLoading(false)
      } else {
        // Product not found
        setIsLoading(false)
      }
    }
  }, [productId, products, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Prepare product data - convert empty strings to undefined
      const productData: any = {
        name: formData.name.trim() || undefined,
        description: formData.description.trim() || undefined,
        shortDescription: formData.shortDescription.trim() || undefined,
        price: formData.price,
        type: formData.type,
        isActive: formData.isActive,
        featured: formData.featured,
        comingSoon: formData.comingSoon,
        category: formData.category?.trim() || undefined,
      }
      
      // Course specific fields - only include if not empty
      if (formData.duration?.trim()) {
        productData.duration = formData.duration.trim()
      }
      if (formData.level?.trim()) {
        productData.level = formData.level.trim()
      }
      if (formData.students?.trim()) {
        // Convert string to number if valid
        const studentsNum = parseInt(formData.students.trim(), 10)
        if (!isNaN(studentsNum)) {
          productData.students = studentsNum.toString()
        }
      }
      if (formData.lessons?.trim()) {
        // Convert string to number if valid
        const lessonsNum = parseInt(formData.lessons.trim(), 10)
        if (!isNaN(lessonsNum)) {
          productData.lessons = lessonsNum.toString()
        }
      }
      
      // Image fields
      if (imageUrl) {
        const imageId = imageUrl.split('/').pop()?.split('?')[0]
        if (imageId) {
          productData.imageId = imageId
        }
        productData.imageUrl = imageUrl
      }
      
      if (formData.externalUrl?.trim()) {
        productData.externalUrl = formData.externalUrl.trim()
      }
      
      console.log('Updating product with data:', productData)
      
      // Update product using the hook
      const updatedProduct = await updateProduct(productId, productData)
      
      if (updatedProduct) {
        console.log('Product updated successfully:', updatedProduct)
        // Show success message and redirect
        alert('Product succesvol bijgewerkt!')
        window.location.href = '/admin/products'
      } else {
        console.error('Failed to update product - no product returned')
        alert('Fout: Product kon niet worden bijgewerkt. Controleer de console voor details.')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout'
      alert(`Fout bij bijwerken product: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Weet je zeker dat je dit product wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {
        const success = await deleteProduct(productId)
        
        if (success) {
          console.log('Product deleted:', productId)
          // Redirect to products list
          window.location.href = '/admin/products'
        } else {
          console.error('Failed to delete product')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="ml-4 text-white">Laden...</p>
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
              href="/admin/products"
              className="text-text-secondary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Product Bewerken</h1>
              <p className="text-text-secondary mt-2">
                Bewerk "{formData.name}"
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/products/${productId}/preview`}
              className="bg-transparent border border-dark-border text-white px-4 py-2 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Verwijderen
            </button>
            <button
              form="product-form"
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Opslaan
                </>
              )}
            </button>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-6">Basis Informatie</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Product Naam *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                      placeholder="Bijv. Podcasten voor beginners"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Type *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'course' | 'ebook' | 'review' }))}
                        className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                      >
                        <option value="course">Cursus</option>
                        <option value="ebook">E-book</option>
                        <option value="review">Review</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Prijs (€) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.price / 100}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Math.round(parseFloat(e.target.value) * 100) }))}
                      className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Laat leeg voor gratis producten
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Korte Beschrijving *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                      placeholder="Een korte beschrijving die verschijnt op de productkaart..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Volledige Beschrijving *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                      placeholder="Een uitgebreide beschrijving van het product..."
                    />
                  </div>

                  {/* Course specific fields */}
                  {formData.type === 'course' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Duur (optioneel)
                          </label>
                          <input
                            type="text"
                            value={formData.duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                            className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                            placeholder="Bijv. 4 uur, 2 dagen"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Niveau (optioneel)
                          </label>
                          <select
                            value={formData.level}
                            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                            className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                          >
                            <option value="">Selecteer niveau</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Gevorderd">Gevorderd</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Aantal Studenten (optioneel)
                          </label>
                          <input
                            type="text"
                            value={formData.students}
                            onChange={(e) => setFormData(prev => ({ ...prev, students: e.target.value }))}
                            className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                            placeholder="Bijv. 1,250"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Aantal Lessen (optioneel)
                          </label>
                          <input
                            type="text"
                            value={formData.lessons}
                            onChange={(e) => setFormData(prev => ({ ...prev, lessons: e.target.value }))}
                            className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                            placeholder="Bijv. 13"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {formData.type === 'review' && (
                    <div className="space-y-4">
                      {/* Category Selection */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <label className="block text-sm font-medium text-white mb-2">
                          📂 Categorie
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'microfoon' | 'webcam' | 'accessoires' | '' }))}
                          className="w-full px-3 py-2 bg-dark-section border border-primary/50 rounded-lg text-white focus:outline-none focus:border-primary"
                        >
                          <option value="">Selecteer categorie</option>
                          <option value="microfoon">🎙️ Microfoon</option>
                          <option value="webcam">📹 Webcam</option>
                          <option value="accessoires">🔧 Accessoires</option>
                        </select>
                        <p className="text-sm text-primary mt-2">
                          💡 Kies de juiste categorie voor dit review product
                        </p>
                      </div>

                      {/* External URL */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <label className="block text-sm font-medium text-white mb-2">
                          🔗 Externe URL (Amazon, etc.)
                        </label>
                        <input
                          type="url"
                          value={formData.externalUrl || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                          className="w-full px-3 py-2 bg-dark-section border border-primary/50 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                          placeholder="https://amazon.nl/dp/..."
                        />
                        <p className="text-sm text-primary mt-2">
                          💡 Link naar het product op Amazon of andere webshop voor affiliate commissie
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-6">SEO Instellingen</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Meta Titel
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                      placeholder="SEO titel voor zoekmachines"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Meta Beschrijving
                    </label>
                    <textarea
                      rows={3}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                      placeholder="SEO beschrijving voor zoekmachines"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-6">Status</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-white">Product is actief</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-white">Featured product</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.comingSoon}
                      onChange={(e) => setFormData(prev => ({ ...prev, comingSoon: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-white">Binnenkort beschikbaar</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-6">Tags</h2>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                      placeholder="Voeg tag toe..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="bg-primary text-black px-3 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-primary/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-6">Afbeelding</h2>
                
                <ImageUpload
                  onImageChange={(file, url) => {
                    setSelectedImage(file)
                    setImageUrl(url || null)
                  }}
                  currentImage={imageUrl || '/uploads/sample-product.jpg'}
                  className="w-full"
                />
              </div>

            </div>
          </div>
        </form>

        {/* Digital Products Upload - Outside form to prevent submit issues */}
        <div className="mt-6">
          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <DigitalProductUpload
              productId={productId}
              onDigitalProductsChange={setDigitalProducts}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
