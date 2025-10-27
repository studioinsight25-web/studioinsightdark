'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { Users, UserPlus, Mail, Shield } from 'lucide-react'

export default function AdminUsers() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Gebruikers</h1>
          <p className="text-text-secondary mt-2">
            Beheer alle geregistreerde gebruikers
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-dark-card rounded-xl border border-dark-border">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Geregistreerde Gebruikers</h2>
            
            {/* Mock users data */}
            <div className="space-y-4">
              {[
                { id: 'USR-001', name: 'Jan de Vries', email: 'jan@example.com', role: 'Gebruiker', joined: '2 dagen geleden' },
                { id: 'USR-002', name: 'Maria Jansen', email: 'maria@example.com', role: 'Gebruiker', joined: '1 week geleden' },
                { id: 'USR-003', name: 'Piet Bakker', email: 'piet@example.com', role: 'Gebruiker', joined: '2 weken geleden' },
                { id: 'USR-004', name: 'Lisa van der Berg', email: 'lisa@example.com', role: 'Gebruiker', joined: '1 maand geleden' },
              ].map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-dark-section rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-black font-semibold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-900/20 text-blue-400">
                      {user.role}
                    </span>
                    <p className="text-sm text-text-secondary mt-1">{user.joined}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-6">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => alert('Gebruiker toevoegen functionaliteit komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <UserPlus className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Nieuwe Gebruiker</h3>
              <p className="text-sm text-text-secondary">Voeg handmatig een gebruiker toe</p>
            </button>
            <button 
              onClick={() => alert('Email functionaliteit komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Mail className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Bulk Email</h3>
              <p className="text-sm text-text-secondary">Verstuur email naar alle gebruikers</p>
            </button>
            <button 
              onClick={() => alert('Rollen beheer komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Shield className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Rollen Beheer</h3>
              <p className="text-sm text-text-secondary">Beheer gebruikersrollen en permissies</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
