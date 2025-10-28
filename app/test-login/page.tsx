'use client'

import { useState } from 'react'
import SessionManager from '@/lib/session'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@studio-insight.nl')
  const [password, setPassword] = useState('Kaasboer19792014@')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        // Set session
        SessionManager.setSession({
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name || '',
          role: data.user.role,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

        setResult(`✅ Login successful! User: ${data.user.email}, Role: ${data.user.role}`)
        
        // Test session
        const session = SessionManager.getSession()
        if (session) {
          setResult(prev => prev + `\n✅ Session stored: ${session.email}`)
        }
        
        // Test admin check
        if (SessionManager.isAdmin()) {
          setResult(prev => prev + `\n✅ Admin check passed`)
        }
        
      } else {
        setResult(`❌ Login failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-dark-card p-6 rounded-lg border border-dark-border">
        <h1 className="text-2xl font-bold text-white mb-6">Test Admin Login</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-section text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-section text-white"
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Test Login'}
          </button>
          
          {result && (
            <div className="mt-4 p-3 bg-dark-section rounded-lg border border-dark-border">
              <pre className="text-sm text-white whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
