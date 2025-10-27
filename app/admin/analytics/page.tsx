'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { BarChart3, TrendingUp, Eye, ShoppingCart, Users, DollarSign } from 'lucide-react'

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-text-secondary mt-2">
            Overzicht van website statistieken en prestaties
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Totaal Bezoekers', value: '12,345', change: '+12% deze maand', icon: Users, color: 'text-blue-400' },
            { name: 'Pagina Weergaven', value: '45,678', change: '+8% deze maand', icon: Eye, color: 'text-green-400' },
            { name: 'Conversie Rate', value: '3.2%', change: '+0.5% deze maand', icon: TrendingUp, color: 'text-yellow-400' },
            { name: 'Omzet', value: '€12,345', change: '+23% deze maand', icon: DollarSign, color: 'text-primary' },
          ].map((stat) => (
            <div key={stat.name} className="bg-dark-card rounded-xl p-6 border border-dark-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  <p className="text-green-400 text-sm mt-1">{stat.change}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-lg">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Chart */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-6">Website Verkeer</h2>
            <div className="h-64 bg-dark-section rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-text-secondary">Grafiek komt binnenkort!</p>
                <p className="text-sm text-text-secondary">Google Analytics integratie</p>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-6">Verkopen</h2>
            <div className="h-64 bg-dark-section rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-text-secondary">Grafiek komt binnenkort!</p>
                <p className="text-sm text-text-secondary">E-commerce tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-6">Top Producten</h2>
          <div className="space-y-4">
            {[
              { name: 'Podcasten voor beginners', sales: 45, revenue: '€4,365' },
              { name: 'Bouw een persoonlijke website', sales: 32, revenue: '€4,704' },
              { name: 'Videobewerking fundamentals', sales: 28, revenue: '€5,516' },
              { name: 'Content strategie masterclass', sales: 22, revenue: '€2,794' },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-dark-section rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-text-secondary">{product.sales} verkopen</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-6">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => alert('Export functionaliteit komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <BarChart3 className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Export Data</h3>
              <p className="text-sm text-text-secondary">Exporteer analytics data</p>
            </button>
            <button 
              onClick={() => alert('Google Analytics integratie komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Google Analytics</h3>
              <p className="text-sm text-text-secondary">Configureer GA4 integratie</p>
            </button>
            <button 
              onClick={() => alert('Custom events komen binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Eye className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Custom Events</h3>
              <p className="text-sm text-text-secondary">Configureer custom tracking</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
