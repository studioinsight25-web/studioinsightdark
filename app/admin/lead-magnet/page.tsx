'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useToast } from '@/hooks/useToast'
import { BookOpen, Mail, Search, Calendar, Clock, CheckCircle, RefreshCw } from 'lucide-react'

interface LeadMagnetSubscriber {
  id: string
  email: string
  name: string | null
  status: 'pending' | 'confirmed'
  confirmedAt: string | null
  createdAt: string
  source?: string | null
}

interface BrevoSubscriber {
  email: string
  name?: string | null
  status?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export default function AdminLeadMagnetPage() {
  const LEAD_MAGNET_LIST_ID = 3
  const { showToast } = useToast()

  const [viewMode, setViewMode] = useState<'local' | 'brevo'>('local')
  const [searchTerm, setSearchTerm] = useState('')

  const [subscribers, setSubscribers] = useState<LeadMagnetSubscriber[]>([])
  const [loading, setLoading] = useState(false)

  const [brevoSubscribers, setBrevoSubscribers] = useState<BrevoSubscriber[]>([])
  const [brevoLoading, setBrevoLoading] = useState(false)
  const [brevoError, setBrevoError] = useState<string | null>(null)

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }
    return date.toLocaleString('nl-NL')
  }

  const loadLocalSubscribers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/newsletter?source=lead-magnet')
      if (!response.ok) {
        throw new Error('Kon leads niet laden')
      }
      const data = await response.json()
      setSubscribers(data)
    } catch (error) {
      console.error('Error loading lead magnet subscribers:', error)
      showToast('Kon gratis gids leads niet laden', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadBrevoSubscribers = async (showSuccessToast = false) => {
    try {
      setBrevoLoading(true)
      setBrevoError(null)
      const response = await fetch(`/api/admin/brevo/list/${LEAD_MAGNET_LIST_ID}`)
      const data = await response.json().catch(() => ({ contacts: [] }))

      if (!response.ok) {
        const message = data?.error || 'Kon Brevo lijst niet laden'
        throw new Error(message)
      }

      const contacts: BrevoSubscriber[] = Array.isArray(data.contacts)
        ? data.contacts.map((contact: any) => ({
            email: contact.email,
            name: contact.name || null,
            status: contact.status || contact.attributes?.STATUS || null,
            createdAt: contact.createdAt || contact.attributes?.createdAt || null,
            updatedAt: contact.updatedAt || contact.attributes?.updatedAt || null
          }))
        : []

      setBrevoSubscribers(contacts)
      if (showSuccessToast) {
        showToast(`Brevo lijst (${contacts.length}) geladen`, 'success')
      }
    } catch (error) {
      console.error('Error loading Brevo list:', error)
      const message = error instanceof Error ? error.message : 'Kon Brevo lijst niet laden'
      setBrevoError(message)
      showToast(message, 'error')
    } finally {
      setBrevoLoading(false)
    }
  }

  useEffect(() => {
    if (viewMode === 'local') {
      loadLocalSubscribers()
    }
  }, [viewMode])

  useEffect(() => {
    if (viewMode === 'brevo' && brevoSubscribers.length === 0 && !brevoLoading) {
      loadBrevoSubscribers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  const filteredLocalSubscribers = subscribers.filter((subscriber) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      subscriber.email.toLowerCase().includes(term) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(term))
    )
  })

  const filteredBrevoSubscribers = brevoSubscribers.filter((subscriber) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      subscriber.email.toLowerCase().includes(term) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(term))
    )
  })

  const isLoading = viewMode === 'local' ? loading : brevoLoading

  const localStats = {
    total: subscribers.length,
    confirmed: subscribers.filter((s) => s.status === 'confirmed').length,
    pending: subscribers.filter((s) => s.status === 'pending').length
  }

  const brevoStats = {
    total: brevoSubscribers.length,
    confirmed: brevoSubscribers.filter((s) => (s.status || '').toLowerCase() === 'confirmed').length,
    pending: brevoSubscribers.filter((s) => (s.status || '').toLowerCase() === 'pending').length
  }

  const summaryCards = viewMode === 'local'
    ? [
        {
          icon: BookOpen,
          label: 'Totaal leads (lokaal)',
          value: localStats.total,
          tone: 'primary'
        },
        {
          icon: CheckCircle,
          label: 'Bevestigd',
          value: localStats.confirmed,
          tone: 'green'
        },
        {
          icon: Clock,
          label: 'In afwachting',
          value: localStats.pending,
          tone: 'yellow'
        }
      ]
    : [
        {
          icon: BookOpen,
          label: `Brevo lijst #${LEAD_MAGNET_LIST_ID}`,
          value: brevoStats.total,
          tone: 'primary'
        },
        {
          icon: CheckCircle,
          label: 'Status: confirmed',
          value: brevoStats.confirmed,
          tone: 'green'
        },
        {
          icon: Clock,
          label: 'Status: pending',
          value: brevoStats.pending,
          tone: 'yellow'
        }
      ]

  const getToneClasses = (tone: 'primary' | 'green' | 'yellow') => {
    switch (tone) {
      case 'green':
        return 'text-green-400'
      case 'yellow':
        return 'text-yellow-400'
      default:
        return 'text-primary'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gratis gids leads</h1>
            <p className="text-text-secondary mt-2">
              Overzicht van iedereen die de gids heeft aangevraagd en de Brevo lijst met bevestigde contacten.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('local')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                viewMode === 'local'
                  ? 'bg-primary text-black border-primary'
                  : 'bg-dark-section border-dark-border text-text-secondary hover:border-primary/50'
              }`}
            >
              Lokale leads
            </button>
            <button
              type="button"
              onClick={() => setViewMode('brevo')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                viewMode === 'brevo'
                  ? 'bg-primary text-black border-primary'
                  : 'bg-dark-section border-dark-border text-text-secondary hover:border-primary/50'
              }`}
            >
              Brevo lijst #{LEAD_MAGNET_LIST_ID}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-dark-card rounded-lg p-4 border border-dark-border">
              <div className="flex items-center gap-3">
                <card.icon className={`w-8 h-8 ${getToneClasses(card.tone)}`} />
                <div>
                  <p className="text-text-secondary text-sm">{card.label}</p>
                  <p className="text-xl font-bold text-white">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Zoek op e-mail of naam"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
              />
            </div>
            {viewMode === 'brevo' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => loadBrevoSubscribers(true)}
                  disabled={brevoLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dark-border text-text-secondary hover:border-primary/50 hover:text-white disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${brevoLoading ? 'animate-spin' : ''}`} />
                  Vernieuwen
                </button>
              </div>
            )}
          </div>
          {brevoError && viewMode === 'brevo' && (
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-200 text-sm">
              {brevoError}
            </div>
          )}
        </div>

        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">
                  {viewMode === 'local' ? 'Leads laden...' : 'Brevo lijst laden...'}
                </p>
              </div>
            </div>
          ) : viewMode === 'local' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-section">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Naam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Ingeschreven op
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredLocalSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-dark-section/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-secondary" />
                          <span className="text-sm text-white">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white">{subscriber.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                            subscriber.status === 'confirmed'
                              ? 'bg-green-900/20 text-green-400'
                              : 'bg-yellow-900/20 text-yellow-400'
                          }`}
                        >
                          {subscriber.status === 'confirmed' ? 'Bevestigd' : 'In afwachting'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(subscriber.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLocalSubscribers.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Geen gratis gids leads gevonden</h3>
                  <p className="text-text-secondary">Probeer een andere zoekterm of controleer later opnieuw.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-section">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Naam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status (Brevo)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Aangemaakt / laatst bijgewerkt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredBrevoSubscribers.map((subscriber) => (
                    <tr key={subscriber.email} className="hover:bg-dark-section/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-secondary" />
                          <span className="text-sm text-white">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white">{subscriber.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary capitalize">{subscriber.status || 'onbekend'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        <div>{formatDate(subscriber.createdAt)}</div>
                        <div className="text-xs text-text-secondary/70">Laatste update: {formatDate(subscriber.updatedAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBrevoSubscribers.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Geen contacten in Brevo lijst</h3>
                  <p className="text-text-secondary">Probeer de lijst te vernieuwen of controleer later nog eens.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}


