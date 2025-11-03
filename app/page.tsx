import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedEbooks from '@/components/FeaturedEbooks'
import PopularCourses from '@/components/PopularCourses'
import RecentReviews from '@/components/RecentReviews'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <FeaturedEbooks />
      <PopularCourses />
      <RecentReviews />
      <Footer />
    </main>
  )
}
