'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { Settings, Shield, Mail, CreditCard, Database, Globe } from 'lucide-react'

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Instellingen</h1>
          <p className="text-text-secondary mt-2">
            Configureer website instellingen en voorkeuren
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-6">Algemene Instellingen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website Naam
                </label>
                <input
                  type="text"
                  defaultValue="Studio Insight"
                  className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website Beschrijving
                </label>
                <textarea
                  rows={3}
                  defaultValue="Cursussen, e-books en reviews voor ondernemers"
                  className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="info@studioinsight.nl"
                  className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-6">Betalingsinstellingen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Mollie API Key
                </label>
                <input
                  type="password"
                  defaultValue="test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM"
                  className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  BTW Percentage
                </label>
                <input
                  type="number"
                  defaultValue="21"
                  className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-6">Email Instellingen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  SMTP Server
                </label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  placeholder="587"
                  className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-6">Beveiliging</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-text-secondary">Extra beveiliging voor admin accounts</p>
                </div>
                <button className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Inschakelen
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Rate Limiting</h3>
                  <p className="text-sm text-text-secondary">Beperk aantal requests per IP</p>
                </div>
                <button className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Configureren
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-6">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => alert('Backup functionaliteit komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Database className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Database Backup</h3>
              <p className="text-sm text-text-secondary">Maak een backup van de database</p>
            </button>
            <button 
              onClick={() => alert('Cache clearing komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Globe className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Clear Cache</h3>
              <p className="text-sm text-text-secondary">Leeg alle caches</p>
            </button>
            <button 
              onClick={() => alert('Logs bekijken komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Settings className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">System Logs</h3>
              <p className="text-sm text-text-secondary">Bekijk systeem logs</p>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={() => alert('Instellingen opslaan functionaliteit komt binnenkort!')}
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
          >
            Instellingen Opslaan
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}






