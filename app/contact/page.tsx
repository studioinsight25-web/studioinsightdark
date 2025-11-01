'use client'

import { useState } from 'react'
import { Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setError(null)
        // Reset form na 3 seconden
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({ name: '', email: '', subject: '', message: '' })
        }, 3000)
      } else {
        // Show error message
        const errorMessage = result.error || result.message || 'Er is een fout opgetreden'
        setError(errorMessage)
        
        // If it's a validation error, show details
        if (result.details && Array.isArray(result.details)) {
          const detailsMessage = result.details.map((issue: any) => 
            `${issue.path.join('.')}: ${issue.message}`
          ).join(', ')
          setError(`${errorMessage} (${detailsMessage})`)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Neem Contact Op
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Heb je vragen over onze cursussen, e-books of reviews? 
            We helpen je graag verder!
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">Stuur ons een bericht</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Bericht verzonden!</h3>
                  <p className="text-text-secondary">
                    We nemen zo snel mogelijk contact met je op.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                        Naam *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                        placeholder="Je volledige naam"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                        placeholder="je@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                      Onderwerp *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white focus:border-primary focus:outline-none"
                    >
                      <option value="">Selecteer een onderwerp</option>
                      <option value="cursus">Vraag over cursussen</option>
                      <option value="ebook">Vraag over e-books</option>
                      <option value="review">Product review aanvraag</option>
                      <option value="partnership">Partnership mogelijkheden</option>
                      <option value="support">Technische ondersteuning</option>
                      <option value="other">Anders</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                      Bericht *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg bg-dark-section border border-dark-border text-white placeholder-text-secondary focus:border-primary focus:outline-none resize-none"
                      placeholder="Vertel ons hoe we je kunnen helpen..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Verzenden...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Verstuur bericht
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">Contact Informatie</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">E-mail</h3>
                    <p className="text-text-secondary">info@studio-insight.nl</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Adres</h3>
                    <p className="text-text-secondary">
                      Studio Insight<br />
                      De Veken 122b<br />
                      1716KG Opmeer
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Openingstijden</h3>
                    <p className="text-text-secondary">
                      Maandag - Vrijdag: 09:00 - 17:00<br />
                      Weekend: Gesloten
                    </p>
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
