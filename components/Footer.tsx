'use client'

import dynamic from 'next/dynamic'
import { Mail, MapPin, Phone } from 'lucide-react'

const NewsletterSignup = dynamic(() => import('./NewsletterSignup'), { ssr: false })

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
    <footer className="bg-dark-section py-16 border-t border-dark-border">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-primary mb-4">
                Studio Insight
              </h3>
              <p className="text-text-secondary text-lg leading-relaxed max-w-md">
                Ontwikkel jouw studio, je merk en je impact met onze praktische cursussen, 
                e-books en eerlijke reviews.
              </p>
            </div>
            
            {/* Contact Information with Icons */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-text-secondary">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Adres</p>
                  <p>De Veken 122b</p>
                  <p>1716KG Opmeer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <a 
                    href="mailto:info@studio-insight.nl"
                    className="hover:text-primary transition-colors"
                  >
                    info@studio-insight.nl
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-text-secondary">
                <div className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">KVK</p>
                  <p>59161264</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <NewsletterSignup />
          </div>

          {/* Navigation Section */}
          <div className="lg:col-span-1">
            <h4 className="text-xl font-semibold text-white mb-6">Navigatie</h4>
            <nav className="space-y-3">
              {footerLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-text-secondary hover:text-primary transition-colors duration-300 text-lg"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-8 border-t border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-text-secondary text-sm">
                © 2024 Studio Insight. Alle rechten voorbehouden.
              </p>
              <p className="text-text-secondary text-sm">
                KVK: 59161264
              </p>
            </div>
            <nav className="flex gap-8 text-sm">
              {legalLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}