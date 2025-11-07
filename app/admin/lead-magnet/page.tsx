'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useToast } from '@/hooks/useToast'
import { BookOpen, Mail, Search, Calendar, Clock, CheckCircle } from 'lucide-react'

interface LeadMagnetSubscriber {
  id: string
  email: string
  name: string | null
  status: 'pending' | 'confirmed'
  confirmedAt: string | null
  createdAt: string
  source?: string | null
}

export default function AdminLeadMagnetPage() {
  const { showToast } = useToast()
  const [subscribers, setSubscribers] = useState<LeadMagnetSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchSubscribers = async () => {
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

    fetchSubscribers()
  }, [showToast])

  const filteredSubscribers = subscribers.filter((subscriber) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      subscriber.email.toLowerCase().includes(term) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(term))
    )
  })

  const stats = {
    total: subscribers.length,
    confirmed: subscribers.filter((s) => s.status === 'confirmed').length,
    pending: subscribers.filter((s) => s.status === 'pending').length,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gratis gids leads</h1>
            <p className="text-text-secondary mt-2">
              Overzicht van iedereen die zich heeft ingeschreven voor de 15 zichtbaarheid-acties.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="text-text-secondary text-sm">Totaal leads</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text-secondary text-sm">Bevestigd</p>
                <p className="text-xl font-bold text-white">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-text-secondary text-sm">In afwachting</p>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Zoek op e-mail of naam"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Leads laden...</p>
              </div>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Ingeschreven op
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredSubscribers.map((subscriber) => (
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
                          {new Date(subscriber.createdAt).toLocaleString('nl-NL')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSubscribers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Geen gratis gids leads gevonden</h3>
                  <p className="text-text-secondary">Probeer een andere zoekterm of controleer later opnieuw.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}


