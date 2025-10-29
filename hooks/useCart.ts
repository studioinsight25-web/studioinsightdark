'use client'

// hooks/useCart.ts - Custom hook for cart management
import { useState, useEffect } from 'react'
import { CartService, CartItem } from '@/lib/cart-database'

export function useCart(userId: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true)
        const items = await CartService.getCartItems(userId)
        setCartItems(items)
        setError(null)
      } catch (err) {
        console.error('Error loading cart items:', err)
        setError('Failed to load cart items')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadCartItems()
    }
  }, [userId])

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const newItem = await CartService.addToCart(userId, productId, quantity)
      if (newItem) {
        // Update local state
        const existingItemIndex = cartItems.findIndex(item => item.productId === productId)
        if (existingItemIndex >= 0) {
          setCartItems(prev => prev.map((item, index) => 
            index === existingItemIndex ? newItem : item
          ))
        } else {
          setCartItems(prev => [...prev, newItem])
        }
        setError(null)
        return true
      }
      return false
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError('Failed to add item to cart')
      return false
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedItem = await CartService.updateCartItemQuantity(userId, productId, quantity)
      if (updatedItem) {
        setCartItems(prev => prev.map(item => 
          item.productId === productId ? updatedItem : item
        ))
        setError(null)
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Failed to update quantity')
      return false
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      const success = await CartService.removeFromCart(userId, productId)
      if (success) {
        setCartItems(prev => prev.filter(item => item.productId !== productId))
        setError(null)
        return true
      }
      return false
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError('Failed to remove item from cart')
      return false
    }
  }

  const clearCart = async () => {
    try {
      const success = await CartService.clearCart(userId)
      if (success) {
        setCartItems([])
        setError(null)
        return true
      }
      return false
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('Failed to clear cart')
      return false
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
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

