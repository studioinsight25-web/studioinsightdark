import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedRow from '@/components/FeaturedRow'
import RecentReviews from '@/components/RecentReviews'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'
import { getOrganizationSchema, getWebsiteSchema, getLocalBusinessSchema } from '@/lib/seo'

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-insight.nl'
  
  const structuredData = [
    getOrganizationSchema(baseUrl),
    getWebsiteSchema(baseUrl),
    getLocalBusinessSchema(baseUrl)
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedRow />
        <RecentReviews />
        <Footer />
      </main>
    </>
  )
}
