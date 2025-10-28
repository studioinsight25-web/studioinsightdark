'use client'

// hooks/useProducts.ts - Custom hook for product management with database
import { useState, useEffect } from 'react'
import { Product } from '@/lib/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load products from database via API
    const loadProducts = async () => {
      try {
        console.log('useProducts: Loading products from database...')
        
        const response = await fetch('/api/products')
        if (response.ok) {
          const allProducts = await response.json()
          console.log('useProducts: Loaded products from database:', allProducts.length)
          console.log('useProducts: Products with images:', allProducts.filter((p: Product) => p.imageUrl))
          setProducts(allProducts)
        } else {
          console.error('Failed to load products from API')
          // Fallback to empty array
          setProducts([])
        }
      } catch (error) {
        console.error('Error loading products:', error)
        // Fallback to empty array
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('useProducts: Adding product:', product)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        const newProduct = await response.json()
        console.log('useProducts: Product created:', newProduct)
        setProducts(prev => [...prev, newProduct])
        return newProduct
      } else {
        throw new Error('Failed to create product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
        return updatedProduct
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id))
        return true
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  const refreshProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const allProducts = await response.json()
        setProducts(allProducts)
      }
    } catch (error) {
      console.error('Error refreshing products:', error)
    }
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