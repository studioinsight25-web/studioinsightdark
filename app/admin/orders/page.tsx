'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  DollarSign,
  Calendar,
  User,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    type: string
  }
}

interface Order {
  id: string
  userId: string
  totalAmount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentId?: string
  createdAt: string
  paidAt?: string
  user: {
    id: string
    email: string
    name?: string
  }
  items: OrderItem[]
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        console.error('Failed to load orders')
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus as any } : order
        ))
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-900/20 text-green-400'
      case 'PENDING':
        return 'bg-yellow-900/20 text-yellow-400'
      case 'FAILED':
        return 'bg-red-900/20 text-red-400'
      case 'REFUNDED':
        return 'bg-gray-900/20 text-gray-400'
      default:
        return 'bg-gray-900/20 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      case 'REFUNDED':
        return <RefreshCw className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Betaald'
      case 'PENDING':
        return 'In behandeling'
      case 'FAILED':
        return 'Mislukt'
      case 'REFUNDED':
        return 'Terugbetaald'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Bestellingen laden...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const totalRevenue = orders
    .filter(order => order.status === 'PAID')
    .reduce((sum, order) => sum + order.totalAmount, 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Bestellingen</h1>
            <p className="text-text-secondary mt-2">
              Beheer alle bestellingen en betalingen
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <div>
                <p className="text-text-secondary text-sm">Totaal Bestellingen</p>
                <p className="text-xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text-secondary text-sm">Totale Omzet</p>
                <p className="text-xl font-bold text-white">€{(totalRevenue / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text-secondary text-sm">Betaalde Orders</p>
                <p className="text-xl font-bold text-white">{orders.filter(o => o.status === 'PAID').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-text-secondary text-sm">In Behandeling</p>
                <p className="text-xl font-bold text-white">{orders.filter(o => o.status === 'PENDING').length}</p>
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
                  placeholder="Zoek bestellingen..."
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
                <option value="all">Alle Statussen</option>
                <option value="PENDING">In behandeling</option>
                <option value="PAID">Betaald</option>
                <option value="FAILED">Mislukt</option>
                <option value="REFUNDED">Terugbetaald</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-section">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Bestelling
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Klant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Producten
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Bedrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-dark-section/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                          <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            #{order.id.slice(0, 8)}...
                          </div>
                          {order.paymentId && (
                            <div className="text-xs text-text-secondary">
                              Payment: {order.paymentId.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-text-secondary mr-2" />
                        <div>
                          <div className="text-sm text-white">{order.user.name || 'Geen naam'}</div>
                          <div className="text-xs text-text-secondary">{order.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center text-sm">
                            <Package className="w-3 h-3 text-text-secondary mr-2" />
                            <span className="text-white">{item.product.name}</span>
                            <span className="text-text-secondary ml-2">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-sm font-medium text-white">
                          €{(order.totalAmount / 100).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="PENDING">In behandeling</option>
                        <option value="PAID">Betaald</option>
                        <option value="FAILED">Mislukt</option>
                        <option value="REFUNDED">Terugbetaald</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-text-secondary mr-2" />
                        <div>
                          <div className="text-sm text-white">
                            {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                          </div>
                          {order.paidAt && (
                            <div className="text-xs text-text-secondary">
                              Betaald: {new Date(order.paidAt).toLocaleDateString('nl-NL')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-text-secondary hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
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
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Geen bestellingen gevonden</h3>
            <p className="text-text-secondary">
              Probeer je zoektermen aan te passen.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}