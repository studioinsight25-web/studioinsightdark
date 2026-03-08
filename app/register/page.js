'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters lang zijn');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Er is een fout opgetreden bij het aanmaken van je account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Er is een fout opgetreden bij het aanmaken van je account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <Link href="/" className="text-3xl font-bold text-primary-500">
              Studio Insight
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Maak een account aan
          </h2>
          <p className="mt-2 text-center text-sm text-dark-300">
            Of{' '}
            <Link
              href="/login"
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              log in op je bestaande account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200">
                E-mailadres
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="je@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200">
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Minimaal 8 karakters"
              />
              <p className="mt-1 text-xs text-dark-400">
                Wachtwoord moet minimaal 8 karakters bevatten met hoofdletters, kleine letters en cijfers
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200">
                Bevestig wachtwoord
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Herhaal je wachtwoord"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-dark-400">
              Door een account aan te maken, ga je akkoord met onze{' '}
              <Link href="/terms" className="text-primary-400 hover:text-primary-300">
                voorwaarden
              </Link>{' '}
              en{' '}
              <Link href="/privacy" className="text-primary-400 hover:text-primary-300">
                privacybeleid
              </Link>
              .
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-dark-400 hover:text-dark-300 transition-colors duration-200"
            >
              ← Terug naar home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
