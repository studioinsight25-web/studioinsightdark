import { getCurrentUser } from '@/lib/auth'
import { OrderService, getProduct } from '@/lib/orders'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Download, Lock, ArrowLeft, FileText, Clock, Eye } from 'lucide-react'

interface EbookPageProps {
  params: {
    id: string
  }
}

export default async function EbookPage({ params }: EbookPageProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/inloggen')
  }

  const product = getProduct(params.id)
  
  if (!product || product.type !== 'ebook') {
    redirect('/ebooks')
  }

  const hasAccess = OrderService.hasAccessToProduct(user.id, params.id)

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/ebooks"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar e-books
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-text-secondary">
              Je hebt geen toegang tot dit e-book. Koop het e-book om toegang te krijgen.
            </p>
          </div>
        </section>

        {/* Access Denied */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border max-w-md mx-auto">
              <Lock className="w-16 h-16 text-text-secondary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Toegang Vereist</h2>
              <p className="text-text-secondary mb-6">
                Je hebt dit e-book nog niet gekocht. Koop het e-book om toegang te krijgen tot de volledige inhoud.
              </p>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {product.price === 0 ? 'Gratis' : `€${(product.price / 100).toFixed(2)}`}
                </div>
                <Link
                  href="/ebooks"
                  className="w-full bg-primary text-black py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {product.price === 0 ? 'Gratis Downloaden' : 'Koop E-book'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // E-book content for users with access
  const ebookContent = getEbookContent(params.id)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link
            href="/ebooks"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar e-books
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {product.name}
          </h1>
          <p className="text-text-secondary mb-4">
            Door Studio Insight
          </p>
          <p className="text-text-secondary">
            {product.description}
          </p>
        </div>
      </section>

      {/* E-book Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* E-book Reader */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
                <div className="aspect-[3/4] bg-dark-section rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-text-secondary mb-4">
                      E-book beschikbaar voor download
                    </p>
                    <button className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center gap-2 mx-auto">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">E-book Inhoud</h2>
                  <div className="text-sm text-text-secondary">
                    {ebookContent.pages} pagina's
                  </div>
                </div>
              </div>

              {/* E-book Description */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">Over dit e-book</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-text-secondary leading-relaxed mb-4">
                    {getEbookDescription(params.id)}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Wat je leert:</h4>
                    <ul className="space-y-1 text-text-secondary">
                      {ebookContent.learningPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* E-book Sidebar */}
            <div className="space-y-6">
              {/* Download Options */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">Download Opties</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors flex items-center gap-3">
                    <Download className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-white font-medium">PDF Versie</span>
                      <p className="text-xs text-text-secondary">Hoge kwaliteit</p>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors flex items-center gap-3">
                    <Download className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-white font-medium">EPUB Versie</span>
                      <p className="text-xs text-text-secondary">Voor e-readers</p>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors flex items-center gap-3">
                    <Download className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-white font-medium">Mobi Versie</span>
                      <p className="text-xs text-text-secondary">Voor Kindle</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* E-book Info */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">E-book Informatie</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Pagina's:</span>
                    <span className="font-semibold">{ebookContent.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Leestijd:</span>
                    <span className="font-semibold">{ebookContent.readingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Formaat:</span>
                    <span className="font-semibold">PDF, EPUB, MOBI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Taal:</span>
                    <span className="font-semibold">Nederlands</span>
                  </div>
                </div>
              </div>

              {/* Related E-books */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold mb-4">Gerelateerde E-books</h3>
                <div className="space-y-3">
                  <Link
                    href="/ebooks/ebook-content"
                    className="block p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors"
                  >
                    <h4 className="font-medium text-white">Content strategie gids</h4>
                    <p className="text-sm text-text-secondary">€19.00</p>
                  </Link>
                  <Link
                    href="/ebooks/ebook-branding"
                    className="block p-3 bg-dark-section rounded-lg border border-dark-border hover:border-primary transition-colors"
                  >
                    <h4 className="font-medium text-white">Branding handboek</h4>
                    <p className="text-sm text-text-secondary">€25.00</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Helper functions
function getEbookContent(ebookId: string) {
  const content: Record<string, any> = {
    'ebook-email': {
      pages: 45,
      readingTime: '2 uur',
      learningPoints: [
        'Effectieve e-mail campagnes opzetten',
        'Open rates en click-through rates verbeteren',
        'E-mail automatisering implementeren',
        'A/B testing voor e-mails',
        'E-mail lijst groei strategieën'
      ]
    },
    'ebook-seo': {
      pages: 62,
      readingTime: '3 uur',
      learningPoints: [
        'Zoekmachine optimalisatie basics',
        'Keyword research technieken',
        'On-page SEO optimalisatie',
        'Link building strategieën',
        'SEO analytics en monitoring'
      ]
    },
    'ebook-content': {
      pages: 78,
      readingTime: '4 uur',
      learningPoints: [
        'Content strategie ontwikkelen',
        'Content planning en kalender',
        'Content creatie processen',
        'Content distributie kanalen',
        'Content performance meten'
      ]
    },
    'ebook-branding': {
      pages: 56,
      readingTime: '3 uur',
      learningPoints: [
        'Merkidentiteit ontwikkelen',
        'Logo en visuele identiteit',
        'Brand voice en messaging',
        'Brand consistency',
        'Brand monitoring en management'
      ]
    }
  }
  
  return content[ebookId] || {
    pages: 50,
    readingTime: '2.5 uur',
    learningPoints: ['Praktische tips en strategieën', 'Stap-voor-stap gidsen', 'Case studies en voorbeelden']
  }
}

function getEbookDescription(ebookId: string): string {
  const descriptions: Record<string, string> = {
    'ebook-email': 'Een uitgebreide gids voor e-mail marketing die je helpt om effectieve e-mail campagnes op te zetten en je ROI te maximaliseren. Leer van experts en implementeer bewezen strategieën.',
    'ebook-seo': 'De complete gids voor zoekmachine optimalisatie. Van basis concepten tot geavanceerde technieken. Leer hoe je je website hoger in Google krijgt en meer organisch verkeer genereert.',
    'ebook-content': 'Ontwikkel een winnende content strategie die je merk helpt groeien. Deze gids behandelt alle aspecten van content marketing, van planning tot uitvoering en meting.',
    'ebook-branding': 'Creëer een sterke merkidentiteit die opvalt en blijft hangen. Leer hoe je een consistent merk opbouwt dat je doelgroep aanspreekt en vertrouwen wekt.'
  }
  
  return descriptions[ebookId] || 'Een praktische gids vol tips en strategieën die je helpen om je doelen te bereiken.'
}

