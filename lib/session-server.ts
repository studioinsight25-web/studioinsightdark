// lib/session-server.ts - Server-side session helpers for API routes
import { NextRequest } from 'next/server'

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
 * Reads directly from request headers for maximum compatibility
 */
export function getSessionFromRequest(request: NextRequest): Session | null {
  try {
    // Read directly from request headers (works in all Next.js versions)
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return null
    }
    
    // Find the session cookie
    const match = cookieHeader.match(/studio-insight-session=([^;]+)/)
    if (!match) {
      return null
    }
    
    // Decode and parse the session
    const decoded = decodeURIComponent(match[1])
    const session = JSON.parse(decoded)
    
    // Check expiration
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error parsing session from cookies:', error)
    return null
  }
}

