// lib/product-storage.ts - Persistent Product Storage
'use client'

import { Product } from './products'

class ProductStorage {
  private static STORAGE_KEY = 'studio-insight-products-v2'
  private static DELETED_KEY = 'studio-insight-deleted-products'

  // Get all products (excluding deleted ones)
  static getAllProducts(): Product[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const deleted = this.getDeletedProducts()
      
      if (stored) {
        const products = JSON.parse(stored)
        // Filter out deleted products
        return products.filter((product: Product) => !deleted.includes(product.id))
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }

    return []
  }

  // Get deleted product IDs
  private static getDeletedProducts(): string[] {
    try {
      const stored = localStorage.getItem(this.DELETED_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading deleted products:', error)
      return []
    }
  }

  // Save products
  static saveProducts(products: Product[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products))
    } catch (error) {
      console.error('Error saving products:', error)
    }
  }

  // Add a product
  // Add a new product
  static addProduct(product: Product): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const products = stored ? JSON.parse(stored) : []
      
      // Add the new product
      products.push(product)
      
      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products))
      
      console.log('Product added to storage:', product)
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  // Create a product from partial data (client-side fallback)
  static createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    if (typeof window === 'undefined') {
      throw new Error('Cannot create product on server side')
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const products: Product[] = stored ? JSON.parse(stored) : []

      const newProduct: Product = {
        ...product as Product,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      products.push(newProduct)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products))

      console.log('Product created in storage:', newProduct)
      return newProduct
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  // Update a product
  static updateProduct(id: string, updates: Partial<Product>): Product | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const products = stored ? JSON.parse(stored) : []
      const index = products.findIndex((p: any) => p.id === id)
      
      if (index === -1) return null

      const updatedProduct = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      products[index] = updatedProduct
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products))
      
      console.log('Product updated in storage:', updatedProduct)
      return updatedProduct
    } catch (error) {
      console.error('Error updating product:', error)
      return null
    }
  }

  // Delete a product (mark as deleted)
  static deleteProduct(id: string): boolean {
    const products = this.getAllProducts()
    const product = products.find(p => p.id === id)
    
    if (!product) return false

    // Add to deleted list
    const deleted = this.getDeletedProducts()
    if (!deleted.includes(id)) {
      deleted.push(id)
      try {
        localStorage.setItem(this.DELETED_KEY, JSON.stringify(deleted))
      } catch (error) {
        console.error('Error saving deleted products:', error)
      }
    }

    // Remove from products list
    const filteredProducts = products.filter(p => p.id !== id)
    this.saveProducts(filteredProducts)
    
    return true
  }

  // Get a specific product
  static getProduct(id: string): Product | null {
    const products = this.getAllProducts()
    return products.find(p => p.id === id) || null
  }

  // Reset everything (for development)
  static reset(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.DELETED_KEY)
  }

  // Initialize with default products if empty
  static initializeWithDefaults(defaultProducts: Product[]): void {
    const existing = this.getAllProducts()
    if (existing.length === 0) {
      this.saveProducts(defaultProducts)
    }
  }
}

export default ProductStorage
