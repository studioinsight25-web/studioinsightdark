// lib/products-database.ts - Database Product Service
import { PrismaClient, ProductType } from '@prisma/client'
import { Product } from './products'

const prisma = new PrismaClient()

export class DatabaseProductService {
  // Convert Prisma Product to our Product interface
  private static convertPrismaProduct(prismaProduct: any): Product {
    return {
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      shortDescription: prismaProduct.shortDescription,
      price: prismaProduct.price,
      type: prismaProduct.type.toLowerCase() as 'course' | 'ebook' | 'review',
      category: prismaProduct.category?.toLowerCase() as 'microfoon' | 'webcam' | 'accessoires' | undefined,
      isActive: prismaProduct.isActive,
      featured: prismaProduct.featured,
      comingSoon: prismaProduct.comingSoon,
      sales: prismaProduct.sales,
      createdAt: prismaProduct.createdAt.toISOString(),
      updatedAt: prismaProduct.updatedAt.toISOString(),
      duration: prismaProduct.duration,
      level: prismaProduct.level,
      students: prismaProduct.students,
      lessons: prismaProduct.lessons,
      imageId: prismaProduct.imageId,
      imageUrl: prismaProduct.imageUrl,
      imagePublicId: prismaProduct.imagePublicId,
      externalUrl: prismaProduct.externalUrl,
    }
  }

  // Convert our Product interface to Prisma data
  private static convertToPrismaData(product: Partial<Product>) {
    return {
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      type: product.type?.toUpperCase() as ProductType,
      category: product.category?.toUpperCase() as any,
      isActive: product.isActive,
      featured: product.featured,
      comingSoon: product.comingSoon,
      sales: product.sales,
      duration: product.duration,
      level: product.level,
      students: product.students,
      lessons: product.lessons,
      imageId: product.imageId,
      imageUrl: product.imageUrl,
      imagePublicId: product.imagePublicId,
      externalUrl: product.externalUrl,
    }
  }

  static async getAllProducts(): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaProduct)
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      return product ? this.convertPrismaProduct(product) : null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  static async getProductsByType(type: 'course' | 'ebook' | 'review'): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: { 
          type: type.toUpperCase() as ProductType,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaProduct)
    } catch (error) {
      console.error('Error fetching products by type:', error)
      return []
    }
  }

  static async getActiveProducts(): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaProduct)
    } catch (error) {
      console.error('Error fetching active products:', error)
      return []
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: { 
          featured: true,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaProduct)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const prismaData = this.convertToPrismaData(productData)
      const newProduct = await prisma.product.create({
        data: prismaData
      })
      return this.convertPrismaProduct(newProduct)
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const prismaData = this.convertToPrismaData(updates)
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: prismaData
      })
      return this.convertPrismaProduct(updatedProduct)
    } catch (error) {
      console.error('Error updating product:', error)
      return null
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id: productId }
      })
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  static async getProductsByCategory(category: 'microfoon' | 'webcam' | 'accessoires'): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: { 
          category: category.toUpperCase() as ReviewCategory,
          type: 'REVIEW',
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaProduct)
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { shortDescription: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
      return products.map(this.convertPrismaProduct)
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }
}