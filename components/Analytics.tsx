// components/Analytics.tsx
'use client'

import Script from 'next/script'

interface AnalyticsProps {
  gaId?: string
}

export default function Analytics({ gaId }: AnalyticsProps) {
  // Use environment variable or prop
  const measurementId = gaId || process.env.NEXT_PUBLIC_GA_ID

  if (!measurementId) {
    console.warn('Google Analytics ID not found. Set NEXT_PUBLIC_GA_ID in .env.local')
    return null
  }

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
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}
