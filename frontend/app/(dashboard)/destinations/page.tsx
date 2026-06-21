'use client';

/**
 * page.tsx — Explore Destinations Dashboard Screen
 *
 * Fetches and displays seeded travel destinations.
 * Supports:
 * - Case-insensitive text search.
 * - Activity tag filtering.
 * - Budget tier selectors.
 * - Full pagination controls.
 * Elegant loader states, responsive card grid layout.
 */

import { useEffect, useState, useCallback } from 'react';
import DestinationCard, { Destination } from '@/components/shared/DestinationCard';
import api from '@/lib/api';
import { Compass, Search, Loader2, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Status indicators
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // List of standard activity chips to show
  const activities = ['Beach', 'Trekking', 'Water Sports', 'Nightlife', 'Heritage', 'Yoga', 'Adventure'];

  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params: any = {
        page,
        limit: 6,
      };

      if (search.trim()) {
        params.search = search;
      }
      if (selectedActivity) {
        params.activity = selectedActivity;
      }
      if (selectedBudget) {
        params.budget = selectedBudget;
      }

      const response = await api.get('/destinations', { params });
      
      if (response.data.success) {
        setDestinations(response.data.destinations);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (err: any) {
      console.error('Error fetching destinations:', err);
      setErrorMsg('Could not load destinations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedActivity, selectedBudget]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Reset filters
  const handleReset = () => {
    setSearch('');
    setSelectedActivity('');
    setSelectedBudget('');
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col justify-start">

      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-950/60 via-slate-950 to-indigo-950/30 border-b border-white/5 px-4 sm:px-6 lg:px-8 py-12">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -left-10 h-60 w-60 rounded-full bg-teal-500/5 blur-3xl" />
          <div className="absolute -bottom-10 right-20 h-60 w-80 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-bold text-teal-400 uppercase tracking-widest mb-3">
                <Compass className="h-3 w-3" />
                Explore India
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                <span className="text-white">Discover </span>
                <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                  Hidden Gems
                </span>
              </h1>
              <p className="mt-3 text-slate-400 max-w-lg">
                From sun-kissed beaches to misty mountain trails — explore curated destinations and guide-discovered secret spots across India.
              </p>
              {!isLoading && totalRecords > 0 && (
                <p className="mt-2 text-xs text-slate-500 font-semibold">
                  <span className="text-teal-400 font-bold">{totalRecords}</span> destinations available to explore
                </p>
              )}
            </div>

            {/* Quick stat chips */}
            <div className="flex flex-wrap gap-2">
              {activities.slice(0, 4).map((act) => (
                <button
                  key={act}
                  onClick={() => { setSelectedActivity(selectedActivity === act ? '' : act); setPage(1); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                    selectedActivity === act
                      ? 'border-teal-500 bg-teal-500/15 text-teal-400'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
      
      {/* Reset Filters CTA */}
      {(search || selectedActivity || selectedBudget) && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}

      {/* Search and Filter Inputs Block */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 bg-slate-900/25 border border-white/5 p-6 rounded-2xl backdrop-blur-md">
        
        {/* Text Search Input */}
        <div className="relative">
          <label htmlFor="search" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Search Spot
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg bg-slate-950 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              placeholder="e.g. Goa, trekking..."
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Budget tier selector dropdown */}
        <div>
          <label htmlFor="budget" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Budget Tier
          </label>
          <select
            id="budget"
            value={selectedBudget}
            onChange={(e) => {
              setSelectedBudget(e.target.value);
              setPage(1);
            }}
            className="mt-2 block w-full rounded-lg bg-slate-950 border border-white/10 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          >
            <option value="">All Budgets</option>
            <option value="low">Low (&lt; ₹2,500/day)</option>
            <option value="medium">Medium (₹2,500 - ₹4,000/day)</option>
            <option value="high">High (&gt; ₹4,000/day)</option>
          </select>
        </div>

        {/* Activity selector dropdown */}
        <div>
          <label htmlFor="activity" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Key Activity
          </label>
          <select
            id="activity"
            value={selectedActivity}
            onChange={(e) => {
              setSelectedActivity(e.target.value);
              setPage(1);
            }}
            className="mt-2 block w-full rounded-lg bg-slate-950 border border-white/10 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          >
            <option value="">All Activities</option>
            {activities.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Activity Filter Chips */}
      <div className="mt-6 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Quick Tags:</span>
        {activities.map((act) => {
          const isSelected = selectedActivity === act;
          return (
            <button
              key={act}
              onClick={() => {
                setSelectedActivity(isSelected ? '' : act);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                isSelected
                  ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                  : 'border-white/5 bg-slate-900/40 text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {act}
            </button>
          );
        })}
      </div>

      {/* Content Rendering Block */}
      <div className="mt-8 flex-grow flex flex-col justify-start">
        {isLoading ? (
          /* Loader state */
          <div className="flex-grow flex flex-col justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
            <p className="mt-4 text-sm text-slate-500">Searching destinations...</p>
          </div>
        ) : errorMsg ? (
          /* Error state */
          <div className="flex-grow flex flex-col justify-center items-center py-20 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500" />
            <h3 className="mt-4 text-lg font-bold text-white">Something went wrong</h3>
            <p className="mt-2 text-sm text-slate-400">{errorMsg}</p>
            <button
              onClick={fetchDestinations}
              className="mt-6 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : destinations.length === 0 ? (
          /* Empty state */
          <div className="flex-grow flex flex-col justify-center items-center py-20 border border-dashed border-white/5 rounded-2xl bg-slate-900/5 text-center">
            <Compass className="h-12 w-12 text-slate-700" />
            <h3 className="mt-4 text-lg font-bold text-white">No destinations found</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm">
              We couldn&apos;t find any spots matching your filter criteria. Try updating your search string or toggling different tags.
            </p>
            <button
              onClick={handleReset}
              className="mt-6 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Main Card Grid and Results */
          <>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">
              Showing {destinations.length} of {totalRecords} destinations
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-6 pb-4">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center space-x-1 rounded-lg border border-white/5 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs text-slate-400">
                  Page <span className="font-bold text-white">{page}</span> of{' '}
                  <span className="font-bold text-white">{totalPages}</span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="flex items-center space-x-1 rounded-lg border border-white/5 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-300 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      </div>
    </div>
  );
}
