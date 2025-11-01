'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useToast } from '@/hooks/useToast'
import { 
  Mail, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  Clock,
  UserPlus,
  Download,
  Calendar
} from 'lucide-react'

interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  consent: boolean
  status: 'pending' | 'confirmed'
  confirmedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminNewsletter() {
  const { showToast } = useToast()
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])

  // Add form state
  const [addEmail, setAddEmail] = useState('')
  const [addName, setAddName] = useState('')
  const [addStatus, setAddStatus] = useState<'pending' | 'confirmed'>('confirmed')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    try {
      const statusParam = filterStatus === 'all' ? '' : `?status=${filterStatus}`
      const response = await fetch(`/api/admin/newsletter${statusParam}`)
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data)
      } else {
        console.error('Failed to load newsletter subscribers')
      }
    } catch (error) {
      console.error('Error loading newsletter subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscribers()
  }, [filterStatus])

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addEmail,
          name: addName || null,
          status: addStatus,
          skipConfirmation: true
        })
      })

      if (response.ok) {
        const newSubscriber = await response.json()
        setSubscribers([newSubscriber, ...subscribers])
        setShowAddModal(false)
        setAddEmail('')
        setAddName('')
        setAddStatus('confirmed')
      } else {
        const error = await response.json()
        showToast(error.error || 'Fout bij toevoegen subscriber', 'error')
      }
    } catch (error) {
      console.error('Error adding subscriber:', error)
      showToast('Fout bij toevoegen subscriber', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm('Weet je zeker dat je deze subscriber wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/admin/newsletter/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setSubscribers(subscribers.filter(sub => sub.id !== id))
        } else {
          console.error('Failed to delete subscriber')
        }
      } catch (error) {
        console.error('Error deleting subscriber:', error)
      }
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const subscriber = subscribers.find(s => s.id === id)
      if (!subscriber) return

      const newStatus = subscriber.status === 'confirmed' ? 'pending' : 'confirmed'
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const updated = await response.json()
        setSubscribers(subscribers.map(s => 
          s.id === id ? { ...s, status: updated.status, confirmedAt: updated.confirmedAt } : s
        ))
      } else {
        console.error('Failed to update subscriber status')
      }
    } catch (error) {
      console.error('Error updating subscriber status:', error)
    }
  }

  const handleSelectSubscriber = (id: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    )
  }

  const stats = {
    total: subscribers.length,
    confirmed: subscribers.filter(s => s.status === 'confirmed').length,
    pending: subscribers.filter(s => s.status === 'pending').length
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Nieuwsbrief subscribers laden...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Nieuwsbrief Subscribers</h1>
            <p className="text-text-secondary mt-2">
              Beheer alle nieuwsbrief inschrijvingen
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Toevoegen
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              <div>
                <p className="text-text-secondary text-sm">Totaal Subscribers</p>
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
                <p className="text-text-secondary text-sm">In Afwachting</p>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Zoek subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">Alle Status</option>
                <option value="confirmed">Bevestigd</option>
                <option value="pending">In Afwachting</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-section">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                      onChange={() => {
                        if (selectedSubscribers.length === filteredSubscribers.length) {
                          setSelectedSubscribers([])
                        } else {
                          setSelectedSubscribers(filteredSubscribers.map(s => s.id))
                        }
                      }}
                      className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Naam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Aangemaakt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-dark-section/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={() => handleSelectSubscriber(subscriber.id)}
                        className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-text-secondary mr-2" />
                        <span className="text-sm text-white">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">{subscriber.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(subscriber.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriber.status === 'confirmed' 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-yellow-900/20 text-yellow-400'
                        }`}
                      >
                        {subscriber.status === 'confirmed' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Bevestigd
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            In Afwachting
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-text-secondary mr-2" />
                        <span className="text-sm text-text-secondary">
                          {new Date(subscriber.createdAt).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                          className="text-text-secondary hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Geen subscribers gevonden</h3>
            <p className="text-text-secondary">
              {searchTerm || filterStatus !== 'all' 
                ? 'Probeer je zoektermen aan te passen.' 
                : 'Voeg je eerste nieuwsbrief subscriber toe.'}
            </p>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-card rounded-lg border border-dark-border p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-white mb-4">Nieuwe Subscriber Toevoegen</h2>
              <form onSubmit={handleAddSubscriber} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Naam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as 'pending' | 'confirmed')}
                    className="w-full px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="confirmed">Bevestigd</option>
                    <option value="pending">In Afwachting</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setAddEmail('')
                      setAddName('')
                      setAddStatus('confirmed')
                    }}
                    className="flex-1 px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white hover:bg-dark-section/80 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 px-4 py-2 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {adding ? 'Toevoegen...' : 'Toevoegen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

