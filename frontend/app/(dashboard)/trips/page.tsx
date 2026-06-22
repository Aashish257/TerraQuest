'use client';

/**
 * page.tsx — My Trips Dashboard Screen
 *
 * Displays a list of user trips, filtered by category: All, Solo, and Group.
 * Shows status badges, destination targets, dates, and budget information.
 * Prominently features a CTA to generate or manually create a trip.
 */

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

  // Initialize auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get('/trips');
      if (response.data.success) {
        setTrips(response.data.trips);
      }
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      // Redirect to login if unauthorized
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      setErrorMsg('Could not fetch trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      fetchTrips();
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, fetchTrips, router, isAuthLoading]);

  // Filter trips based on active tab
  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'all') return true;
    return trip.tripType === activeTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'ongoing':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'completed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950/85 backdrop-blur-md">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-teal-500/20 blur-lg animate-pulse" />
          <Loader2 className="relative h-12 w-12 text-teal-400 animate-spin" />
        </div>
        <p className="mt-6 text-sm font-semibold tracking-wide text-slate-400 animate-pulse">
          Initializing secure session...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Trips
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Organize itineraries, budget entries, and invite friends to travel.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <Link
            href="/destinations"
            className="flex items-center justify-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span>Browse Spots</span>
          </Link>
          
          <Link
            href="/trips/new"
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Trip</span>
          </Link>
        </div>
      </div>

      {/* Tabs list filter */}
      <div className="mt-8 flex border-b border-white/10">
        <div className="flex space-x-6">
          {(['all', 'solo', 'group'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold capitalize border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Trips' : `${tab} Trips`}
            </button>
          ))}
        </div>
      </div>

      {/* Trips list grid */}
      <div className="mt-8 flex-grow flex flex-col justify-start">
        {errorMsg ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-rose-500" />
            <p className="mt-4 text-slate-300 text-sm font-semibold">{errorMsg}</p>
          </div>
        ) : isLoading ? (
          /* Pulsing Card Skeletons */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md h-48 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-slate-800 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-800 rounded mt-4 animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-4 w-1/3 bg-slate-800 rounded mt-4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          /* Empty Trips Layout */
          <div className="flex-grow flex flex-col justify-center items-center py-20 border border-dashed border-white/5 rounded-2xl bg-slate-900/5 text-center px-4">
            <Calendar className="h-12 w-12 text-slate-700" />
            <h3 className="mt-4 text-lg font-bold text-white">No travel plans yet</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm">
              Create a manual itinerary or explore featured destinations in India to start planning.
            </p>
            <div className="mt-6 flex space-x-3">
              <Link
                href="/trips/new"
                className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-400 transition-colors"
              >
                Create manual Trip
              </Link>
              <Link
                href="/ai-planner"
                className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span>Plan with AI</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Trips Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <div
                key={trip._id}
                className="group relative rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  {/* Category Type Tag & Status badge */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1 text-xs font-semibold text-slate-400">
                      {trip.tripType === 'group' ? (
                        <>
                          <Users className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Group Trip</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5 text-teal-400" />
                          <span>Solo Trip</span>
                        </>
                      )}
                    </span>
                    <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusStyle(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    {trip.title}
                  </h3>

                  {/* Destination Info */}
                  {trip.destinationId && (
                    <div className="mt-2 flex items-center space-x-1 text-sm text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        {trip.destinationId.name}
                        {trip.destinationId.state ? `, ${trip.destinationId.state}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </span>
                  </div>
                </div>

                {/* Footer Metrics & CTA Link */}
                <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Planned Budget</span>
                    <span className="text-sm font-semibold text-slate-200">
                      ₹{trip.budget.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    href={`/trips/${trip._id}`}
                    className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-teal-500 hover:text-slate-950 hover:border-teal-400 transition-all"
                  >
                    Manage Trip
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
