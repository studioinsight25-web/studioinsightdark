'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import SessionManager from '@/lib/session'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok && result.user) {
        // Set session
        SessionManager.setSession({
          userId: result.user.id,
          email: result.user.email,
          name: result.user.name || '',
          role: result.user.role,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })

        // Redirect to admin dashboard
        router.push('/admin')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-black" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Log in om toegang te krijgen tot het admin dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="admin@studio-insight.nl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-dark-border rounded-lg bg-dark-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-secondary hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-secondary hover:text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Inloggen...
                </div>
              ) : (
                'Inloggen'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-primary transition-colors duration-200"
            >
              ← Terug naar homepage
            </Link>
          </div>
        </form>

        <div className="mt-8 p-4 bg-dark-card rounded-lg border border-dark-border">
          <h3 className="text-sm font-medium text-white mb-2">Demo Credentials:</h3>
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong>Email:</strong> admin@studio-insight.nl</p>
            <p><strong>Password:</strong> Kaasboer19792014@</p>
          </div>
        </div>
      </div>
    </main>
  )
}
