// hooks/useDigitalProducts.ts
'use client'

import { useState, useEffect } from 'react'
import DigitalProductService, { DigitalProduct } from '@/lib/digital-products'

export function useDigitalProducts(productId?: string) {
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDigitalProducts = async () => {
      try {
        DigitalProductService.initializeWithDefaults()
        
        if (productId) {
          const products = await DigitalProductService.getDigitalProductsByProductId(productId)
          setDigitalProducts(products)
        } else {
          // Load all digital products (from DB with fallback)
          const allProducts = await DigitalProductService.getAllDigitalProducts()
          setDigitalProducts(allProducts)
        }
      } catch (error) {
        console.error('Error loading digital products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDigitalProducts()
  }, [productId])

  const addDigitalProduct = async (
    product: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DigitalProduct> => {
    const newProduct = await DigitalProductService.addDigitalProduct(product)
    setDigitalProducts(prev => [...prev, newProduct])
    return newProduct
  }

  const updateDigitalProduct = async (
    id: string,
    updates: Partial<DigitalProduct>
  ): Promise<DigitalProduct | null> => {
    const updatedProduct = await DigitalProductService.updateDigitalProduct(id, updates)
    if (updatedProduct) {
      setDigitalProducts(prev => prev.map(dp => dp.id === id ? updatedProduct : dp))
    }
    return updatedProduct
  }

  const deleteDigitalProduct = async (id: string): Promise<boolean> => {
    const success = await DigitalProductService.deleteDigitalProduct(id)
    if (success) {
      setDigitalProducts(prev => prev.filter(dp => dp.id !== id))
    }
    return success
  }

  const generateDownloadLink = async (digitalProductId: string, userId: string) => {
    try {
      const response = await fetch(`/api/download/${digitalProductId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()
      
      if (result.success) {
        return result.downloadUrl
      } else {
        throw new Error(result.error || 'Failed to generate download link')
      }
    } catch (error) {
      console.error('Error generating download link:', error)
      throw error
    }
  }

  const downloadFile = async (digitalProductId: string, userId: string) => {
    try {
      const downloadUrl = await generateDownloadLink(digitalProductId, userId)
      
      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = digitalProducts.find(dp => dp.id === digitalProductId)?.fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return true
    } catch (error) {
      console.error('Error downloading file:', error)
      return false
    }
  }

  return {
    digitalProducts,
    loading,
    addDigitalProduct,
    updateDigitalProduct,
    deleteDigitalProduct,
    generateDownloadLink,
    downloadFile,
  }
}

