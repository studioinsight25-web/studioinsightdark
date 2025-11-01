'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Save, CheckCircle } from 'lucide-react'
import SessionManager from '@/lib/session'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    const session = SessionManager.getSession()
    if (!session) {
      router.push('/inloggen')
      return
    }
    
    setUser(session)
    setFormData({
      name: session.name || '',
      email: session.email || ''
    })
    setIsLoading(false)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Update session with new data
        const session = SessionManager.getSession()
        if (session) {
          SessionManager.setSession({
            ...session,
            name: formData.name,
            email: formData.email
          })
          // Dispatch event to update header
          window.dispatchEvent(new Event('sessionUpdated'))
        }
        
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Er is een fout opgetreden')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Laden...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-dark-section border-b border-dark-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Terug naar dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Mijn Profiel</h1>
              <p className="text-text-secondary">Beheer je accountgegevens</p>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Profiel Instellingen</h2>
                <p className="text-text-secondary text-sm">Wijzig je persoonlijke informatie</p>
              </div>
            </div>

            {success && (
              <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400 font-medium">Profiel succesvol bijgewerkt!</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Naam
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                  placeholder="Je volledige naam"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                  placeholder="je@email.com"
                  required
                />
                <p className="text-xs text-text-secondary mt-2">
                  Je e-mailadres wordt gebruikt voor inloggen en belangrijke notificaties.
                </p>
              </div>

              <div className="pt-4 border-t border-dark-border">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Wijzigingen opslaan
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-dark-border">
              <h3 className="text-lg font-semibold text-white mb-4">Account Informatie</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Account aangemaakt</p>
                    <p className="text-white">Niet beschikbaar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Account type</p>
                    <p className="text-white">Klant account</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

