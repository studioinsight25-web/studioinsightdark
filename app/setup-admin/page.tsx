'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const createAdmin = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/create-admin-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to create admin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="max-w-md w-full bg-dark-card border border-dark-border rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Setup Admin User
        </h1>

        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-text-secondary text-sm mb-2">
            Credentials:
          </p>
          <p className="text-white font-mono text-sm">
            Email: admin@studio-insight.nl
          </p>
          <p className="text-white font-mono text-sm">
            Password: admin123
          </p>
        </div>

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Creating...' : 'Create Admin User'}
        </button>

        {result && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-semibold mb-2">Success!</p>
            <pre className="text-white text-sm whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-semibold mb-2">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {result && result.success && (
          <button
            onClick={() => router.push('/inloggen')}
            className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        )}
      </div>
    </main>
  )
}

