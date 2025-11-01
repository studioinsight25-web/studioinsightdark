// lib/session-server.ts - Server-side session helpers for API routes
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export interface Session {
  userId: string
  email: string
  name?: string
  role: string
  expiresAt?: string
}

/**
 * Get session from cookies (for use in API routes/server-side)
 * This reads the session cookie that was set by SessionManager.setSession()
 */
export function getSessionFromRequest(request: NextRequest): Session | null {
  try {
    // First try using Next.js cookies() API (Next.js 15+)
    try {
      const cookieStore = cookies()
      const sessionCookie = cookieStore.get('studio-insight-session')
      
      if (sessionCookie?.value) {
        const session = JSON.parse(decodeURIComponent(sessionCookie.value))
        // Check expiration
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
          return null
        }
        return session
      }
    } catch (error) {
      // Fallback if cookies() fails (Next.js < 15 or edge runtime issues)
      console.warn('Failed to use cookies() API, trying fallback:', error)
    }
    
    // Fallback: read from request headers
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const match = cookieHeader.match(/studio-insight-session=([^;]+)/)
      if (match) {
        const decoded = decodeURIComponent(match[1])
        const session = JSON.parse(decoded)
        // Check expiration
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
          return null
        }
        return session
      }
    }
    
    return null
  } catch (error) {
    console.error('Error parsing session from cookies:', error)
    return null
  }
}

