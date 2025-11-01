'use client'

import { useEffect } from 'react'

export default function SimpleTestPage() {
  useEffect(() => {
    // Test Google Analytics after page loads
    const testGA = () => {
      console.log('🧪 Testing Google Analytics...')
      
      // Check if gtag exists
      if (typeof window.gtag === 'function') {
        console.log('✅ gtag function found')
        
        // Send a test event
        window.gtag('event', 'test_page_view', {
          event_category: 'test',
          event_label: 'Simple test page',
          value: 1
        })
        
        console.log('✅ Test event sent')
      } else {
        console.log('❌ gtag function not found')
      }
      
      // Check dataLayer
      if (window.dataLayer) {
        console.log('✅ dataLayer found, length:', window.dataLayer.length)
      } else {
        console.log('❌ dataLayer not found')
      }
    }
    
    // Test after 2 seconds
    setTimeout(testGA, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Google Analytics Test</h1>
        
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border mb-8">
          <h2 className="text-2xl font-semibold mb-4">Status Check</h2>
          <p className="text-text-secondary mb-4">
            Open je browser developer tools (F12) en kijk naar de Console tab.
          </p>
          <p className="text-green-400 font-medium">
            Je zou moeten zien: "✅ Google Analytics initialized with ID: G-YPF60909JC"
          </p>
        </div>
        
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border">
          <h2 className="text-2xl font-semibold mb-4">Test Acties</h2>
          <button
            onClick={() => {
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'button_click', {
                  event_category: 'test',
                  event_label: 'Test button clicked',
                  value: 1
                })
                alert('✅ Test event sent to Google Analytics!')
              } else {
                alert('❌ Google Analytics not available')
              }
            }}
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Verstuur Test Event
          </button>
        </div>
        
        <div className="mt-8 text-text-secondary">
          <p>GA ID: G-YPF60909JC</p>
          <p>Controleer Google Analytics Realtime rapporten</p>
        </div>
      </div>
    </div>
  )
}






