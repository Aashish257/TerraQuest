'use client';

/**
 * guides/page.tsx — Local Guides Directory
 *
 * Displays a searchable, filterable directory of local travel guides.
 * Filters by location (text) and minimum rating threshold (dropdown).
 * Uses React Suspense to safely load search query params in Next.js 14.
 */

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Compass,
  MapPin,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  Globe,
  Award,
} from 'lucide-react';

interface Guide {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  experience: number;
  languages: string[];
  expertise: string[];
  location: string;
  bio: string;
  rating: number;
  totalReviews: number;
}

function GuidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter and pagination states
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [ratingSelect, setRatingSelect] = useState(searchParams.get('rating') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGuides, setTotalGuides] = useState(0);

  const fetchGuides = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (locationInput) params.append('location', locationInput);
      if (ratingSelect) params.append('rating', ratingSelect);
      params.append('page', page.toString());
      params.append('limit', '6');

      const res = await api.get(`/guides?${params.toString()}`);
      if (res.data.success) {
        setGuides(res.data.guides);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalGuides(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error('Error fetching guides:', err);
    } finally {
      setIsLoading(false);
    }
  }, [locationInput, ratingSelect, page]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams();
    if (locationInput) newParams.set('location', locationInput);
    if (ratingSelect) newParams.set('rating', ratingSelect);
    newParams.set('page', '1');
    router.push(`/guides?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', newPage.toString());
    router.push(`/guides?${newParams.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Find Local Guides
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl">
          Connect with trusted, expert local guides to unlock hidden locations and discover authentic off-beat travel experiences.
        </p>
      </div>

      {/* Search & Filter Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl mb-8 backdrop-blur-md">
        
        {/* Location input */}
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by location (e.g. Goa, Manali)..."
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60 text-sm text-slate-200 placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Rating filter */}
        <div className="relative">
          <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <select
            value={ratingSelect}
            onChange={(e) => setRatingSelect(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60 text-sm text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-950 text-slate-400">All Ratings</option>
            <option value="4" className="bg-slate-950 text-slate-200">4.0 Stars & Up</option>
            <option value="4.5" className="bg-slate-950 text-slate-200">4.5 Stars & Up</option>
            <option value="3" className="bg-slate-950 text-slate-200">3.0 Stars & Up</option>
          </select>
          <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center justify-center space-x-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-all py-2.5 shadow-lg shadow-teal-500/10"
        >
          <Search className="h-4 w-4" />
          <span>Apply Filters</span>
        </button>
      </form>

      {/* Guide Cards Grid */}
      {isLoading ? (
        <div className="flex-grow flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        </div>
      ) : guides.length === 0 ? (
        <div className="flex-grow flex flex-col justify-center items-center py-20 text-center">
          <Compass className="h-16 w-16 text-slate-800 animate-pulse" />
          <h3 className="mt-4 text-lg font-bold text-white">No Guides Found</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-xs">
            Try adjusting your search query or lowering the minimum rating threshold.
          </p>
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div
                key={guide._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/30 p-6 backdrop-blur-md hover:border-teal-500/20 hover:bg-slate-900/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white group-hover:scale-105 transition-transform duration-300 shadow-md">
                        {guide.userId.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight group-hover:text-teal-400 transition-colors duration-300">
                          {guide.userId.name}
                        </h3>
                        <span className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                          <MapPin className="h-3 w-3 text-teal-500" />
                          <span>{guide.location}</span>
                        </span>
                      </div>
                    </div>

                    {/* Rating Cache */}
                    <div className="flex items-center space-x-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{guide.rating > 0 ? guide.rating.toFixed(1) : 'New'}</span>
                      {guide.totalReviews > 0 && (
                        <span className="text-[10px] text-slate-500 font-normal">({guide.totalReviews})</span>
                      )}
                    </div>
                  </div>

                  {/* Bio snippet */}
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                    {guide.bio || 'No bio provided. Looking forward to exploring India with you!'}
                  </p>

                  {/* Stats details */}
                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Award className="h-3.5 w-3.5 text-teal-400" />
                      <span>{guide.experience} Years Exp.</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Globe className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="truncate">{guide.languages.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>

                  {/* Expertise badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {guide.expertise.slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-slate-800/60 border border-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <Link
                    href={`/guides/${guide.userId._id}`}
                    className="flex w-full items-center justify-center rounded-xl bg-slate-950 border border-white/5 hover:border-teal-500/35 hover:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all text-center"
                  >
                    <span>View Full Profile</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center space-x-4 border-t border-white/5 pt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-slate-400 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GuidesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
          <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
          <p className="mt-4 text-sm text-slate-500">Loading directory...</p>
        </div>
      }
    >
      <GuidesContent />
    </Suspense>
  );
}
