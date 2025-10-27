'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Temporarily disable authentication for development
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }
  const stats = [
    {
      name: 'Totaal Producten',
      value: '12',
      change: '+2 deze maand',
      changeType: 'positive',
      icon: Package,
    },
    {
      name: 'Actieve Bestellingen',
      value: '47',
      change: '+12% van vorige maand',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      name: 'Geregistreerde Gebruikers',
      value: '1,234',
      change: '+8% van vorige maand',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Totale Omzet',
      value: '€12,345',
      change: '+23% van vorige maand',
      changeType: 'positive',
      icon: DollarSign,
    },
  ]

  const recentOrders = [
    { id: 'ORD-001', customer: 'Jan de Vries', amount: '€97', status: 'Betaald', date: '2 min geleden' },
    { id: 'ORD-002', customer: 'Maria Jansen', amount: '€147', status: 'In behandeling', date: '15 min geleden' },
    { id: 'ORD-003', customer: 'Piet Bakker', amount: '€197', status: 'Betaald', date: '1 uur geleden' },
    { id: 'ORD-004', customer: 'Lisa van der Berg', amount: '€127', status: 'Wachtend', date: '2 uur geleden' },
  ]

  const topProducts = [
    { name: 'Podcasten voor beginners', sales: 45, revenue: '€4,365' },
    { name: 'Bouw een persoonlijke website', sales: 32, revenue: '€4,704' },
    { name: 'Videobewerking fundamentals', sales: 28, revenue: '€5,516' },
    { name: 'Content strategie masterclass', sales: 22, revenue: '€2,794' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-text-secondary mt-2">
            Overzicht van je Studio Insight admin panel
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-dark-card rounded-xl p-6 border border-dark-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  <p className="text-green-400 text-sm mt-1">{stat.change}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recente Bestellingen</h2>
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                Alle bekijken
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-dark-section rounded-lg">
                  <div>
                    <p className="font-medium text-white">{order.id}</p>
                    <p className="text-sm text-text-secondary">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{order.amount}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Betaald' 
                          ? 'bg-green-900/20 text-green-400' 
                          : order.status === 'In behandeling'
                          ? 'bg-yellow-900/20 text-yellow-400'
                          : 'bg-gray-900/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Top Producten</h2>
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                Alle bekijken
              </button>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
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
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-6">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/products/new'}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Package className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Nieuw Product</h3>
              <p className="text-sm text-text-secondary">Voeg een nieuwe cursus of e-book toe</p>
            </button>
            <button 
              onClick={() => {
                console.log('Korting code functionaliteit komt binnenkort!')
                alert('Korting code functionaliteit komt binnenkort!')
              }}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Korting Code</h3>
              <p className="text-sm text-text-secondary">Maak een nieuwe korting code aan</p>
            </button>
            <button 
              onClick={() => window.open('/', '_blank')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <Eye className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Website Preview</h3>
              <p className="text-sm text-text-secondary">Bekijk hoe de website eruit ziet</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
