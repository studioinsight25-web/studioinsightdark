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
      console.warn('SessionServer: No cookie header found')
      return null
    }
    
    // Find the session cookie - try both encoded and unencoded patterns
    let match = cookieHeader.match(/studio-insight-session=([^;]+)/)
    if (!match) {
      console.warn('SessionServer: No studio-insight-session cookie found in:', cookieHeader.substring(0, 100))
      return null
    }
    
    // Decode and parse the session
    let decoded: string
    try {
      decoded = decodeURIComponent(match[1])
    } catch (e) {
      // If decodeURIComponent fails, try using the value directly (might already be decoded)
      decoded = match[1]
    }
    
    const session = JSON.parse(decoded)
    
    // Check expiration
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      console.warn('SessionServer: Session expired', { expiresAt: session.expiresAt, now: new Date() })
      return null
    }
    
    if (!session.userId || !session.email) {
      console.warn('SessionServer: Session missing userId or email', session)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error parsing session from cookies:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
    }
    return null
  }
}

