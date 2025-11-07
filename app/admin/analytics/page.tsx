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
  pageViewsChange?: number
  uniqueVisitors: number
  uniqueVisitorsChange?: number
  conversionRate: number
  conversionRateChange?: number
  totalRevenue: number
  revenueChange?: number
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
  const [refreshing, setRefreshing] = useState(false)
  const hasTrafficData = analyticsData?.trafficSources?.some((source) => source.visitors > 0)

  useEffect(() => {
    loadAnalyticsData()
    checkGoogleAnalyticsConnection()
  }, [timeRange])

  const checkGoogleAnalyticsConnection = () => {
    // Check if Google Analytics is properly configured
    // Note: process.env is not available in client components, so we check at build time
    // For client-side, we can check if GA script is loaded
    if (typeof window !== 'undefined') {
      const gaLoaded = typeof (window as any).gtag !== 'undefined'
      setGaConnected(gaLoaded)
    } else {
      setGaConnected(true) // Assume connected on server
    }
  }

  const loadAnalyticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Fetch real analytics data from API
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      // Set fallback data if API fails
      setAnalyticsData({
        pageViews: 0,
        uniqueVisitors: 0,
        conversionRate: 0,
        totalRevenue: 0,
        topPages: [],
        topProducts: [],
        trafficSources: [],
        recentActivity: []
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  const handleRefresh = () => {
    loadAnalyticsData(true)
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
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Laden...' : 'Vernieuwen'}
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
                <p className="text-2xl font-bold text-white">{analyticsData?.pageViews.toLocaleString() || 0}</p>
                {analyticsData?.pageViewsChange !== undefined && (
                  <p className={`text-sm ${analyticsData.pageViewsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData.pageViewsChange >= 0 ? '+' : ''}{analyticsData.pageViewsChange.toFixed(1)}% vs vorige periode
                  </p>
                )}
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Unieke Bezoekers</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.uniqueVisitors.toLocaleString() || 0}</p>
                {analyticsData?.uniqueVisitorsChange !== undefined && (
                  <p className={`text-sm ${analyticsData.uniqueVisitorsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData.uniqueVisitorsChange >= 0 ? '+' : ''}{analyticsData.uniqueVisitorsChange.toFixed(1)}% vs vorige periode
                  </p>
                )}
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Conversiepercentage</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.conversionRate.toFixed(2) || 0}%</p>
                {analyticsData?.conversionRateChange !== undefined && (
                  <p className={`text-sm ${analyticsData.conversionRateChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData.conversionRateChange >= 0 ? '+' : ''}{analyticsData.conversionRateChange.toFixed(1)}% vs vorige periode
                  </p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Totale Omzet</p>
                <p className="text-2xl font-bold text-white">€{((analyticsData?.totalRevenue || 0) / 100).toFixed(2)}</p>
                {analyticsData?.revenueChange !== undefined && (
                  <p className={`text-sm ${analyticsData.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData.revenueChange >= 0 ? '+' : ''}{analyticsData.revenueChange.toFixed(1)}% vs vorige periode
                  </p>
                )}
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
          {hasTrafficData ? (
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
                        style={{ width: `${Math.min(100, source.percentage)}%` }}
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
          ) : (
            <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200 text-sm">
              <p className="font-medium mb-2">Nog geen verkeersdata voor deze periode.</p>
              <p>
                Koppel Google Analytics (NEXT_PUBLIC_GA_ID) of verzamel leads via de gratis gids om verkeersbronnen automatisch te vullen.
              </p>
            </div>
          )}
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