'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            {/* Error Illustration */}
            <div className="mb-8">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <div className="w-24 h-1 bg-red-400 mx-auto mb-6"></div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Er is iets misgegaan
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              Er is een onverwachte fout opgetreden. Probeer de pagina te verversen.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                <h3 className="font-semibold text-red-400 mb-2">Error Details:</h3>
                <pre className="text-sm text-red-300 overflow-auto">
                  {error?.message || 'Unknown error'}
                </pre>
                {error.digest && (
                  <p className="text-xs text-red-400 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Opnieuw Proberen
              </button>
              <Link
                href="/"
                className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Naar Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-12 pt-8 border-t border-dark-border">
              <p className="text-text-secondary mb-4">
                Blijft het probleem bestaan? Neem contact met ons op.
              </p>
              <Link
                href="/contact"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Contact Opnemen
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}



