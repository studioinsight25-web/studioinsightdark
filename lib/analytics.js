// Vercel Analytics helper
export function trackEvent(eventName, properties = {}) {
  if (typeof window !== 'undefined' && window.va) {
    try {
      window.va.track(eventName, properties);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('Vercel Analytics not loaded');
  }
}

export function trackPageView(url) {
  if (typeof window !== 'undefined' && window.va) {
    try {
      window.va.track('page_view', { url });
    } catch (error) {
      console.warn('Page view tracking failed:', error);
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('Vercel Analytics not loaded');
  }
}

export function trackPurchase(productId, productType, amount) {
  trackEvent('purchase', {
    product_id: productId,
    product_type: productType,
    value: amount,
    currency: 'EUR',
  });
}

export function trackCourseStart(courseId) {
  trackEvent('course_start', {
    course_id: courseId,
  });
}

export function trackEbookDownload(ebookId) {
  trackEvent('ebook_download', {
    ebook_id: ebookId,
  });
}
