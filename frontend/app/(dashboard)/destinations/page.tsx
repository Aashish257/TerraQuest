/**
 * page.tsx — Destinations Explore Page Placeholder
 *
 * Exposes a placeholder content screen for verifying dashboard routes.
 */

import Link from 'next/link';
import { Compass, Sparkles, Plus } from 'lucide-react';

export default function DestinationsPlaceholder() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5">
        <Compass className="h-8 w-8" />
      </div>
      
      <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
        Explore Destinations
      </h1>
      
      <p className="mt-4 text-sm text-slate-400 max-w-md">
        Here you will find a curated collection of travel spots in India. Full search, filter, and pagination capabilities will launch in Phase 2.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          href="/"
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/register"
          className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-teal-400 hover:to-indigo-500 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Start AI Planning</span>
        </Link>
      </div>
    </div>
  );
}
