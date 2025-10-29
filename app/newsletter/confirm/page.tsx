'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Mail } from 'lucide-react'

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmSubscription = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Ontbrekende bevestigingstoken')
        return
      }

      try {
        const response = await fetch(`/api/newsletter/confirm?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error || 'Er is een fout opgetreden')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Er is een fout opgetreden bij het bevestigen')
      }
    }

    confirmSubscription()
  }, [searchParams])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-dark-card rounded-xl p-8 border border-dark-border text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-white mb-4">Bevestigen...</h1>
              <p className="text-text-secondary">Je inschrijving wordt bevestigd.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Inschrijving bevestigd!</h1>
              <p className="text-text-secondary mb-6">{message}</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm">
                  Je ontvangt nu updates over nieuwe cursussen, e-books en reviews van Studio Insight.
                </p>
              </div>
              <a
                href="/"
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Terug naar de website
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Bevestiging mislukt</h1>
              <p className="text-text-secondary mb-6">{message}</p>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">
                  De bevestigingslink is mogelijk verlopen of ongeldig. Probeer opnieuw in te schrijven.
                </p>
              </div>
              <a
                href="/"
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
              >
                Terug naar de website
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  )
}


