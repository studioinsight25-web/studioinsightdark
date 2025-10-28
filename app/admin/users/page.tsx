'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Shield,
  Mail,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to load users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const handleDeleteUser = async (id: string) => {
    if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setUsers(users.filter(user => user.id !== id))
        } else {
          console.error('Failed to delete user')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleToggleRole = async (id: string) => {
    try {
      const user = users.find(u => u.id === id)
      if (!user) return

      const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === id ? { ...u, role: newRole } : u
        ))
      } else {
        console.error('Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Gebruikers laden...</p>
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
            <h1 className="text-3xl font-bold text-white">Gebruikers</h1>
            <p className="text-text-secondary mt-2">
              Beheer alle gebruikersaccounts
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-text-secondary text-sm">Totaal Gebruikers</p>
                <p className="text-xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text-secondary text-sm">Admin Gebruikers</p>
                <p className="text-xl font-bold text-white">{users.filter(u => u.role === 'ADMIN').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-text-secondary text-sm">Normale Gebruikers</p>
                <p className="text-xl font-bold text-white">{users.filter(u => u.role === 'USER').length}</p>
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
                  placeholder="Zoek gebruikers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">Alle Rollen</option>
                <option value="USER">Gebruikers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-section">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Gebruiker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Rol
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-section/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.name || 'Geen naam'}
                          </div>
                          <div className="text-sm text-text-secondary">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-text-secondary mr-2" />
                        <span className="text-sm text-white">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(user.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-blue-900/20 text-blue-400'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Gebruiker'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-text-secondary mr-2" />
                        <span className="text-sm text-text-secondary">
                          {new Date(user.createdAt).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
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
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Geen gebruikers gevonden</h3>
            <p className="text-text-secondary">
              Probeer je zoektermen aan te passen.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}