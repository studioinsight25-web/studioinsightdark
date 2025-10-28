'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function TestAnalyticsPage() {
  useEffect(() => {
    // Test Google Analytics after component mounts
    setTimeout(() => {
      console.log('🧪 Testing Google Analytics...')
      
      // Check if gtag is available
      if (typeof window.gtag === 'function') {
        console.log('✅ gtag function is available')
        
        // Send a test event
        window.gtag('event', 'test_event', {
          event_category: 'test',
          event_label: 'Analytics test page',
          value: 1
        })
        console.log('✅ Test event sent to Google Analytics')
      } else {
        console.log('❌ gtag function not available')
      }
      
      // Check dataLayer
      if (window.dataLayer) {
        console.log('✅ dataLayer available, length:', window.dataLayer.length)
        console.log('   Recent events:', window.dataLayer.slice(-3))
      } else {
        console.log('❌ dataLayer not available')
      }
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google Analytics Test Pagina</h1>
        
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Google Analytics Status</h2>
          <div className="space-y-2">
            <p><strong>GA ID:</strong> G-YPF60909JC</p>
            <p><strong>Status:</strong> <span className="text-green-400">Geconfigureerd</span></p>
            <p><strong>Script:</strong> <span className="text-green-400">Geladen</span></p>
          </div>
        </div>
        
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Acties</h2>
          <div className="space-y-4">
            <button
              onClick={() => {
                if (typeof window.gtag === 'function') {
                  window.gtag('event', 'button_click', {
                    event_category: 'test',
                    event_label: 'Test button clicked',
                    value: 1
                  })
                  alert('Test event sent to Google Analytics!')
                } else {
                  alert('Google Analytics not available')
                }
              }}
              className="bg-primary text-black px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Verstuur Test Event
            </button>
            
            <button
              onClick={() => {
                console.log('Current dataLayer:', window.dataLayer)
                alert('Check console for dataLayer contents')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4"
            >
              Toon DataLayer
            </button>
          </div>
        </div>
        
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold mb-4">Instructies</h2>
          <ol className="list-decimal list-inside space-y-2 text-text-secondary">
            <li>Open je browser developer tools (F12)</li>
            <li>Ga naar de Console tab</li>
            <li>Klik op "Verstuur Test Event"</li>
            <li>Controleer of er geen errors zijn</li>
            <li>Ga naar Google Analytics om te zien of events binnenkomen</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
