// lib/session.ts - Simple session management
export interface Session {
  userId: string
  email: string
  name?: string
  role: string
  expiresAt?: string
}

class SessionManager {
  private static SESSION_KEY = 'studio-insight-session'

  static setSession(session: Session): void {
    if (typeof window !== 'undefined') {
      try {
        // Add expiration if not provided
        const sessionWithExpiry = {
          ...session,
          expiresAt: session.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        
        // Store in localStorage for client-side access
        const sessionJson = JSON.stringify(sessionWithExpiry)
        localStorage.setItem(this.SESSION_KEY, sessionJson)
        
        // Verify it was saved
        const saved = localStorage.getItem(this.SESSION_KEY)
        if (!saved || saved !== sessionJson) {
          console.error('[SessionManager] Failed to save session to localStorage')
          return
        }
        
        // Session saved successfully
        
        // Also set as cookie for server-side access (middleware)
        // Use Secure only in production (HTTPS), otherwise cookie won't work on localhost
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
        const secureFlag = isSecure ? '; Secure' : ''
        document.cookie = `${this.SESSION_KEY}=${encodeURIComponent(sessionJson)}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax${secureFlag}`
        
        // Trigger storage event for other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: this.SESSION_KEY,
          newValue: sessionJson,
          storageArea: localStorage
        }))
        
        // Also dispatch custom event
        window.dispatchEvent(new Event('sessionUpdated'))
      } catch (error) {
        console.error('[SessionManager] Error setting session:', error)
      }
    }
  }

  static getSession(): Session | null {
    if (typeof window === 'undefined') return null
    
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null
      
      const session = JSON.parse(sessionData)
      
      // Check if session is expired
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        this.clearSession()
        return null
      }
      
      return session
    } catch (error) {
      console.error('Error parsing session:', error)
      return null
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
      document.cookie = `${this.SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  static getCurrentUserId(): string | null {
    const session = this.getSession()
    return session?.userId || null
  }

  static isAdmin(): boolean {
    const session = this.getSession()
    return session?.role === 'ADMIN'
  }

  static isLoggedIn(): boolean {
    return this.isAuthenticated()
  }
}

export default SessionManager
