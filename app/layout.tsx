import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Analytics from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Studio Insight - Ontwikkel jouw studio, je merk en je impact",
  description: "Cursussen, e-books en reviews die je helpen om slimmer te groeien. Voor ondernemers en professionals.",
  keywords: "studio, cursussen, ondernemers, branding, content creation, e-books, reviews",
  openGraph: {
    title: "Studio Insight",
    description: "Cursussen, e-books en reviews voor ondernemers",
    type: "website",
    locale: "nl_NL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={inter.variable}>
      <body className="font-sans antialiased">
        <Analytics />
        <Header />
        {children}
      </body>
    </html>
  );
}
