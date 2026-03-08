'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StickyHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Cursussen', href: '/cursus' },
    { name: 'E-books', href: '/e-books' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Community', href: '/community' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-500">Studio Insight</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-dark-200 hover:text-primary-400 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 bg-dark-700 rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-dark-200 hover:text-primary-400 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-dark-200 hover:text-red-400 transition-colors duration-200"
                >
                  Uitloggen
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-dark-200 hover:text-primary-400 transition-colors duration-200"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Registreren
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-dark-200 hover:text-primary-400 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-800 rounded-lg mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-dark-200 hover:text-primary-400 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-dark-700 pt-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-dark-200 hover:text-primary-400 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-dark-200 hover:text-red-400 transition-colors duration-200"
                    >
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-dark-200 hover:text-primary-400 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Inloggen
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-dark-200 hover:text-primary-400 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registreren
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
