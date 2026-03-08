'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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
        alert(data.error || 'An error occurred while generating the invite');
      }
    } catch (error) {
      console.error('Discord invite error:', error);
      alert('An error occurred while generating the invite');
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user.email}!
          </h1>
          <p className="text-dark-300">
            Here you&apos;ll find access to the community.
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
                  Exclusive Discord community for members
                </p>
              </div>
              <div>
                {discordInvite ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.open(discordInvite.inviteUrl, '_blank')}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Go to Discord
                    </button>
                    <button
                      onClick={() => setDiscordInvite(null)}
                      className="text-dark-400 hover:text-dark-300 text-sm"
                    >
                      New link
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateDiscordInvite}
                    disabled={isGeneratingInvite}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    {isGeneratingInvite ? 'Generating...' : 'Generate Invite'}
                  </button>
                )}
              </div>
            </div>
            {discordInvite && (
              <div className="mt-4 p-3 bg-dark-700 rounded-lg">
                <p className="text-xs text-dark-400">
                  Link expires: {new Date(discordInvite.expiresAt).toLocaleString('en-US')}
                </p>
              </div>
            )}
          </div>
        )}

        {!user.hasAccess && (
          <div className="bg-dark-800 rounded-lg p-8 mb-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Community access required
            </h2>
            <p className="text-dark-300 mb-6">
              Get AI Trading Analytics access to join the exclusive Discord community.
            </p>
            <Link href="/ai-trading-analytics" className="btn-primary">
              AI Trading Analytics
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6">
          <Link href="/ai-trading-analytics" className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-primary-500/50 transition-colors duration-200 group">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors duration-200">
                AI Trading Analytics
              </h3>
            </div>
            <p className="text-dark-300 text-sm">
              AI-powered trading insights and signal systems for crypto markets
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
