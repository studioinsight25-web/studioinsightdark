import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedEbooks from '@/components/FeaturedEbooks'
import RecentReviews from '@/components/RecentReviews'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <FeaturedEbooks />
      <RecentReviews />
      <Footer />
    </main>
  )
}
