// components/Analytics.tsx
'use client'

import Script from 'next/script'

interface AnalyticsProps {
  gaId?: string
}

export default function Analytics({ gaId }: AnalyticsProps) {
  // Use your Google Analytics ID directly
  const measurementId = gaId || 'G-YPF60909JC'

  console.log('🔍 Analytics component loaded with ID:', measurementId)

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Use typeof checks to ensure window/document exist (SSR-safe)
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            // Configure GA cookies safely for current host and modern browsers
            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              cookie_domain: 'auto',
              cookie_flags: 'SameSite=None;Secure'
            });
            
            // Send initial page view
            gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href
            });
            
            console.log('✅ Google Analytics initialized with ID: ${measurementId}');
          }
        `}
      </Script>
    </>
  )
}

