// app/api/admin/analytics/route.ts - Analytics API for Admin Dashboard
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || '7d'
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date
    
    switch (timeRange) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousEndDate = startDate
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousEndDate = startDate
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousEndDate = startDate
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Helper to normalise source labels
    const normalizeSource = (source: string | null | undefined) => {
      const value = (source || '').toLowerCase()
      switch (value) {
        case 'lead-magnet':
        case 'lead magnet':
          return 'lead-magnet'
        case 'newsletter':
        case 'email':
          return 'newsletter'
        case 'admin':
        case 'manual':
          return 'admin'
        case 'checkout':
          return 'checkout'
        default:
          return 'unknown'
      }
    }

    const formatSourceLabel = (source: string) => {
      switch (source) {
        case 'lead-magnet':
          return 'Lead magnet'
        case 'newsletter':
          return 'Nieuwsbrief'
        case 'admin':
          return 'Handmatig toegevoegd'
        case 'checkout':
          return 'Checkout'
        default:
          return 'Onbekend'
      }
    }

    // Get paid orders in time range
    const paidOrdersResult = await DatabaseService.query(
      `SELECT 
        o.id,
        o.total_amount,
        o.created_at,
        o.paid_at,
        o.order_number,
        oi.product_id,
        oi.product_name,
        oi.quantity,
        oi.price,
        u.email as user_email,
        u.name as user_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.status = 'PAID' 
        AND o.created_at >= $1
      ORDER BY o.created_at DESC`,
      [startDate.toISOString()]
    )

    const newUsersResult = await DatabaseService.query(
      `SELECT email, created_at 
       FROM users
       WHERE created_at >= $1`,
      [startDate.toISOString()]
    )

    const newsletterSubscriptionsResult = await DatabaseService.query(
      `SELECT email, COALESCE("source", 'unknown') AS source, "createdAt"
       FROM "newsletterSubscriptions"
       WHERE "createdAt" >= $1`,
      [startDate.toISOString()]
    )

    // Get all orders (for conversion rate calculation)
    const allOrdersResult = await DatabaseService.query(
      `SELECT id, status, created_at 
       FROM orders 
       WHERE created_at >= $1`,
      [startDate.toISOString()]
    )

    // Get previous period data for comparison
    const previousPaidOrdersResult = await DatabaseService.query(
      `SELECT 
        o.id,
        o.total_amount,
        o.created_at,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.status = 'PAID' 
        AND o.created_at >= $1
        AND o.created_at < $2`,
      [previousStartDate.toISOString(), previousEndDate.toISOString()]
    )

    const previousAllOrdersResult = await DatabaseService.query(
      `SELECT id, status, created_at 
       FROM orders 
       WHERE created_at >= $1
       AND created_at < $2`,
      [previousStartDate.toISOString(), previousEndDate.toISOString()]
    )

    const previousNewUsersResult = await DatabaseService.query(
      `SELECT email, created_at 
       FROM users
       WHERE created_at >= $1
         AND created_at < $2`,
      [previousStartDate.toISOString(), previousEndDate.toISOString()]
    )

    const previousNewsletterSubscriptionsResult = await DatabaseService.query(
      `SELECT email, COALESCE("source", 'unknown') AS source, "createdAt"
       FROM "newsletterSubscriptions"
       WHERE "createdAt" >= $1
         AND "createdAt" < $2`,
      [previousStartDate.toISOString(), previousEndDate.toISOString()]
    )

    const previousRevenue = previousPaidOrdersResult.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_amount || '0')
    }, 0)

    const previousPaidOrdersCount = previousPaidOrdersResult.filter((o: any, index: number, self: any[]) => 
      index === self.findIndex((x: any) => x.id === o.id)
    ).length

    const previousTotalOrders = previousAllOrdersResult.length
    const previousConversionRate = previousTotalOrders > 0 ? (previousPaidOrdersCount / previousTotalOrders) * 100 : 0

    const previousUniqueVisitorEmails = new Set(
      [
        ...previousPaidOrdersResult.map((o: any) => o.user_email).filter(Boolean),
        ...previousNewUsersResult.map((u: any) => u.email).filter(Boolean),
        ...previousNewsletterSubscriptionsResult.map((n: any) => n.email).filter(Boolean)
      ]
    )

    const previousUniqueVisitors = previousUniqueVisitorEmails.size
    const previousPageViews = Math.max(previousTotalOrders * 15, previousUniqueVisitors * 3)

    // Get all products with sales data
    const productsResult = await DatabaseService.query(
      `SELECT 
        p.id,
        p.name,
        p.type,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.quantity) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'PAID'
      WHERE p."isActive" = true
      GROUP BY p.id, p.name, p.type
      ORDER BY total_sold DESC NULLS LAST
      LIMIT 10`
    )

    // Calculate metrics
    const totalRevenue = paidOrdersResult.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_amount || '0')
    }, 0)

    const totalOrders = allOrdersResult.length
    const paidOrdersCount = paidOrdersResult.filter((o: any, index: number, self: any[]) => 
      index === self.findIndex((x: any) => x.id === o.id)
    ).length
    
    const conversionRate = totalOrders > 0 ? (paidOrdersCount / totalOrders) * 100 : 0

    // Get unique users who made purchases
    const visitorEmails = new Set(
      [
        ...paidOrdersResult.map((o: any) => o.user_email).filter(Boolean),
        ...newUsersResult.map((u: any) => u.email).filter(Boolean),
        ...newsletterSubscriptionsResult.map((n: any) => n.email).filter(Boolean)
      ]
    )
    
    // Get top products (by sales)
    const topProducts = productsResult
      .filter((p: any) => parseInt(p.total_sold || '0', 10) > 0)
      .map((p: any) => ({
        product: p.name,
        views: parseInt(p.total_sold || '0', 10), // Using sales as "views" proxy
        conversions: parseInt(p.order_count || '0', 10)
      }))
      .slice(0, 5)

    // Get recent activity (recent paid orders)
    const recentOrders = paidOrdersResult
      .filter((o: any, index: number, self: any[]) => 
        index === self.findIndex((x: any) => x.id === o.id)
      )
      .slice(0, 5)
      .map((order: any) => {
        const paidDate = order.paid_at || order.created_at
        const date = new Date(paidDate)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        let timestamp = ''
        if (diffMins < 1) timestamp = 'zojuist'
        else if (diffMins < 60) timestamp = `${diffMins} minuten geleden`
        else if (diffHours < 24) timestamp = `${diffHours} uur geleden`
        else timestamp = `${diffDays} dagen geleden`

        return {
          action: 'Purchase',
          user: order.user_email || 'Onbekend',
          timestamp: timestamp,
          value: parseFloat(order.total_amount || '0')
        }
      })

    // Top pages - we'll use static data since we don't track page views in database
    // In the future, you could add a page_views table
    const pageViewCounts = new Map<string, number>()
    const incrementPageView = (page: string, amount = 1) => {
      const current = pageViewCounts.get(page) || 0
      pageViewCounts.set(page, current + amount)
    }

    // Estimate page views based on newsletter sources and orders
    if (newsletterSubscriptionsResult.length > 0) {
      const leadMagnetCount = newsletterSubscriptionsResult.filter((n: any) => normalizeSource(n.source) === 'lead-magnet').length
      const newsletterCount = newsletterSubscriptionsResult.filter((n: any) => normalizeSource(n.source) === 'newsletter').length
      if (leadMagnetCount > 0) incrementPageView('/lead-magnet', leadMagnetCount)
      if (newsletterCount > 0) incrementPageView('/', newsletterCount)
    }

    if (totalOrders > 0) {
      incrementPageView('/checkout', totalOrders)
      incrementPageView('/cart', Math.max(Math.round(totalOrders * 1.5), totalOrders))
    }

    const topPages = Array.from(pageViewCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    if (topPages.length === 0) {
      topPages.push(
        { page: '/lead-magnet', views: 0 },
        { page: '/cursussen', views: 0 },
        { page: '/ebooks', views: 0 }
      )
    }

    // Traffic sources based on recorded newsletter sources and orders
    const trafficSourceCounts = new Map<string, number>()
    newsletterSubscriptionsResult.forEach((subscriber: any) => {
      const key = normalizeSource(subscriber.source)
      trafficSourceCounts.set(key, (trafficSourceCounts.get(key) || 0) + 1)
    })

    if (totalOrders > 0) {
      trafficSourceCounts.set('checkout', (trafficSourceCounts.get('checkout') || 0) + totalOrders)
    }

    const totalTrafficVisitors = Array.from(trafficSourceCounts.values()).reduce((sum, value) => sum + value, 0)

    let trafficSources
    if (totalTrafficVisitors > 0) {
      trafficSources = Array.from(trafficSourceCounts.entries())
        .map(([source, visitors]) => ({
          source: formatSourceLabel(source),
          visitors,
          percentage: Math.max(1, Math.round((visitors / totalTrafficVisitors) * 100))
        }))
        .sort((a, b) => b.visitors - a.visitors)
    } else {
      trafficSources = [
        { source: 'Direct', visitors: 0, percentage: 0 },
        { source: 'Google Search', visitors: 0, percentage: 0 },
        { source: 'Social Media', visitors: 0, percentage: 0 }
      ]
    }

    // Calculate page views (estimated based on orders and products)
    const newsletterPageViews = newsletterSubscriptionsResult.length * 2
    const estimatedPageViews = Math.max(totalOrders * 15, newsletterPageViews, visitorEmails.size * 3)
    
    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const pageViewsChange = calculatePercentageChange(estimatedPageViews, previousPageViews)
    const uniqueVisitorsCount = visitorEmails.size || Math.floor(estimatedPageViews / 3.8)
    const uniqueVisitorsChange = calculatePercentageChange(uniqueVisitorsCount, previousUniqueVisitors)
    const conversionRateChange = calculatePercentageChange(conversionRate, previousConversionRate)
    const revenueChange = calculatePercentageChange(totalRevenue, previousRevenue)
    
    const analyticsData = {
      pageViews: estimatedPageViews,
      pageViewsChange: parseFloat(pageViewsChange.toFixed(1)),
      uniqueVisitors: uniqueVisitorsCount,
      uniqueVisitorsChange: parseFloat(uniqueVisitorsChange.toFixed(1)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      conversionRateChange: parseFloat(conversionRateChange.toFixed(1)),
      totalRevenue: Math.round(totalRevenue), // in cents
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      topPages,
      topProducts: topProducts.length > 0 ? topProducts : [
        { product: 'Geen verkopen', views: 0, conversions: 0 }
      ],
      trafficSources,
      recentActivity: recentOrders.length > 0 ? recentOrders : [
        { action: 'Geen recente activiteit', user: '-', timestamp: '-' }
      ]
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('[Admin Analytics] Error fetching analytics data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

