import Image from 'next/image'
import { Users, Target, Award, Heart, CheckCircle, ArrowRight } from 'lucide-react'

const team = [
  {
    name: "Daan van der Berg",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Ondernemer met 10+ jaar ervaring in content creation en studio development."
  },
  {
    name: "Lisa de Vries",
    role: "Content Director",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    bio: "Expert in content strategie en digitale marketing."
  },
  {
    name: "Mark Janssen",
    role: "Technical Lead",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    bio: "Tech specialist met focus op moderne web development."
  }
]

const values = [
  {
    icon: Target,
    title: "Praktisch Leren",
    description: "We focussen op praktische kennis die je direct kunt toepassen in je werk."
  },
  {
    icon: Users,
    title: "Community First",
    description: "Onze community staat centraal. We leren van en met elkaar."
  },
  {
    icon: Award,
    title: "Kwaliteit",
    description: "Alleen de beste content en tools krijgen een plek in ons platform."
  },
  {
    icon: Heart,
    title: "Passie",
    description: "We zijn gepassioneerd over het helpen van ondernemers groeien."
  }
]

const stats = [
  { number: "5000+", label: "Tevreden studenten" },
  { number: "50+", label: "Cursussen & e-books" },
  { number: "100+", label: "Product reviews" },
  { number: "4.9", label: "Gemiddelde rating" }
]

const timeline = [
  {
    year: "2020",
    title: "Studio Insight opgericht",
    description: "Gestart met de visie om ondernemers te helpen hun studio en merk te ontwikkelen."
  },
  {
    year: "2021",
    title: "Eerste cursussen gelanceerd",
    description: "Onze eerste praktische cursussen over podcasten en content creation."
  },
  {
    year: "2022",
    title: "Community platform",
    description: "Discord community gelanceerd met actieve leden en dagelijkse discussies."
  },
  {
    year: "2023",
    title: "Review programma",
    description: "Gestart met uitgebreide product reviews voor content creators."
  },
  {
    year: "2024",
    title: "Internationale uitbreiding",
    description: "Uitbreiding naar andere landen en nieuwe content categorieën."
  }
]

export default function OverOnsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Over Studio Insight
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            We zijn gepassioneerd over het helpen van ondernemers en professionals 
            om hun studio, merk en impact te ontwikkelen. Met praktische cursussen, 
            e-books en eerlijke reviews helpen we je slimmer te groeien.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-dark-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Onze Missie
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                Studio Insight is ontstaan uit de overtuiging dat elke ondernemer 
                de tools en kennis verdient om hun volledige potentieel te bereiken. 
                We geloven dat praktische, toepasbare kennis de sleutel is tot succes.
              </p>
              <p className="text-lg text-text-secondary mb-8">
                Onze missie is om ondernemers te empoweren met de beste cursussen, 
                e-books en product reviews, zodat ze slimmer kunnen groeien en hun 
                impact kunnen vergroten.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300">
                  Bekijk onze cursussen
                </button>
                <button className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300">
                  Word lid van de community
                </button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                alt="Studio Insight team"
                width={600}
                height={400}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Onze Waarden
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {value.title}
                </h3>
                <p className="text-text-secondary">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-dark-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ons Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-text-secondary text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Onze Reis
          </h2>
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-lg">
                    {item.year}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-section">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sluit je aan bij onze community
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Word onderdeel van een groeiende community van ondernemers die samen leren en groeien.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Word lid van Discord
            </button>
            <button className="bg-transparent border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-all duration-300 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Bekijk cursussen
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

