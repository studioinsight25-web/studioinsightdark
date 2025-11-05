// lib/seo.ts - SEO Utility Functions and Structured Data
import type { Product } from './products'

export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: any
}

// Organization Structured Data (for homepage)
export function getOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Studio Insight',
    url: baseUrl,
    logo: `${baseUrl}/og-image.jpg`,
    description: 'Cursussen, e-books en reviews die je helpen om slimmer te groeien. Voor ondernemers en professionals.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'De Veken 122b',
      addressLocality: 'Opmeer',
      postalCode: '1716 KG',
      addressCountry: 'NL'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@studio-insight.nl',
      contactType: 'customer service',
      areaServed: 'NL',
      availableLanguage: 'Dutch'
    },
    sameAs: [
      // Add social media links here when available
      // 'https://www.linkedin.com/company/studio-insight',
      // 'https://www.facebook.com/studioinsight',
      // 'https://www.instagram.com/studioinsight'
    ]
  }
}

// LocalBusiness Schema (for geo-targeting)
export function getLocalBusinessSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}#business`,
    name: 'Studio Insight',
    image: `${baseUrl}/og-image.jpg`,
    url: baseUrl,
    telephone: null, // Add if available
    email: 'info@studio-insight.nl',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'De Veken 122b',
      addressLocality: 'Opmeer',
      addressRegion: 'Noord-Holland',
      postalCode: '1716 KG',
      addressCountry: 'NL'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.7069, // Opmeer coordinates - update if needed
      longitude: 4.9444
    },
    priceRange: '€€',
    areaServed: {
      '@type': 'Country',
      name: 'Nederland'
    }
  }
}

// Product Schema (for courses and e-books)
export function getProductSchema(product: Product, baseUrl: string) {
  const price = product.price / 100 // Convert cents to euros
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription || '',
    image: product.imageUrl || `${baseUrl}/og-image.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'Studio Insight'
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.id}`,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      availability: product.isActive
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Studio Insight'
      }
    }
  }

  // Add Course schema if it's a course
  if (product.type === 'course') {
    schema['@type'] = ['Product', 'Course']
    schema.courseCode = product.id
    schema.educationalCredentialAwarded = 'Certificate of Completion'
    schema.provider = {
      '@type': 'Organization',
      name: 'Studio Insight',
      url: baseUrl
    }
    if (product.duration) {
      schema.timeRequired = product.duration
    }
    if (product.level) {
      schema.audience = {
        '@type': 'EducationalAudience',
        educationalRole: product.level
      }
    }
  }

  // Add Book schema if it's an e-book
  if (product.type === 'ebook') {
    schema['@type'] = ['Product', 'Book']
    schema.bookFormat = 'https://schema.org/EBook'
    schema.numberOfPages = product.lessons || undefined
  }

  return schema
}

// Breadcrumb Schema
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`
    }))
  }
}

// Website Schema (for homepage)
export function getWebsiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Studio Insight',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/zoeken?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

// CollectionPage Schema (for category pages like /cursussen, /ebooks)
export function getCollectionPageSchema(
  type: 'course' | 'ebook' | 'review',
  baseUrl: string,
  products: Product[]
) {
  const typeNames: Record<string, string> = {
    course: 'Cursussen',
    ebook: 'E-books',
    review: 'Reviews'
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${typeNames[type]} - Studio Insight`,
    description: `Bekijk alle ${typeNames[type].toLowerCase()} van Studio Insight`,
    url: `${baseUrl}/${type === 'course' ? 'cursussen' : type === 'ebook' ? 'ebooks' : 'reviews'}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': product.type === 'course' ? 'Course' : product.type === 'ebook' ? 'Book' : 'Product',
          name: product.name,
          url: `${baseUrl}/products/${product.id}`
        }
      }))
    }
  }
}

// FAQ Schema (can be used for FAQ sections)
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Generate meta description from product
export function generateMetaDescription(product: Product, maxLength: number = 160): string {
  const description = product.shortDescription || product.description || ''
  if (description.length <= maxLength) {
    return description
  }
  return description.substring(0, maxLength - 3) + '...'
}

// Generate meta title from product
export function generateMetaTitle(product: Product, maxLength: number = 60): string {
  const title = product.name || 'Studio Insight'
  if (title.length <= maxLength) {
    return title
  }
  return title.substring(0, maxLength - 3) + '...'
}

// Generate keywords for product
export function generateKeywords(product: Product): string[] {
  const keywords: string[] = []
  
  // Add product name words
  if (product.name) {
    keywords.push(...product.name.toLowerCase().split(' '))
  }
  
  // Add type
  if (product.type === 'course') {
    keywords.push('cursus', 'online cursus', 'e-learning')
  } else if (product.type === 'ebook') {
    keywords.push('ebook', 'e-book', 'digitale gids')
  } else if (product.type === 'review') {
    keywords.push('review', 'productreview', 'beoordeling')
  }
  
  // Add category if available
  if (product.category) {
    keywords.push(product.category)
  }
  
  // Add level if available
  if (product.level) {
    keywords.push(product.level)
  }
  
  // Add generic keywords
  keywords.push('studio insight', 'nederland', 'online leren')
  
  return [...new Set(keywords)] // Remove duplicates
}

