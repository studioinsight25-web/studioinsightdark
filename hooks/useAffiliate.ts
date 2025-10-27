// hooks/useAffiliate.ts
'use client'

import { useState, useEffect } from 'react'
import AffiliateService, { AffiliateLink } from '@/lib/affiliate'

export function useAffiliate(affiliateId?: string) {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAffiliateLinks = () => {
      try {
        AffiliateService.initializeWithDefaults()
        
        if (affiliateId) {
          const links = AffiliateService.getAffiliateLinksByAffiliate(affiliateId)
          setAffiliateLinks(links)
        } else {
          const allLinks = AffiliateService.getAllAffiliateLinks()
          setAffiliateLinks(allLinks)
        }
      } catch (error) {
        console.error('Error loading affiliate links:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAffiliateLinks()
  }, [affiliateId])

  const createAffiliateLink = (
    affiliateId: string,
    affiliateName: string,
    productId: string,
    productName: string,
    externalUrl: string,
    commissionRate: number = 10
  ) => {
    const newLink = AffiliateService.createAffiliateLink(
      affiliateId,
      affiliateName,
      productId,
      productName,
      externalUrl,
      commissionRate
    )
    setAffiliateLinks(prev => [...prev, newLink])
    return newLink
  }

  const updateAffiliateLink = (id: string, updates: Partial<AffiliateLink>) => {
    const updatedLink = AffiliateService.updateAffiliateLink(id, updates)
    if (updatedLink) {
      setAffiliateLinks(prev => prev.map(link => link.id === id ? updatedLink : link))
    }
    return updatedLink
  }

  const deleteAffiliateLink = (id: string) => {
    const success = AffiliateService.deleteAffiliateLink(id)
    if (success) {
      setAffiliateLinks(prev => prev.filter(link => link.id !== id))
    }
    return success
  }

  const generateAffiliateUrl = (linkCode: string, productId: string) => {
    return AffiliateService.generateAffiliateUrl(linkCode, productId)
  }

  const getAffiliateStats = (affiliateId: string) => {
    return AffiliateService.getAffiliateStats(affiliateId)
  }

  return {
    affiliateLinks,
    loading,
    createAffiliateLink,
    updateAffiliateLink,
    deleteAffiliateLink,
    generateAffiliateUrl,
    getAffiliateStats,
  }
}
