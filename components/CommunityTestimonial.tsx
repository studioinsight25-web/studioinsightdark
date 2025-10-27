import Image from 'next/image'

export default function CommunityTestimonial() {
  return (
    <section className="py-20 bg-dark-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Community Banner */}
          <div className="bg-gradient-to-br from-dark-card to-dark-section p-8 rounded-xl border border-dark-border">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Sluit je aan bij de Studio Insight Community
            </h2>
            <p className="text-text-secondary mb-6">
              Verbind met andere ondernemers en deel je ervaringen in onze actieve Discord community.
            </p>
            <button className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105">
              Toegang via Discord
            </button>
          </div>

          {/* Testimonial */}
          <div className="bg-dark-card p-8 rounded-xl border border-dark-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
                  alt="Daan W"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <blockquote className="text-lg italic mb-4">
                  "De cursussen zijn enorm inzichtelijk en praktisch. Mijn studio en workflow zijn opmerkelijk verbeterd!"
                </blockquote>
                <cite className="text-text-secondary font-semibold">
                  - Daan W.
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

