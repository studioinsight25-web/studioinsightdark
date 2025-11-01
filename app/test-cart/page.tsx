'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import SessionManager from '@/lib/session'

export default function TestCartPage() {
  const { showToast } = useToast()
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart/check')
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      console.error('Error running diagnostics:', error)
      showToast('Fout bij diagnosticeren', 'error')
    } finally {
      setLoading(false)
    }
  }

  const testAddToCart = async () => {
    const session = SessionManager.getSession()
    if (!session?.userId) {
      showToast('Je moet ingelogd zijn', 'error')
      return
    }

    setLoading(true)
    try {
      // Get first product to test
      const productsResponse = await fetch('/api/products')
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products')
      }
      const productsData = await productsResponse.ok ? await productsResponse.json() : { products: [] }
      const firstProduct = productsData.products?.[0]
      
      if (!firstProduct) {
        showToast('Geen producten gevonden om te testen', 'error')
        return
      }

      console.log('Testing add to cart with product:', firstProduct.id)

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: firstProduct.id,
          quantity: 1
        })
      })

      const result = await response.json()
      setTestResult({
        status: response.status,
        ok: response.ok,
        result
      })

      if (response.ok) {
        showToast('Test geslaagd! Product toegevoegd aan winkelwagen.', 'success')
      } else {
        showToast(`Test mislukt: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      showToast('Test error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8">Cart Diagnostic Tool</h1>

        <div className="space-y-6">
          {/* Diagnostics Button */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-4">Database & Config Check</h2>
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Laden...' : 'Run Diagnostics'}
            </button>

            {diagnostics && (
              <div className="mt-6 p-4 bg-dark-section rounded-lg">
                <pre className="text-white text-sm overflow-auto">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Test Add to Cart */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-4">Test Add to Cart</h2>
            <button
              onClick={testAddToCart}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Testen...' : 'Test Add to Cart'}
            </button>

            {testResult && (
              <div className="mt-6 p-4 bg-dark-section rounded-lg">
                <pre className="text-white text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">💡 Instructies</h3>
            <ul className="text-blue-300 text-sm space-y-2">
              <li>1. Klik op "Run Diagnostics" om te zien wat er mis is</li>
              <li>2. Controleer of <code className="bg-blue-900/50 px-1 rounded">cartItemsTable.exists</code> true is</li>
              <li>3. Als false: voer de SQL uit uit <code className="bg-blue-900/50 px-1 rounded">scripts/add-cart-items-table.sql</code></li>
              <li>4. Klik op "Test Add to Cart" om het toevoegen te testen</li>
              <li>5. Check de console (F12) voor gedetailleerde errors</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

