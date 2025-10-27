// components/AffiliateLinkGenerator.tsx
'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Share2, Users } from 'lucide-react'
import { useAffiliate } from '@/hooks/useAffiliate'

interface AffiliateLinkGeneratorProps {
  productId: string
  productName: string
  externalUrl?: string // Voor externe producten zoals Amazon
  className?: string
}

export default function AffiliateLinkGenerator({ 
  productId, 
  productName, 
  externalUrl,
  className = '' 
}: AffiliateLinkGeneratorProps) {
  const { createAffiliateLink, generateAffiliateUrl } = useAffiliate()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    affiliateId: '',
    affiliateName: '',
    externalUrl: externalUrl || '',
    commissionRate: 10
  })
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const handleGenerateLink = () => {
    if (!formData.affiliateId || !formData.affiliateName || !formData.externalUrl) {
      alert('Vul alle velden in')
      return
    }

    const affiliateLink = createAffiliateLink(
      formData.affiliateId,
      formData.affiliateName,
      productId,
      productName,
      formData.externalUrl,
      formData.commissionRate
    )

    const url = generateAffiliateUrl(affiliateLink.linkCode, productId)
    setGeneratedLink(url)
    setShowForm(false)
  }

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      alert('Affiliate link gekopieerd naar clipboard!')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Affiliate Link Generator</h3>
            <p className="text-sm text-text-secondary">
              Genereer een affiliate link voor dit product
            </p>
          </div>
        </div>

        {!generatedLink ? (
          <div className="space-y-4">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-primary text-black py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Affiliate Link Genereren
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Affiliate ID
                  </label>
                  <input
                    type="text"
                    value={formData.affiliateId}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliateId: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                    placeholder="Bijv. AFF001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Affiliate Naam
                  </label>
                  <input
                    type="text"
                    value={formData.affiliateName}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliateName: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                    placeholder="Bijv. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Externe URL (Amazon, etc.)
                  </label>
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                    placeholder="https://amazon.nl/dp/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Commissie Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-dark-section border border-dark-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateLink}
                    className="flex-1 bg-primary text-black py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
                  >
                    Link Genereren
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-transparent border border-dark-border text-white py-2 px-4 rounded-lg font-semibold hover:border-primary transition-colors duration-300"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-semibold">Affiliate Link Gegenereerd!</span>
              </div>
              <p className="text-sm text-green-300 mb-3">
                Deel deze link om commissie te verdienen op verkopen
              </p>
              <div className="bg-dark-section rounded-lg p-3">
                <code className="text-sm text-white break-all">{generatedLink}</code>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-primary text-black py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Kopieer Link
              </button>
              <button
                onClick={() => {
                  window.open(generatedLink, '_blank')
                }}
                className="flex-1 bg-transparent border border-dark-border text-white py-2 px-4 rounded-lg font-semibold hover:border-primary transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Test Link
              </button>
            </div>
            
            <button
              onClick={() => {
                setGeneratedLink(null)
                setFormData({ affiliateId: '', affiliateName: '', externalUrl: externalUrl || '', commissionRate: 10 })
              }}
              className="w-full bg-transparent border border-dark-border text-text-secondary py-2 px-4 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300"
            >
              Nieuwe Link Genereren
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 pt-4 border-t border-dark-border">
          <h4 className="font-medium text-white mb-2">💡 Hoe werkt het?</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Genereer een unieke affiliate link voor dit product</li>
            <li>• Deel de link via social media, email, of website</li>
            <li>• Verdien commissie op elke verkoop via jouw link</li>
            <li>• Track clicks en conversies in het admin panel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
