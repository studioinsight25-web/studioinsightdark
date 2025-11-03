'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(result.error || 'Er is een fout opgetreden. Probeer het later opnieuw.')
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
      console.error('Forgot password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-black" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Wachtwoord Vergeten
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten
          </p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  E-mail Verzonden!
                </h3>
                <p className="text-green-300 text-sm leading-relaxed">
                  Als dit e-mailadres bestaat in ons systeem, ontvang je binnen enkele minuten een e-mail met een link om je wachtwoord te resetten.
                </p>
                <p className="text-green-300 text-sm mt-3 leading-relaxed">
                  <strong>Tip:</strong> Controleer ook je spam/junk folder als je de e-mail niet ziet.
                </p>
                <Link
                  href="/inloggen"
                  className="inline-block mt-4 text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
                >
                  ← Terug naar inloggen
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

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
                  className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-xl bg-dark-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                  placeholder="jouw@email.nl"
                />
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
                    Verzenden...
                  </div>
                ) : (
                  'Verstuur Reset Link'
                )}
              </button>
            </div>

            <div className="text-center space-y-2">
              <Link
                href="/inloggen"
                className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Terug naar inloggen
              </Link>
              <p className="text-xs text-text-secondary">
                Weet je je wachtwoord weer?{' '}
                <Link
                  href="/inloggen"
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  Log hier in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

