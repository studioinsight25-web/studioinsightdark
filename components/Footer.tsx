export default function Footer() {
  const footerLinks = [
    { name: 'Over Studio Insight', href: '/over-ons' },
    { name: 'Cursussen', href: '/cursussen' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'E-books', href: '/ebooks' },
    { name: 'Support', href: '/contact' },
  ]

  const legalLinks = [
    { name: 'Algemene Voorwaarden', href: '/voorwaarden' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ]

  return (
    <footer className="bg-dark-section py-12 border-t border-dark-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">
              Studio Insight
            </h3>
            <p className="text-text-secondary mb-4">
              Ontwikkel jouw studio, je merk en je impact met onze praktische cursussen, 
              e-books en eerlijke reviews.
            </p>
            <div className="text-text-secondary text-sm">
              <p>Keizersgracht 123</p>
              <p>1015 CJ Amsterdam</p>
              <p>info@studioinsight.nl</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Navigatie</h4>
            <nav className="space-y-2">
              {footerLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Juridisch</h4>
            <nav className="space-y-2">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="pt-8 border-t border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-secondary text-sm">
              © 2024 Studio Insight. Alle rechten voorbehouden.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-text-secondary hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="/cookies" className="text-text-secondary hover:text-primary transition-colors">
                Cookies
              </a>
              <a href="/voorwaarden" className="text-text-secondary hover:text-primary transition-colors">
                Voorwaarden
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
