import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop"
          alt="Ondernemers leren in een professionele omgeving"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl px-4 mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
          Ontwikkel jouw studio, je merk en je impact.
        </h1>
        <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto text-white/90">
          Cursussen, e-books en reviews die je helpen om slimmer te groeien.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/cursussen"
            className="bg-primary text-black px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/25 w-full sm:w-auto text-center"
          >
            Bekijk cursussen
          </Link>
          <Link 
            href="/reviews"
            className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
          >
            Lees reviews
          </Link>
        </div>
      </div>
    </section>
  )
}

