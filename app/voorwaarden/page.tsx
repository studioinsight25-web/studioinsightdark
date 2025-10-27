import Link from 'next/link'
import { Calendar, FileText, Shield, CreditCard } from 'lucide-react'

export default function VoorwaardenPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Algemene Voorwaarden
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
                <FileText className="w-6 h-6 text-primary" />
                Inleiding
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Welkom bij Studio Insight. Deze algemene voorwaarden regelen het gebruik van onze website, 
                cursussen, e-books en diensten. Door gebruik te maken van onze diensten, ga je akkoord met 
                deze voorwaarden.
              </p>
            </div>

            {/* Definitions */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">1. Definities</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Studio Insight</h3>
                  <p className="text-text-secondary">De onderneming die deze website en diensten aanbiedt.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Gebruiker</h3>
                  <p className="text-text-secondary">Iedere persoon die gebruik maakt van onze website of diensten.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Diensten</h3>
                  <p className="text-text-secondary">Alle cursussen, e-books, reviews en andere content die wij aanbieden.</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">2. Onze Diensten</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Cursussen</h3>
                  <p className="text-text-secondary">
                    Wij bieden online cursussen aan over verschillende onderwerpen. Cursussen zijn beschikbaar 
                    na betaling en kunnen worden gevolgd op eigen tempo.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">E-books</h3>
                  <p className="text-text-secondary">
                    Onze e-books zijn beschikbaar voor download na betaling. Sommige e-books zijn gratis beschikbaar.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Reviews</h3>
                  <p className="text-text-secondary">
                    Wij bieden eerlijke reviews van producten en diensten. Deze reviews zijn gebaseerd op onze eigen ervaring.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                3. Betalingen en Terugbetalingen
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Betaling</h3>
                  <p className="text-text-secondary">
                    Alle betalingen dienen vooraf te worden voldaan. Wij accepteren verschillende betaalmethoden 
                    zoals creditcard, iDEAL en PayPal.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Terugbetaling</h3>
                  <p className="text-text-secondary">
                    Terugbetalingen zijn mogelijk binnen 14 dagen na aankoop, mits de cursus of e-book nog niet 
                    volledig is gebruikt. Neem contact met ons op via het contactformulier.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prijsveranderingen</h3>
                  <p className="text-text-secondary">
                    Wij behouden ons het recht voor om prijzen te wijzigen. Bestaande klanten worden op de hoogte 
                    gesteld van prijsveranderingen.
                  </p>
                </div>
              </div>
            </div>

            {/* User Rights */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">4. Gebruikersrechten en Verplichtingen</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Toegang tot Diensten</h3>
                  <p className="text-text-secondary">
                    Je hebt het recht om toegang te krijgen tot de diensten waarvoor je hebt betaald. 
                    Je account is persoonlijk en mag niet worden gedeeld.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verantwoordelijkheden</h3>
                  <p className="text-text-secondary">
                    Je bent verantwoordelijk voor het correct gebruik van onze diensten en het respecteren 
                    van intellectuele eigendomsrechten.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verboden Handelingen</h3>
                  <p className="text-text-secondary">
                    Het is verboden om onze content te kopiëren, te verspreiden of commercieel te gebruiken 
                    zonder toestemming.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                5. Privacy en Gegevensbescherming
              </h2>
              <p className="text-text-secondary mb-4">
                Wij respecteren je privacy en beschermen je persoonlijke gegevens volgens de AVG/GDPR. 
                Voor meer informatie, zie onze{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/80">
                  Privacy Policy
                </Link>.
              </p>
            </div>

            {/* Liability */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">6. Aansprakelijkheid</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Beperkte Aansprakelijkheid</h3>
                  <p className="text-text-secondary">
                    Onze aansprakelijkheid is beperkt tot het bedrag dat je hebt betaald voor de specifieke dienst.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen Garantie</h3>
                  <p className="text-text-secondary">
                    Wij geven geen garantie op specifieke resultaten van onze cursussen of diensten.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                7. Wijzigingen in Voorwaarden
              </h2>
              <p className="text-text-secondary">
                Wij behouden ons het recht voor om deze voorwaarden te wijzigen. Belangrijke wijzigingen 
                worden gecommuniceerd via e-mail of via onze website. Door gebruik te blijven maken van 
                onze diensten na wijzigingen, ga je akkoord met de nieuwe voorwaarden.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">8. Contact</h2>
              <p className="text-text-secondary mb-4">
                Voor vragen over deze voorwaarden kun je contact met ons opnemen:
              </p>
              <div className="space-y-2 text-text-secondary">
                <p>E-mail: info@studioinsight.nl</p>
                <p>Telefoon: +31 6 1234 5678</p>
                <p>Adres: Keizersgracht 123, 1015 CJ Amsterdam</p>
              </div>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
                >
                  Contact Opnemen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

