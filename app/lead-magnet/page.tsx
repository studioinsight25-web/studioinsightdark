export const metadata = {
  title: 'Download de gratis gids: 15 zichtbaarheid-acties zonder advertenties | Studio Insight',
  description: 'Ontvang een gratis gids met 15 zichtbaarheid-acties die je vandaag nog kunt implementeren. Inclusief opvolgsequentie, bonusresources en templates.'
}

const visibilityTips = [
  'Start elke week met een zichtbaarheidssprint van twee uur waarin je content creëert voor de komende dagen.',
  'Publiceer minimaal drie social posts per week met een duidelijke expertisehoek en uitnodiging tot reactie.',
  'Gebruik stories of reels om één behind-the-scenes moment te delen waarmee volgers de mens achter je merk leren kennen.',
  'Vraag iedere nieuwe volger om een korte introductie via DM en nodig ze uit voor een mini-call of resource.',
  'Herwerk één lange vorm artikel of podcast per maand in meerdere snackable contentstukken om je bereik te vergroten.',
  'Plan een wekelijks live-moment (Instagram, LinkedIn of YouTube) waarin je één vraag van je doelgroep beantwoordt.',
  'Maak een lijst van tien relevante communities of groepen en deel daar elke week waardevolle inzichten zonder salespitch.',
  'Voeg onder iedere post een mini-CTA toe naar je lead magnet, wachtlijst of kennismakingsgesprek.',
  'Stuur elke week een korte nieuwsbrief met één tip, één reflectievraag en één link naar een relevant aanbod.',
  'Gebruik testimonials of mini-cases in je content om concreet resultaat zichtbaar te maken.',
  'Zoek één partner per maand voor een gezamenlijke live of guest post om elkaars bereik te versterken.',
  'Plan één kwartaalcampagne rond een specifiek thema en bouw daar al je zichtbaarheidstaken omheen.',
  'Meet iedere week drie kerncijfers: nieuwe leads, aantal gesprekken en afspraken die uit je zichtbaarheid komen.',
  'Optimaliseer je LinkedIn- of Instagram-profiel zodat bezoekers direct snappen wat je aanbiedt en hoe ze contact opnemen.',
  'Voeg een herinneringstelling aan je agenda toe om maandelijks je resultaten te evalueren en de volgende zichtbaarheid-acties te kiezen.'
]

export default function LeadMagnetPage() {
  return (
    <main className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            15 zichtbaarheid-acties uit onze gratis gids
          </h1>
          <p className="text-lg text-text-secondary">
            Deze gids helpt creatieve ondernemers, coaches en consultants om zonder advertenties zichtbaar te blijven. Elke tip is direct toepasbaar en ontworpen om nieuwe gesprekken, leads en klanten op te leveren.
          </p>
        </header>

        <section className="space-y-6">
          <p className="text-text-secondary">
            Hieronder vind je de volledige lijst met 15 acties. Print ze uit, plan ze in en herhaal wat voor jou werkt. Zo bouw je stap voor stap een consistente zichtbaarheid rondom jouw expertise.
          </p>

          <ol className="space-y-5 list-decimal list-inside text-text-secondary">
            {visibilityTips.map((tip, index) => (
              <li key={index} className="leading-relaxed">{tip}</li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}


