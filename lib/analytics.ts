// lib/analytics.ts
'use client'

// Google Analytics 4 E-commerce Events
export const trackPurchase = (orderData: {
  id: string
  total: number
  items: Array<{
    id: string
    name: string
    type: string
    price: number
  }>
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderData.id,
      value: orderData.total / 100, // Convert cents to euros
      currency: 'EUR',
      items: orderData.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.type,
        quantity: 1,
        price: item.price / 100 // Convert cents to euros
      }))
    })
  }
}

export const trackAddToCart = (product: {
  id: string
  name: string
  type: string
  price: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'EUR',
      value: product.price / 100,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.type,
        quantity: 1,
        price: product.price / 100
      }]
    })
  }
}

export const trackViewItem = (product: {
  id: string
  name: string
  type: string
  price: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'EUR',
      value: product.price / 100,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.type,
        price: product.price / 100
      }]
    })
  }
}

export const trackBeginCheckout = (items: Array<{
  id: string
  name: string
  type: string
  price: number
}>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const totalValue = items.reduce((sum, item) => sum + item.price, 0)
    
    window.gtag('event', 'begin_checkout', {
      currency: 'EUR',
      value: totalValue / 100,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.type,
        quantity: 1,
        price: item.price / 100
      }))
    })
  }
}

export const trackAffiliateClick = (affiliateCode: string, productId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_click', {
      affiliate_code: affiliateCode,
      product_id: productId,
      event_category: 'affiliate'
    })
  }
}

export const trackAffiliateConversion = (linkCode: string, productId: string, orderValue: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_conversion', {
      event_category: 'Affiliate',
      event_label: `Conversion: ${linkCode}`,
      value: orderValue / 100, // Convert cents to euros
      currency: 'EUR',
      custom_parameter_1: productId,
      custom_parameter_2: linkCode,
    })
  }
}

export const trackPageView = (pageName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href
    })
  }
}

// Custom events for Studio Insight
export const trackCourseEnrollment = (courseId: string, courseName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'course_enrollment', {
      course_id: courseId,
      course_name: courseName,
      event_category: 'education'
    })
  }
}

export const trackEbookDownload = (ebookId: string, ebookName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ebook_download', {
      ebook_id: ebookId,
      ebook_name: ebookName,
      event_category: 'download'
    })
  }
}

export const trackReviewView = (reviewId: string, reviewName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'review_view', {
      review_id: reviewId,
      review_name: reviewName,
      event_category: 'review'
    })
  }
}

// TypeScript declarations for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
