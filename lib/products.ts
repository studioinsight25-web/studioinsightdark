// lib/products.ts - Centralized Product Management
import ProductStorage from './product-storage'
import { DatabaseProductService } from './products-database'

export interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string // Korte beschrijving voor overzichten
  price: number // in cents
  type: 'course' | 'ebook' | 'review'
  category?: 'microfoon' | 'webcam' | 'accessoires' // Voor review producten
  isActive: boolean
  featured: boolean
  sales: number
  createdAt: string
  updatedAt: string
  comingSoon?: boolean // Binnenkort beschikbaar status
  // Course specific fields
  duration?: string
  level?: string
  students?: string
  lessons?: string
  imageId?: string
  imageUrl?: string // Cloudinary image URL
  imagePublicId?: string // Cloudinary public ID for deletion
  externalUrl?: string // Voor affiliate links naar externe producten
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
    imageId: '1507003211169-0a1dd7228f2d'
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
    imageId: '1467232004584-a241de8bcf5d'
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
    imageId: '1574717024653-61fd2cf4d44d'
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
    imageId: '1552664730-d307ca884978'
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
    imageId: '1507003211169-0a1dd7228f2d'
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
    imageId: '1467232004584-a241de8bcf5d'
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
    imageId: '1552664730-d307ca884978'
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
    imageId: '1574717024653-61fd2cf4d44d'
  }
}

// Product service functions with persistent storage
export class ProductService {
  static getAllProducts(): Product[] {
    if (typeof window === 'undefined') {
      // Server-side rendering, return default products
      return Object.values(DEFAULT_PRODUCTS)
    }

    // Initialize with defaults if empty
    ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
    
    return ProductStorage.getAllProducts()
  }

  static getProduct(productId: string): Product | null {
    if (typeof window === 'undefined') {
      return DEFAULT_PRODUCTS[productId] || null
    }
    
    return ProductStorage.getProduct(productId)
  }

  static getProductsByType(type: 'course' | 'ebook' | 'review'): Product[] {
    return this.getAllProducts().filter(product => product.type === type)
  }

  static getActiveProducts(): Product[] {
    return this.getAllProducts().filter(product => product.isActive)
  }

  static getFeaturedProducts(): Product[] {
    return this.getAllProducts().filter(product => product.featured && product.isActive)
  }


  static updateProduct(productId: string, updates: Partial<Product>): Product | null {
    if (typeof window === 'undefined') return null
    
    return ProductStorage.updateProduct(productId, updates)
  }

  static deleteProduct(productId: string): boolean {
    if (typeof window === 'undefined') return false
    
    return ProductStorage.deleteProduct(productId)
  }

  static createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    console.log('ProductService: Creating product with data:', product)
    const id = `product-${Date.now()}`
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('ProductService: New product created:', newProduct)
    console.log('ProductService: New product imageUrl:', newProduct.imageUrl)

    if (typeof window !== 'undefined') {
      ProductStorage.addProduct(newProduct)
      console.log('ProductService: Product added to storage')
    }

    return newProduct
  }

  // Reset to default products (useful for development)
  static resetToDefaults(): void {
    if (typeof window === 'undefined') return
    
    ProductStorage.reset()
    ProductStorage.initializeWithDefaults(Object.values(DEFAULT_PRODUCTS))
  }
}

// Helper functions for backward compatibility
export function formatPrice(priceInCents: number): string {
  return priceInCents === 0 ? 'Gratis' : `€${(priceInCents / 100).toFixed(2)}`
}

export function getCourseImage(courseId: string): string {
  const product = ProductService.getProduct(courseId)
  return product?.imageId || '1507003211169-0a1dd7228f2d'
}

export function getCourseCategory(courseId: string): string {
  const product = ProductService.getProduct(courseId)
  return product?.category || 'General'
}

export function getCourseLevel(courseId: string): string {
  const product = ProductService.getProduct(courseId)
  return product?.level || 'Beginner'
}

export function getCourseDuration(courseId: string): string {
  const product = ProductService.getProduct(courseId)
  return product?.duration || '4 uur'
}

export function getCourseStudents(courseId: string): string {
  const product = ProductService.getProduct(courseId)
  return product?.students || '1,000'
}

export function getCourseLessons(courseId: string): string {
  const product = ProductService.getProduct(courseId)
  return product?.lessons || '10'
}
