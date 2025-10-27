'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { ShoppingCart, Users, BarChart3, Settings } from 'lucide-react'

export default function AdminOrders() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Bestellingen</h1>
          <p className="text-text-secondary mt-2">
            Beheer alle bestellingen en betalingen
          </p>
        </div>

        {/* Orders Table */}
        <div className="bg-dark-card rounded-xl border border-dark-border">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recente Bestellingen</h2>
            
            {/* Mock orders data */}
            <div className="space-y-4">
              {[
                { id: 'ORD-001', customer: 'Jan de Vries', amount: '€97', status: 'Betaald', date: '2 min geleden' },
                { id: 'ORD-002', customer: 'Maria Jansen', amount: '€147', status: 'In behandeling', date: '15 min geleden' },
                { id: 'ORD-003', customer: 'Piet Bakker', amount: '€197', status: 'Betaald', date: '1 uur geleden' },
                { id: 'ORD-004', customer: 'Lisa van der Berg', amount: '€127', status: 'Wachtend', date: '2 uur geleden' },
              ].map((order) => (
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
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-6">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => alert('Export functionaliteit komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <ShoppingCart className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Export Orders</h3>
              <p className="text-sm text-text-secondary">Exporteer bestellingen naar CSV</p>
            </button>
            <button 
              onClick={() => alert('Refund functionaliteit komt binnenkort!')}
              className="p-4 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors text-left"
            >
              <ShoppingCart className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-white">Refund Management</h3>
              <p className="text-sm text-text-secondary">Beheer refunds en terugbetalingen</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
