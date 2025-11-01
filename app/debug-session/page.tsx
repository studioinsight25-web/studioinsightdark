'use client'

import { useState, useEffect } from 'react'
import SessionManager from '@/lib/session'

export default function DebugSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [localStorageInfo, setLocalStorageInfo] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkSession = () => {
      // Get session via SessionManager
      const session = SessionManager.getSession()
      
      // Get directly from localStorage
      const raw = typeof window !== 'undefined' 
        ? localStorage.getItem('studio-insight-session') 
        : null
      
      // Check admin status
      const admin = SessionManager.isAdmin()
      
      setSessionInfo(session)
      setLocalStorageInfo(raw || 'NOT FOUND')
      setIsAdmin(admin)
    }

    checkSession()
    
    // Check every second
    const interval = setInterval(checkSession, 1000)
    
    // Also listen for storage changes
    window.addEventListener('storage', checkSession)
    window.addEventListener('sessionUpdated', checkSession)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkSession)
      window.removeEventListener('sessionUpdated', checkSession)
    }
  }, [])

  const clearSession = () => {
    SessionManager.clearSession()
    window.location.reload()
  }

  const setTestSession = () => {
    SessionManager.setSession({
      userId: 'test-admin-id',
      email: 'admin@test.nl',
      name: 'Test Admin',
      role: 'ADMIN',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Session Debug Page</h1>
        
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border space-y-4">
          <h2 className="text-xl font-semibold text-white">Session via SessionManager:</h2>
          <pre className="bg-dark-section p-4 rounded text-white text-sm overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border space-y-4">
          <h2 className="text-xl font-semibold text-white">Raw localStorage:</h2>
          <pre className="bg-dark-section p-4 rounded text-white text-sm overflow-auto break-all">
            {localStorageInfo}
          </pre>
        </div>

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border space-y-4">
          <h2 className="text-xl font-semibold text-white">Admin Status:</h2>
          <div className="bg-dark-section p-4 rounded">
            <p className={`text-lg font-bold ${isAdmin ? 'text-green-400' : 'text-red-400'}`}>
              {isAdmin ? '✅ IS ADMIN' : '❌ NOT ADMIN'}
            </p>
            <p className="text-text-secondary text-sm mt-2">
              Session role: {sessionInfo?.role || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border space-y-4">
          <h2 className="text-xl font-semibold text-white">Actions:</h2>
          <div className="flex gap-4">
            <button
              onClick={setTestSession}
              className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90"
            >
              Set Test Admin Session
            </button>
            <button
              onClick={clearSession}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
            >
              Clear Session
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border space-y-4">
          <h2 className="text-xl font-semibold text-white">All localStorage keys:</h2>
          <pre className="bg-dark-section p-4 rounded text-white text-sm">
            {typeof window !== 'undefined' 
              ? JSON.stringify(Object.keys(localStorage), null, 2)
              : 'N/A'}
          </pre>
        </div>
      </div>
    </main>
  )
}

