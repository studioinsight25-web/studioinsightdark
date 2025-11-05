// app/products/[id]/metadata.ts - Generate metadata for product pages
import { Metadata } from 'next'
import { DatabaseProductService } from '@/lib/products-database'
import { generateMetaTitle, generateMetaDescription, generateKeywords } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-insight.nl'
  
  try {
    const product = await DatabaseProductService.getProduct(params.id)
    
    if (!product) {
      return {
        title: 'Product niet gevonden | Studio Insight',
        description: 'Het gevraagde product kon niet worden gevonden.',
      }
    }

    // Use generated titles/descriptions (metaTitle/metaDescription not in Product interface)
    const title = generateMetaTitle(product)
    const description = generateMetaDescription(product)
    const keywords = generateKeywords(product).join(', ')
    const imageUrl = product.imageUrl || `${baseUrl}/og-image.jpg`
    const productUrl = `${baseUrl}/products/${product.id}`

    return {
      title: `${title} | Studio Insight`,
      description,
      keywords,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: title,
        description: description,
        url: productUrl,
        siteName: 'Studio Insight',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        locale: 'nl_NL',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
      },
      robots: {
        index: product.isActive,
        follow: true,
      },
    }
  } catch (error) {
    console.error('Error generating metadata for product:', error)
    return {
      title: 'Product | Studio Insight',
      description: 'Bekijk dit product op Studio Insight',
    }
  }
}

