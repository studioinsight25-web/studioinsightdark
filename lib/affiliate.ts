// lib/affiliate.ts
'use client'

export interface AffiliateLink {
  id: string
  affiliateId: string
  affiliateName: string
  productId: string
  productName: string
  linkCode: string
  externalUrl: string // Amazon URL of andere externe link
  commissionRate: number // Percentage (e.g., 10 for 10%)
  clicks: number
  conversions: number
  totalEarnings: number // in cents
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AffiliateClick {
  id: string
  linkCode: string
  productId: string
  userId?: string
  ipAddress: string
  userAgent: string
  referrer?: string
  clickedAt: string
}

export interface AffiliateConversion {
  id: string
  linkCode: string
  productId: string
  orderId: string
  userId: string
  commissionAmount: number // in cents
  conversionAt: string
}

class AffiliateService {
  private static affiliateLinks: Record<string, AffiliateLink> = {}
  private static affiliateClicks: Record<string, AffiliateClick> = {}
  private static affiliateConversions: Record<string, AffiliateConversion> = {}

  static initializeWithDefaults() {
    if (typeof window === 'undefined') return

    const storedLinks = localStorage.getItem('studio-insight-affiliate-links')
    if (storedLinks) {
      this.affiliateLinks = JSON.parse(storedLinks)
    }

    const storedClicks = localStorage.getItem('studio-insight-affiliate-clicks')
    if (storedClicks) {
      this.affiliateClicks = JSON.parse(storedClicks)
    }

    const storedConversions = localStorage.getItem('studio-insight-affiliate-conversions')
    if (storedConversions) {
      this.affiliateConversions = JSON.parse(storedConversions)
    }
  }

  static saveToStorage() {
    if (typeof window === 'undefined') return

    localStorage.setItem('studio-insight-affiliate-links', JSON.stringify(this.affiliateLinks))
    localStorage.setItem('studio-insight-affiliate-clicks', JSON.stringify(this.affiliateClicks))
    localStorage.setItem('studio-insight-affiliate-conversions', JSON.stringify(this.affiliateConversions))
  }

  static generateLinkCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static createAffiliateLink(
    affiliateId: string,
    affiliateName: string,
    productId: string,
    productName: string,
    externalUrl: string,
    commissionRate: number = 10
  ): AffiliateLink {
    this.initializeWithDefaults()

    const linkCode = this.generateLinkCode()
    const id = `affiliate-${Date.now()}`

    const affiliateLink: AffiliateLink = {
      id,
      affiliateId,
      affiliateName,
      productId,
      productName,
      linkCode,
      externalUrl,
      commissionRate,
      clicks: 0,
      conversions: 0,
      totalEarnings: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.affiliateLinks[id] = affiliateLink
    this.saveToStorage()
    return affiliateLink
  }

  static getAffiliateLinksByAffiliate(affiliateId: string): AffiliateLink[] {
    this.initializeWithDefaults()
    return Object.values(this.affiliateLinks).filter(link => link.affiliateId === affiliateId)
  }

  static getAffiliateLinksByProduct(productId: string): AffiliateLink[] {
    this.initializeWithDefaults()
    return Object.values(this.affiliateLinks).filter(link => link.productId === productId)
  }

  static getAffiliateLink(linkCode: string): AffiliateLink | null {
    this.initializeWithDefaults()
    return Object.values(this.affiliateLinks).find(link => link.linkCode === linkCode) || null
  }

  static trackClick(linkCode: string, productId: string, ipAddress: string, userAgent: string, referrer?: string): AffiliateClick {
    this.initializeWithDefaults()

    const affiliateLink = this.getAffiliateLink(linkCode)
    if (!affiliateLink) {
      throw new Error('Affiliate link not found')
    }

    // Update click count
    affiliateLink.clicks += 1
    affiliateLink.updatedAt = new Date().toISOString()
    this.affiliateLinks[affiliateLink.id] = affiliateLink

    // Create click record
    const clickId = `click-${Date.now()}`
    const click: AffiliateClick = {
      id: clickId,
      linkCode,
      productId,
      ipAddress,
      userAgent,
      referrer,
      clickedAt: new Date().toISOString()
    }

    this.affiliateClicks[clickId] = click
    this.saveToStorage()

    return click
  }

  static trackConversion(linkCode: string, productId: string, orderId: string, userId: string, orderAmount: number): AffiliateConversion {
    this.initializeWithDefaults()

    const affiliateLink = this.getAffiliateLink(linkCode)
    if (!affiliateLink) {
      throw new Error('Affiliate link not found')
    }

    // Calculate commission
    const commissionAmount = Math.round((orderAmount * affiliateLink.commissionRate) / 100)

    // Update conversion count and earnings
    affiliateLink.conversions += 1
    affiliateLink.totalEarnings += commissionAmount
    affiliateLink.updatedAt = new Date().toISOString()
    this.affiliateLinks[affiliateLink.id] = affiliateLink

    // Create conversion record
    const conversionId = `conversion-${Date.now()}`
    const conversion: AffiliateConversion = {
      id: conversionId,
      linkCode,
      productId,
      orderId,
      userId,
      commissionAmount,
      conversionAt: new Date().toISOString()
    }

    this.affiliateConversions[conversionId] = conversion
    this.saveToStorage()

    return conversion
  }

  static generateAffiliateUrl(linkCode: string, productId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return `${baseUrl}/ref/${linkCode}/${productId}`
  }

  static getAllAffiliateLinks(): AffiliateLink[] {
    this.initializeWithDefaults()
    return Object.values(this.affiliateLinks)
  }

  static getAffiliateStats(affiliateId: string) {
    this.initializeWithDefaults()
    
    const links = this.getAffiliateLinksByAffiliate(affiliateId)
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)
    const totalConversions = links.reduce((sum, link) => sum + link.conversions, 0)
    const totalEarnings = links.reduce((sum, link) => sum + link.totalEarnings, 0)
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    return {
      totalLinks: links.length,
      totalClicks,
      totalConversions,
      totalEarnings,
      conversionRate: Math.round(conversionRate * 100) / 100
    }
  }

  static updateAffiliateLink(id: string, updates: Partial<AffiliateLink>): AffiliateLink | null {
    this.initializeWithDefaults()
    
    if (!this.affiliateLinks[id]) return null

    this.affiliateLinks[id] = {
      ...this.affiliateLinks[id],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    this.saveToStorage()
    return this.affiliateLinks[id]
  }

  static deleteAffiliateLink(id: string): boolean {
    this.initializeWithDefaults()
    
    if (!this.affiliateLinks[id]) return false

    delete this.affiliateLinks[id]
    this.saveToStorage()
    return true
  }
}

export default AffiliateService
