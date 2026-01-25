import Header from '@/components/Header'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import RecentSpots from '@/components/RecentSpots'
import Categories from '@/components/Categories'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <RecentSpots />
        <Categories />
      </main>
      <Footer />
    </div>
  )
}