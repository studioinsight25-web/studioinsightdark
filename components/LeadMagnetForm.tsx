'use client'

import { useState } from 'react'
import { Loader2, Mail, User } from 'lucide-react'

const DOWNLOAD_URL = process.env.NEXT_PUBLIC_LEAD_MAGNET_URL || '/uploads/lead-magnet.pdf'

export default function LeadMagnetForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setErrorDetails(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, consent: true, source: 'lead-magnet' })
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok || response.status === 207) {
        setPendingConfirmation(true)

        if (data.emailSent === false) {
          const fallbackMessage = data.message || 'Inschrijving geregistreerd, maar bevestigingsmail kon niet worden verzonden. Controleer je spam of probeer het later opnieuw.'
          setError(fallbackMessage)

          if (data.emailError) {
            setErrorDetails(`Foutmelding e-mail: ${data.emailError}`)
          } else if (data.debug?.emailError) {
            setErrorDetails(`Debug: ${data.debug.emailError}`)
          }
        }

        setName('')
        setEmail('')
        return
      }

      setError(data.error || 'Kon je inschrijving niet verwerken')
      if (data.details) {
        setErrorDetails(data.details)
      }
    } catch (submissionError: unknown) {
      if (submissionError instanceof Error) {
        setError(submissionError.message)
      } else {
        setError('Er ging iets mis. Probeer het later opnieuw.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (pendingConfirmation) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-xl shadow-primary/5">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-white">Bijna binnen! 🎉</h3>
            <p className="text-text-secondary">
              We hebben je aanvraag ontvangen. Check je inbox voor de bevestigingsmail en klik op de link om de gids te ontvangen.
            </p>
          </div>

          <div className="bg-dark-section border border-dark-border rounded-xl p-6 space-y-4">
            <div>
              <p className="text-sm text-text-secondary uppercase tracking-wide">Wat gebeurt er nu?</p>
            </div>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">1</span>
                <div>
                  <p className="font-medium text-white">Bevestig je inschrijving</p>
                  <p className="text-text-secondary text-sm">Open de mail met onderwerp “Bevestig je download” en klik op de knop.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">2</span>
                <div>
                  <p className="font-medium text-white">Ontvang de gids direct</p>
                  <p className="text-text-secondary text-sm">Na bevestiging sturen we je meteen de downloadlink toe.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">3</span>
                <div>
                  <p className="font-medium text-white">Bonus na 2 dagen</p>
                  <p className="text-text-secondary text-sm">Je ontvangt een opvolgmail met de vraag of je al een actie hebt toegepast, plus extra tips.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
            <p className="text-sm text-primary">
              Tip: Voeg <strong>hello@studio-insight.nl</strong> toe aan je contacten, zodat de mails niet in je spam terechtkomen.
            </p>
          </div>

          {DOWNLOAD_URL && (
            <div className="border border-dark-border bg-dark-section rounded-xl p-6">
              <p className="text-text-secondary text-sm mb-4">
                Geen e-mail ontvangen? Zodra je bevestigd hebt, kun je de gids ook hier downloaden:
              </p>
              <a
                href={DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary text-black px-5 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Download de gids
              </a>
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-500/40 bg-red-500/10 rounded-xl">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              {errorDetails && (
                <p className="text-red-300/80 text-xs mt-2 break-all">{errorDetails}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-xl shadow-primary/5 space-y-6">
      <div className="space-y-3">
        <h3 className="text-3xl font-semibold text-white">Claim de gratis gids 🪄</h3>
        <p className="text-text-secondary">
          Vul je gegevens in en ontvang 15 direct toepasbare zichtbaarheid-acties in je inbox.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-text-secondary mb-2 block">Voornaam</span>
          <div className="relative">
            <User className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Voornaam"
              className="w-full pl-10 pr-4 py-3 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm text-text-secondary mb-2 block">E-mailadres *</span>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="je@email.com"
              required
              className="w-full pl-10 pr-4 py-3 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Verwerken...' : 'Ontvang gratis gids'}
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/40 bg-red-500/10 rounded-xl">
          <p className="text-red-400 text-sm font-medium">{error}</p>
          {errorDetails && (
            <p className="text-red-300/80 text-xs mt-2 break-all">{errorDetails}</p>
          )}
        </div>
      )}

      <p className="text-xs text-text-secondary leading-relaxed">
        Door je in te schrijven ga je akkoord met onze privacyvoorwaarden en ontvang je updates van Studio Insight. Afmelden kan op ieder moment.
      </p>
    </form>
  )
}


