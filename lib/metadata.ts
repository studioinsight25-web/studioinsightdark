import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Studio Insight - Ontwikkel jouw studio, je merk en je impact",
    template: "%s | Studio Insight"
  },
  description: "Cursussen, e-books en reviews die je helpen om slimmer te groeien. Voor ondernemers en professionals.",
  keywords: [
    "studio",
    "cursussen", 
    "ondernemers",
    "branding",
    "content creation",
    "e-books",
    "reviews",
    "podcasten",
    "web development",
    "videobewerking",
    "content strategie"
  ],
  authors: [{ name: "Studio Insight" }],
  creator: "Studio Insight",
  publisher: "Studio Insight",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    title: "Studio Insight - Ontwikkel jouw studio, je merk en je impact",
    description: "Cursussen, e-books en reviews die je helpen om slimmer te groeien. Voor ondernemers en professionals.",
    siteName: "Studio Insight",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Studio Insight - Cursussen voor ondernemers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Insight - Ontwikkel jouw studio, je merk en je impact",
    description: "Cursussen, e-books en reviews die je helpen om slimmer te groeien.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}



