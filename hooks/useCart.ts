'use client'

// hooks/useCart.ts - Custom hook for cart management using API routes
import { useState, useEffect } from 'react'
import { CartItem } from '@/lib/cart-database'

export function useCart(userId: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          setCartItems(data.cartItems || [])
          setError(null)
        } else if (response.status === 401) {
          // User not authenticated - set empty cart instead of error
          setCartItems([])
          setError(null)
        } else {
          // Only set error for actual failures, not empty carts
          const errorData = await response.json().catch(() => ({}))
          console.error('Failed to load cart:', errorData)
          setCartItems([])
          setError(null) // Don't show error, just show empty cart
        }
      } catch (err) {
        console.error('Error loading cart items:', err)
        // Don't set error - just show empty cart state
        setCartItems([])
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadCartItems()
    } else {
      // No userId - set empty cart
      setCartItems([])
      setLoading(false)
      setError(null)
    }
  }, [userId])

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      })

      if (response.ok) {
        // Reload cart items
        const cartResponse = await fetch('/api/cart')
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          setCartItems(data.cartItems || [])
        }
        setError(null)
        return true
      } else {
        setError('Failed to add item to cart')
        return false
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError('Failed to add item to cart')
      return false
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      // For now, remove and re-add with new quantity
      // In a real app, you'd have a PUT endpoint for this
      if (quantity <= 0) {
        return await removeFromCart(productId)
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      })

      if (response.ok) {
        // Reload cart items
        const cartResponse = await fetch('/api/cart')
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          setCartItems(data.cartItems || [])
        }
        setError(null)
        return true
      } else {
        setError('Failed to update quantity')
        return false
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Failed to update quantity')
      return false
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.productId !== productId))
        setError(null)
        return true
      } else {
        setError('Failed to remove item from cart')
        return false
      }
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError('Failed to remove item from cart')
      return false
    }
  }

  const clearCart = async () => {
    try {
      // Remove all items one by one
      for (const item of cartItems) {
        await removeFromCart(item.productId)
      }
      setCartItems([])
      setError(null)
      return true
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('Failed to clear cart')
      return false
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.quantity)
      }
      return total
    }, 0)
  }

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemCount,
  }
}