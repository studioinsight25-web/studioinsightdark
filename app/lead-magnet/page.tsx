import LeadMagnetForm from '@/components/LeadMagnetForm'

export const metadata = {
  title: 'Download de gratis gids: 15 zichtbaarheid-acties zonder advertenties | Studio Insight',
  description: 'Ontvang een gratis gids met 15 zichtbaarheid-acties die je vandaag nog kunt implementeren. Inclusief opvolgsequentie, bonusresources en templates.'
}

export default function LeadMagnetPage() {
  return (
    <main className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
            Gratis gids
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            De 15 zichtbaarheid-acties die werken in 2025
          </h1>
          <p className="text-lg text-text-secondary">
            In onze gratis gids lees je precies welke vijftien acties wij aanraden om zonder advertenties zichtbaar te blijven. We geven je de strategie, voorbeeldcopy en een mini-actieplanner zodat je ze direct kunt toepassen.
          </p>
          <div className="space-y-4 text-text-secondary">
            <p className="font-semibold text-white">Inside de gids:</p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Social, e-mail en partnership tactieken die je in minder dan een uur per week kunt uitvoeren.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Voorbeeldscripts waarmee je direct een post, mail of DM kunt versturen.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Een overzicht van hoe je alle 15 acties plant zodat je zichtbaar blijft zonder overdrive.</span>
              </li>
            </ul>
          </div>
          <p className="text-text-secondary">
            Schrijf je hieronder in voor de gratis gids. Je ontvangt de downloadlink meteen in je inbox, plus een korte opvolgserie met extra tips.
          </p>
        </div>

        <LeadMagnetForm />
      </div>
    </main>
  )
}


