// lib/products-database.ts - Database-based Product Service
import { prisma } from './prisma'
import { Product, ProductType } from '@prisma/client'

export class DatabaseProductService {
  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get products by type
  static async getProductsByType(type: ProductType): Promise<Product[]> {
    return await prisma.product.findMany({
      where: { type, isActive: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<Product[]> {
    return await prisma.product.findMany({
      where: { featured: true, isActive: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get single product
  static async getProduct(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id }
    })
  }

  // Create product
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return await prisma.product.create({
      data: productData
    })
  }

  // Update product
  static async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  // Delete product
  static async deleteProduct(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id }
    })
  }

  // Get products by category (for reviews)
  static async getProductsByCategory(category: string): Promise<Product[]> {
    return await prisma.product.findMany({
      where: { 
        category,
        type: 'REVIEW',
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get product statistics
  static async getProductStats() {
    const [total, active, featured, courses, ebooks, reviews] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { type: 'COURSE' } }),
      prisma.product.count({ where: { type: 'EBOOK' } }),
      prisma.product.count({ where: { type: 'REVIEW' } })
    ])

    return {
      total,
      active,
      featured,
      courses,
      ebooks,
      reviews
    }
  }
}

// Backward compatibility functions
export async function getProduct(productId: string): Promise<Product | null> {
  return await DatabaseProductService.getProduct(productId)
}

export async function getAllProducts(): Promise<Product[]> {
  return await DatabaseProductService.getAllProducts()
}

export async function getProductsByType(type: ProductType): Promise<Product[]> {
  return await DatabaseProductService.getProductsByType(type)
}

// Price formatting utility
export function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2)
}
