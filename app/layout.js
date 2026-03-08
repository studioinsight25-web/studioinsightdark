import { Inter } from 'next/font/google';
import './globals.css';
import StickyHeader from '@/components/StickyHeader';
import DynamicFooter from '@/components/DynamicFooter';
import ErrorBoundary from '@/components/ErrorBoundary';
import DynamicAnalytics from '@/components/DynamicAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Studio Insight - AI Trading Analytics for Entrepreneurs',
    template: '%s | Studio Insight',
  },
  description: 'The platform for entrepreneurs and traders. AI Trading Analytics to take your business to the next level.',
  keywords: ['AI Trading Analytics', 'crypto', 'trading', 'entrepreneurs', 'signals', 'volatility'],
  authors: [{ name: 'Studio Insight' }],
  creator: 'Studio Insight',
  publisher: 'Studio Insight',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Studio Insight - AI Trading Analytics for Entrepreneurs',
    description: 'The platform for entrepreneurs and traders. AI Trading Analytics to take your business to the next level.',
    siteName: 'Studio Insight',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Studio Insight - AI Trading Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio Insight - AI Trading Analytics for Entrepreneurs',
    description: 'The platform for entrepreneurs and traders. AI Trading Analytics to take your business to the next level.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#059669" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Cache buster */}
        <meta name="cache-buster" content={Date.now().toString()} />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ErrorBoundary>
          <StickyHeader />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <DynamicFooter />
          <DynamicAnalytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}
