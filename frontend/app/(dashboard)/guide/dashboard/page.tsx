// This file renders the page screen for dashboard in the browser.
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Map,
  MapPin,
  Compass,
  MessageSquare,
  Plus,
  User,
  ArrowRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface GuideRequest {
  _id: string;
  travelerId: {
    _id: string;
    name: string;
    email: string;
  };
  tripId: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function GuideDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  const [stats, setStats] = useState({
    hiddenPlaces: 0,
    experiences: 0,
    destinations: 0,
    requests: 0,
  });
  
  const [recentRequests, setRecentRequests] = useState<GuideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/guide/dashboard');
      return;
    }
    
    if (user && user.role !== 'guide') {
      router.push('/become-guide');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [hiddenPlacesRes, experiencesRes, destinationsRes, requestsRes, profileRes] = await Promise.all([
          api.get('/hidden-places/guide/me'),
          api.get('/experiences/guide/me'),
          api.get('/destinations/guide/me'),
          api.get('/guide-requests/guide/me'),
          api.get(`/guides/${user?._id}`).catch(() => null),
        ]);

        setStats({
          hiddenPlaces: hiddenPlacesRes.data.count || 0,
          experiences: experiencesRes.data.count || 0,
          destinations: destinationsRes.data.count || 0,
          requests: requestsRes.data.count || 0,
        });

        // Check if guide has filled in their profile
        if (profileRes?.data?.guide) {
          const p = profileRes.data.guide;
          setProfileComplete(!!(p.location && p.bio));
        } else {
          setProfileComplete(false);
        }

        // Sort requests by newest first and take top 5
        const allRequests = requestsRes.data.requests || [];
        const sorted = [...allRequests].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentRequests(sorted.slice(0, 5));
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'guide') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
        <div className="mesh-bg" />
        <div className="glass rounded-2xl px-8 py-6 flex items-center gap-4 z-10">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span className="dot-pulse" />
          <span
            className="text-sm font-medium text-zinc-300"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Loading your workspace&hellip;
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4">
        <div className="mesh-bg" />
        <div className="glass z-10 w-full max-w-md rounded-2xl border border-rose-500/30 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2
            className="text-xl font-bold text-rose-300"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dashboard Error
          </h2>
          <p className="mt-2 text-sm text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-ghost mt-6 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="mesh-bg" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Profile Incomplete Banner */}
        {!profileComplete && (
          <div className="glass mb-6 flex items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex-shrink-0 rounded-xl bg-amber-500/10 p-2 text-amber-400">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="dot-pulse" />
                <p
                  className="text-sm font-bold text-amber-300"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Complete your guide profile to get started
                </p>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Travelers can&apos;t find or request you until you fill in your bio and location.
              </p>
            </div>
            <Link
              href="/guide/profile"
              className="flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
            >
              Complete Now
            </Link>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Guide Workspace
            </h1>
            <p className="mt-1.5 text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
              Welcome back,{' '}
              <span className="font-semibold text-emerald-400">{user?.name}</span>. Manage
              your public profile, listings, and traveler requests.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/guide/profile"
              id="btn-edit-profile"
              className="btn btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <User className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/guide/requests"
              id="btn-view-requests"
              className="btn btn-primary inline-flex items-center gap-2 text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Manage Requests</span>
            </Link>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Hidden Places',
              value: stats.hiddenPlaces,
              icon: Map,
              iconBg: 'bg-emerald-500/15',
              iconColor: 'text-emerald-400',
              accent: 'from-emerald-500 to-emerald-700',
            },
            {
              label: 'My Experiences',
              value: stats.experiences,
              icon: Compass,
              iconBg: 'bg-sky-500/15',
              iconColor: 'text-sky-400',
              accent: 'from-sky-500 to-sky-700',
            },
            {
              label: 'Destinations',
              value: stats.destinations,
              icon: MapPin,
              iconBg: 'bg-violet-500/15',
              iconColor: 'text-violet-400',
              accent: 'from-violet-500 to-violet-700',
            },
            {
              label: 'Total Requests',
              value: stats.requests,
              icon: MessageSquare,
              iconBg: 'bg-amber-500/15',
              iconColor: 'text-amber-400',
              accent: 'from-amber-500 to-amber-700',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card-3d-wrapper">
                <div className="glass card-3d card-spotlight rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className="font-mono text-4xl font-bold text-white"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {stat.value}
                    </span>
                    <div className={`rounded-xl p-2.5 ${stat.iconBg} ${stat.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{stat.label}</p>
                  <div
                    className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${stat.accent} opacity-60`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions + Recent Requests Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Quick Actions Panel */}
          <div className="lg:col-span-1">
            <h2
              className="mb-4 text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Quick Add Actions
            </h2>
            <div className="space-y-3">

              <Link
                href="/guide/hidden-places/create"
                id="cta-add-hidden"
                className="glass flex items-center gap-4 rounded-xl border border-white/10 p-4 transition-all hover:border-emerald-500/40 group"
              >
                <div className="flex-shrink-0 rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold text-zinc-200 transition-colors group-hover:text-emerald-400"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Add Hidden Place
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">Share offbeat viewpoint spots</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-emerald-400" />
              </Link>

              <Link
                href="/guide/experiences/create"
                id="cta-add-experience"
                className="glass flex items-center gap-4 rounded-xl border border-white/10 p-4 transition-all hover:border-sky-500/40 group"
              >
                <div className="flex-shrink-0 rounded-xl bg-sky-500/10 p-2.5 text-sky-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold text-zinc-200 transition-colors group-hover:text-sky-400"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Add Experience
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">List a guided tour or trek trail</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-sky-400" />
              </Link>

              <Link
                href="/guide/destinations/create"
                id="cta-add-destination"
                className="glass flex items-center gap-4 rounded-xl border border-white/10 p-4 transition-all hover:border-violet-500/40 group"
              >
                <div className="flex-shrink-0 rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold text-zinc-200 transition-colors group-hover:text-violet-400"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Contribute Destination
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">Submit new location for approval</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-violet-400" />
              </Link>

            </div>
          </div>

          {/* Recent Requests Table */}
          <div className="lg:col-span-2">
            <div className="glass-strong rounded-2xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Recent Requests
                </h2>
                <Link
                  href="/guide/requests"
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-600">
                    <Compass className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400">No booking requests yet</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Travelers will request you from your{' '}
                    <Link href="/guide/profile" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                      public profile
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        <th className="pb-3 pr-4">Traveler</th>
                        <th className="pb-3 pr-4">Trip Title</th>
                        <th className="pb-3 pr-4">Message</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentRequests.map((req) => (
                        <tr
                          key={req._id}
                          className="transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="py-3 pr-4 font-bold text-zinc-50">
                            {req.travelerId?.name}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="flex items-center gap-1.5 text-zinc-300">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-zinc-500" />
                              <span className="truncate max-w-[120px]">{req.tripId?.title}</span>
                            </span>
                          </td>
                          <td className="max-w-[160px] truncate py-3 pr-4 text-zinc-400">
                            {req.message}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`tag inline-flex items-center gap-1 ${
                                req.status === 'accepted'
                                  ? 'tag-active border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                  : req.status === 'rejected'
                                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                              }`}
                            >
                              {req.status === 'accepted' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : req.status === 'rejected' ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className="font-mono text-xs text-zinc-500"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
