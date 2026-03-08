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
        alert(data.error || 'An error occurred while generating the invite');
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
            Exclusive Discord community for members. Connect with other entrepreneurs, 
            ask questions and share your experiences.
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
                Login required
              </h2>
              <p className="text-dark-300 mb-6">
                You must be logged in to access the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login" className="btn-primary">
                  Log in
                </Link>
                <Link href="/register" className="btn-secondary">
                  Create account
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
                Community access required
              </h2>
              <p className="text-dark-300 mb-6">
                Purchase AI Trading Analytics to get access to the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/ai-trading-analytics" className="btn-primary">
                  AI Trading Analytics
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Contact
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
                  <h3 className="text-lg font-semibold text-green-400">Welcome to the community!</h3>
                  <p className="text-green-300 text-sm">
                    You have access to the exclusive Studio Insight Discord community.
                  </p>
                </div>
              </div>
            </div>

            {/* Discord Access */}
            <div className="bg-dark-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Go to Discord
              </h2>
              <p className="text-dark-300 mb-6">
                Click the button below to generate a temporary invite link for the Discord community.
                This link is valid for 24 hours.
              </p>
              
              {discordInvite ? (
                <div className="space-y-4">
                  <div className="bg-dark-700 rounded-lg p-4">
                    <p className="text-sm text-dark-300 mb-2">Your invite link:</p>
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
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-dark-400 mt-2">
                      Expires: {new Date(discordInvite.expiresAt).toLocaleString('en-US')}
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
                  {isGeneratingInvite ? 'Generating...' : 'Generate Discord Invite'}
                </button>
              )}
            </div>

            {/* Community Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">What can you expect?</h3>
                <ul className="space-y-2 text-dark-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Direct access to experts
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Exclusive content and tips
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Network with other members
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Early access to new content
                  </li>
                </ul>
              </div>
              
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Community rules</h3>
                <ul className="space-y-2 text-dark-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    Respect other members
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    Share relevant content
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    No spam or promotion
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    Help each other when possible
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
