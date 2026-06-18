import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TerraQuest — Discover India\'s Hidden Gems & AI Itineraries',
  description: 'TerraQuest is an AI-powered travel planner that helps you discover offbeat destinations, build structured budgets, and plan trips across India.',
  keywords: 'travel planner, AI itineraries, India travel, hidden places, travel budget tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-950">
      <body className={`${inter.className} flex flex-col min-h-screen text-slate-100 antialiased`}>
        {/* Header Navigation */}
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-grow flex flex-col bg-slate-950">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
