'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary mb-4">404</div>
          <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Pagina niet gevonden
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Naar Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors duration-300 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-dark-border">
          <h2 className="text-lg font-semibold mb-4">Populaire Pagina's</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/cursussen"
              className="p-3 bg-dark-card rounded-lg border border-dark-border hover:border-primary transition-colors"
            >
              <div className="text-sm font-medium text-white">Cursussen</div>
            </Link>
            <Link
              href="/ebooks"
              className="p-3 bg-dark-card rounded-lg border border-dark-border hover:border-primary transition-colors"
            >
              <div className="text-sm font-medium text-white">E-books</div>
            </Link>
            <Link
              href="/reviews"
              className="p-3 bg-dark-card rounded-lg border border-dark-border hover:border-primary transition-colors"
            >
              <div className="text-sm font-medium text-white">Reviews</div>
            </Link>
            <Link
              href="/contact"
              className="p-3 bg-dark-card rounded-lg border border-dark-border hover:border-primary transition-colors"
            >
              <div className="text-sm font-medium text-white">Contact</div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

