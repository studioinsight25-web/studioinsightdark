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

