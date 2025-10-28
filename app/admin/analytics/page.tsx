'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  MousePointer,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  conversionRate: number
  totalRevenue: number
  topPages: Array<{
    page: string
    views: number
  }>
  topProducts: Array<{
    product: string
    views: number
    conversions: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  recentActivity: Array<{
    action: string
    user: string
    timestamp: string
    value?: number
  }>
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [gaConnected, setGaConnected] = useState(false)

  useEffect(() => {
    loadAnalyticsData()
    checkGoogleAnalyticsConnection()
  }, [timeRange])

  const checkGoogleAnalyticsConnection = () => {
    // Check if Google Analytics is properly configured
    const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-YPF60909JC'
    setGaConnected(!!gaId && gaId !== 'G-XXXXXXXXXX')
  }

  const loadAnalyticsData = async () => {
    try {
      // For now, we'll use mock data since we need to integrate with Google Analytics API
      // In a real implementation, you would fetch this from Google Analytics API
      const mockData: AnalyticsData = {
        pageViews: 12450,
        uniqueVisitors: 3240,
        conversionRate: 3.2,
        totalRevenue: 15750, // in cents
        topPages: [
          { page: '/cursussen', views: 3420 },
          { page: '/ebooks', views: 2890 },
          { page: '/reviews', views: 2150 },
          { page: '/over-ons', views: 1890 },
          { page: '/contact', views: 1200 }
        ],
        topProducts: [
          { product: 'Podcasten voor beginners', views: 890, conversions: 23 },
          { product: 'Videobewerking fundamentals', views: 750, conversions: 18 },
          { product: 'Content strategie masterclass', views: 680, conversions: 15 },
          { product: 'E-mail marketing voor ondernemers', views: 620, conversions: 12 },
          { product: 'SEO voor starters', views: 580, conversions: 10 }
        ],
        trafficSources: [
          { source: 'Direct', visitors: 1200, percentage: 37 },
          { source: 'Google Search', visitors: 980, percentage: 30 },
          { source: 'Social Media', visitors: 650, percentage: 20 },
          { source: 'Email', visitors: 410, percentage: 13 }
        ],
        recentActivity: [
          { action: 'Purchase', user: 'user@example.com', timestamp: '2 minuten geleden', value: 19700 },
          { action: 'Course View', user: 'student@example.com', timestamp: '5 minuten geleden' },
          { action: 'Ebook Download', user: 'reader@example.com', timestamp: '8 minuten geleden' },
          { action: 'Purchase', user: 'buyer@example.com', timestamp: '12 minuten geleden', value: 9700 },
          { action: 'Review View', user: 'reviewer@example.com', timestamp: '15 minuten geleden' }
        ]
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Analytics laden...</p>
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
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-text-secondary mt-2">
              Inzicht in je website prestaties en verkoop
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-dark-section border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="7d">Laatste 7 dagen</option>
              <option value="30d">Laatste 30 dagen</option>
              <option value="90d">Laatste 90 dagen</option>
            </select>
            <button
              onClick={loadAnalyticsData}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Vernieuwen
            </button>
          </div>
        </div>

        {/* Google Analytics Status */}
        <div className={`p-4 rounded-lg border ${
          gaConnected 
            ? 'bg-green-900/20 border-green-500/20 text-green-400' 
            : 'bg-yellow-900/20 border-yellow-500/20 text-yellow-400'
        }`}>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">
              {gaConnected ? 'Google Analytics is verbonden' : 'Google Analytics niet geconfigureerd'}
            </span>
            {!gaConnected && (
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-yellow-300 hover:text-yellow-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {!gaConnected && (
            <p className="text-sm mt-1">
              Voeg je Google Analytics ID toe aan NEXT_PUBLIC_GA_ID in .env.local voor live data
            </p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Paginaweergaven</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.pageViews.toLocaleString()}</p>
                <p className="text-green-400 text-sm">+12% vs vorige periode</p>
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Unieke Bezoekers</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.uniqueVisitors.toLocaleString()}</p>
                <p className="text-green-400 text-sm">+8% vs vorige periode</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Conversiepercentage</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.conversionRate}%</p>
                <p className="text-green-400 text-sm">+0.5% vs vorige periode</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Totale Omzet</p>
                <p className="text-2xl font-bold text-white">€{((analyticsData?.totalRevenue || 0) / 100).toFixed(2)}</p>
                <p className="text-green-400 text-sm">+15% vs vorige periode</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <h3 className="text-lg font-semibold text-white mb-4">Top Pagina's</h3>
            <div className="space-y-3">
              {analyticsData?.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-primary/20 text-primary text-xs rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-white">{page.page}</span>
                  </div>
                  <span className="text-text-secondary">{page.views.toLocaleString()} weergaven</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <h3 className="text-lg font-semibold text-white mb-4">Top Producten</h3>
            <div className="space-y-3">
              {analyticsData?.topProducts.map((product, index) => (
                <div key={product.product} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-primary/20 text-primary text-xs rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-white text-sm">{product.product}</span>
                      <div className="text-xs text-text-secondary">
                        {product.views} weergaven • {product.conversions} conversies
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
          <h3 className="text-lg font-semibold text-white mb-4">Verkeersbronnen</h3>
          <div className="space-y-4">
            {analyticsData?.trafficSources.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MousePointer className="w-4 h-4 text-text-secondary mr-3" />
                  <span className="text-white">{source.source}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-dark-section rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-text-secondary w-16 text-right">
                    {source.percentage}%
                  </span>
                  <span className="text-text-secondary w-20 text-right">
                    {source.visitors.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
          <h3 className="text-lg font-semibold text-white mb-4">Recente Activiteit</h3>
          <div className="space-y-3">
            {analyticsData?.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.action === 'Purchase' ? 'bg-green-400' :
                    activity.action === 'Course View' ? 'bg-blue-400' :
                    activity.action === 'Ebook Download' ? 'bg-purple-400' :
                    'bg-orange-400'
                  }`}></div>
                  <div>
                    <span className="text-white">{activity.action}</span>
                    <div className="text-xs text-text-secondary">
                      {activity.user} • {activity.timestamp}
                    </div>
                  </div>
                </div>
                {activity.value && (
                  <span className="text-green-400 font-medium">
                    €{(activity.value / 100).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}