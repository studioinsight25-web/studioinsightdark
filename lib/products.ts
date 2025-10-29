// lib/products.ts - Centralized Product Management
import ProductStorage from './product-storage'
import { DatabaseProductService } from './products-database'

export interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string
  price: number // Price in cents
  type: 'course' | 'ebook' | 'review'
  category?: 'microfoon' | 'webcam' | 'accessoires'
  isActive: boolean
  featured: boolean
  comingSoon?: boolean
  sales: number
  duration?: string
  level?: string
  students?: string
  lessons?: string
  imageId?: string
  imageUrl?: string
  imagePublicId?: string
  externalUrl?: string
  createdAt: string
  updatedAt: string
}

// Default product data
const DEFAULT_PRODUCTS: Record<string, Product> = {
  'course-podcast': {
    id: 'course-podcast',
    name: 'Podcasten voor beginners',
    description: 'Leer de basis van podcasten en bouw je eigen podcast op.',
    price: 9700, // €97.00 in cents
    type: 'course',
    isActive: true,
    featured: true,
    sales: 45,
    createdAt: '2024-10-20',
    updatedAt: '2024-10-26',
    duration: '4 uur',
    level: 'Beginner',
    students: '1,250',
    lessons: '13',
    imageId: '1507003211169-0a1dd7228f2d',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
  },
  'course-website': {
    id: 'course-website',
    name: 'Bouw een persoonlijke website',
    description: 'Van concept tot live website. Leer moderne web development technieken.',
    price: 14700, // €147.00 in cents
    type: 'course',
    isActive: true,
    featured: false,
    sales: 32,
    createdAt: '2024-10-18',
    updatedAt: '2024-10-25',
    duration: '6 uur',
    level: 'Beginner',
    students: '2,100',
    lessons: '14',
    imageId: '1467232004584-a241de8bcf5d',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop'
  },
  'course-video': {
    id: 'course-video',
    name: 'Videobewerking fundamentals',
    description: 'Professionele video editing technieken voor content creators.',
    price: 19700, // €197.00 in cents
    type: 'course',
    isActive: true,
    featured: true,
    sales: 28,
    createdAt: '2024-10-15',
    updatedAt: '2024-10-24',
    duration: '8 uur',
    level: 'Gevorderd',
    students: '890',
    lessons: '15',
    imageId: '1574717024653-61fd2cf4d44d',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop'
  },
  'course-content': {
    id: 'course-content',
    name: 'Content strategie masterclass',
    description: 'Ontwikkel een winnende content strategie voor je merk.',
    price: 12700, // €127.00 in cents
    type: 'course',
    isActive: true,
    featured: false,
    sales: 22,
    createdAt: '2024-10-12',
    updatedAt: '2024-10-23',
    duration: '5 uur',
    level: 'Gemiddeld',
    students: '1,500',
    lessons: '12',
    imageId: '1552664730-d307ca884978',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },
  'ebook-email': {
    id: 'ebook-email',
    name: 'E-mail marketing voor ondernemers',
    description: 'Leer effectieve e-mail campagnes opzetten.',
    price: 0, // Free
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 156,
    createdAt: '2024-10-10',
    updatedAt: '2024-10-22',
    imageId: '1507003211169-0a1dd7228f2d',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
  },
  'ebook-seo': {
    id: 'ebook-seo',
    name: 'SEO voor starters',
    description: 'Zoekmachine optimalisatie van A tot Z.',
    price: 0, // Free
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 89,
    createdAt: '2024-10-08',
    updatedAt: '2024-10-21',
    imageId: '1467232004584-a241de8bcf5d',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop'
  },
  'ebook-content': {
    id: 'ebook-content',
    name: 'Content strategie gids',
    description: 'Ontwikkel een winnende content strategie.',
    price: 1900, // €19.00 in cents
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 67,
    createdAt: '2024-10-05',
    updatedAt: '2024-10-20',
    imageId: '1552664730-d307ca884978',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },
  'ebook-branding': {
    id: 'ebook-branding',
    name: 'Branding handboek',
    description: 'Creëer een sterke merkidentiteit.',
    price: 2500, // €25.00 in cents
    type: 'ebook',
    isActive: true,
    featured: false,
    sales: 43,
    createdAt: '2024-10-03',
    updatedAt: '2024-10-19',
    imageId: '1574717024653-61fd2cf4d44d',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop'
  },
  'review-microfoon-1': {
    id: 'review-microfoon-1',
    name: 'Rode NT-USB Mini Review',
    description: 'Een uitgebreide review van de Rode NT-USB Mini microfoon voor podcasters en content creators.',
    shortDescription: 'De perfecte microfoon voor podcasts en streaming.',
    price: 0,
    type: 'review',
    category: 'microfoon',
    isActive: true,
    featured: true,
    sales: 0,
    createdAt: '2024-10-27',
    updatedAt: '2024-10-27',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop',
    externalUrl: 'https://www.amazon.nl/Rode-NT-USB-Mini-USB-Microfoon/dp/B082G92K7M'
  },
  'review-webcam-1': {
    id: 'review-webcam-1',
    name: 'Logitech C920 Pro Review',
    description: 'Een diepgaande review van de Logitech C920 Pro webcam voor professionals.',
    shortDescription: 'Professionele webcam voor streaming en video calls.',
    price: 0,
    type: 'review',
    category: 'webcam',
    isActive: true,
    featured: false,
    sales: 0,
    createdAt: '2024-10-27',
    updatedAt: '2024-10-27',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=250&fit=crop',
    externalUrl: 'https://www.amazon.nl/Logitech-C920-Pro-HD-Webcam/dp/B006JH8T3S'
  },
  'review-accessoires-1': {
    id: 'review-accessoires-1',
    name: 'Elgato Stream Deck Review',
    description: 'Review van de Elgato Stream Deck voor streamers en content creators.',
    shortDescription: 'Professionele controle voor je stream setup.',
    price: 0,
    type: 'review',
    category: 'accessoires',
    isActive: true,
    featured: false,
    sales: 0,
    createdAt: '2024-10-27',
    updatedAt: '2024-10-27',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=250&fit=crop',
    externalUrl: 'https://www.amazon.nl/Elgato-Stream-Deck-Controller/dp/B06XKNZT1P'
  }
}

// Product service functions with database storage
export class ProductService {
  // Database methods (server-side only)
  static async getAllProducts(): Promise<Product[]> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.getAllProducts()
      } catch (error) {
        console.error('Error fetching products from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.getAllProducts()
    }
    
    return Object.values(DEFAULT_PRODUCTS)
  }

  static async getProduct(productId: string): Promise<Product | null> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.getProduct(productId)
      } catch (error) {
        console.error('Error fetching product from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.getProduct(productId)
    }
    
    return DEFAULT_PRODUCTS[productId] || null
  }

  static async getProductsByType(type: 'course' | 'ebook' | 'review'): Promise<Product[]> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.getProductsByType(type)
      } catch (error) {
        console.error('Error fetching products by type from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.getAllProducts().filter(product => product.type === type)
    }
    
    return Object.values(DEFAULT_PRODUCTS).filter(product => product.type === type)
  }

  static async getActiveProducts(): Promise<Product[]> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.getActiveProducts()
      } catch (error) {
        console.error('Error fetching active products from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.getAllProducts().filter(product => product.isActive)
    }
    
    return Object.values(DEFAULT_PRODUCTS).filter(product => product.isActive)
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.getFeaturedProducts()
      } catch (error) {
        console.error('Error fetching featured products from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.getAllProducts().filter(product => product.featured)
    }
    
    return Object.values(DEFAULT_PRODUCTS).filter(product => product.featured)
  }

  static async getProductsByCategory(category: 'microfoon' | 'webcam' | 'accessoires'): Promise<Product[]> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.getProductsByCategory(category)
      } catch (error) {
        console.error('Error fetching products by category from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.getAllProducts().filter(product => product.category === category)
    }
    
    return Object.values(DEFAULT_PRODUCTS).filter(product => product.category === category)
  }

  static async searchProducts(query: string): Promise<Product[]> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.searchProducts(query)
      } catch (error) {
        console.error('Error searching products from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      const allProducts = ProductStorage.getAllProducts()
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    const allProducts = Object.values(DEFAULT_PRODUCTS)
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.updateProduct(productId, updates)
      } catch (error) {
        console.error('Error updating product in database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.updateProduct(productId, updates)
    }
    
    return null
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.deleteProduct(productId)
      } catch (error) {
        console.error('Error deleting product from database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.deleteProduct(productId)
    }
    
    return false
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    // Only use database on server-side
    if (typeof window === 'undefined') {
      try {
        return await DatabaseProductService.createProduct(product)
      } catch (error) {
        console.error('Error creating product in database:', error)
      }
    }
    
    // Client-side fallback to localStorage
    if (typeof window !== 'undefined') {
      ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
      return ProductStorage.createProduct(product)
    }
    
    throw new Error('Cannot create product on server side without database')
  }

  // Reset to defaults (server-side only)
  static async resetToDefaults(): Promise<void> {
    if (typeof window !== 'undefined') {
      throw new Error('resetToDefaults can only be called on server-side')
    }
    
    try {
      // Products are managed via DatabaseProductService now
      // This function is deprecated
      throw new Error('resetToDefaults is deprecated - use DatabaseProductService instead')
    } catch (error) {
      console.error('Error resetting to defaults:', error)
      throw error
    }
  }

  // Sync methods for client-side use
  static getAllProductsSync(): Product[] {
    if (typeof window === 'undefined') {
      throw new Error('getAllProductsSync can only be called on client-side')
    }
    
    ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
    return ProductStorage.getAllProducts()
  }

  static getProductSync(productId: string): Product | null {
    if (typeof window === 'undefined') {
      throw new Error('getProductSync can only be called on client-side')
    }
    
    ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
    return ProductStorage.getProduct(productId)
  }

  static createProductSync(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    if (typeof window === 'undefined') {
      throw new Error('createProductSync can only be called on client-side')
    }
    
    ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
    return ProductStorage.createProduct(product)
  }

  static updateProductSync(productId: string, updates: Partial<Product>): Product | null {
    if (typeof window === 'undefined') {
      throw new Error('updateProductSync can only be called on client-side')
    }
    
    ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
    return ProductStorage.updateProduct(productId, updates)
  }

  static deleteProductSync(productId: string): boolean {
    if (typeof window === 'undefined') {
      throw new Error('deleteProductSync can only be called on client-side')
    }
    
    ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
    return ProductStorage.deleteProduct(productId)
  }
}

// Utility functions
export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return 'Gratis'
  return `€${(priceInCents / 100).toFixed(2)}`
}

export function getProductTypeLabel(type: Product['type']): string {
  switch (type) {
    case 'course':
      return 'Cursus'
    case 'ebook':
      return 'E-book'
    case 'review':
      return 'Review'
    default:
      return type
  }
}

export function getCategoryLabel(category: Product['category']): string {
  switch (category) {
    case 'microfoon':
      return 'Microfoon'
    case 'webcam':
      return 'Webcam'
    case 'accessoires':
      return 'Accessoires'
    default:
      return category || ''
  }
}

export default ProductService