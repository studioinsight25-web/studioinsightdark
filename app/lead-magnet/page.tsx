import LeadMagnetForm from '@/components/LeadMagnetForm'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Download de gratis gids: 15 zichtbaarheid-acties zonder advertenties | Studio Insight',
  description: 'Ontvang een gratis gids met 15 zichtbaarheid-acties die je vandaag nog kunt implementeren. Inclusief opvolgsequentie, bonusresources en templates.'
}

const highlights = [
  {
    title: '15 zichtbaarheid-acties',
    description: 'Concreet en toepasbaar. Iedere actie kun je in 30-45 minuten afronden, zonder advertentiebudget.'
  },
  {
    title: 'Directe templates',
    description: 'Format voor social posts, e-mails en stories zodat je niet vanaf een leeg scherm hoeft te starten.'
  },
  {
    title: 'Mini-tracker',
    description: 'Houd je voortgang bij en zie welke tactieken het snelst resultaat opleveren.'
  }
]

const productSpotlights = [
  {
    title: 'Contentkalender 90 dagen',
    description: 'Plan je zichtbaarheid voor de komende drie maanden met bewezen formats en ritme.',
    href: '/products'
  },
  {
    title: 'E-book: Storytelling voor experts',
    description: 'Verander je expertise in verhalen die onthouden en gedeeld worden.',
    href: '/ebooks'
  },
  {
    title: 'Live sessie: Zichtbaarheid Q&A',
    description: 'Stel je vragen live en krijg direct advies voor jouw situatie.',
    href: '/courses'
  }
]

export default function LeadMagnetPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                Nieuw • Gratis gids
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Download de gratis gids: 15 zichtbaarheid-acties zonder advertenties
              </h1>
              <p className="text-lg text-text-secondary max-w-xl">
                Ontvang 15 praktische acties waarmee je vandaag al nieuwe leads aantrekt. Geen marketing-jargon, maar concrete scripts, visuals en opvolgtemplates die in de praktijk werken.
              </p>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Perfect voor coaches, creatieve studio’s en consultants die constant zichtbaar willen zijn.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Inclusief opvolgsequentie: bevestigingsmail, check-in na 2 dagen en tripwire-aanbieding.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Bonus: checklist voor socials + e-mail templates om meteen te testen.</span>
                </li>
              </ul>
            </div>

            <div>
              <LeadMagnetForm />
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted value */}
      <section className="py-20 border-t border-dark-border/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item) => (
              <div key={item.title} className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-3">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow timeline */}
      <section className="py-20 bg-gradient-to-b from-dark-section/40 via-transparent to-transparent">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-12 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Zo haal je alles uit de gids</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Gebruik de opvolgflow om nieuwe leads te verwarmen en door te stromen naar je producten en diensten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">1</span>
              <h3 className="text-xl font-semibold text-white">Automatische levering</h3>
              <p className="text-text-secondary text-sm">Bevestigingsmail met directe downloadlink zodat nieuwe contacten meteen waarde ervaren.</p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">2</span>
              <h3 className="text-xl font-semibold text-white">Check-in na 2 dagen</h3>
              <p className="text-text-secondary text-sm">Vraag welke actie ze al geprobeerd hebben, nodig uit om een resultaat te delen en bied extra tips.</p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">3</span>
              <h3 className="text-xl font-semibold text-white">Introductie tripwire</h3>
              <p className="text-text-secondary text-sm">Promoot een laagdrempelige aanbieding (cheatsheet + templates) met een tijdgebonden bonus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product spotlights */}
      <section className="py-20 border-t border-dark-border/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Meer manieren om zichtbaar te blijven</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Zet de energie van je nieuwe leads door naar producten die perfect aansluiten op de gids.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productSpotlights.map((spotlight) => (
              <div key={spotlight.title} className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-white">{spotlight.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{spotlight.description}</p>
                </div>
                <Link
                  href={spotlight.href}
                  className="inline-flex items-center justify-center gap-2 text-primary font-semibold border border-primary/50 rounded-lg px-4 py-2 hover:bg-primary hover:text-black transition-colors"
                >
                  Ontdek meer
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Veelgestelde vragen</h2>
            <p className="text-text-secondary">Alles wat je wilt weten over de gids en opvolging.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Hoe ontvang ik de gids?</h3>
              <p className="text-text-secondary text-sm">Na je inschrijving ontvang je een bevestigingsmail. Zodra je die bevestigt, sturen we direct de downloadlink en kun je aan de slag.</p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Kan ik de opvolgemails aanpassen?</h3>
              <p className="text-text-secondary text-sm">Ja, je kunt de templates inzetten in MailerLite, Beehiiv of je eigen e-mailtool. We leveren koppen, CTA’s en timing-suggesties zodat je ze eenvoudig personaliseert.</p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Wat als ik al een lead magnet heb?</h3>
              <p className="text-text-secondary text-sm">Gebruik de acties als upgrade voor je huidige magnet, of koppel de gids als bonus aan je bestaande aanbod. De templates werken ook zelfstandig.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary/15 via-transparent to-transparent">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ben je klaar voor constante zichtbaarheid?</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Sluit je aan bij honderden ondernemers die zichtbaar blijven zonder advertenties. Download de gids en start vandaag met acties die werken.
          </p>
          <div className="max-w-xl mx-auto">
            <LeadMagnetForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


