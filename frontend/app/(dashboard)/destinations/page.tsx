// This file renders the page screen for destinations in the browser.
'use client';

/**
 * destinations/page.tsx — Premium Explore Page
 *
 * Skills applied:
 * - Design Taste Frontend: horizontal pill filter row, skeleton shimmer loaders,
 *   beautiful empty/error states, asymmetric hero
 * - Antigravity Design Expert: glassmorphic filter bar, floating label pill
 * - Scroll Experience: IntersectionObserver scroll reveal, stagger cascade
 * - Tailwind Design System: consistent spacing tokens, responsive grid
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import DestinationCard, { Destination } from '@/components/shared/DestinationCard';
import api from '@/lib/api';
import {
  Compass, Search, Loader2, RefreshCw,
  AlertCircle, ChevronLeft, ChevronRight, X, SlidersHorizontal
} from 'lucide-react';

const ACTIVITIES = ['Beach', 'Trekking', 'Water Sports', 'Nightlife', 'Heritage', 'Yoga', 'Adventure', 'Wildlife'];
const BUDGETS    = [
  { value: '',       label: 'All budgets'           },
  { value: 'low',    label: 'Budget (< ₹2,500/day)'  },
  { value: 'medium', label: 'Mid (₹2,500–₹4,000/day)'},
  { value: 'high',   label: 'Premium (> ₹4,000/day)' },
];

/* Skeleton card loader — matches card proportions */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid #27272A', background: '#0F1720' }}>
      <div className="skeleton h-56 w-full" />
      <div className="p-5 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-5 w-14 rounded-md" />
          <div className="skeleton h-5 w-16 rounded-md" />
          <div className="skeleton h-5 w-12 rounded-md" />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid #27272A' }}>
          <div className="skeleton h-8 w-20 rounded" />
          <div className="skeleton h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

/* Beautiful empty state */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl border border-white/[0.06] bg-[#111113]
                      flex items-center justify-center mb-6 animate-float">
        <Compass className="h-10 w-10 text-zinc-700" />
      </div>
      <h3
        className="text-xl font-bold text-zinc-300 mb-2"
        style={{ fontFamily: 'var(--font-outfit, Outfit)', letterSpacing: '-0.02em' }}
      >
        No destinations found
      </h3>
      <p className="text-sm text-zinc-600 max-w-sm leading-relaxed mb-6"
         style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}>
        We couldn&apos;t match your filters. Try adjusting your search
        or clearing the active tags.
      </p>
      <button
        onClick={onReset}
        className="btn btn-ghost text-sm px-5 py-2 gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Clear all filters
      </button>
    </div>
  );
}

/* Error state */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl border border-rose-500/20 bg-rose-500/5
                      flex items-center justify-center mb-5">
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>
      <h3 className="text-lg font-bold text-zinc-300 mb-2"
          style={{ fontFamily: 'var(--font-outfit, Outfit)' }}>
        Something went wrong
      </h3>
      <p className="text-sm text-zinc-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="btn btn-primary text-sm px-5 py-2"
      >
        Try again
      </button>
    </div>
  );
}

export default function DestinationsPage() {
  const [destinations,   setDestinations]   = useState<Destination[]>([]);
  const [search,         setSearch]         = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedBudget,   setSelectedBudget]   = useState('');
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalRecords,   setTotalRecords]   = useState(0);
  const [isLoading,      setIsLoading]      = useState(true);
  const [errorMsg,       setErrorMsg]       = useState<string | null>(null);
  const [showFilters,    setShowFilters]    = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params: Record<string, string | number> = { page, limit: 9 };
      if (search.trim())      params.search   = search;
      if (selectedActivity)   params.activity = selectedActivity;
      if (selectedBudget)     params.budget   = selectedBudget;

      const response = await api.get('/destinations', { params });
      if (response.data.success) {
        setDestinations(response.data.destinations);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
      }
    } catch {
      setErrorMsg('Could not load destinations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedActivity, selectedBudget]);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [destinations]);

  const handleReset = () => {
    setSearch(''); setSelectedActivity(''); setSelectedBudget(''); setPage(1);
  };

  const hasFilters = search || selectedActivity || selectedBudget;

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0A1118' }}>

      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16"
        style={{
          borderBottom: '1px solid #27272A',
          background: 'radial-gradient(ellipse at top left, rgba(16,185,129,0.05) 0%, transparent 55%)',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
             style={{ background: 'rgba(16,185,129,0.04)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-20 right-10 w-80 h-80 rounded-full pointer-events-none"
             style={{ background: 'rgba(16,185,129,0.03)', filter: 'blur(80px)' }} />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-5"
                 style={{ borderRadius: '9999px', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)', padding: '6px 14px' }}>
              <Compass className="h-3 w-3 text-emerald-400" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Explore India
              </span>
            </div>

            <h1
              className="text-6xl sm:text-7xl tracking-[-0.03em] leading-[1.0]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: '#FFFFFF' }}
            >
              Discover
              <span className="text-gradient-emerald"> hidden gems</span>
            </h1>

            <p
              className="mt-5 text-base leading-relaxed max-w-lg"
              style={{ fontFamily: 'var(--font-body)', color: '#A1A1AA' }}
            >
              From sun-drenched beaches to mist-draped mountain trails — explore
              curated destinations and guide-discovered secret spots across India.
            </p>

            {!isLoading && totalRecords > 0 && (
              <p className="mt-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#52525B' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{totalRecords}</span>
                {' '}destinations available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div
        className="sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-3"
        style={{ borderBottom: '1px solid #27272A', background: 'rgba(10,17,24,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            <input
              ref={searchRef}
              id="destination-search"
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search destinations..."
              className="w-full h-9 pl-9 pr-4 text-sm placeholder:text-zinc-700
                         focus:outline-none transition-all duration-200"
              style={{
                background: '#0F1720',
                border: '1px solid #27272A',
                borderRadius: 'var(--radius-control)',
                color: '#e4e4e7',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(16,185,129,0.4)'; e.target.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#27272A'; e.target.style.boxShadow = 'none'; }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px hidden sm:block" style={{ background: '#27272A' }} />

          {/* Activity pill filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ACTIVITIES.map((act) => (
              <button
                key={act}
                onClick={() => { setSelectedActivity(selectedActivity === act ? '' : act); setPage(1); }}
                className={`tag transition-all duration-200 cursor-pointer hover:scale-[1.03]
                            ${selectedActivity === act ? 'tag-active' : ''}`}
              >
                {act}
              </button>
            ))}
          </div>

          {/* Budget dropdown */}
          <select
            id="destination-budget"
            value={selectedBudget}
            onChange={(e) => { setSelectedBudget(e.target.value); setPage(1); }}
            className="h-9 px-3 text-xs focus:outline-none transition-all duration-200 min-w-[160px] cursor-pointer"
            style={{
              background: '#0F1720',
              border: '1px solid #27272A',
              borderRadius: 'var(--radius-control)',
              color: '#d4d4d8',
              fontFamily: 'var(--font-body)',
            }}
          >
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 h-9 px-3 text-rose-400 text-xs font-semibold
                         hover:bg-rose-500/10 transition-all duration-200 shrink-0"
              style={{ borderRadius: 'var(--radius-control)', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">

        {/* Result count */}
        {!isLoading && !errorMsg && destinations.length > 0 && (
          <p className="mb-6" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Showing {destinations.length} of {totalRecords} results
            {hasFilters && <span style={{ color: '#10b981', marginLeft: '8px' }}>— filtered</span>}
          </p>
        )}

        {/* States */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : errorMsg ? (
          <ErrorState message={errorMsg} onRetry={fetchDestinations} />
        ) : destinations.length === 0 ? (
          <EmptyState onReset={handleReset} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest, i) => (
                <div
                  key={dest._id}
                  className="reveal"
                  style={{ transitionDelay: `${(i % 9) * 60}ms` }}
                >
                  <DestinationCard destination={dest} index={i} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-between border-t border-white/[0.05] pt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-ghost text-sm px-5 py-2 gap-2 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                      if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) {
                        acc.push('…');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…' ? (
                        <span key={`dot-${i}`} className="px-2 text-zinc-700 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`
                            w-9 h-9 rounded-lg text-sm font-semibold font-mono transition-all
                            ${page === p
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                            }
                          `}
                        >
                          {p}
                        </button>
                      )
                    )
                  }
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-ghost text-sm px-5 py-2 gap-2 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
