// lib/admin-auth.ts - Admin Authentication Utilities
import { getCurrentUser } from './auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/inloggen?redirect=/admin')
  }
  
  // In een echte app zou je hier de admin role checken
  // Voor nu accepteren we alle ingelogde gebruikers als admin
  if (user.email !== 'admin@studioinsight.nl' && user.email !== 'demo@studioinsight.nl') {
    // In productie: redirect naar unauthorized page
    console.warn('Non-admin user attempted to access admin panel:', user.email)
  }
  
  return user
}

export async function requireAdminAPI() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  if (user.email !== 'admin@studioinsight.nl' && user.email !== 'demo@studioinsight.nl') {
    throw new Error('Admin access required')
  }
  
  return user
}

// Admin layout wrapper - removed JSX to fix build error
// Use requireAdmin() directly in page components instead
