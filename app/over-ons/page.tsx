import Image from 'next/image'
import { Target, Award, Heart, CheckCircle } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: "Praktisch Leren",
    description: "We focussen op praktische kennis die je direct kunt toepassen in je werk."
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
                  Bekijk onze e-books
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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



      {/* CTA Section */}
      <section className="py-20 bg-dark-section">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start vandaag nog met leren
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Ontdek onze praktische cursussen en e-books die je helpen groeien als ondernemer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Bekijk cursussen
            </button>
            <button className="bg-transparent border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-black transition-all duration-300 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Bekijk e-books
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}


