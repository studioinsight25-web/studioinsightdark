'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, CheckCircle } from 'lucide-react'

export default function RegistrerenPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters bevatten')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(result.error || 'Er is een fout opgetreden')
      }
    } catch (error) {
      console.error('Register error:', error)
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Account aangemaakt!
            </h1>
            <p className="text-text-secondary mb-6">
              Je wordt automatisch doorgestuurd naar je dashboard.
            </p>
            <div className="w-full bg-dark-section rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Maak je account
          </h1>
          <p className="text-text-secondary">
            Sluit je aan bij Studio Insight
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Volledige naam
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                  placeholder="Je volledige naam"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                  placeholder="je@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                  placeholder="Minimaal 6 karakters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Bevestig wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                  placeholder="Herhaal je wachtwoord"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Account aanmaken
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-text-secondary">
              Door je te registreren ga je akkoord met onze{' '}
              <Link href="/contact" className="text-primary hover:text-primary/80">
                voorwaarden
              </Link>
            </p>
          </div>

          {/* Links */}
          <div className="mt-6 text-center">
            <Link
              href="/inloggen"
              className="text-primary hover:text-primary/80 transition-colors text-sm"
            >
              Al een account? Log hier in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}


