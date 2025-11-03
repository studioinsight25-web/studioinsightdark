import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedRow from '@/components/FeaturedRow'
import RecentReviews from '@/components/RecentReviews'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <FeaturedRow />
      <RecentReviews />
      <Footer />
    </main>
  )
}
