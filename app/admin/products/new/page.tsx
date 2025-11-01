'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import DigitalProductUpload from '@/components/admin/DigitalProductUpload'
import { ProductService } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'
import { useDigitalProducts } from '@/hooks/useDigitalProducts'
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react'
import Link from 'next/link'
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
  externalUrl?: string // Voor affiliate links naar externe producten
  // Course specific fields
  duration?: string
  level?: string
  students?: string
  lessons?: string
}

export default function NewProductPage() {
  const { addProduct } = useProducts()
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const levels = ['Beginner', 'Gemiddeld', 'Gevorderd', 'Expert']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create product data
      const productData: any = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        type: formData.type,
        isActive: formData.isActive,
        featured: formData.featured,
        comingSoon: formData.comingSoon,
        sales: 0,
        category: formData.category || undefined,
        // Course specific fields
        duration: formData.duration || '',
        level: formData.level || '',
        students: formData.students || '',
        lessons: formData.lessons || '',
        imageId: imageUrl ? imageUrl.split('/').pop()?.split('?')[0] : undefined,
        imageUrl: imageUrl || undefined,
        externalUrl: formData.externalUrl || undefined
      }
      
      // Price: required for course and ebook, optional for review
      if (formData.type === 'review') {
        productData.price = 0 // Review products don't need a price
      } else {
        productData.price = formData.price
      }
      
      // Add to ProductService using the hook
      const newProduct = await addProduct(productData)
      
      console.log('Product created:', newProduct)
      console.log('Image URL saved:', imageUrl)
      console.log('Product imageUrl:', newProduct.imageUrl)
      
      // Redirect to edit page to add digital products
      window.location.href = `/admin/products/${newProduct.id}`
    } catch (error) {
      console.error('Error creating product:', error)
      alert(`Fout bij aanmaken product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
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
              <h1 className="text-3xl font-bold text-white">Nieuw Product</h1>
              <p className="text-text-secondary mt-2">
                Voeg een nieuwe cursus of e-book toe
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              className="bg-transparent border border-dark-border text-white px-4 py-2 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
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

                  {formData.type !== 'review' && (
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
                  )}
                  
                  {formData.type === 'review' && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-sm text-blue-400">
                        💡 <strong>Review product:</strong> Voor review producten is geen prijs nodig omdat ze affiliate links gebruiken. De prijs wordt automatisch op €0,00 gezet.
                      </p>
                    </div>
                  )}

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
                      rows={8}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary resize-vertical"
                      placeholder="Schrijf hier een uitgebreide beschrijving van je product. Deze tekst wordt getoond op de product detail pagina waar gebruikers alle informatie kunnen lezen over je cursus, e-book of review.

Voorbeelden:
- Wat leren gebruikers?
- Wat zijn de voordelen?
- Voor wie is dit geschikt?
- Wat maakt dit uniek?"
                    />
                    <p className="text-xs text-text-secondary mt-2">
                      Deze tekst wordt prominent weergegeven op de product detail pagina
                    </p>
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
                            {levels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
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
                  
                  {/* External URL voor affiliate links */}
                  {formData.type === 'review' && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Externe URL (Amazon, etc.)
                      </label>
                      <input
                        type="url"
                        value={formData.externalUrl || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                        placeholder="https://amazon.nl/dp/..."
                      />
                      <p className="text-sm text-text-secondary mt-1">
                        URL naar het externe product dat je reviewt (bijv. Amazon)
                      </p>
                    </div>
                  )}
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
                  className="w-full"
                />
              </div>

              {/* Digital Products Upload */}
              <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-6">Digitale Bestanden</h2>
                <p className="text-text-secondary mb-4">
                  Upload digitale bestanden die klanten kunnen downloaden na aankoop van dit product.
                </p>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Tip:</strong> Digitale bestanden kunnen worden toegevoegd na het opslaan van het product. 
                    Ga naar het product bewerken om bestanden te uploaden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
