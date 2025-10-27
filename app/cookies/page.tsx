import Link from 'next/link'
import { Cookie, Settings, BarChart, Shield, Eye, Clock, Database } from 'lucide-react'

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Cookie Policy
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
                <Cookie className="w-6 h-6 text-primary" />
                Wat zijn Cookies?
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Cookies zijn kleine tekstbestanden die op je computer of mobiele apparaat worden opgeslagen 
                wanneer je onze website bezoekt. Ze helpen ons om je ervaring te verbeteren en onze website 
                beter te begrijpen.
              </p>
            </div>

            {/* Cookie Types */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">1. Soorten Cookies die Wij Gebruiken</h2>
              
              {/* Essential Cookies */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Essentiële Cookies
                </h3>
                <p className="text-text-secondary mb-3">
                  Deze cookies zijn noodzakelijk voor het functioneren van onze website en kunnen niet worden uitgeschakeld.
                </p>
                <div className="bg-dark-section rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white font-medium mb-1">auth-token</p>
                      <p className="text-text-secondary">Houdt je ingelogd</p>
                      <p className="text-text-secondary">Bewaartijd: 7 dagen</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">session-id</p>
                      <p className="text-text-secondary">Website functionaliteit</p>
                      <p className="text-text-secondary">Bewaartijd: Sessie</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-primary" />
                  Analytics Cookies
                </h3>
                <p className="text-text-secondary mb-3">
                  Deze cookies helpen ons om te begrijpen hoe bezoekers onze website gebruiken.
                </p>
                <div className="bg-dark-section rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white font-medium mb-1">_ga</p>
                      <p className="text-text-secondary">Google Analytics</p>
                      <p className="text-text-secondary">Bewaartijd: 2 jaar</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">_gid</p>
                      <p className="text-text-secondary">Google Analytics</p>
                      <p className="text-text-secondary">Bewaartijd: 24 uur</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Functionele Cookies
                </h3>
                <p className="text-text-secondary mb-3">
                  Deze cookies onthouden je voorkeuren en verbeteren je ervaring.
                </p>
                <div className="bg-dark-section rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white font-medium mb-1">theme-preference</p>
                      <p className="text-text-secondary">Donkere/lichte modus</p>
                      <p className="text-text-secondary">Bewaartijd: 1 jaar</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">language</p>
                      <p className="text-text-secondary">Taal voorkeur</p>
                      <p className="text-text-secondary">Bewaartijd: 1 jaar</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Marketing Cookies
                </h3>
                <p className="text-text-secondary mb-3">
                  Deze cookies worden gebruikt om relevante advertenties te tonen.
                </p>
                <div className="bg-dark-section rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white font-medium mb-1">_fbp</p>
                      <p className="text-text-secondary">Facebook Pixel</p>
                      <p className="text-text-secondary">Bewaartijd: 3 maanden</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">ads-preferences</p>
                      <p className="text-text-secondary">Advertentie voorkeuren</p>
                      <p className="text-text-secondary">Bewaartijd: 1 jaar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Party */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">2. Cookies van Derden</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Google Analytics</h3>
                  <p className="text-text-secondary">
                    Wij gebruiken Google Analytics om website gebruik te analyseren. 
                    <Link href="https://policies.google.com/privacy" className="text-primary hover:text-primary/80 ml-1">
                      Lees meer over Google's privacy policy
                    </Link>.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Social Media</h3>
                  <p className="text-text-secondary">
                    Social media knoppen kunnen cookies plaatsen. Deze worden beheerd door de respectievelijke platforms.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Embedded Content</h3>
                  <p className="text-text-secondary">
                    Video's en andere embedded content kunnen cookies plaatsen van de oorspronkelijke providers.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookie Management */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                3. Cookie Beheer
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Browser Instellingen</h3>
                  <p className="text-text-secondary mb-3">
                    Je kunt cookies beheren via je browser instellingen:
                  </p>
                  <ul className="space-y-2 text-text-secondary ml-4">
                    <li>• <strong>Chrome:</strong> Instellingen → Privacy en beveiliging → Cookies</li>
                    <li>• <strong>Firefox:</strong> Opties → Privacy en beveiliging → Cookies</li>
                    <li>• <strong>Safari:</strong> Voorkeuren → Privacy → Cookies</li>
                    <li>• <strong>Edge:</strong> Instellingen → Cookies en site machtigingen</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Cookie Banner</h3>
                  <p className="text-text-secondary">
                    Bij je eerste bezoek kun je je cookie voorkeuren instellen via onze cookie banner.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Opt-out Links</h3>
                  <div className="space-y-2 text-text-secondary">
                    <p>• <Link href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:text-primary/80">Google Analytics Opt-out</Link></p>
                    <p>• <Link href="https://www.facebook.com/settings?tab=ads" className="text-primary hover:text-primary/80">Facebook Ad Preferences</Link></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6">4. Impact van Cookie Uitschakeling</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Essentiële Cookies</h3>
                  <p className="text-text-secondary">
                    Het uitschakelen van essentiële cookies kan ervoor zorgen dat onze website niet goed functioneert.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Cookies</h3>
                  <p className="text-text-secondary">
                    Zonder analytics cookies kunnen wij niet zien hoe onze website wordt gebruikt en deze verbeteren.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Functionele Cookies</h3>
                  <p className="text-text-secondary">
                    Je voorkeuren worden niet onthouden en je moet deze bij elk bezoek opnieuw instellen.
                  </p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                5. Updates van deze Policy
              </h2>
              <p className="text-text-secondary">
                Wij kunnen deze cookie policy van tijd tot tijd bijwerken. Belangrijke wijzigingen worden 
                gecommuniceerd via onze website of per e-mail. We raden aan om deze pagina regelmatig te 
                controleren voor updates.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <h2 className="text-2xl font-bold mb-6">6. Contact</h2>
              <p className="text-text-secondary mb-4">
                Voor vragen over cookies of deze policy:
              </p>
              <div className="space-y-2 text-text-secondary mb-6">
                <p>E-mail: privacy@studioinsight.nl</p>
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
                  href="/privacy"
                  className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

