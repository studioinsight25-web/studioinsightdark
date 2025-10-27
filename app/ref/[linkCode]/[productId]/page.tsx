// app/ref/[linkCode]/[productId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import AffiliateService from '@/lib/affiliate'
import { trackAffiliateClick } from '@/lib/analytics'

export default function AffiliateRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [affiliateLink, setAffiliateLink] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const { linkCode, productId } = params
        
        // Get affiliate link
        const link = AffiliateService.getAffiliateLink(linkCode as string)
        if (!link) {
          setError('Affiliate link niet gevonden')
          setLoading(false)
          return
        }

        setAffiliateLink(link)

        // Track click
        const click = AffiliateService.trackClick(
          linkCode as string,
          productId as string,
          'unknown', // IP will be tracked by server
          navigator.userAgent,
          document.referrer
        )

        // Track in analytics
        trackAffiliateClick(linkCode as string, productId as string)

        // Redirect to external URL after 3 seconds
        setTimeout(() => {
          if (link.externalUrl) {
            window.open(link.externalUrl, '_blank')
          } else {
            router.push(`/products/${productId}`)
          }
        }, 3000)

      } catch (err) {
        setError('Redirect fout')
        console.error('Affiliate redirect error:', err)
      } finally {
        setLoading(false)
      }
    }

    handleRedirect()
  }, [params, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Redirecten...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 bg-dark-card rounded-xl border border-dark-border max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Redirect Fout</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link
            href="/"
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8 bg-dark-card rounded-xl border border-dark-border max-w-md">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Affiliate Link Gedetecteerd!
        </h1>
        
        <p className="text-text-secondary mb-6">
          Je wordt doorgestuurd naar het product via affiliate link van{' '}
          <span className="text-primary font-semibold">{affiliateLink?.affiliateName}</span>
        </p>

        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-semibold">Redirecting...</span>
          </div>
          <p className="text-sm text-green-300">
            Je wordt automatisch doorgestuurd over 3 seconden
          </p>
        </div>

        <div className="space-y-3">
          {link.externalUrl ? (
            <button
              onClick={() => window.open(link.externalUrl, '_blank')}
              className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Naar Externe Website
            </button>
          ) : (
            <Link
              href={`/products/${params.productId}`}
              className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Direct naar Product
            </Link>
          )}
          
          <Link
            href="/"
            className="w-full bg-transparent border border-dark-border text-white py-3 px-6 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Home
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-xs text-text-secondary">
            Deze affiliate link helpt {affiliateLink?.affiliateName} om commissie te verdienen
          </p>
        </div>
      </div>
    </main>
  )
}
