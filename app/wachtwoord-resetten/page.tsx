'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Geen reset token gevonden in de link')
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const result = await response.json()

        if (response.ok && result.valid) {
          setEmail(result.email)
          setIsVerifying(false)
        } else {
          setError(result.error || 'Ongeldige of verlopen reset link')
          setIsVerifying(false)
        }
      } catch (err) {
        setError('Er is een fout opgetreden bij het verifiëren van de reset link')
        setIsVerifying(false)
        console.error('Verify token error:', err)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens lang zijn')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/inloggen')
        }, 3000)
      } else {
        setError(result.error || 'Er is een fout opgetreden bij het wijzigen van het wachtwoord')
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
      console.error('Reset password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4 text-primary" />
          <p className="text-white text-lg">Reset link verifiëren...</p>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-3">
              Wachtwoord Gewijzigd!
            </h2>
            <p className="text-green-300 text-sm mb-6 leading-relaxed">
              Je wachtwoord is succesvol gewijzigd. Je wordt doorgestuurd naar de inlogpagina...
            </p>
            <Link
              href="/inloggen"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
            >
              Direct inloggen →
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-black" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Nieuw Wachtwoord Instellen
          </h2>
          {email && (
            <p className="mt-2 text-sm text-text-secondary">
              Voor: {email}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {error && error.includes('verlopen') || error.includes('ongeldig') ? (
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border text-center">
            <p className="text-text-secondary mb-4">
              Deze reset link is niet meer geldig. Vraag een nieuwe aan.
            </p>
            <Link
              href="/wachtwoord-vergeten"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
            >
              Nieuwe reset link aanvragen →
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                Nieuw Wachtwoord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-dark-border rounded-xl bg-dark-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                  placeholder="Minimaal 8 tekens"
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
              <p className="mt-1 text-xs text-text-secondary">
                Minimaal 8 tekens lang
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Bevestig Nieuw Wachtwoord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-dark-border rounded-xl bg-dark-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                  placeholder="Herhaal wachtwoord"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-text-secondary hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-secondary hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Wachtwoord Wijzigen...
                  </div>
                ) : (
                  'Wachtwoord Wijzigen'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/inloggen"
                className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Terug naar inloggen
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

