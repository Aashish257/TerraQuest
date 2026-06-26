// This file renders the page screen for trips in the browser.
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Calendar, User, Users, Plus, Loader2, Sparkles, MapPin, Compass, AlertCircle } from 'lucide-react';

interface Trip {
  _id: string;
  title: string;
  tripType: 'solo' | 'group';
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  destinationId?: {
    _id: string;
    name: string;
    country: string;
    state?: string;
  };
}

export default function TripsPage() {
  const router = useRouter();
  const { isAuthenticated, user, initialize, isLoading: isAuthLoading } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'solo' | 'group'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => { initialize(); }, [initialize]);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true); setErrorMsg(null);
    try {
      const response = await api.get('/trips');
      if (response.data.success) setTrips(response.data.trips);
    } catch (err: any) {
      if (err.response?.status === 401) { router.push('/login'); return; }
      setErrorMsg('Could not fetch trips. Please try again.');
    } finally { setIsLoading(false); }
  }, [router]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) fetchTrips();
    else router.push('/login');
  }, [isAuthenticated, fetchTrips, router, isAuthLoading]);

  const filteredTrips = trips.filter(t => activeTab === 'all' ? true : t.tripType === activeTab);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const getStatusStyle = (s: string) => {
    switch(s) {
      case 'planning': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'ongoing': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const getStatusDotColor = (s: string) => {
    switch(s) {
      case 'planning': return 'bg-amber-400';
      case 'ongoing': return 'bg-emerald-400';
      case 'completed': return 'bg-blue-400';
      case 'cancelled': return 'bg-rose-400';
      default: return 'bg-zinc-400';
    }
  };

  const tabCounts = {
    all: trips.length,
    solo: trips.filter(t => t.tripType === 'solo').length,
    group: trips.filter(t => t.tripType === 'group').length,
  };

  // --- Auth Loading State ---
  if (isAuthLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="glass rounded-2xl p-10 flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center w-16 h-16">
            <span className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
            <span className="absolute inset-1 rounded-full border-2 border-emerald-500/60" />
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin relative z-10" />
          </div>
          <p className="text-zinc-400 text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] mesh-bg" style={{ background: '#09090b' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h1
              className="text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              My Trips
            </h1>
            <p className="text-sm text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
              Plan, explore, and track all your adventures in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="btn btn-ghost flex items-center gap-2 text-sm">
              <Compass className="w-4 h-4" />
              Browse Spots
            </Link>
            <Link href="/trips/create" className="btn btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Create Trip
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'solo', 'group'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? 'tag tag-active' : 'tag'
              }`}
            >
              {tab === 'solo' && <User className="w-3.5 h-3.5" />}
              {tab === 'group' && <Users className="w-3.5 h-3.5" />}
              {tab === 'all' && <Sparkles className="w-3.5 h-3.5" />}
              <span className="capitalize">{tab}</span>
              <span
                className="ml-1 text-xs opacity-60"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-5 w-24 rounded-full" />
                </div>
                <div className="skeleton h-6 w-3/4 rounded-lg" />
                <div className="skeleton h-4 w-1/2 rounded-md" />
                <div className="skeleton h-4 w-2/3 rounded-md" />
                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <div className="skeleton h-5 w-20 rounded-md" />
                  <div className="skeleton h-5 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMsg && (
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center max-w-md mx-auto">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-7 h-7 text-rose-400" />
            </div>
            <div className="space-y-1">
              <h3
                className="text-base font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Something went wrong
              </h3>
              <p className="text-sm text-zinc-400">{errorMsg}</p>
            </div>
            <button
              onClick={fetchTrips}
              className="btn btn-ghost text-sm mt-1"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMsg && filteredTrips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <Compass className="w-16 h-16 text-zinc-700" />
            <div className="space-y-2">
              <h3
                className="text-xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {activeTab === 'all' ? 'No trips yet' : `No ${activeTab} trips yet`}
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                {activeTab === 'all'
                  ? 'Start planning your next adventure — the world is waiting.'
                  : `You have no ${activeTab} trips planned. Create one to get started.`}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Link href="/explore" className="btn btn-ghost flex items-center gap-2 text-sm">
                <Compass className="w-4 h-4" />
                Browse Spots
              </Link>
              <Link href="/trips/create" className="btn btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                Create Trip
              </Link>
            </div>
          </div>
        )}

        {/* Trip Cards Grid */}
        {!isLoading && !errorMsg && filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div key={trip._id} className="card-3d-wrapper group">
                <div className="card-3d glass card-spotlight rounded-2xl p-5 flex flex-col gap-4 h-full transition-all duration-300">

                  {/* Top Row: type + status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                      {trip.tripType === 'solo' ? (
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span className="capitalize" style={{ fontFamily: 'var(--font-body)' }}>
                        {trip.tripType}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(trip.status)}`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(trip.status)}`} />
                      <span className="capitalize">{trip.status}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-lg font-semibold text-white leading-snug transition-all duration-300 group-hover:text-gradient-emerald cursor-default"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {trip.title}
                  </h2>

                  {/* Destination */}
                  {trip.destinationId && (
                    <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
                      <span style={{ fontFamily: 'var(--font-body)' }}>
                        {trip.destinationId.name}
                        {trip.destinationId.state ? `, ${trip.destinationId.state}` : ''}
                        {', '}
                        {trip.destinationId.country}
                      </span>
                    </div>
                  )}

                  {/* Date Range */}
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
                    <span style={{ fontFamily: 'var(--font-body)' }}>
                      {formatDate(trip.startDate)} &mdash; {formatDate(trip.endDate)}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Footer */}
                  <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-xs text-zinc-500 uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        Budget
                      </span>
                      <span
                        className="text-sm font-semibold text-white"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        ${trip.budget.toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href={`/trips/${trip._id}`}
                      className="btn btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
                    >
                      View Trip
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
