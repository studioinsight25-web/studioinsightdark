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
      setMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Simulate newsletter signup
    setTimeout(() => {
      setMessage('Thank you for subscribing!');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* About Studio Insight */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">About Studio Insight</h3>
            <p className="text-dark-300 text-sm leading-relaxed">
              The platform for entrepreneurs and traders. 
              AI Trading Analytics to take your business to the next level.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/ai-trading-analytics" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  AI Trading Analytics
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
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Stay updated</h3>
            <p className="text-dark-300 text-sm mb-4">
              Receive updates about AI Trading Analytics.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? '...' : 'Subscribe'}
              </button>
            </form>
            {message && (
              <p className={`mt-2 text-sm ${message.includes('Thank you') ? 'text-green-400' : 'text-red-400'}`}>
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
                100% Secure
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Proven Method
              </span>
            </div>
            <div className="text-sm text-dark-400">
              © 2024 Studio Insight. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
