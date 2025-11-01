import Link from 'next/link'
import { GraduationCap, Book, Star, Users } from 'lucide-react'

const categories = [
  { 
    icon: GraduationCap, 
    title: 'Cursussen', 
    description: 'Leer nieuwe vaardigheden',
    href: '/cursussen' 
  },
  { 
    icon: Book, 
    title: 'E-books', 
    description: 'Downloadbare gidsen',
    href: '/ebooks' 
  },
  { 
    icon: Star, 
    title: 'Reviews', 
    description: 'Product beoordelingen',
    href: '/reviews' 
  },
  { 
    icon: Users, 
    title: 'Community', 
    description: 'Sluit je aan bij anderen',
    href: '/community' 
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-20 bg-dark-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group bg-dark-card p-8 rounded-xl text-center border border-dark-border hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10 cursor-pointer block"
            >
              <div className="mb-4 flex justify-center">
                <category.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300 text-white">
                {category.title}
              </h3>
              <p className="text-text-secondary text-sm">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

