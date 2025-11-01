'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Save, CheckCircle, MapPin, Building2, Phone, Globe, Briefcase } from 'lucide-react'
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
    email: '',
    address: '',
    city: '',
    postcode: '',
    country: 'Nederland',
    phone: '',
    company_name: '',
    industry: '',
    website: ''
  })

  useEffect(() => {
    const loadUserProfile = async () => {
      const session = SessionManager.getSession()
      if (!session) {
        router.push('/inloggen')
        return
      }
      
      setUser(session)
      
      // Load full user profile from API
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setFormData({
            name: data.user?.name || session.name || '',
            email: data.user?.email || session.email || '',
            address: data.user?.address || '',
            city: data.user?.city || '',
            postcode: data.user?.postcode || '',
            country: data.user?.country || 'Nederland',
            phone: data.user?.phone || '',
            company_name: data.user?.company_name || '',
            industry: data.user?.industry || '',
            website: data.user?.website || ''
          })
        } else {
          // Fallback to session data only
          setFormData({
            name: session.name || '',
            email: session.email || '',
            address: '',
            city: '',
            postcode: '',
            country: 'Nederland',
            phone: '',
            company_name: '',
            industry: '',
            website: ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        // Fallback to session data
        setFormData({
          name: session.name || '',
          email: session.email || '',
          address: '',
          city: '',
          postcode: '',
          country: 'Nederland',
          phone: '',
          company_name: '',
          industry: '',
          website: ''
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserProfile()
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
              {/* Persoonlijke Informatie */}
              <div className="border-b border-dark-border pb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Persoonlijke Informatie
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Volledige Naam *
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
                      E-mailadres *
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

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefoonnummer
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                      placeholder="+31 6 12345678"
                    />
                  </div>
                </div>
              </div>

              {/* Adres Informatie */}
              <div className="border-b border-dark-border pb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adres Informatie
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                      Adres
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                      placeholder="Straatnaam en huisnummer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postcode" className="block text-sm font-medium text-white mb-2">
                        Postcode
                      </label>
                      <input
                        type="text"
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                        placeholder="1234AB"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                        Woonplaats
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                        placeholder="Amsterdam"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-white mb-2">
                      Land
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white focus:border-primary focus:outline-none"
                    >
                      <option value="Nederland">Nederland</option>
                      <option value="België">België</option>
                      <option value="Duitsland">Duitsland</option>
                      <option value="Anders">Anders</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bedrijfs Informatie */}
              <div className="border-b border-dark-border pb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Bedrijfs Informatie
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-white mb-2">
                      Naam Bedrijf
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                      placeholder="Studio Insight B.V."
                    />
                  </div>

                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Branche / Industrie
                    </label>
                    <input
                      type="text"
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                      placeholder="Marketing, IT, Design, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                      placeholder="https://www.voorbeeld.nl"
                    />
                  </div>
                </div>
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

