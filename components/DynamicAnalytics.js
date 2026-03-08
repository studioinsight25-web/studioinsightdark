'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export default function DynamicAnalytics() {
  useEffect(() => {
    // Only load analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Wait for Vercel Analytics to load
      const checkAnalytics = () => {
        if (typeof window !== 'undefined' && window.va) {
          trackPageView(window.location.pathname);
        } else {
          // Retry after a short delay
          setTimeout(checkAnalytics, 100);
        }
      };

      checkAnalytics();
    }
  }, []);

  return null;
}
