// This file defines the root HTML layout, font setup, and provider wrappers for the application.
import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'TerraQuest — AI-Powered Travel Planning for India',
  description:
    'TerraQuest uses cutting-edge AI to craft personalized itineraries, connect you with verified local guides, and help you explore India\'s most extraordinary destinations.',
  keywords: 'travel planner, AI itineraries, India travel, local guides, hidden destinations, budget tracker',
  openGraph: {
    title: 'TerraQuest — AI-Powered Travel Planning',
    description: 'Craft impeccable itineraries with AI. Connect with local experts. Discover hidden India.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${outfit.variable} ${dmSans.variable}`}>
      <body
        style={{ fontFamily: 'var(--font-dm-sans, DM Sans), system-ui, sans-serif' }}
        className="flex flex-col min-h-[100dvh] bg-[#09090b] text-zinc-100 antialiased"
      >
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
