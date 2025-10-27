import Link from 'next/link'
import { AlertTriangle, Shield, BookOpen, Star, ExternalLink, Info } from 'lucide-react'

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Disclaimer
          </h1>
          <p className="text-xl text-text-secondary">
            Laatst bijgewerkt: 26 oktober 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-invert max-w-none">
            
            {/* Introduction */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Inleiding
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Deze disclaimer regelt het gebruik van onze website, cursussen, e-books en andere diensten. 
                Door gebruik te maken van onze diensten, erkent je de voorwaarden van deze disclaimer.
              </p>
            </div>

            {/* Educational Content */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                1. Educatieve Content
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen Garantie op Resultaten</h3>
                  <p className="text-text-secondary">
                    Onze cursussen en e-books zijn bedoeld voor educatieve doeleinden. Wij geven geen garantie 
                    dat het volgen van onze cursussen zal leiden tot specifieke resultaten, zoals meer omzet, 
                    klanten of succes in je onderneming.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Eigen Verantwoordelijkheid</h3>
                  <p className="text-text-secondary">
                    Je bent zelf verantwoordelijk voor het toepassen van de geleerde kennis en het nemen van 
                    beslissingen op basis van deze informatie. Wij zijn niet aansprakelijk voor de gevolgen van 
                    je acties.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Individuele Omstandigheden</h3>
                  <p className="text-text-secondary">
                    Elke situatie is uniek. Wat voor de één werkt, werkt mogelijk niet voor de ander. 
                    Pas de geleerde kennis altijd aan aan je eigen omstandigheden en doe je eigen onderzoek.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Star className="w-6 h-6 text-primary" />
                2. Product Reviews
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Eerlijke Mening</h3>
                  <p className="text-text-secondary">
                    Onze product reviews zijn gebaseerd op onze eigen ervaring en mening. Deze reviews zijn 
                    subjectief en kunnen verschillen van jouw ervaring met hetzelfde product.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen Sponsoring</h3>
                  <p className="text-text-secondary">
                    Wij ontvangen geen betaling voor positieve reviews. Onze reviews zijn onafhankelijk en 
                    gebaseerd op onze eigen ervaring.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Product Wijzigingen</h3>
                  <p className="text-text-secondary">
                    Producten kunnen na onze review zijn gewijzigd. Controleer altijd de actuele specificaties 
                    en prijzen bij de leverancier.
                  </p>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-primary" />
                3. Externe Links
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen Controle</h3>
                  <p className="text-text-secondary">
                    Onze website kan links bevatten naar externe websites. Wij hebben geen controle over 
                    de inhoud van deze websites en zijn niet verantwoordelijk voor hun inhoud of privacybeleid.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Eigen Risico</h3>
                  <p className="text-text-secondary">
                    Het bezoeken van externe links is op eigen risico. Wij raden aan om de privacy policy 
                    en voorwaarden van externe websites te controleren.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Affiliate Links</h3>
                  <p className="text-text-secondary">
                    Sommige links kunnen affiliate links zijn. Dit betekent dat wij een commissie kunnen 
                    ontvangen als je via deze link een aankoop doet, zonder extra kosten voor jou.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Disclaimer */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">4. Technische Disclaimer</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Website Beschikbaarheid</h3>
                  <p className="text-text-secondary">
                    Wij streven ernaar om onze website 24/7 beschikbaar te houden, maar kunnen geen 
                    garantie geven op ononderbroken toegang. Onderhoud, updates of technische problemen 
                    kunnen tijdelijke uitval veroorzaken.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Content Nauwkeurigheid</h3>
                  <p className="text-text-secondary">
                    Wij doen ons best om alle informatie accuraat en up-to-date te houden, maar kunnen 
                    geen garantie geven op de volledigheid of juistheid van alle content.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Virussen en Malware</h3>
                  <p className="text-text-secondary">
                    Wij nemen maatregelen om onze website te beschermen tegen virussen en malware, maar 
                    kunnen geen 100% garantie geven. Gebruik altijd up-to-date antivirus software.
                  </p>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                5. Beperking van Aansprakelijkheid
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Maximale Aansprakelijkheid</h3>
                  <p className="text-text-secondary">
                    Onze totale aansprakelijkheid is beperkt tot het bedrag dat je hebt betaald voor de 
                    specifieke dienst of cursus waar het probleem betrekking op heeft.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Indirecte Schade</h3>
                  <p className="text-text-secondary">
                    Wij zijn niet aansprakelijk voor indirecte schade, zoals gederfde winst, gemiste 
                    kansen of gevolgschade.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Force Majeure</h3>
                  <p className="text-text-secondary">
                    Wij zijn niet aansprakelijk voor schade veroorzaakt door omstandigheden buiten onze 
                    controle, zoals natuurrampen, oorlog of pandemieën.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Advice */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Info className="w-6 h-6 text-primary" />
                6. Geen Professioneel Advies
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen Vervanging</h3>
                  <p className="text-text-secondary">
                    Onze content is geen vervanging voor professioneel advies van accountants, advocaten, 
                    financieel adviseurs of andere professionals.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Raadpleeg Professionals</h3>
                  <p className="text-text-secondary">
                    Voor belangrijke beslissingen raden wij aan om professioneel advies in te winnen van 
                    gekwalificeerde professionals.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Juridische Zaken</h3>
                  <p className="text-text-secondary">
                    Voor juridische vragen of problemen, raadpleeg altijd een gekwalificeerde advocaat 
                    in je rechtsgebied.
                  </p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">7. Wijzigingen</h2>
              <p className="text-text-secondary">
                Wij behouden ons het recht voor om deze disclaimer te wijzigen zonder voorafgaande kennisgeving. 
                Het is je verantwoordelijkheid om deze pagina regelmatig te controleren op updates. 
                Door gebruik te blijven maken van onze diensten na wijzigingen, ga je akkoord met de 
                bijgewerkte disclaimer.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">8. Contact</h2>
              <p className="text-text-secondary mb-4">
                Voor vragen over deze disclaimer:
              </p>
              <div className="space-y-2 text-text-secondary mb-6">
                <p>E-mail: info@studioinsight.nl</p>
                <p>Telefoon: +31 6 1234 5678</p>
                <p>Adres: Keizersgracht 123, 1015 CJ Amsterdam</p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/contact"
                  className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
                >
                  Contact Opnemen
                </Link>
                <Link
                  href="/voorwaarden"
                  className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300"
                >
                  Algemene Voorwaarden
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

