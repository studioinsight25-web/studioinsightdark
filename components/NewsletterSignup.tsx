'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Clock } from 'lucide-react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, consent: true })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Er ging iets mis')
      }
      setPending(true)
      setEmail('')
      setName('')
    } catch (err: any) {
      setError(err.message || 'Kon je inschrijving niet verwerken')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border h-fit">
      <div className="mb-4">
        <h4 className="text-xl font-semibold text-white mb-2">Schrijf je in voor de nieuwsbrief</h4>
        <p className="text-text-secondary text-sm">Updates over nieuwe cursussen, e-books en reviews.</p>
      </div>
      
      {pending ? (
        <div className="flex items-center gap-3 text-blue-400 p-4 bg-blue-900/10 rounded-lg border border-blue-500/20">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">Bevestigingsmail verzonden!</p>
            <p className="text-xs text-text-secondary">Check je inbox en klik op de bevestigingslink.</p>
          </div>
        </div>
      ) : success ? (
        <div className="flex items-center gap-3 text-green-400 p-4 bg-green-900/10 rounded-lg border border-green-500/20">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">Bedankt! Je bent ingeschreven.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Je naam (optioneel)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          />
          <div className="relative">
            <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="je@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Versturen...' : 'Inschrijven'}
          </button>
        </form>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <p className="text-text-secondary text-xs mt-4 leading-relaxed">
        Door je in te schrijven ga je akkoord met onze privacyvoorwaarden.
      </p>
    </div>
  )
}


