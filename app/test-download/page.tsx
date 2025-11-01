'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Download, Lock } from 'lucide-react'
import SessionManager from '@/lib/session'

interface TestResult {
  test: string
  passed: boolean
  message: string
  details?: any
}

export default function TestDownloadPage() {
  const [session, setSession] = useState<any>(null)
  const [productId, setProductId] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([])

  useEffect(() => {
    const sessionData = SessionManager.getSession()
    setSession(sessionData)
    
    // Load purchased products
    if (sessionData?.userId) {
      fetch('/api/user/purchases')
        .then(res => res.json())
        .then(data => {
          setPurchasedProducts(data.products || [])
          // Auto-fill first purchased product ID
          if (data.products && data.products.length > 0) {
            setProductId(data.products[0].id)
          }
        })
        .catch(console.error)
    }
  }, [])

  const runTests = async () => {
    if (!productId || !session?.userId) {
      alert('Voer een product ID in en zorg dat je ingelogd bent')
      return
    }

    setIsRunning(true)
    const results: TestResult[] = []

    try {
      // Test 1: Check if user has purchased this product
      const purchasesRes = await fetch('/api/user/purchases')
      const purchasesData = await purchasesRes.json()
      const hasPurchased = (purchasesData.products || []).some((p: any) => p.id === productId)
      
      results.push({
        test: 'Test 1: Product aankoop status',
        passed: true, // This test always passes - it's just informational
        message: hasPurchased 
          ? '✅ Product is gekocht - download zou moeten werken' 
          : '✅ Product is NIET gekocht - download zou moeten falen (correct)',
        details: { productId, hasPurchased, totalPurchased: purchasesData.products?.length || 0 }
      })

      // Test 2: Check digital products API access
      try {
        const digitalRes = await fetch(`/api/digital-products/${productId}/user`)
        if (digitalRes.status === 403) {
          results.push({
            test: 'Test 2: API toegang geblokkeerd?',
            passed: !hasPurchased, // Should be blocked if not purchased
            message: hasPurchased 
              ? '❌ API blokkeert toegang, maar product IS gekocht - FOUT!' 
              : '✅ API blokkeert toegang correct (product niet gekocht)',
            details: { status: digitalRes.status }
          })
        } else if (digitalRes.ok) {
          const digitalProducts = await digitalRes.json()
          results.push({
            test: 'Test 2: Digitale producten ophalen',
            passed: hasPurchased,
            message: hasPurchased
              ? `✅ ${digitalProducts.length} digitaal bestand(en) gevonden`
              : '❌ Digitale producten gevonden zonder aankoop - SECURITY ISSUE!',
            details: { count: digitalProducts.length, products: digitalProducts }
          })
        }
      } catch (err) {
        results.push({
          test: 'Test 2: Digitale producten API',
          passed: false,
          message: `❌ Fout: ${err instanceof Error ? err.message : 'Unknown error'}`,
          details: { error: err }
        })
      }

      // Test 3: Test download security endpoint
      try {
        const securityRes = await fetch(`/api/test-download-security?productId=${productId}`)
        if (securityRes.ok) {
          const securityData = await securityRes.json()
          results.push({
            test: 'Test 3: Security verificatie',
            passed: securityData.tests.hasPurchasedProduct === hasPurchased,
            message: securityData.tests.hasPurchasedProduct
              ? '✅ Security check: Product is gekocht'
              : '✅ Security check: Product is NIET gekocht (toegang geweigerd)',
            details: securityData.tests
          })
        }
      } catch (err) {
        results.push({
          test: 'Test 3: Security endpoint',
          passed: false,
          message: `❌ Security endpoint fout: ${err instanceof Error ? err.message : 'Unknown'}`,
          details: { error: err }
        })
      }

      // Test 4: Try to generate download link
      if (hasPurchased) {
        try {
          // First get digital products
          const digitalRes = await fetch(`/api/digital-products/${productId}/user`)
          if (digitalRes.ok) {
            const digitalProducts = await digitalRes.json()
            if (digitalProducts.length > 0) {
              const digitalProductId = digitalProducts[0].id
              const downloadRes = await fetch(`/api/download/${digitalProductId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.userId })
              })
              
              if (downloadRes.ok) {
                const downloadData = await downloadRes.json()
                results.push({
                  test: 'Test 4: Download link genereren',
                  passed: true,
                  message: '✅ Download link succesvol gegenereerd',
                  details: { hasUrl: !!downloadData.downloadUrl }
                })
              } else {
                const errorData = await downloadRes.json()
                results.push({
                  test: 'Test 4: Download link genereren',
                  passed: false,
                  message: `❌ Download link genereren mislukt: ${errorData.error || 'Unknown error'}`,
                  details: { status: downloadRes.status, error: errorData }
                })
              }
            } else {
              results.push({
                test: 'Test 4: Download link genereren',
                passed: true,
                message: '⏭️ Geen digitale bestanden beschikbaar voor dit product',
                details: {}
              })
            }
          }
        } catch (err) {
          results.push({
            test: 'Test 4: Download link genereren',
            passed: false,
            message: `❌ Fout: ${err instanceof Error ? err.message : 'Unknown error'}`,
            details: { error: err }
          })
        }
      } else {
        // Test 4b: Try to download without purchase (should fail)
        try {
          // Get any digital product for this product (should fail at API level)
          const digitalRes = await fetch(`/api/digital-products/${productId}/user`)
          if (digitalRes.status === 403) {
            results.push({
              test: 'Test 4: Download zonder aankoop',
              passed: true,
              message: '✅ Correct geblokkeerd: Download zonder aankoop wordt geweigerd',
              details: { status: 403 }
            })
          } else {
            results.push({
              test: 'Test 4: Download zonder aankoop',
              passed: false,
              message: '❌ SECURITY ISSUE: Download mogelijk zonder aankoop!',
              details: { status: digitalRes.status }
            })
          }
        } catch (err) {
          results.push({
            test: 'Test 4: Download zonder aankoop',
            passed: false,
            message: `❌ Test fout: ${err instanceof Error ? err.message : 'Unknown'}`,
            details: { error: err }
          })
        }
      }

    } catch (error) {
      results.push({
        test: 'Test Suite',
        passed: false,
        message: `❌ Test suite fout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">🔒 Download Security Test</h1>
        
        {/* Session Info */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gebruiker Info</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-white"><strong>User ID:</strong> {session.userId}</p>
              <p className="text-white"><strong>Email:</strong> {session.email}</p>
              <p className="text-text-secondary">
                <strong>Gekochte producten:</strong> {purchasedProducts.length}
              </p>
            </div>
          ) : (
            <p className="text-red-400">❌ Niet ingelogd - log in om te testen</p>
          )}
        </div>

        {/* Product Selection */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Configuratie</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Product ID om te testen:</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-dark-section border border-dark-border rounded-lg px-4 py-2 text-white"
                placeholder="product-123"
              />
            </div>
            
            {purchasedProducts.length > 0 && (
              <div>
                <p className="text-text-secondary text-sm mb-2">Of selecteer een gekocht product:</p>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-dark-section border border-dark-border rounded-lg px-4 py-2 text-white"
                >
                  <option value="">-- Selecteer product --</option>
                  {purchasedProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button
              onClick={runTests}
              disabled={isRunning || !session || !productId}
              className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Tests uitvoeren...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Voer Security Tests Uit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-semibold text-white mb-4">Test Resultaten</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.passed
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{result.test}</h3>
                      <p className="text-sm text-text-secondary">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-text-secondary cursor-pointer hover:text-primary">
                            Details bekijken
                          </summary>
                          <pre className="mt-2 text-xs bg-dark-section p-3 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-dark-border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Samenvatting</h3>
              </div>
              <p className="text-text-secondary text-sm">
                {testResults.filter(r => r.passed).length} van {testResults.length} tests geslaagd
              </p>
              {testResults.every(r => r.passed) && (
                <p className="text-green-400 font-semibold mt-2">
                  ✅ Alle security checks zijn correct geïmplementeerd!
                </p>
              )}
              {testResults.some(r => !r.passed) && (
                <p className="text-red-400 font-semibold mt-2">
                  ⚠️ Sommige tests zijn gefaald - controleer de details hierboven
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

