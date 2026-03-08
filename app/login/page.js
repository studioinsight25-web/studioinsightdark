'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Er is een fout opgetreden bij het inloggen');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Er is een fout opgetreden bij het inloggen');
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
            Inloggen op je account
          </h2>
          <p className="mt-2 text-center text-sm text-dark-300">
            Of{' '}
            <Link
              href="/register"
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              maak een nieuw account aan
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
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Je wachtwoord"
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
              {isLoading ? 'Inloggen...' : 'Inloggen'}
            </button>
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
