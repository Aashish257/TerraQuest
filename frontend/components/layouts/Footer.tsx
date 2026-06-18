/**
 * Footer.tsx — Standard Footer Component
 *
 * Provides links and copyright statement for TerraQuest.
 */

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950 py-8 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        
        {/* Logo/Info */}
        <div className="flex flex-col items-center md:items-start space-y-1">
          <span className="text-lg font-bold text-white tracking-wider">TerraQuest</span>
          <span className="text-xs text-slate-500">Your AI-powered Indian travel companion.</span>
        </div>

        {/* Links */}
        <div className="flex space-x-6 text-sm">
          <Link href="/destinations" className="hover:text-teal-400 transition-colors">
            Destinations
          </Link>
          <Link href="/trips" className="hover:text-teal-400 transition-colors">
            Trips
          </Link>
          <Link href="/ai-planner" className="hover:text-teal-400 transition-colors">
            AI Planner
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} TerraQuest. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
