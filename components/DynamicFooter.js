'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DynamicFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Simple email validation
    if (!email.includes('@')) {
      setMessage('Voer een geldig e-mailadres in');
      setIsSubmitting(false);
      return;
    }

    // Simulate newsletter signup
    setTimeout(() => {
      setMessage('Bedankt voor je aanmelding!');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Over Studio Insight */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Over Studio Insight</h3>
            <p className="text-dark-300 text-sm leading-relaxed">
              Het platform voor ondernemers, podcasters en contentmakers. 
              Kwalitatieve cursussen, e-books en reviews om je business naar het volgende niveau te tillen.
            </p>
          </div>

          {/* Producten */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Producten</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cursus" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Cursussen <span className="text-primary-500">(3)</span>
                </Link>
              </li>
              <li>
                <Link href="/e-books" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  E-books <span className="text-primary-500">(3)</span>
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Reviews <span className="text-primary-500">(6)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Populaire Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Populaire Reviews</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/reviews/shure-sm7b" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Shure SM7B Review
                </Link>
              </li>
              <li>
                <Link href="/reviews/rode-podmic" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Rode PodMic Review
                </Link>
              </li>
              <li>
                <Link href="/reviews/audio-technica-at2020" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Audio-Technica AT2020
                </Link>
              </li>
            </ul>
          </div>

          {/* Cursussen */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Cursussen</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cursus/podcast-starter" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Podcast Starter
                </Link>
              </li>
              <li>
                <Link href="/cursus/audio-editing" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Audio Editing Pro
                </Link>
              </li>
              <li>
                <Link href="/cursus/content-strategy" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Content Strategy
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Voorwaarden
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Retourbeleid
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Blijf op de hoogte</h3>
            <p className="text-dark-300 text-sm mb-4">
              Ontvang updates over nieuwe cursussen, e-books en reviews.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Je e-mailadres"
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? '...' : 'Aanmelden'}
              </button>
            </form>
            {message && (
              <p className={`mt-2 text-sm ${message.includes('Bedankt') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-dark-700">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap items-center gap-6 text-sm text-dark-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                100% Veilig
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Veilig Betalen
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Bewezen Methode
              </span>
            </div>
            <div className="text-sm text-dark-400">
              © 2024 Studio Insight. Alle rechten voorbehouden.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
