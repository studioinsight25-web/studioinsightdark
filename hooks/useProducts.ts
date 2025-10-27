'use client'

// hooks/useProducts.ts - Custom hook for product management
import { useState, useEffect } from 'react'
import { ProductService, Product } from '@/lib/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only load products on client-side
    const loadProducts = () => {
      try {
        const allProducts = ProductService.getAllProducts()
        console.log('useProducts: Loading products:', allProducts)
        console.log('useProducts: Products with images:', allProducts.filter(p => p.imageUrl))
        setProducts(allProducts)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('useProducts: Adding product:', product)
    const newProduct = ProductService.createProduct(product)
    console.log('useProducts: Product created:', newProduct)
    console.log('useProducts: Product imageUrl:', newProduct.imageUrl)
    setProducts(prev => {
      const updated = [...prev, newProduct]
      console.log('useProducts: Updated products list:', updated)
      return updated
    })
    return newProduct
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProduct = ProductService.updateProduct(id, updates)
    if (updatedProduct) {
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
    }
    return updatedProduct
  }

  const deleteProduct = (id: string) => {
    const success = ProductService.deleteProduct(id)
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
    return success
  }

  const refreshProducts = () => {
    const allProducts = ProductService.getAllProducts()
    setProducts(allProducts)
  }

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  }
}
