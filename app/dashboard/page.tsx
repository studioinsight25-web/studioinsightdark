import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DigitalProductDownload from '@/components/DigitalProductDownload'
import { 
  BookOpen, 
  Clock, 
  Star, 
  Play, 
  Download, 
  Award,
  TrendingUp,
  Calendar,
  LogOut,
  FileText,
  Video,
  Music
} from 'lucide-react'

// Course data (in production, this would come from a database)
const courses = [
  {
    id: '1',
    title: 'Podcasten voor beginners',
    instructor: 'Studio Insight',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    duration: '4 uur',
    lessons: 13,
    completed: 8,
    progress: 62,
    rating: 5,
    category: 'Audio',
    lastAccessed: '2 dagen geleden'
  },
  {
    id: '2',
    title: 'Bouw een persoonlijke website',
    instructor: 'Studio Insight',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop',
    duration: '6 uur',
    lessons: 14,
    completed: 14,
    progress: 100,
    rating: 5,
    category: 'Web Development',
    lastAccessed: '1 week geleden'
  },
  {
    id: '3',
    title: 'Videobewerking fundamentals',
    instructor: 'Studio Insight',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop',
    duration: '8 uur',
    lessons: 15,
    completed: 3,
    progress: 20,
    rating: 5,
    category: 'Video',
    lastAccessed: '5 dagen geleden'
  }
]

const stats = [
  { label: 'Cursussen gestart', value: '3', icon: BookOpen },
  { label: 'Lessen voltooid', value: '25', icon: Award },
  { label: 'Studietijd', value: '12u', icon: Clock },
  { label: 'Certificaten', value: '1', icon: Star }
]

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/inloggen')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welkom terug, {user.name}!
              </h1>
              <p className="text-text-secondary">
                Hier is een overzicht van je voortgang en cursussen.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/cursussen"
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
              >
                Nieuwe cursus starten
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="bg-transparent border border-dark-border text-white px-6 py-3 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Uitloggen
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-dark-card rounded-xl p-6 border border-dark-border text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-12 bg-dark-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Mijn Cursussen
            </h2>
            <Link
              href="/cursussen"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Alle cursussen bekijken
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-black px-3 py-1 rounded-full text-sm font-semibold">
                    {course.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-dark-card/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-white">
                    {course.progress}% voltooid
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {course.title}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Door {course.instructor}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.completed}/{course.lessons} lessen</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-text-secondary mb-2">
                      <span>Voortgang</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-section rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Laatst bekeken: {course.lastAccessed}</span>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(course.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        // Navigate to course content
                        window.location.href = `/courses/${course.id}`
                      }}
                      className="flex-1 bg-primary text-black py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {course.progress === 100 ? 'Opnieuw bekijken' : 'Verder leren'}
                    </button>
                    <button 
                      onClick={() => {
                        // Navigate to product page for downloads
                        window.location.href = `/products/${course.id}`
                      }}
                      className="bg-transparent border border-dark-border text-white py-2 px-4 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Downloads */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Mijn Digitale Downloads
            </h2>
            <div className="text-sm text-text-secondary">
              Alleen beschikbaar na aankoop
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-dark-card rounded-xl p-6 border border-dark-border"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-sm text-text-secondary">Door {course.instructor}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <DigitalProductDownload
                    productId={course.id}
                    userId={user.id}
                    className="w-full"
                  />
                </div>
                
                <div className="text-xs text-text-secondary">
                  Laatst geüpdatet: {course.lastAccessed}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

