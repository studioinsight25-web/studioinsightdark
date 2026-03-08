'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [discordInvite, setDiscordInvite] = useState(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        // In a real app, you'd fetch purchases from an API
        // For now, we'll use mock data
        setPurchases([
          {
            id: '1',
            productId: 'course-1',
            productType: 'course',
            title: 'Podcast Starter Cursus',
            description: 'Leer de basis van podcasting',
            amount: 9900,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            productId: 'ebook-1',
            productType: 'ebook',
            title: 'Audio Editing Pro',
            description: 'Complete gids voor audio editing',
            amount: 1999,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDiscordInvite = async () => {
    if (!user || !user.hasAccess) return;

    setIsGeneratingInvite(true);
    try {
      const response = await fetch('/api/discord/invite');
      const data = await response.json();
      
      if (data.success) {
        setDiscordInvite(data);
      } else {
        alert(data.error || 'Er is een fout opgetreden bij het genereren van de invite');
      }
    } catch (error) {
      console.error('Discord invite error:', error);
      alert('Er is een fout opgetreden bij het genereren van de invite');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const downloadEbook = async (ebookId) => {
    try {
      const response = await fetch('/api/download/ebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ebookId }),
      });

      const data = await response.json();
      
      if (data.success) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert(data.error || 'Er is een fout opgetreden bij het downloaden');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Er is een fout opgetreden bij het downloaden');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const formatPrice = (priceInCents) => {
    return `€${(priceInCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welkom terug, {user.email}!
          </h1>
          <p className="text-dark-300">
            Hier vind je al je aankopen en toegang tot de community.
          </p>
        </div>

        {/* Discord Community Access */}
        {user.hasAccess && (
          <div className="bg-dark-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Studio Insight Community
                </h2>
                <p className="text-dark-300 text-sm">
                  Exclusieve Discord community voor leden
                </p>
              </div>
              <div>
                {discordInvite ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.open(discordInvite.inviteUrl, '_blank')}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Ga naar Discord
                    </button>
                    <button
                      onClick={() => setDiscordInvite(null)}
                      className="text-dark-400 hover:text-dark-300 text-sm"
                    >
                      Nieuwe link
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateDiscordInvite}
                    disabled={isGeneratingInvite}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    {isGeneratingInvite ? 'Genereren...' : 'Genereer Invite'}
                  </button>
                )}
              </div>
            </div>
            {discordInvite && (
              <div className="mt-4 p-3 bg-dark-700 rounded-lg">
                <p className="text-xs text-dark-400">
                  Link verloopt op: {new Date(discordInvite.expiresAt).toLocaleString('nl-NL')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Purchases */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Mijn Aankopen
          </h2>
          
          {purchases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {purchase.title}
                      </h3>
                      <p className="text-dark-300 text-sm mb-2">
                        {purchase.description}
                      </p>
                      <p className="text-dark-400 text-xs">
                        Gekocht op {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                    <span className="text-primary-500 font-semibold">
                      {formatPrice(purchase.amount)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {purchase.productType === 'course' ? (
                      <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Start Cursus
                      </button>
                    ) : (
                      <button
                        onClick={() => downloadEbook(purchase.productId)}
                        className="flex-1 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Download E-book
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nog geen aankopen
              </h3>
              <p className="text-dark-300 mb-6">
                Je hebt nog geen cursussen of e-books gekocht. Ontdek onze content!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cursus" className="btn-primary">
                  Bekijk Cursussen
                </Link>
                <Link href="/e-books" className="btn-secondary">
                  Bekijk E-books
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/cursus" className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-primary-500/50 transition-colors duration-200 group">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors duration-200">
                Cursussen
              </h3>
            </div>
            <p className="text-dark-300 text-sm">
              Ontwikkel je vaardigheden met onze professionele cursussen
            </p>
          </Link>

          <Link href="/e-books" className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-accent-500/50 transition-colors duration-200 group">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-accent-400 transition-colors duration-200">
                E-books
              </h3>
            </div>
            <p className="text-dark-300 text-sm">
              Diepgaande kennis in handige digitale boeken
            </p>
          </Link>

          <Link href="/reviews" className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-purple-500/50 transition-colors duration-200 group">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors duration-200">
                Reviews
              </h3>
            </div>
            <p className="text-dark-300 text-sm">
              Eerlijke reviews van audio- en tech-producten
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
