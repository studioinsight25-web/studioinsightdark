'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Product, formatPrice, ProductService } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Package,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react'
import Link from 'next/link'

export default function AdminProducts() {
  const { products, loading, updateProduct, deleteProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Producten laden...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || product.type === filterType
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && product.isActive) ||
      (filterStatus === 'inactive' && !product.isActive)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const toggleProductStatus = async (id: string) => {
    try {
      const product = products.find(p => p.id === id)
      if (!product) return

      // Update product status using hook
      updateProduct(id, { isActive: !product.isActive })
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Weet je zeker dat je dit product wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {
        deleteProduct(id)
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.length === 0) return

    const confirmMessage = {
      activate: 'Weet je zeker dat je de geselecteerde producten wilt activeren?',
      deactivate: 'Weet je zeker dat je de geselecteerde producten wilt deactiveren?',
      delete: 'Weet je zeker dat je de geselecteerde producten wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.'
    }

    if (!confirm(confirmMessage[action])) return

    try {
      // Update products using hook
      if (action === 'delete') {
        selectedProducts.forEach(productId => {
          deleteProduct(productId)
        })
      } else {
        selectedProducts.forEach(productId => {
          updateProduct(productId, { 
            isActive: action === 'activate' 
          })
        })
      }

      setSelectedProducts([])
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Producten</h1>
            <p className="text-text-secondary mt-2">
              Beheer je cursussen, e-books en reviews
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nieuw Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-text-secondary text-sm">Totaal Producten</p>
                <p className="text-xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text-secondary text-sm">Actieve Producten</p>
                <p className="text-xl font-bold text-white">{products.filter(p => p.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-text-secondary text-sm">Featured</p>
                <p className="text-xl font-bold text-white">{products.filter(p => p.featured).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-text-secondary text-sm">Deze Maand</p>
                <p className="text-xl font-bold text-white">+2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Bulk Actions */}
        <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Zoek producten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">Alle Types</option>
                <option value="course">Cursussen</option>
                <option value="ebook">E-books</option>
                <option value="review">Reviews</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">Alle Statussen</option>
                <option value="active">Actief</option>
                <option value="inactive">Inactief</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-border">
              <div className="flex items-center gap-4">
                <span className="text-text-secondary text-sm">
                  {selectedProducts.length} producten geselecteerd
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleBulkAction('activate')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Activeren
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkAction('deactivate')}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Deactiveren
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-section">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Prijs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Verkocht
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Laatst Bijgewerkt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-dark-section/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 text-primary bg-dark-section border-dark-border rounded focus:ring-primary focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {product.name}
                            {product.featured && (
                              <span className="ml-2 bg-yellow-900/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                                Featured
                              </span>
                            )}
                            {product.comingSoon && (
                              <span className="ml-2 bg-orange-900/20 text-orange-400 text-xs px-2 py-1 rounded-full">
                                Binnenkort
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary">{product.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.type === 'course' 
                          ? 'bg-blue-900/20 text-blue-400' 
                          : product.type === 'ebook'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-orange-900/20 text-orange-400'
                      }`}>
                        {product.type === 'course' ? 'Cursus' : product.type === 'ebook' ? 'E-book' : 'Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleProductStatus(product.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-red-900/20 text-red-400'
                        }`}
                      >
                        {product.isActive ? 'Actief' : 'Inactief'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(product.updatedAt).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/preview`}
                          className="text-text-secondary hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-text-secondary hover:text-primary transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
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
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Geen producten gevonden</h3>
            <p className="text-text-secondary mb-6">
              Probeer je zoektermen aan te passen of voeg een nieuw product toe.
            </p>
            <Link
              href="/admin/products/new"
              className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nieuw Product Toevoegen
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
