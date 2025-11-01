import Link from 'next/link'
import { Shield, Eye, Database, Lock, Mail, Phone, Calendar, User } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Privacy Policy
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
                <Shield className="w-6 h-6 text-primary" />
                Inleiding
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Studio Insight respecteert je privacy en is verplicht om je persoonlijke gegevens te beschermen 
                volgens de Algemene Verordening Gegevensbescherming (AVG/GDPR). Deze privacy policy legt uit 
                hoe wij je gegevens verzamelen, gebruiken en beschermen.
              </p>
            </div>

            {/* Data Controller */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">1. Gegevensverantwoordelijke</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Studio Insight</h3>
                    <p className="text-text-secondary">Keizersgracht 123, 1015 CJ Amsterdam</p>
                    <p className="text-text-secondary">E-mail: info@studioinsight.nl</p>
                    <p className="text-text-secondary">Telefoon: +31 6 1234 5678</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Collection */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                2. Welke Gegevens Verzamelen Wij?
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Persoonlijke Gegevens</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li>• Naam en e-mailadres (bij registratie)</li>
                    <li>• Telefoonnummer (optioneel)</li>
                    <li>• Betalingsgegevens (via beveiligde betaalproviders)</li>
                    <li>• IP-adres en browser informatie</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Gebruiksgegevens</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li>• Cursus voortgang en voltooiingen</li>
                    <li>• Website bezoeken en pagina views</li>
                    <li>• Downloads van e-books</li>
                    <li>• Contact formulier inzendingen</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">3. Doeleinden van Gegevensverwerking</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Service Levering</h3>
                  <p className="text-text-secondary">
                    Om je toegang te geven tot cursussen, e-books en andere diensten waarvoor je hebt betaald.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Communicatie</h3>
                  <p className="text-text-secondary">
                    Om je te informeren over nieuwe cursussen, updates en belangrijke wijzigingen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verbetering</h3>
                  <p className="text-text-secondary">
                    Om onze diensten te verbeteren en nieuwe content te ontwikkelen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Wettelijke Verplichtingen</h3>
                  <p className="text-text-secondary">
                    Om te voldoen aan fiscale en andere wettelijke verplichtingen.
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Basis */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">4. Rechtsgrond voor Verwerking</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Uitvoering Overeenkomst</h3>
                  <p className="text-text-secondary">
                    Voor het leveren van cursussen en e-books waarvoor je hebt betaald.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Toestemming</h3>
                  <p className="text-text-secondary">
                    Voor marketing e-mails en nieuwsbrieven (je kunt je altijd uitschrijven).
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Gerechtvaardigd Belang</h3>
                  <p className="text-text-secondary">
                    Voor het verbeteren van onze diensten en het voorkomen van fraude.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">5. Delen van Gegevens</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Service Providers</h3>
                  <p className="text-text-secondary">
                    Wij delen gegevens met vertrouwde partners zoals betaalproviders en hosting services, 
                    alleen voor het leveren van onze diensten.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Wettelijke Verplichtingen</h3>
                  <p className="text-text-secondary">
                    Wij kunnen gegevens delen wanneer dit wettelijk verplicht is of om onze rechten te beschermen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen Verkoop</h3>
                  <p className="text-text-secondary">
                    Wij verkopen nooit je persoonlijke gegevens aan derden.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                6. Gegevensbeveiliging
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Technische Maatregelen</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li>• SSL/TLS encryptie voor alle data overdracht</li>
                    <li>• Beveiligde servers en databases</li>
                    <li>• Regelmatige security updates</li>
                    <li>• Toegangscontrole en monitoring</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Organisatorische Maatregelen</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li>• Beperkte toegang tot persoonlijke gegevens</li>
                    <li>• Training van medewerkers over privacy</li>
                    <li>• Incident response procedures</li>
                    <li>• Regelmatige privacy audits</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                7. Je Rechten
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Toegang</h3>
                  <p className="text-text-secondary">
                    Je hebt het recht om te weten welke gegevens wij van je verwerken.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Rectificatie</h3>
                  <p className="text-text-secondary">
                    Je kunt vragen om onjuiste gegevens te corrigeren.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verwijdering</h3>
                  <p className="text-text-secondary">
                    Je kunt vragen om je gegevens te verwijderen (recht op vergetelheid).
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Beperking</h3>
                  <p className="text-text-secondary">
                    Je kunt vragen om de verwerking van je gegevens te beperken.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Gegevensportabiliteit</h3>
                  <p className="text-text-secondary">
                    Je kunt je gegevens in een gestructureerd formaat ontvangen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Bezwaar</h3>
                  <p className="text-text-secondary">
                    Je kunt bezwaar maken tegen bepaalde verwerkingen van je gegevens.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">8. Cookies en Tracking</h2>
              <p className="text-text-secondary mb-4">
                Wij gebruiken cookies om je ervaring te verbeteren en onze website te analyseren. 
                Voor meer informatie, zie onze{' '}
                <Link href="/cookies" className="text-primary hover:text-primary/80">
                  Cookie Policy
                </Link>.
              </p>
            </div>

            {/* Retention */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                9. Bewaartermijn
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account Gegevens</h3>
                  <p className="text-text-secondary">
                    Bewaard zolang je account actief is, plus 2 jaar voor wettelijke verplichtingen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Betalingsgegevens</h3>
                  <p className="text-text-secondary">
                    Bewaard volgens fiscale wetgeving (7 jaar).
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Marketing Gegevens</h3>
                  <p className="text-text-secondary">
                    Bewaard totdat je je uitschrijft of toestemming intrekt.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">10. Contact</h2>
              <p className="text-text-secondary mb-4">
                Voor vragen over deze privacy policy of je gegevens:
              </p>
              <div className="space-y-2 text-text-secondary mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>E-mail: privacy@studioinsight.nl</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Telefoon: +31 6 1234 5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>Adres: Keizersgracht 123, 1015 CJ Amsterdam</span>
                </div>
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








