'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CommunityPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [discordInvite, setDiscordInvite] = useState(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Studio Insight Community
          </h1>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Exclusieve Discord community voor leden. Connect met andere ondernemers, 
            stel vragen en deel je ervaringen.
          </p>
        </div>

        {!user ? (
          /* Not logged in */
          <div className="text-center">
            <div className="bg-dark-800 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Inloggen vereist
              </h2>
              <p className="text-dark-300 mb-6">
                Je moet ingelogd zijn om toegang te krijgen tot de community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login" className="btn-primary">
                  Inloggen
                </Link>
                <Link href="/register" className="btn-secondary">
                  Account Aanmaken
                </Link>
              </div>
            </div>
          </div>
        ) : !user.hasAccess ? (
          /* Logged in but no access */
          <div className="text-center">
            <div className="bg-dark-800 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Community toegang vereist
              </h2>
              <p className="text-dark-300 mb-6">
                Je hebt een cursus of e-book gekocht om toegang te krijgen tot de community.
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
          </div>
        ) : (
          /* Has access */
          <div className="space-y-8">
            {/* Success message */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">Welkom in de community!</h3>
                  <p className="text-green-300 text-sm">
                    Je hebt toegang tot de exclusieve Studio Insight Discord community.
                  </p>
                </div>
              </div>
            </div>

            {/* Discord Access */}
            <div className="bg-dark-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ga naar Discord
              </h2>
              <p className="text-dark-300 mb-6">
                Klik op de knop hieronder om een tijdelijke invite link te genereren voor de Discord community.
                Deze link is 24 uur geldig.
              </p>
              
              {discordInvite ? (
                <div className="space-y-4">
                  <div className="bg-dark-700 rounded-lg p-4">
                    <p className="text-sm text-dark-300 mb-2">Je invite link:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={discordInvite.inviteUrl}
                        readOnly
                        className="flex-1 bg-dark-600 text-white px-3 py-2 rounded border border-dark-500 text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(discordInvite.inviteUrl)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                      >
                        Kopiëren
                      </button>
                    </div>
                    <p className="text-xs text-dark-400 mt-2">
                      Verloopt op: {new Date(discordInvite.expiresAt).toLocaleString('nl-NL')}
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(discordInvite.inviteUrl, '_blank')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Open Discord Community
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateDiscordInvite}
                  disabled={isGeneratingInvite}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {isGeneratingInvite ? 'Genereren...' : 'Genereer Discord Invite'}
                </button>
              )}
            </div>

            {/* Community Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Wat kun je verwachten?</h3>
                <ul className="space-y-2 text-dark-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Directe toegang tot experts
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Exclusieve content en tips
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Netwerken met andere leden
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Vroege toegang tot nieuwe content
                  </li>
                </ul>
              </div>
              
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Community regels</h3>
                <ul className="space-y-2 text-dark-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    Respecteer andere leden
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    Deel relevante content
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    Geen spam of promotie
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    Help elkaar waar mogelijk
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
