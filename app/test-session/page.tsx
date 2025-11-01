'use client'

import { useState, useEffect } from 'react'
import SessionManager from '@/lib/session'

export default function TestSessionPage() {
  const [session, setSession] = useState<any>(null)
  const [rawSession, setRawSession] = useState<string>('')

  useEffect(() => {
    const loadSession = () => {
      const s = SessionManager.getSession()
      setSession(s)
      const raw = localStorage.getItem('studio-insight-session')
      setRawSession(raw || 'no session found')
    }

    loadSession()
  }, [])

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-2xl mx-auto bg-dark-card border border-dark-border rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Session Test</h1>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-dark-section rounded-lg">
            <h2 className="text-white font-semibold mb-2">Session from Manager:</h2>
            <pre className="text-white text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-dark-section rounded-lg">
            <h2 className="text-white font-semibold mb-2">Raw localStorage:</h2>
            <pre className="text-white text-sm whitespace-pre-wrap break-all">
              {rawSession}
            </pre>
          </div>

          <div className="p-4 bg-dark-section rounded-lg">
            <h2 className="text-white font-semibold mb-2">isAdmin():</h2>
            <p className="text-white text-sm">{String(SessionManager.isAdmin())}</p>
          </div>

          <div className="p-4 bg-dark-section rounded-lg">
            <h2 className="text-white font-semibold mb-2">isAuthenticated():</h2>
            <p className="text-white text-sm">{String(SessionManager.isAuthenticated())}</p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Reload
        </button>
      </div>
    </main>
  )
}

